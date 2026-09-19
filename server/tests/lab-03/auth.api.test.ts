import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { hashPassword } from "../../src/auth.js";
import * as prismaModule from "../../src/prisma.js";

const password = "Local-development-password";
const user = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: "Ariya Somchai",
  email: "ariya.somchai@example.com",
  role: "REQUESTER",
  isActive: true,
  mustChangePassword: false,
  passwordHash: hashPassword(password),
  createdAt: new Date("2026-09-19T00:00:00.000Z"),
  updatedAt: new Date("2026-09-19T00:00:00.000Z"),
  ...overrides,
});

function csrfCookie(response: any) {
  return (response.headers["set-cookie"] as string[]).find((value) => value.startsWith("toktickit_csrf="))!.split(";")[0];
}

describe("Lab 3 authentication contract", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("requires CSRF and returns safe user data on login", async () => {
    const csrf = await request(app).get("/api/auth/csrf");
    const findFirst = vi.fn().mockResolvedValue(user());
    const create = vi.fn().mockResolvedValue({ id: 2 });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ user: { findFirst }, session: { create } } as any);
    const missing = await request(app).post("/api/auth/login").send({ email: user().email, password });
    const response = await request(app).post("/api/auth/login").set("Cookie", csrfCookie(csrf)).set("X-CSRF-Token", csrf.body.csrfToken).send({ email: user().email, password });
    expect(missing.status).toBe(400);
    expect(missing.body.error.code).toBe("INVALID_CSRF");
    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ id: 1, role: "REQUESTER" });
    expect(response.body.user).not.toHaveProperty("passwordHash");
    expect(response.headers["set-cookie"]).toEqual(expect.arrayContaining([expect.stringContaining("toktickit_session="), expect.stringContaining("HttpOnly")]));
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ userId: 1, tokenHash: expect.any(String) }) });
  });

  it("uses the same safe 401 for missing and inactive accounts", async () => {
    const csrf = await request(app).get("/api/auth/csrf");
    const findFirst = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ user: { findFirst }, session: { create: vi.fn() } } as any);
    const submit = () => request(app).post("/api/auth/login").set("Cookie", csrfCookie(csrf)).set("X-CSRF-Token", csrf.body.csrfToken).send({ email: "user@example.com", password });
    findFirst.mockResolvedValueOnce(null);
    const missing = await submit();
    findFirst.mockResolvedValueOnce(user({ isActive: false }));
    const inactive = await submit();
    expect(missing.status).toBe(401);
    expect(inactive.status).toBe(401);
    expect(missing.body).toEqual(inactive.body);
  });

  it("gates normal routes until password change and revokes the old session", async () => {
    const rawToken = "initial-session-token";
    const csrfToken = "csrf-token";
    const initial = user({ mustChangePassword: true });
    const session = { id: 11, userId: 1, expiresAt: new Date(Date.now() + 60_000), revokedAt: null, user: initial };
    const findUnique = vi.fn().mockResolvedValue(session);
    const updateSession = vi.fn().mockResolvedValue({});
    const createSession = vi.fn().mockResolvedValue({ id: 12 });
    const updateUser = vi.fn().mockResolvedValue(user({ mustChangePassword: false, passwordHash: hashPassword("New-local-password-2026") }));
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ user: { findUnique: vi.fn().mockResolvedValue(initial), update: updateUser }, session: { findUnique, update: updateSession, create: createSession } } as any);
    const cookie = `toktickit_session=${rawToken}; toktickit_csrf=${csrfToken}`;
    const blocked = await request(app).get("/api/tickets").set("Cookie", cookie);
    const changed = await request(app).post("/api/auth/change-password").set("Cookie", cookie).set("X-CSRF-Token", csrfToken).send({ currentPassword: password, newPassword: "New-local-password-2026" });
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe("PASSWORD_CHANGE_REQUIRED");
    expect(changed.status).toBe(200);
    expect(updateSession).toHaveBeenCalledWith({ where: { id: 11 }, data: { revokedAt: expect.any(Date) } });
    expect(createSession).toHaveBeenCalledOnce();
    expect(findUnique).toHaveBeenCalledWith({ where: { tokenHash: crypto.createHash("sha256").update(rawToken).digest("hex") }, include: { user: true } });
  });
});
