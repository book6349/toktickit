import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

const staff = { id: 7, name: "Somchai Staff", email: "staff@example.com", role: "IT_STAFF", isActive: true, mustChangePassword: false, createdAt: new Date(), updatedAt: new Date() };
const session = { id: 11, userId: 7, expiresAt: new Date(Date.now() + 60_000), revokedAt: null, user: staff };
const detail = {
  id: 44, ticketNumber: "TT-20260919-000044", ticketDate: new Date(), requesterId: 2, ownerId: 7, categoryId: 1, relatedSystemId: 2,
  requestedPriority: "HIGH", itPriority: "MEDIUM", status: "OPEN", summary: "VPN access request", description: "Please restore access to the corporate VPN.",
  requesterResolutionIndicatedAt: null, createdAt: new Date(), updatedAt: new Date(), requester: { id: 2, name: "Ariya Requester", email: "ariya@example.com", role: "REQUESTER" },
  owner: staff, category: { id: 1, name: "Access" }, relatedSystem: { id: 2, name: "VPN" }, attachments: [], comments: [], notes: [],
};

// Expected rules come from specification.md section 8, not implementation exports.
const approvedTransitions: Record<string, string[]> = {
  NEW: ["OPEN", "CANCELLED"],
  OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  CANCELLED: ["REOPENED"],
};
const statusCases = Object.keys(approvedTransitions).flatMap((from) =>
  Object.keys(approvedTransitions).map((to) => ({ from, to, allowed: approvedTransitions[from].includes(to) })),
);
const confirmedCases = Object.entries(approvedTransitions).flatMap(([from, targets]) =>
  targets.filter((to) => ["RESOLVED", "CLOSED", "CANCELLED"].includes(to)).map((to) => ({ from, to })),
);
const mutationCookie = "toktickit_session=staff-token; toktickit_csrf=csrf-token";

