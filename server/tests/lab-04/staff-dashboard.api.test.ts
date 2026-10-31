import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

const asOf = "2026-10-30T12:00:00.000Z";
const cookie = "toktickit_session=staff-dashboard-token";
const activeStatuses = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "REOPENED"];

function auth(role = "IT_STAFF", id = 7) {
  return {
    session: {
      findUnique: vi.fn().mockResolvedValue({
        id: 1, userId: id, revokedAt: null, expiresAt: new Date(Date.now() + 60_000),
        user: { id, name: "Staff", email: "staff@example.com", role, isActive: true, mustChangePassword: false },
      }),
    },
  };
}

describe("Lab 4 Staff dashboard API", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("counts full active Ticket and assigned-action scopes, including zero breakdown values", async () => {
    const ticket = { id: 10, ticketNumber: "TT-10", status: "OPEN", summary: "VPN request", updatedAt: new Date(asOf), resolvedAt: null, requestedPriority: "HIGH", itPriority: "MEDIUM", ownerId: 7, owner: { id: 7, name: "Staff" } };
    const action = { id: 20, ticketId: 10, actionDateTime: new Date("2026-10-30T13:00:00Z"), description: "Restore access", result: "Pending", status: "PLANNED", performedBy: { id: 8, name: "Different actor" }, assignee: { id: 7, name: "Staff" }, ticket: { id: 10, ticketNumber: "TT-10", summary: "VPN request", status: "OPEN" } };
    const count = vi.fn().mockResolvedValueOnce(4).mockResolvedValueOnce(6).mockResolvedValueOnce(2).mockResolvedValueOnce(3);
    const groupBy = vi.fn().mockResolvedValueOnce([{ status: "OPEN", _count: { _all: 6 } }]).mockResolvedValueOnce([{ itPriority: "MEDIUM", _count: { _all: 6 } }]);
    const ticketFindMany = vi.fn().mockResolvedValue([ticket]);
    const actionFindMany = vi.fn().mockResolvedValue([action]);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ ...auth(), ticket: { count, groupBy, findMany: ticketFindMany }, actionTaken: { count, findMany: actionFindMany } } as any);

    const response = await request(app).get(`/api/staff/dashboard?asOf=${encodeURIComponent(asOf)}`).set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.asOfUtc).toBe(asOf);
    expect(response.body.metrics).toMatchObject({
      unassignedActive: { count: 4 }, myActiveTickets: { count: 6 },
      activeByStatus: activeStatuses.map((value) => ({ value, count: value === "OPEN" ? 6 : 0 })),
      activeByItPriority: [{ value: "LOW", count: 0 }, { value: "MEDIUM", count: 6 }, { value: "HIGH", count: 0 }],
      recentlyUpdatedActive: { count: 2, items: [{ id: 10 }] },
      myActiveActionsTaken: { count: 3, items: [{ id: 20, performedBy: { id: 8 }, assignee: { id: 7 } }] },
    });
    expect(count).toHaveBeenNthCalledWith(1, { where: { status: { in: activeStatuses }, ownerId: null } });
    expect(count).toHaveBeenNthCalledWith(2, { where: { status: { in: activeStatuses }, ownerId: 7 } });
    expect(count).toHaveBeenNthCalledWith(3, { where: { status: { in: activeStatuses }, updatedAt: { gte: new Date("2026-10-23T12:00:00.000Z"), lte: new Date(asOf) } } });
    expect(count).toHaveBeenNthCalledWith(4, { where: { assigneeId: 7, status: { in: ["PLANNED", "IN_PROGRESS"] } } });
    expect(groupBy).toHaveBeenNthCalledWith(1, { by: ["status"], where: { status: { in: activeStatuses } }, _count: { _all: true } });
    expect(groupBy).toHaveBeenNthCalledWith(2, { by: ["itPriority"], where: { status: { in: activeStatuses } }, _count: { _all: true } });
    expect(ticketFindMany).toHaveBeenCalledWith(expect.objectContaining({ take: 5, orderBy: [{ updatedAt: "desc" }, { id: "asc" }] }));
    expect(actionFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { assigneeId: 7, status: { in: ["PLANNED", "IN_PROGRESS"] } }, take: 5, orderBy: [{ actionDateTime: "asc" }, { id: "asc" }] }));
  });

  it("paginates dashboard drill-downs with the same active status, owner, priority and time predicates", async () => {
    const count = vi.fn().mockResolvedValue(25);
    const findMany = vi.fn().mockResolvedValue([]);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ ...auth(), ticket: { count, findMany } } as any);
    const from = "2026-10-23T12:00:00.000Z";
    const response = await request(app).get(`/api/staff/dashboard/tickets?status=OPEN&itPriority=HIGH&ownerScope=me&updatedFrom=${from}&updatedTo=${asOf}&page=2&pageSize=20`).set("Cookie", cookie);
    const where = {
      status: { in: activeStatuses },
      AND: [{ status: "OPEN" }, { ownerId: 7 }],
      itPriority: "HIGH",
      updatedAt: { gte: new Date(from), lte: new Date(asOf) },
    };
    expect(response.status).toBe(200);
    expect(response.body.pagination).toMatchObject({ page: 2, pageSize: 20, totalItems: 25, totalPages: 2 });
    expect(count).toHaveBeenCalledWith({ where });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where, skip: 20, take: 20 }));
  });

  it("allows Administrator dashboards, denies Requesters, and rejects out-of-scope filters", async () => {
    const count = vi.fn().mockResolvedValue(0);
    const groupBy = vi.fn().mockResolvedValue([]);
    const findMany = vi.fn().mockResolvedValue([]);
    const actionTaken = { count, findMany };
    const ticket = { count, groupBy, findMany };
    const getPrisma = vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ ...auth("ADMINISTRATOR", 2), ticket, actionTaken } as any);
    expect((await request(app).get("/api/staff/dashboard").set("Cookie", cookie)).status).toBe(200);
    getPrisma.mockReturnValue({ ...auth("REQUESTER", 4), ticket, actionTaken } as any);
    expect((await request(app).get("/api/staff/dashboard").set("Cookie", cookie)).status).toBe(403);
    getPrisma.mockReturnValue({ ...auth("ADMINISTRATOR", 2), ticket, actionTaken } as any);
    expect((await request(app).get("/api/staff/dashboard/tickets?status=CLOSED").set("Cookie", cookie)).status).toBe(400);
  });
});
