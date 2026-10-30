import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

const staff = { id: 7, name: "Somchai Staff", email: "staff@example.com", role: "IT_STAFF", isActive: true, mustChangePassword: false, createdAt: new Date(), updatedAt: new Date() };
const session = { id: 11, userId: 7, expiresAt: new Date(Date.now() + 60_000), revokedAt: null, user: staff };
const mutationCookie = "toktickit_session=staff-token; toktickit_csrf=csrf-token";
const statuses = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED"];
const transitions: Record<string, string[]> = {
  NEW: ["OPEN", "CANCELLED"],
  OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  CANCELLED: ["REOPENED"],
};
const matrix = Object.keys(transitions).flatMap((from) => statuses.map((to) => ({ from, to, allowed: transitions[from].includes(to) })));

function makeTicket(status = "OPEN", workflowVersion = 1) {
  return {
    id: 44, ticketNumber: "TT-20261030-000044", ticketDate: new Date(), requesterId: 2, ownerId: 7, categoryId: 1, relatedSystemId: 2,
    requestedPriority: "HIGH", itPriority: "MEDIUM", status, workflowVersion,
    summary: "VPN access request", description: "Please restore access to the corporate VPN.", requesterResolutionIndicatedAt: null,
    resolutionSummary: ["RESOLVED", "CLOSED"].includes(status) ? "VPN access restored." : null,
    resolvedAt: ["RESOLVED", "CLOSED"].includes(status) ? new Date("2026-10-30T09:00:00.000Z") : null,
    resolvedById: ["RESOLVED", "CLOSED"].includes(status) ? 7 : null,
    createdAt: new Date(), updatedAt: new Date(), requester: { id: 2, name: "Ariya Requester", email: "ariya@example.com", role: "REQUESTER" },
    owner: staff, resolvedBy: staff, category: { id: 1, name: "Access" }, relatedSystem: { id: 2, name: "VPN" },
    attachments: [], comments: [], notes: [],
  };
}

function wireDb(options: { role?: string; from?: string; version?: number; actions?: string[]; count?: number } = {}) {
  const requester = options.role === "REQUESTER";
  const actor = { ...staff, id: requester ? 2 : 7, role: options.role ?? "IT_STAFF" };
  const activeSession = { ...session, userId: actor.id, user: actor };
  const ticket = makeTicket(options.from ?? "OPEN", options.version ?? 1);
  const event = {
    id: 9, fromStatus: "RESOLVED", toStatus: "REOPENED", version: 4, createdAt: new Date("2026-10-30T10:00:00.000Z"),
    actor: { id: 7, name: "Somchai Staff" }, reason: "Requester reported the issue again.", resolutionSummary: "VPN access restored.",
    resolvedAt: new Date("2026-10-30T09:00:00.000Z"), resolvedBy: { id: 7, name: "Somchai Staff" },
  };
  const tx = {
    ticket: {
      findUnique: vi.fn(async () => ({ ...ticket })),
      updateMany: vi.fn(async ({ data }: any) => {
        if ((options.count ?? 1) === 1) {
          Object.assign(ticket, data);
          ticket.workflowVersion = (options.version ?? 1) + 1;
        }
        return { count: options.count ?? 1 };
      }),
    },
    actionTaken: { findMany: vi.fn().mockResolvedValue((options.actions ?? ["COMPLETED"]).map((status) => ({ status }))) },
    ticketWorkflowEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
  };
  const db = {
    session: { findUnique: vi.fn().mockResolvedValue(activeSession) },
    ticket: {
      findUnique: vi.fn(async () => ticket),
      findFirst: vi.fn(async () => ticket),
    },
    actionTaken: { findMany: vi.fn().mockResolvedValue((options.actions ?? ["COMPLETED"]).map((status) => ({ status }))) },
    ticketWorkflowEvent: { findMany: vi.fn().mockResolvedValue([event]) },
    $transaction: vi.fn((callback: (value: any) => unknown) => callback(tx)),
  };
  return { db, tx, ticket };
}

function patchStatus(body: Record<string, unknown>) {
  return request(app).patch("/api/staff/tickets/44/status")
    .set("Cookie", mutationCookie).set("X-CSRF-Token", "csrf-token").send(body);
}