describe("Lab 3 IT Staff Ticket Detail", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("requires the approved confirmation and transition matrix on the backend", async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: 44, status: "OPEN" });
    const updateMany = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { findUnique, updateMany } } as any);
    const response = await request(app).patch("/api/staff/tickets/44/status").set("Cookie", "toktickit_session=staff-token; toktickit_csrf=csrf-token").set("X-CSRF-Token", "csrf-token").send({ status: "RESOLVED", confirm: false });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_TRANSITION");
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("updates a permitted status only when the current state still matches", async () => {
    const findUnique = vi.fn().mockResolvedValueOnce({ id: 44, status: "OPEN" }).mockResolvedValueOnce({ ...detail, status: "RESOLVED" });
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { findUnique, updateMany } } as any);
    const response = await request(app).patch("/api/staff/tickets/44/status").set("Cookie", "toktickit_session=staff-token; toktickit_csrf=csrf-token").set("X-CSRF-Token", "csrf-token").send({ status: "RESOLVED", confirm: true });
    expect(response.status).toBe(200);
    expect(updateMany).toHaveBeenCalledWith({ where: { id: 44, status: "OPEN" }, data: { status: "RESOLVED" } });
    expect(response.body.ticket.status).toBe("RESOLVED");
  });

  it("rejects requester owners and allows a permitted priority update", async () => {
    const findUnique = vi.fn()
      .mockResolvedValueOnce({ id: 44 })
      .mockResolvedValueOnce({ id: 22, role: "REQUESTER", isActive: true })
      .mockResolvedValueOnce({ id: 44 })
      .mockResolvedValueOnce({ ...detail, itPriority: "HIGH" });
    const update = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ session: { findUnique: vi.fn().mockResolvedValue(session) }, user: { findUnique }, ticket: { findUnique, update } } as any);
    const ownerResponse = await request(app).patch("/api/staff/tickets/44/owner").set("Cookie", "toktickit_session=staff-token; toktickit_csrf=csrf-token").set("X-CSRF-Token", "csrf-token").send({ ownerId: 22 });
    expect(ownerResponse.status).toBe(409);
    const priorityResponse = await request(app).patch("/api/staff/tickets/44/priority").set("Cookie", "toktickit_session=staff-token; toktickit_csrf=csrf-token").set("X-CSRF-Token", "csrf-token").send({ itPriority: "HIGH" });
    expect(priorityResponse.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ where: { id: 44 }, data: { itPriority: "HIGH" } });
  });

  it.each(statusCases)("enforces $from -> $to (allowed=$allowed) from the approved matrix", async ({ from, to, allowed }) => {
    const findUnique = vi.fn().mockResolvedValueOnce({ id: 44, status: from }).mockResolvedValueOnce({ ...detail, status: to });
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { findUnique, updateMany },
    } as any);
    const response = await request(app).patch("/api/staff/tickets/44/status")
      .set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send({ status: to, confirm: true });
    if (allowed) {
      expect(response.status).toBe(200);
      expect(response.body.ticket.status).toBe(to);
      expect(updateMany).toHaveBeenCalledWith({ where: { id: 44, status: from }, data: { status: to } });
    } else {
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INVALID_TRANSITION");
      expect(updateMany).not.toHaveBeenCalled();
    }
  });

  it.each(confirmedCases)("requires explicit confirmation for $from -> $to", async ({ from, to }) => {
    const updateMany = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue(session) },
      ticket: { findUnique: vi.fn().mockResolvedValue({ id: 44, status: from }), updateMany },
    } as any);
    for (const confirm of [undefined, false, "true"]) {
      const response = await request(app).patch("/api/staff/tickets/44/status")
        .set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send({ status: to, confirm });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INVALID_TRANSITION");
    }
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("returns a safe conflict when the Ticket status changes before persistence", async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: 44, status: "OPEN" });
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { findUnique, updateMany },
    } as any);
    const response = await request(app).patch("/api/staff/tickets/44/status")
      .set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send({ status: "IN_PROGRESS" });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
    expect(findUnique).toHaveBeenCalledTimes(1);
  });

  it.each([
    { role: "IT_STAFF", isActive: true, expected: 200 },
    { role: "ADMINISTRATOR", isActive: true, expected: 200 },
    { role: "REQUESTER", isActive: true, expected: 409 },
    { role: "IT_STAFF", isActive: false, expected: 409 },
    { role: "ADMINISTRATOR", isActive: false, expected: 409 },
  ])("owner assignment accepts only active permitted accounts: $role active=$isActive", async ({ role, isActive, expected }) => {
    const update = vi.fn();
    const owner = { id: 22, role, isActive };
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue(session) },
      user: { findUnique: vi.fn().mockResolvedValue(owner) },
      ticket: { findUnique: vi.fn().mockResolvedValue({ ...detail, ownerId: 22, owner }), update },
    } as any);
    const response = await request(app).patch("/api/staff/tickets/44/owner")
      .set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send({ ownerId: 22 });
    expect(response.status).toBe(expected);
    if (expected === 200) expect(update).toHaveBeenCalledWith({ where: { id: 44 }, data: { ownerId: 22 } });
    else expect(update).not.toHaveBeenCalled();
  });

  it("permits unassignment without looking up an owner account", async () => {
    const userLookup = vi.fn();
    const update = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue(session) }, user: { findUnique: userLookup },
      ticket: { findUnique: vi.fn().mockResolvedValue({ ...detail, ownerId: null, owner: null }), update },
    } as any);
    const response = await request(app).patch("/api/staff/tickets/44/owner")
      .set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send({ ownerId: null });
    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ where: { id: 44 }, data: { ownerId: null } });
    expect(userLookup).not.toHaveBeenCalled();
  });

  it.each(["REQUESTER", "ADMINISTRATOR"])("denies %s ownership and status mutations before reading Ticket data", async (role) => {
    const findUnique = vi.fn();
    const update = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue({ ...session, user: { ...staff, role } }) },
      ticket: { findUnique, update, updateMany: update },
    } as any);
    for (const operation of ["owner", "status"]) {
      const response = await request(app).patch(`/api/staff/tickets/44/${operation}`)
        .set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send({ ownerId: 22, status: "OPEN" });
      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    }
    expect(findUnique).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it.each(["IT_STAFF", "ADMINISTRATOR", "REQUESTER"])("applies the IT Priority authorization rule to %s", async (role) => {
    const update = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue({ ...session, user: { ...staff, role } }) },
      ticket: { findUnique: vi.fn().mockResolvedValue({ ...detail, itPriority: "LOW" }), update },
    } as any);
    const response = await request(app).patch("/api/staff/tickets/44/priority")
      .set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send({ itPriority: "LOW", requestedPriority: "LOW" });
    expect(response.status).toBe(role === "REQUESTER" ? 403 : 200);
    if (role === "REQUESTER") expect(update).not.toHaveBeenCalled();
    else {
      expect(update).toHaveBeenCalledWith({ where: { id: 44 }, data: { itPriority: "LOW" } });
      expect(response.body.ticket.requestedPriority).toBe("HIGH");
    }
  });
});
