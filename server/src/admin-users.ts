import type { Express, Request, Response } from "express";
import { getPrisma } from "./prisma.js";
import {
  fail,
  getUserDelegate,
  hashPassword,
  normalizeEmail,
  requireCsrf,
  requireRole,
  safeUser,
  validatePassword,
  type UserRole,
} from "./auth.js";

const ROLES: UserRole[] = ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"];
const ROLE_SET = new Set<UserRole>(ROLES);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class AdminOperationError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AdminOperationError";
  }
}

function positiveInt(value: unknown): number | null {
  const text = String(value ?? "");
  if (!/^[1-9]\d*$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function requiredName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim();
  return name.length >= 1 && name.length <= 120 ? name : null;
}

function requiredEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = normalizeEmail(value);
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
}

function requiredRole(value: unknown): UserRole | null {
  const role = typeof value === "string" ? value.trim().toUpperCase() : "";
  return ROLE_SET.has(role as UserRole) ? role as UserRole : null;
}

function parseCreate(body: any) {
  const fields: Record<string, string> = {};
  const name = requiredName(body?.name);
  const email = requiredEmail(body?.email);
  const role = requiredRole(body?.role);
  const isActive = body?.isActive === undefined ? true : body.isActive;
  const password = typeof body?.initialPassword === "string" ? body.initialPassword : "";
  if (!name) fields.name = "Enter a name between 1 and 120 characters.";
  if (!email) fields.email = "Enter a valid email address.";
  if (!role) fields.role = "Choose REQUESTER, IT_STAFF, or ADMINISTRATOR.";
  if (typeof isActive !== "boolean") fields.isActive = "Active state must be true or false.";
  const passwordError = validatePassword(password);
  if (passwordError) fields.initialPassword = passwordError;
  return { fields, name, email, role, isActive: isActive as boolean, password };
}

function parsePatch(body: any) {
  const allowed = new Set(["name", "email", "role", "isActive"]);
  const fields: Record<string, string> = {};
  const bodyKeys = body && typeof body === "object" ? Object.keys(body) : [];
  const unsupported = bodyKeys.filter((key) => !allowed.has(key));
  if (unsupported.length > 0) fields[unsupported[0]] = "This field cannot be changed here.";
  if (bodyKeys.length === 0) fields.form = "Provide at least one editable field.";

  let name: string | undefined;
  let email: string | undefined;
  let role: UserRole | undefined;
  let isActive: boolean | undefined;
  if (bodyKeys.includes("name")) {
    name = requiredName(body.name) ?? undefined;
    if (!name) fields.name = "Enter a name between 1 and 120 characters.";
  }
  if (bodyKeys.includes("email")) {
    email = requiredEmail(body.email) ?? undefined;
    if (!email) fields.email = "Enter a valid email address.";
  }
  if (bodyKeys.includes("role")) {
    role = requiredRole(body.role) ?? undefined;
    if (!role) fields.role = "Choose REQUESTER, IT_STAFF, or ADMINISTRATOR.";
  }
  if (bodyKeys.includes("isActive")) {
    isActive = typeof body.isActive === "boolean" ? body.isActive : undefined;
    if (isActive === undefined) fields.isActive = "Active state must be true or false.";
  }
  return { fields, name, email, role, isActive };
}

function isUniqueEmailError(error: any) {
  return error?.code === "P2002";
}

function isTransactionConflict(error: any) {
  return error?.code === "P2034";
}

async function serializable<T>(prisma: any, work: (transaction: any) => Promise<T>): Promise<T> {
  if (typeof prisma.$transaction === "function") {
    return prisma.$transaction(work, { isolationLevel: "Serializable" });
  }
  return work(prisma);
}

function respondWithError(res: Response, error: any, fallback: string) {
  if (error instanceof AdminOperationError) {
    return fail(res, error.status, error.code, error.message, error.fields);
  }
  if (isUniqueEmailError(error)) {
    return fail(res, 409, "DUPLICATE_EMAIL", "That email address is already in use.", { email: "Choose a different email address." });
  }
  if (isTransactionConflict(error)) {
    return fail(res, 409, "CONFLICT", "The account changed before the operation completed. Try again.");
  }
  return fail(res, 500, "INTERNAL_ERROR", fallback);
}

async function requireAdministrator(req: Request, res: Response) {
  return requireRole(req, res, ["ADMINISTRATOR"]);
}

