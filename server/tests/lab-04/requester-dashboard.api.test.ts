import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

const asOf = "2026-10-30T12:00:00.000Z";
const cookie = "toktickit_session=requester-dashboard-token";
const activeStatuses = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "REOPENED"];

function auth(role = "REQUESTER", id = 4) {
  return {
    session: {
      findUnique: vi.fn().mockResolvedValue({
        id: 1, userId: id, revokedAt: null, expiresAt: new Date(Date.now() + 60_000),
        user: { id, name: "Requester", email: "requester@example.com", role, isActive: true, mustChangePassword: false },
      }),
    },
  };
}

describe("Lab 4 Requester dashboard API", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("counts every owned Ticket and returns at most five recent rows using inclusive UTC windows", async () => {
    const updated = { id: 10, ticketNumber: "TT-10", status: "OPEN", summary: "Recent update", updatedAt: new Date(asOf), resolvedAt: null, requestedPriority: "HIGH", itPriority: "MEDIUM", ownerId: 7, owner: { id: 7, name: "Staff" } };
    const resolved = { ...updated, id: 11, ticketNumber: "TT-11", status: "RESOLVED", summary: "Recently resolved", resolvedAt: new Date("2026-10-01T12:00:00.000Z") };
    const count = vi.fn().mockResolvedValueOnce(23).mockResolvedValueOnce(2).mockResolvedValueOnce(7).mockResolvedValueOnce(3);
    const findMany = vi.fn().mockResolvedValueOnce([updated]).mockResolvedValueOnce([resolved]);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ ...auth(), ticket: { count, findMany } } as any);

    const response = await request(app).get(`/api/requester/dashboard?asOf=${encodeURIComponent(asOf)}`).set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.asOfUtc).toBe(asOf);
    expect(response.body.metrics).toMatchObject({
      openTickets: { count: 23 },
      waitingForRequester: { count: 2 },
      recentlyUpdated: { count: 7, items: [{ id: 10 }] },
      recentlyResolved: { count: 3, items: [{ id: 11 }] },
    });
    expect(count).toHaveBeenNthCalledWith(1, { where: { requesterId: 4, status: { in: activeStatuses } } });
    expect(count).toHaveBeenNthCalledWith(2, { where: { requesterId: 4, status: "WAITING_FOR_REQUESTER" } });
    expect(count).toHaveBeenNthCalledWith(3, { where: { requesterId: 4, updatedAt: { gte: new Date("2026-10-23T12:00:00.000Z"), lte: new Date(asOf) } } });
    expect(count).toHaveBeenNthCalledWith(4, { where: { requesterId: 4, status: { in: ["RESOLVED", "CLOSED"] }, resolvedAt: { gte: new Date("2026-09-30T12:00:00.000Z"), lte: new Date(asOf) } } });
    expect(findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ take: 5, orderBy: [{ updatedAt: "desc" }, { id: "asc" }] }));
    expect(findMany).toHaveBeenNthCalledWith(2, expect.objectContaining({ take: 5, orderBy: [{ resolvedAt: "desc" }, { id: "asc" }] }));
    expect(count.mock.calls.every(([arg]) => !("skip" in arg) && !("take" in arg))).toBe(true);
  });

  it("rejects missing sessions, other roles, and timestamps without an explicit timezone", async () => {
    const count = vi.fn();
    const findMany = vi.fn();
    const db: any = { ...auth("IT_STAFF"), ticket: { count, findMany } };
    const getPrisma = vi.spyOn(prismaModule, "getPrisma").mockReturnValue(db);
    expect((await request(app).get("/api/requester/dashboard")).status).toBe(401);
    expect((await request(app).get("/api/requester/dashboard").set("Cookie", cookie)).status).toBe(403);
    getPrisma.mockReturnValue({ ...auth("REQUESTER"), ticket: { count, findMany } } as any);
    expect((await request(app).get("/api/requester/dashboard?asOf=2026-10-30T12:00:00").set("Cookie", cookie)).status).toBe(400);
    expect(count).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });

  it.each([
    {
      filters: { statusGroup: "active", updatedFrom: "2026-10-23T12:00:00.000Z", updatedTo: asOf },
      expected: { requesterId: 4, status: { in: activeStatuses }, updatedAt: { gte: new Date("2026-10-23T12:00:00.000Z"), lte: new Date(asOf) } },
    },
    {
      filters: { statusGroup: "resolved", resolvedFrom: "2026-09-30T12:00:00.000Z", resolvedTo: asOf, sortBy: "resolvedAt", sortDirection: "desc" },
      expected: { requesterId: 4, status: { in: ["RESOLVED", "CLOSED"] }, resolvedAt: { gte: new Date("2026-09-30T12:00:00.000Z"), lte: new Date(asOf) } },
    },
  ])("applies dashboard $filters to the full authenticated Ticket list", async ({ filters, expected }) => {
    const count = vi.fn().mockResolvedValue(25);
    const findMany = vi.fn().mockResolvedValue([]);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ ...auth(), ticket: { count, findMany } } as any);
    const response = await request(app).get("/api/tickets").query(filters).set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.pagination.totalItems).toBe(25);
    expect(count).toHaveBeenCalledWith({ where: expected });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expected, skip: 0, take: 10, orderBy: [{ [filters.statusGroup === "resolved" ? "resolvedAt" : "updatedAt"]: "desc" }, { id: "asc" }] }));
  });
});
