import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

const staff = {
  id: 7, name: "Somchai Staff", email: "staff@example.com", role: "IT_STAFF", isActive: true,
  mustChangePassword: false, createdAt: new Date("2026-09-19T00:00:00.000Z"), updatedAt: new Date("2026-09-19T00:00:00.000Z"),
};
const requester = { id: 2, name: "Ariya Requester", email: "ariya@example.com", role: "REQUESTER", isActive: true };
const session = { id: 11, userId: 7, expiresAt: new Date(Date.now() + 60_000), revokedAt: null, user: staff };
const ticket = {
  id: 44, ticketNumber: "TT-20260919-000044", ticketDate: new Date(), requesterId: 2, ownerId: 7,
  categoryId: 1, relatedSystemId: 2, requestedPriority: "HIGH", itPriority: "MEDIUM", status: "OPEN",
  summary: "VPN access request", description: "Please restore access to the corporate VPN.", requesterResolutionIndicatedAt: null,
  createdAt: new Date(), updatedAt: new Date(), requester, owner: staff,
  category: { id: 1, name: "Access" }, relatedSystem: { id: 2, name: "VPN" },
};

describe("Lab 3 IT Staff Queue", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("enforces staff-only access and returns filtered paginated queue data", async () => {
    const count = vi.fn().mockResolvedValue(1);
    const findMany = vi.fn().mockResolvedValue([ticket]);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { count, findMany } } as any);
    const response = await request(app).get("/api/staff/tickets?search=VPN&status=OPEN&itPriority=MEDIUM&ownership=assigned&page=2&pageSize=20&sortBy=owner&sortDirection=asc").set("Cookie", "toktickit_session=staff-token");
    expect(response.status).toBe(200);
    expect(response.body.items[0]).toMatchObject({ ticketNumber: ticket.ticketNumber, owner: { role: "IT_STAFF" } });
    expect(response.body.pagination).toMatchObject({ page: 2, pageSize: 20, totalItems: 1, totalPages: 1 });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 20, orderBy: [{ ownerId: "asc" }, { id: "asc" }] }));
    expect(findMany.mock.calls[0][0].where).toMatchObject({ status: "OPEN", itPriority: "MEDIUM", ownerId: { not: null } });
  });

  it("rejects invalid queries before touching ticket data", async () => {
    const findMany = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { count: vi.fn(), findMany } } as any);
    const response = await request(app).get("/api/staff/tickets?pageSize=15").set("Cookie", "toktickit_session=staff-token");
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
    expect(findMany).not.toHaveBeenCalled();
  });

  it("does not expose the Queue to Requesters or Administrators", async () => {
    const requesterSession = { ...session, user: { ...staff, role: "REQUESTER" } };
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ session: { findUnique: vi.fn().mockResolvedValue(requesterSession) }, ticket: { count: vi.fn(), findMany: vi.fn() } } as any);
    const response = await request(app).get("/api/staff/tickets").set("Cookie", "toktickit_session=requester-token");
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});