function bodyFor(from: string, to: string) {
  return {
    status: to,
    expectedVersion: 1,
    ...( ["RESOLVED", "CLOSED", "CANCELLED"].includes(to) ? { confirm: true } : {}),
    ...(to === "RESOLVED" ? { resolutionSummary: "VPN access restored." } : {}),
    ...(to === "REOPENED" ? { reason: "Requester reported the issue again." } : {}),
  };
}

describe("Lab 4 Ticket workflow API", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it.each(matrix)("enforces $from -> $to (allowed=$allowed)", async ({ from, to, allowed }) => {
    const { db, tx } = wireDb({ from });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(db as any);
    const response = await patchStatus(bodyFor(from, to));
    if (!allowed) {
      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe("INVALID_TRANSITION");
      expect(tx.ticket.updateMany).not.toHaveBeenCalled();
      expect(tx.ticketWorkflowEvent.create).not.toHaveBeenCalled();
      expect(tx.ticket.findUnique).toHaveBeenCalledTimes(1);
      return;
    }
    expect(response.status).toBe(200);
    expect(response.body.ticket.status).toBe(to);
    expect(response.body.ticket.workflowVersion).toBe(2);
    expect(tx.ticket.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.ticketWorkflowEvent.create).toHaveBeenCalledTimes(1);
  });

  it("requires a completed action and a summary, and ignores cancelled actions as blockers", async () => {
    const missingSummary = wireDb({ actions: ["COMPLETED"] });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(missingSummary.db as any);
    const noSummary = await patchStatus({ status: "RESOLVED", expectedVersion: 1, confirm: true });
    expect(noSummary.status).toBe(422);
    expect(noSummary.body.error.code).toBe("RESOLUTION_GATE_FAILED");
    expect(missingSummary.tx.ticket.updateMany).not.toHaveBeenCalled();

    const noCompletedAction = wireDb({ actions: ["CANCELLED"] });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(noCompletedAction.db as any);
    const noCompleted = await patchStatus({ status: "RESOLVED", expectedVersion: 1, confirm: true, resolutionSummary: "Fixed." });
    expect(noCompleted.status).toBe(422);
    expect(noCompleted.body.error.code).toBe("RESOLUTION_GATE_FAILED");
    expect(noCompletedAction.tx.ticket.updateMany).not.toHaveBeenCalled();
    expect(noCompletedAction.ticket.status).toBe("OPEN");

    const blockedAction = wireDb({ actions: ["COMPLETED", "PLANNED"] });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(blockedAction.db as any);
    const blocked = await patchStatus({ status: "RESOLVED", expectedVersion: 1, confirm: true, resolutionSummary: "Fixed." });
    expect(blocked.status).toBe(422);
    expect(blocked.body.error.code).toBe("RESOLUTION_GATE_FAILED");
    expect(blockedAction.tx.ticket.updateMany).not.toHaveBeenCalled();
    expect(blockedAction.ticket.status).toBe("OPEN");

    const allowedWithCancelled = wireDb({ actions: ["COMPLETED", "CANCELLED"] });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(allowedWithCancelled.db as any);
    const resolved = await patchStatus({ status: "RESOLVED", expectedVersion: 1, confirm: true, resolutionSummary: "Fixed." });
    expect(resolved.status).toBe(200);
    expect(allowedWithCancelled.tx.ticket.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 44, status: "OPEN", workflowVersion: 1 },
      data: expect.objectContaining({ status: "RESOLVED", resolutionSummary: "Fixed.", resolvedById: 7, resolvedAt: expect.any(Date), workflowVersion: { increment: 1 } }),
    }));
    expect(allowedWithCancelled.tx.ticketWorkflowEvent.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ toStatus: "RESOLVED", resolutionSummary: "Fixed.", version: 2, actorId: 7 }),
    }));
  });

  it("requires confirmation for closing and preserves the resolution summary", async () => {
    const noResolution = wireDb({ from: "RESOLVED" });
    noResolution.ticket.resolutionSummary = null;
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(noResolution.db as any);
    const blockedClose = await patchStatus({ status: "CLOSED", expectedVersion: 1, confirm: true });
    expect(blockedClose.status).toBe(422);
    expect(blockedClose.body.error.code).toBe("RESOLUTION_GATE_FAILED");
    expect(noResolution.tx.ticket.updateMany).not.toHaveBeenCalled();

    const missingConfirm = wireDb({ from: "RESOLVED" });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(missingConfirm.db as any);
    const rejected = await patchStatus({ status: "CLOSED", expectedVersion: 1 });
    expect(rejected.status).toBe(422);
    expect(rejected.body.error.code).toBe("CONFIRMATION_REQUIRED");
    expect(missingConfirm.tx.ticket.updateMany).not.toHaveBeenCalled();

    const closed = wireDb({ from: "RESOLVED" });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(closed.db as any);
    const accepted = await patchStatus({ status: "CLOSED", expectedVersion: 1, confirm: true });
    expect(accepted.status).toBe(200);
    expect(closed.tx.ticket.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { status: "CLOSED", workflowVersion: { increment: 1 } },
    }));
    expect(closed.ticket.resolutionSummary).toBe("VPN access restored.");
  });

  it("requires a reason to reopen and keeps the prior resolution in history while clearing current fields", async () => {
    const missingReason = wireDb({ from: "RESOLVED" });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(missingReason.db as any);
    const rejected = await patchStatus({ status: "REOPENED", expectedVersion: 1 });
    expect(rejected.status).toBe(422);
    expect(missingReason.tx.ticket.updateMany).not.toHaveBeenCalled();

    const reopened = wireDb({ from: "RESOLVED" });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(reopened.db as any);
    const accepted = await patchStatus({ status: "REOPENED", expectedVersion: 1, reason: "The issue returned." });
    expect(accepted.status).toBe(200);
    expect(reopened.ticket).toMatchObject({ status: "REOPENED", resolutionSummary: null, resolvedAt: null, resolvedById: null });
    expect(reopened.tx.ticketWorkflowEvent.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ reason: "The issue returned.", resolutionSummary: "VPN access restored.", resolvedAt: expect.any(Date) }),
    }));
  });

  it("rejects stale versions and failed compare-and-set writes without appending an event", async () => {
    const stale = wireDb({ from: "OPEN", version: 2 });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(stale.db as any);
    const staleResponse = await patchStatus({ status: "IN_PROGRESS", expectedVersion: 1 });
    expect(staleResponse.status).toBe(409);
    expect(staleResponse.body.error.code).toBe("VERSION_CONFLICT");
    expect(stale.tx.ticket.updateMany).not.toHaveBeenCalled();
    expect(stale.tx.ticketWorkflowEvent.create).not.toHaveBeenCalled();
    expect(stale.ticket.status).toBe("OPEN");

    const raced = wireDb({ from: "OPEN", count: 0 });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(raced.db as any);
    const raceResponse = await patchStatus({ status: "IN_PROGRESS", expectedVersion: 1 });
    expect(raceResponse.status).toBe(409);
    expect(raceResponse.body.error.code).toBe("VERSION_CONFLICT");
    expect(raced.tx.ticketWorkflowEvent.create).not.toHaveBeenCalled();
    expect(raced.ticket.status).toBe("OPEN");
  });

  it.each(["REQUESTER", "ADMINISTRATOR"]) ("keeps %s formal status read-only", async (role) => {
    const { db, tx } = wireDb({ role });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(db as any);
    const response = await patchStatus({ status: "IN_PROGRESS", expectedVersion: 1 });
    expect(response.status).toBe(403);
    expect(db.ticket.findUnique).not.toHaveBeenCalled();
    expect(tx.ticket.findUnique).not.toHaveBeenCalled();
  });

  it("returns owned Ticket workflow to Requesters without exposing reopening reasons or staff controls", async () => {
    const { db } = wireDb({ role: "REQUESTER", from: "REOPENED", version: 4 });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(db as any);
    const response = await request(app).get("/api/tickets/44/workflow").set("Cookie", "toktickit_session=staff-token");
    expect(response.status).toBe(200);
    expect(db.ticket.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 44, requesterId: 2 } }));
    expect(response.body.permittedNextStatuses).toEqual([]);
    expect(response.body.events[0]).not.toHaveProperty("reason");
    expect(response.body.events[0].resolutionSummary).toBe("VPN access restored.");
  });

  it("returns 404 when a Requester asks for another person's workflow", async () => {
    const { db } = wireDb({ role: "REQUESTER" });
    db.ticket.findFirst.mockResolvedValue(null as any);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue(db as any);
    const response = await request(app).get("/api/tickets/44/workflow").set("Cookie", "toktickit_session=staff-token");
    expect(response.status).toBe(404);
    expect(db.ticket.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 44, requesterId: 2 } }));
    expect(db.ticketWorkflowEvent.findMany).not.toHaveBeenCalled();
  });
});
