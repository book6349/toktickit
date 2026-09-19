import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { hashPassword } from "../../src/auth.js";
import * as prismaModule from "../../src/prisma.js";

const csrfCookie = "toktickit_csrf=csrf-token";
const adminCookie = `toktickit_session=admin-token; ${csrfCookie}`;
const requesterCookie = `toktickit_session=requester-token; ${csrfCookie}`;

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    role: "ADMINISTRATOR",
    isActive: true,
    mustChangePassword: false,
    passwordHash: hashPassword("Local-development-password"),
    createdAt: new Date("2026-09-19T00:00:00.000Z"),
    updatedAt: new Date("2026-09-19T00:00:00.000Z"),
    ...overrides,
  };
}

function setupPrisma(options: {
  sessionUser?: any;
  findMany?: any;
  findFirst?: any;
  findUnique?: any;
  create?: any;
  update?: any;
  count?: any;
} = {}) {
  const sessionFindUnique = vi.fn().mockResolvedValue({
    id: 11,
    userId: options.sessionUser?.id ?? 1,
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    user: options.sessionUser ?? user(),
  });
  const delegate = {
    findMany: options.findMany ?? vi.fn().mockResolvedValue([]),
    findFirst: options.findFirst ?? vi.fn().mockResolvedValue(null),
    findUnique: options.findUnique ?? vi.fn().mockResolvedValue(user()),
    create: options.create ?? vi.fn().mockResolvedValue(user({ id: 20, role: "REQUESTER", mustChangePassword: true })),
    update: options.update ?? vi.fn().mockResolvedValue(user()),
    count: options.count ?? vi.fn().mockResolvedValue(2),
  };
  const prisma = {
    session: { findUnique: sessionFindUnique },
    user: delegate,
    $transaction: vi.fn(async (work: (transaction: any) => Promise<any>) => work(prisma)),
  };
  vi.spyOn(prismaModule, "getPrisma").mockReturnValue(prisma as any);
  return { prisma, delegate, sessionFindUnique };
}

