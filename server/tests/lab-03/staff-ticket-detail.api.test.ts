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
});