export function registerAdminUserRoutes(app: Express) {
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    const context = await requireAdministrator(req, res);
    if (!context) return;
    const search = String(req.query.search ?? "").trim();
    const roleValue = String(req.query.role ?? "").trim().toUpperCase();
    if (roleValue && !ROLE_SET.has(roleValue as UserRole)) {
      return fail(res, 400, "VALIDATION_ERROR", "Choose a valid role filter.", { role: "Choose REQUESTER, IT_STAFF, or ADMINISTRATOR." });
    }
    const where: Record<string, any> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (roleValue) where.role = roleValue;
    try {
      const users = await getUserDelegate(getPrisma()).findMany({
        where,
        orderBy: [{ name: "asc" }, { id: "asc" }],
      });
      return res.json({ users: users.map(safeUser) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to load User Management.");
    }
  });

  app.post("/api/admin/users", async (req: Request, res: Response) => {
    const context = await requireAdministrator(req, res);
    if (!context) return;
    if (!requireCsrf(req, res)) return;
    const input = parseCreate(req.body);
    if (Object.keys(input.fields).length > 0) {
      return fail(res, 400, "VALIDATION_ERROR", "Please correct the user fields.", input.fields);
    }
    try {
      const created = await serializable(getPrisma(), async (transaction) => {
        const delegate = getUserDelegate(transaction);
        const duplicate = await delegate.findFirst({ where: { email: { equals: input.email, mode: "insensitive" } } });
        if (duplicate) {
          throw new AdminOperationError(409, "DUPLICATE_EMAIL", "That email address is already in use.", { email: "Choose a different email address." });
        }
        return delegate.create({
          data: {
            name: input.name,
            email: input.email,
            role: input.role,
            isActive: input.isActive,
            passwordHash: hashPassword(input.password),
            mustChangePassword: true,
          },
        });
      });
      return res.status(201).json({ user: safeUser(created) });
    } catch (error) {
      return respondWithError(res, error, "Unable to create the user safely.");
    }
  });

  app.patch("/api/admin/users/:userId", async (req: Request, res: Response) => {
    const context = await requireAdministrator(req, res);
    if (!context) return;
    if (!requireCsrf(req, res)) return;
    const userId = positiveInt(req.params.userId);
    if (userId === null) return fail(res, 404, "RESOURCE_NOT_FOUND", "User not found.");
    const input = parsePatch(req.body);
    if (Object.keys(input.fields).length > 0) {
      return fail(res, 400, "VALIDATION_ERROR", "Please correct the editable user fields.", input.fields);
    }
    try {
      const updated = await serializable(getPrisma(), async (transaction) => {
        const delegate = getUserDelegate(transaction);
        const target = await delegate.findUnique({ where: { id: userId } });
        if (!target) throw new AdminOperationError(404, "RESOURCE_NOT_FOUND", "User not found.");
        if (input.email && normalizeEmail(target.email) !== input.email) {
          const duplicate = await delegate.findFirst({ where: { email: { equals: input.email, mode: "insensitive" }, id: { not: userId } } });
          if (duplicate) {
            throw new AdminOperationError(409, "DUPLICATE_EMAIL", "That email address is already in use.", { email: "Choose a different email address." });
          }
        }
        const nextRole = input.role ?? target.role;
        const nextActive = input.isActive ?? target.isActive;
        const removesAdministrator = target.role === "ADMINISTRATOR" && target.isActive && (nextRole !== "ADMINISTRATOR" || nextActive !== true);
        if (userId === context.user.id && removesAdministrator) {
          throw new AdminOperationError(403, "FORBIDDEN", "You cannot deactivate or demote your own Administrator account.", { isActive: "Keep your own Administrator account active." });
        }
        if (removesAdministrator) {
          const activeAdministrators = await delegate.count({ where: { role: "ADMINISTRATOR", isActive: true } });
          if (activeAdministrators <= 1) {
            throw new AdminOperationError(409, "LAST_ADMINISTRATOR", "At least one active Administrator must remain.", { isActive: "Keep one Administrator active." });
          }
        }
        const data: Record<string, unknown> = {};
        if (input.name !== undefined) data.name = input.name;
        if (input.email !== undefined) data.email = input.email;
        if (input.role !== undefined) data.role = input.role;
        if (input.isActive !== undefined) data.isActive = input.isActive;
        return delegate.update({ where: { id: userId }, data });
      });
      return res.json({ user: safeUser(updated) });
    } catch (error) {
      return respondWithError(res, error, "Unable to update the user safely.");
    }
  });

  app.post("/api/admin/users/:userId/initial-password", async (req: Request, res: Response) => {
    const context = await requireAdministrator(req, res);
    if (!context) return;
    if (!requireCsrf(req, res)) return;
    const userId = positiveInt(req.params.userId);
    if (userId === null) return fail(res, 404, "RESOURCE_NOT_FOUND", "User not found.");
    const initialPassword = typeof req.body?.initialPassword === "string" ? req.body.initialPassword : "";
    const passwordError = validatePassword(initialPassword);
    if (passwordError) return fail(res, 400, "VALIDATION_ERROR", "Please correct the initial password.", { initialPassword: passwordError });
    try {
      const updated = await serializable(getPrisma(), async (transaction) => {
        const delegate = getUserDelegate(transaction);
        const target = await delegate.findUnique({ where: { id: userId } });
        if (!target) throw new AdminOperationError(404, "RESOURCE_NOT_FOUND", "User not found.");
        return delegate.update({
          where: { id: userId },
          data: { passwordHash: hashPassword(initialPassword), mustChangePassword: true },
        });
      });
      return res.json({ user: safeUser(updated) });
    } catch (error) {
      return respondWithError(res, error, "Unable to reset the initial password safely.");
    }
  });
}