describe("Lab 3 Administrator User Management API", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("lists safe users with case-insensitive search and one role filter", async () => {
    const findMany = vi.fn().mockResolvedValue([user({ id: 2, role: "REQUESTER", email: "ari@example.com" })]);
    const { delegate } = setupPrisma({ findMany });
    const response = await request(app)
      .get("/api/admin/users?search=ARI&role=requester")
      .set("Cookie", adminCookie);

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0]).toMatchObject({ id: 2, role: "REQUESTER" });
    expect(response.body.users[0]).not.toHaveProperty("passwordHash");
    expect(delegate.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        OR: [
          { name: { contains: "ARI", mode: "insensitive" } },
          { email: { contains: "ARI", mode: "insensitive" } },
        ],
        role: "REQUESTER",
      },
    }));
  });

  it("rejects non-Administrators and invalid role filters", async () => {
    setupPrisma({ sessionUser: user({ role: "REQUESTER" }) });
    const forbidden = await request(app).get("/api/admin/users").set("Cookie", requesterCookie);
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error.code).toBe("FORBIDDEN");

    setupPrisma();
    const invalid = await request(app).get("/api/admin/users?role=OWNER").set("Cookie", adminCookie);
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("creates an active user with a hashed initial password and forced change", async () => {
    const create = vi.fn().mockImplementation(({ data }: any) => user({
      id: 22,
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.isActive,
      mustChangePassword: data.mustChangePassword,
      passwordHash: data.passwordHash,
    }));
    const { delegate, prisma } = setupPrisma({ create });
    const response = await request(app)
      .post("/api/admin/users")
      .set("Cookie", adminCookie)
      .set("X-CSRF-Token", "csrf-token")
      .send({ name: "New Staff", email: "New.Staff@Example.com", role: "IT_STAFF", isActive: true, initialPassword: "Local-password-2026" });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({ name: "New Staff", email: "new.staff@example.com", role: "IT_STAFF", isActive: true, mustChangePassword: true });
    expect(response.body.user).not.toHaveProperty("passwordHash");
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ email: "new.staff@example.com", mustChangePassword: true }) });
    expect(create.mock.calls[0][0].data.passwordHash).not.toBe("Local-password-2026");
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
    expect(delegate.findFirst).toHaveBeenCalledWith({ where: { email: { equals: "new.staff@example.com", mode: "insensitive" } } });
  });

  it("rejects duplicate email and invalid create input safely", async () => {
    setupPrisma({ findFirst: vi.fn().mockResolvedValue(user({ id: 4, email: "new.staff@example.com" })) });
    const duplicate = await request(app)
      .post("/api/admin/users")
      .set("Cookie", adminCookie)
      .set("X-CSRF-Token", "csrf-token")
      .send({ name: "New Staff", email: "NEW.STAFF@example.com", role: "IT_STAFF", initialPassword: "Local-password-2026" });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("DUPLICATE_EMAIL");

    setupPrisma();
    const invalid = await request(app)
      .post("/api/admin/users")
      .set("Cookie", adminCookie)
      .set("X-CSRF-Token", "csrf-token")
      .send({ name: "Bad User", email: "bad@example.com", role: "OWNER", initialPassword: "short" });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe("VALIDATION_ERROR");
    expect(invalid.body.error.fields).toEqual(expect.objectContaining({ role: expect.any(String), initialPassword: expect.any(String) }));
  });

  it("edits permitted account fields and resets the initial password", async () => {
    const target = user({ id: 2, name: "Old Staff", email: "old.staff@example.com", role: "IT_STAFF", isActive: true });
    const findUnique = vi.fn().mockResolvedValue(target);
    const update = vi.fn()
      .mockResolvedValueOnce(user({ ...target, name: "Updated Staff", isActive: false }))
      .mockResolvedValueOnce(user({ ...target, mustChangePassword: true, passwordHash: hashPassword("Reset-password-2026") }));
    const { delegate } = setupPrisma({ findUnique, update, findFirst: vi.fn().mockResolvedValue(null), count: vi.fn().mockResolvedValue(2) });
    const edited = await request(app)
      .patch("/api/admin/users/2")
      .set("Cookie", adminCookie)
      .set("X-CSRF-Token", "csrf-token")
      .send({ name: "Updated Staff", isActive: false });
    expect(edited.status).toBe(200);
    expect(edited.body.user).toMatchObject({ name: "Updated Staff", isActive: false });
    expect(delegate.update).toHaveBeenNthCalledWith(1, { where: { id: 2 }, data: { name: "Updated Staff", isActive: false } });

    const reset = await request(app)
      .post("/api/admin/users/2/initial-password")
      .set("Cookie", adminCookie)
      .set("X-CSRF-Token", "csrf-token")
      .send({ initialPassword: "Reset-password-2026" });
    expect(reset.status).toBe(200);
    expect(reset.body.user.mustChangePassword).toBe(true);
    expect(delegate.update).toHaveBeenNthCalledWith(2, { where: { id: 2 }, data: { passwordHash: expect.any(String), mustChangePassword: true } });
  });

  it("blocks self-deactivation and removal of the last active Administrator", async () => {
    const { delegate } = setupPrisma({ findUnique: vi.fn().mockResolvedValue(user()), count: vi.fn().mockResolvedValue(1) });
    const self = await request(app)
      .patch("/api/admin/users/1")
      .set("Cookie", adminCookie)
      .set("X-CSRF-Token", "csrf-token")
      .send({ isActive: false });
    expect(self.status).toBe(403);
    expect(self.body.error.code).toBe("FORBIDDEN");

    setupPrisma({
      findUnique: vi.fn().mockResolvedValue(user({ id: 2, email: "second.admin@example.com" })),
      count: vi.fn().mockResolvedValue(1),
    });
    const last = await request(app)
      .patch("/api/admin/users/2")
      .set("Cookie", adminCookie)
      .set("X-CSRF-Token", "csrf-token")
      .send({ isActive: false });
    expect(last.status).toBe(409);
    expect(last.body.error.code).toBe("LAST_ADMINISTRATOR");
    expect(delegate.update).not.toHaveBeenCalled();
  });
});
