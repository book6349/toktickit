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

  it.each(["REQUESTER", "ADMINISTRATOR"])("does not expose the Queue to %s", async (role) => {
    const requesterSession = { ...session, user: { ...staff, role } };
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ session: { findUnique: vi.fn().mockResolvedValue(requesterSession) }, ticket: { count: vi.fn(), findMany: vi.fn() } } as any);
    const response = await request(app).get("/api/staff/tickets").set("Cookie", "toktickit_session=requester-token");
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it.each(["updatedAt", "createdAt", "ticketNumber", "status", "requestedPriority", "itPriority", "owner"]
    .flatMap((field) => ["asc", "desc"].map((direction) => ({ field, direction }))))
  ("applies the documented $field $direction ordering with a deterministic tie-breaker", async ({ field, direction }) => {
    const findMany = vi.fn().mockResolvedValue([]);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { count: vi.fn().mockResolvedValue(0), findMany },
    } as any);
    const response = await request(app).get(`/api/staff/tickets?sortBy=${field}&sortDirection=${direction}`).set("Cookie", "toktickit_session=staff-token");
    expect(response.status).toBe(200);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: [{ [field === "owner" ? "ownerId" : field]: direction }, { id: direction }],
    }));
  });

  it.each([
    { query: "status=waiting_for_requester", where: { status: "WAITING_FOR_REQUESTER" } },
    { query: "requestedPriority=high", where: { requestedPriority: "HIGH" } },
    { query: "itPriority=low", where: { itPriority: "LOW" } },
    { query: "ownerId=7", where: { ownerId: 7 } },
    { query: "ownership=assigned", where: { ownerId: { not: null } } },
    { query: "ownership=unassigned", where: { ownerId: null } },
    { query: "ownerId=7&ownership=assigned", where: { ownerId: 7 } },
    { query: "ownerId=7&ownership=unassigned", where: { ownerId: 7, AND: [{ ownerId: null }] } },
    { query: "status=OPEN&requestedPriority=HIGH&itPriority=LOW&ownerId=7", where: { status: "OPEN", requestedPriority: "HIGH", itPriority: "LOW", ownerId: 7 } },
  ])("keeps count and item retrieval in the same $query filter scope", async ({ query, where }) => {
    const count = vi.fn().mockResolvedValue(0);
    const findMany = vi.fn().mockResolvedValue([]);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { count, findMany },
    } as any);
    const response = await request(app).get(`/api/staff/tickets?${query}`).set("Cookie", "toktickit_session=staff-token");
    expect(response.status).toBe(200);
    expect(count).toHaveBeenCalledWith({ where });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where }));
  });

  it("searches every documented field case-insensitively", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { count: vi.fn().mockResolvedValue(0), findMany },
    } as any);
    const response = await request(app).get("/api/staff/tickets?search=VPN").set("Cookie", "toktickit_session=staff-token");
    expect(response.status).toBe(200);
    expect(findMany.mock.calls[0][0].where.OR).toEqual([
      { ticketNumber: { contains: "VPN", mode: "insensitive" } },
      { summary: { contains: "VPN", mode: "insensitive" } },
      { description: { contains: "VPN", mode: "insensitive" } },
      { requester: { name: { contains: "VPN", mode: "insensitive" } } },
      { requester: { email: { contains: "VPN", mode: "insensitive" } } },
    ]);
  });

  it.each(["page=0", "page=-1", "pageSize=15", "sortBy=unknown", "sortDirection=sideways", "status=UNKNOWN", "requestedPriority=URGENT", "itPriority=URGENT", "ownerId=0", "ownership=unknown"])
  ("rejects %s before querying Queue data", async (query) => {
    const count = vi.fn();
    const findMany = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { count, findMany },
    } as any);
    const response = await request(app).get(`/api/staff/tickets?${query}`).set("Cookie", "toktickit_session=staff-token");
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
    expect(count).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });
});
