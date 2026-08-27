import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

const ticket = {
  id: 10,
  ticketNumber: "TT-20260824-000010",
  ticketDate: new Date("2026-08-24T10:00:00.000Z"),
  requesterId: 4,
  categoryId: 2,
  relatedSystemId: 3,
  requestedPriority: "HIGH",
  status: "NEW",
  summary: "VPN access request",
  description: "Please restore access to the corporate VPN.",
  createdAt: new Date("2026-08-24T10:00:00.000Z"),
  updatedAt: new Date("2026-08-24T11:00:00.000Z"),
  requester: { id: 4, name: "Niran Suksan", email: "niran@example.com" },
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 3, name: "VPN" },
  attachments: [],
};

describe("Lab 2 My Tickets list", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("applies filters and pagination inside the selected requester scope", async () => {
    const count = vi.fn().mockResolvedValue(25);
    const findMany = vi.fn().mockResolvedValue([ticket]);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      requesterUser: {
        findFirst: vi.fn().mockResolvedValue({ id: 4, name: "Niran Suksan", email: "niran@example.com" }),
      },
      ticket: { count, findMany },
    } as any);

    const response = await request(app)
      .get("/api/tickets?search=VPN&categoryId=2&requestedPriority=HIGH&status=NEW&sortBy=createdAt&sortDirection=asc&page=2&pageSize=20")
      .set("X-Requester-Id", "4");

    const expectedWhere = {
      requesterId: 4,
      OR: [
        { summary: { contains: "VPN", mode: "insensitive" } },
        { description: { contains: "VPN", mode: "insensitive" } },
      ],
      categoryId: 2,
      requestedPriority: "HIGH",
      status: "NEW",
    };
    expect(response.status).toBe(200);
    expect(response.body.items[0].ticketNumber).toBe(ticket.ticketNumber);
    expect(response.body.pagination).toEqual({
      page: 2,
      pageSize: 20,
      totalItems: 25,
      totalPages: 2,
      hasPrevious: true,
      hasNext: false,
    });
    expect(count).toHaveBeenCalledWith({ where: expectedWhere });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expectedWhere,
      orderBy: [{ createdAt: "asc" }, { id: "desc" }],
      skip: 20,
      take: 20,
    }));
  });

  it("rejects invalid list controls before querying tickets", async () => {
    const count = vi.fn();
    const findMany = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      requesterUser: {
        findFirst: vi.fn().mockResolvedValue({ id: 4, name: "Niran Suksan", email: "niran@example.com" }),
      },
      ticket: { count, findMany },
    } as any);

    const response = await request(app)
      .get("/api/tickets?page=0&sortBy=unsupported")
      .set("X-Requester-Id", "4");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_QUERY");
    expect(count).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });
});
