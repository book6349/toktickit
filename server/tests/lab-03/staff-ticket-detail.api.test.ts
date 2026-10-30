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

function workflowDb(status = "OPEN", updateCount = 1) {
  const current = { id: 44, status, workflowVersion: 1, resolutionSummary: ["RESOLVED", "CLOSED"].includes(status) ? "VPN access restored." : null,
    resolvedAt: ["RESOLVED", "CLOSED"].includes(status) ? new Date("2026-10-30T09:00:00.000Z") : null,
    resolvedById: ["RESOLVED", "CLOSED"].includes(status) ? 7 : null };
  const updated = { ...detail, ...current };
  const tx = {
    ticket: {
      findUnique: vi.fn().mockResolvedValue(current),
      updateMany: vi.fn(async ({ data }: any) => {
        if (updateCount === 1) {
          updated.status = data.status;
          updated.workflowVersion = 2;
          Object.assign(updated, data);
          updated.workflowVersion = 2;
        }
        return { count: updateCount };
      }),
    },
    actionTaken: { findMany: vi.fn().mockResolvedValue([{ status: "COMPLETED" }]) },
    ticketWorkflowEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
  };
  const db = {
    session: { findUnique: vi.fn().mockResolvedValue(session) },
    ticket: { findUnique: vi.fn().mockResolvedValue(updated) },
    $transaction: vi.fn((callback: (value: any) => unknown) => callback(tx)),
  };
  return { db, tx, updated };
}

function workflowBody(to: string) {
  return { status: to, expectedVersion: 1,
    ...(["RESOLVED", "CLOSED", "CANCELLED"].includes(to) ? { confirm: true } : {}),
    ...(to === "RESOLVED" ? { resolutionSummary: "VPN access restored." } : {}),
    ...(to === "REOPENED" ? { reason: "The issue returned." } : {}),
  };
}

describe("Lab 3 IT Staff Ticket Detail", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("requires the approved confirmation and transition matrix on the backend", async () => {
    const { db, tx } = workflowDb("OPEN");
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(db as any);
    const response = await request(app).patch("/api/staff/tickets/44/status").set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send({ status: "RESOLVED", expectedVersion: 1, confirm: false });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("RESOLUTION_GATE_FAILED");
    expect(tx.ticket.updateMany).not.toHaveBeenCalled();
  });

  it("updates a permitted status only when the current state still matches", async () => {
    const { db, tx } = workflowDb("OPEN");
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(db as any);
    const response = await request(app).patch("/api/staff/tickets/44/status").set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send({ status: "RESOLVED", expectedVersion: 1, confirm: true, resolutionSummary: "VPN access restored." });
    expect(response.status).toBe(200);
    expect(tx.ticket.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 44, status: "OPEN", workflowVersion: 1 }, data: expect.objectContaining({ status: "RESOLVED", workflowVersion: { increment: 1 }, resolutionSummary: "VPN access restored.", resolvedById: 7 }) }));
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
    const { db, tx } = workflowDb(from);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(db as any);
    const response = await request(app).patch("/api/staff/tickets/44/status")
      .set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send(workflowBody(to));
    if (allowed) {
      expect(response.status).toBe(200);
      expect(response.body.ticket.status).toBe(to);
      expect(tx.ticket.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 44, status: from, workflowVersion: 1 }, data: expect.objectContaining({ status: to, workflowVersion: { increment: 1 } }) }));
    } else {
      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe("INVALID_TRANSITION");
      expect(tx.ticket.updateMany).not.toHaveBeenCalled();
    }
  });

  it.each(confirmedCases)("requires explicit confirmation for $from -> $to", async ({ from, to }) => {
    const { db, tx } = workflowDb(from);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(db as any);
    for (const confirm of [undefined, false, "true"]) {
      const response = await request(app).patch("/api/staff/tickets/44/status")
        .set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send({ status: to, expectedVersion: 1, confirm });
      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe(to === "RESOLVED" ? "RESOLUTION_GATE_FAILED" : "CONFIRMATION_REQUIRED");
    }
    expect(tx.ticket.updateMany).not.toHaveBeenCalled();
  });

  it("returns a safe conflict when the Ticket status changes before persistence", async () => {
    const { db, tx } = workflowDb("OPEN", 0);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(db as any);
    const response = await request(app).patch("/api/staff/tickets/44/status")
      .set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send({ status: "IN_PROGRESS", expectedVersion: 1 });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("VERSION_CONFLICT");
    expect(tx.ticket.findUnique).toHaveBeenCalledTimes(1);
    expect(tx.ticketWorkflowEvent.create).not.toHaveBeenCalled();
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
