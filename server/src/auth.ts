import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { getPrisma } from "./prisma.js";

export const SESSION_COOKIE = "toktickit_session";
export const CSRF_COOKIE = "toktickit_csrf";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export type UserRole = "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR";

export type SafeUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthContext = {
  user: SafeUser;
  sessionId: number;
  rawToken: string;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

function errorBody(code: string, message: string, fields?: Record<string, string>) {
  return { error: { code, message, ...(fields ? { fields } : {}) } };
}

export function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) {
  return res.status(status).json(errorBody(code, message, fields));
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validatePassword(value: string): string | null {
  if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
    return `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`;
  }
  if (value.trim().length === 0) return "Password cannot be whitespace only.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return "Password must contain at least one letter and one number.";
  }
  return null;
}

export function getUserDelegate(prisma: any): any {
  return prisma.user ?? prisma.requesterUser;
}

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const segment of String(header ?? "").split(";")) {
    const separator = segment.indexOf("=");
    if (separator <= 0) continue;
    const name = segment.slice(0, separator).trim();
    const value = segment.slice(separator + 1).trim();
    if (name) {
      try {
        cookies[name] = decodeURIComponent(value);
      } catch {
        cookies[name] = "";
      }
    }
  }
  return cookies;
}

function hashToken(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function randomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function isSecureRequest(req: Request): boolean {
  return req.secure || String(req.headers["x-forwarded-proto"] ?? "").toLowerCase() === "https";
}

function setCookie(res: Response, name: string, value: string, options: {
  httpOnly?: boolean;
  maxAge?: number;
  secure?: boolean;
}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "SameSite=Lax"];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge / 1000))}`);
  if (options.secure) parts.push("Secure");
  res.append("Set-Cookie", parts.join("; "));
}

function setSessionCookie(req: Request, res: Response, rawToken: string) {
  setCookie(res, SESSION_COOKIE, rawToken, {
    httpOnly: true,
    maxAge: SESSION_TTL_MS,
    secure: isSecureRequest(req),
  });
}

function clearSessionCookie(req: Request, res: Response) {
  setCookie(res, SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    secure: isSecureRequest(req),
  });
}

function setCsrfCookie(req: Request, res: Response, token: string) {
  setCookie(res, CSRF_COOKIE, token, {
    maxAge: 60 * 60 * 1000,
    secure: isSecureRequest(req),
  });
}

export function safeUser(user: any): SafeUser {
  return {
    id: Number(user.id),
    name: String(user.name),
    email: String(user.email),
    role: (user.role ?? "REQUESTER") as UserRole,
    isActive: Boolean(user.isActive),
    mustChangePassword: Boolean(user.mustChangePassword),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algorithm, salt, expectedHex] = String(stored ?? "").split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex || !/^[0-9a-f]+$/i.test(expectedHex)) return false;
  const actual = crypto.scryptSync(password, salt, expectedHex.length / 2);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function tokenFromRequest(req: Request): string | null {
  const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  return token || null;
}

export async function loadAuthContext(req: Request): Promise<AuthContext | null> {
  const rawToken = tokenFromRequest(req);
  if (!rawToken) return null;
  const prisma = getPrisma();
  if (!prisma.session?.findUnique) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });
  if (!session || session.revokedAt || new Date(session.expiresAt).getTime() <= Date.now()) return null;
  const user = session.user ?? (await getUserDelegate(prisma).findUnique({ where: { id: session.userId } }));
  if (!user || !user.isActive) return null;
  const context: AuthContext = {
    user: safeUser(user),
    sessionId: Number(session.id),
    rawToken,
  };
  req.auth = context;
  return context;
}

export async function requireUser(
  req: Request,
  res: Response,
  options: { allowPasswordChangeOnly?: boolean } = {},
): Promise<AuthContext | null> {
  try {
    const context = await loadAuthContext(req);
    if (!context) {
      fail(res, 401, "UNAUTHENTICATED", "Sign in to continue.");
      return null;
    }
    if (context.user.mustChangePassword && !options.allowPasswordChangeOnly) {
      fail(res, 403, "PASSWORD_CHANGE_REQUIRED", "Change your password before continuing.");
      return null;
    }
    return context;
  } catch {
    fail(res, 500, "INTERNAL_ERROR", "Unable to verify the current session.");
    return null;
  }
}

export function requireCsrf(req: Request, res: Response): boolean {
  const cookieToken = parseCookies(req.headers.cookie)[CSRF_COOKIE] ?? "";
  const headerToken = String(req.header("X-CSRF-Token") ?? "");
  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);
  const valid = cookieBuffer.length > 0 && cookieBuffer.length === headerBuffer.length &&
    crypto.timingSafeEqual(cookieBuffer, headerBuffer);
  if (!valid) {
    fail(res, 400, "INVALID_CSRF", "A valid CSRF token is required.");
    return false;
  }
  return true;
}

export async function requireRole(
  req: Request,
  res: Response,
  roles: UserRole[],
  options: { allowPasswordChangeOnly?: boolean } = {},
): Promise<AuthContext | null> {
  const context = await requireUser(req, res, options);
  if (!context) return null;
  if (!roles.includes(context.user.role)) {
    fail(res, 403, "FORBIDDEN", "You do not have permission to perform this action.");
    return null;
  }
  return context;
}

function createSessionData(userId: number, rawToken: string) {
  return {
    tokenHash: hashToken(rawToken),
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  };
}

export function registerAuthRoutes(app: Express) {
  app.get("/api/auth/csrf", (req: Request, res: Response) => {
    const token = randomToken();
    setCsrfCookie(req, res, token);
    return res.json({ csrfToken: token });
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    if (!requireCsrf(req, res)) return;
    const emailInput = typeof req.body?.email === "string" ? req.body.email : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const email = normalizeEmail(emailInput);
    if (!email || !password || !email.includes("@")) {
      return fail(res, 400, "VALIDATION_ERROR", "Enter a valid email and password.", {
        email: "Enter a valid email address.",
        password: "Enter your password.",
      });
    }
    try {
      const prisma = getPrisma();
      const user = await getUserDelegate(prisma).findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });
      if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
        return fail(res, 401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
      }
      const rawToken = randomToken();
      await prisma.session.create({ data: createSessionData(user.id, rawToken) });
      setSessionCookie(req, res, rawToken);
      return res.json({ user: safeUser(user), mustChangePassword: Boolean(user.mustChangePassword) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to sign in safely.");
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const context = await requireUser(req, res, { allowPasswordChangeOnly: true });
    if (!context) return;
    return res.json({ user: context.user, mustChangePassword: context.user.mustChangePassword });
  });

  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    if (!requireCsrf(req, res)) return;
    const context = await requireUser(req, res, { allowPasswordChangeOnly: true });
    if (!context) return;
    const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
    const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
    const validationMessage = validatePassword(newPassword);
    if (!currentPassword || validationMessage) {
      return fail(res, 400, "VALIDATION_ERROR", "Please correct the password fields.", {
        currentPassword: currentPassword ? "" : "Enter your current password.",
        newPassword: validationMessage ?? "",
      });
    }
    try {
      const prisma = getPrisma();
      const user = await getUserDelegate(prisma).findUnique({ where: { id: context.user.id } });
      if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
        return fail(res, 403, "INVALID_CREDENTIALS", "Current password is incorrect.");
      }
      if (verifyPassword(newPassword, user.passwordHash)) {
        return fail(res, 400, "VALIDATION_ERROR", "Choose a password different from the current password.", {
          newPassword: "Choose a different password.",
        });
      }
      const updated = await getUserDelegate(prisma).update({
        where: { id: context.user.id },
        data: { passwordHash: hashPassword(newPassword), mustChangePassword: false },
      });
      await prisma.session.update({ where: { id: context.sessionId }, data: { revokedAt: new Date() } });
      const rawToken = randomToken();
      await prisma.session.create({ data: createSessionData(context.user.id, rawToken) });
      setSessionCookie(req, res, rawToken);
      return res.json({ user: safeUser(updated), mustChangePassword: false });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to change the password safely.");
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    if (!requireCsrf(req, res)) return;
    try {
      const context = await loadAuthContext(req);
      if (context) {
        await getPrisma().session.update({
          where: { id: context.sessionId },
          data: { revokedAt: new Date() },
        });
      }
    } catch {
      clearSessionCookie(req, res);
      return fail(res, 500, "INTERNAL_ERROR", "Unable to sign out safely.");
    }
    clearSessionCookie(req, res);
    return res.status(204).send();
  });
}
