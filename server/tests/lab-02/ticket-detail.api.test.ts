import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

const ownedTicket = {
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

describe("Lab 2 owned Ticket Detail", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the detail only within the selected requester scope", async () => {
    const findFirst = vi.fn().mockResolvedValue(ownedTicket);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      requesterUser: {
        findFirst: vi.fn().mockResolvedValue({ id: 4, name: "Niran Suksan", email: "niran@example.com" }),
      },
      ticket: { findFirst },
    } as any);

    const response = await request(app)
      .get("/api/tickets/10")
      .set("X-Requester-Id", "4");

    expect(response.status).toBe(200);
    expect(response.body.ticket).toMatchObject({
      id: 10,
      ticketNumber: ownedTicket.ticketNumber,
      summary: ownedTicket.summary,
      description: ownedTicket.description,
      status: "NEW",
    });
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 10, requesterId: 4 },
    }));
  });

  it("returns the same safe not-found response for another requester's ticket", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      requesterUser: {
        findFirst: vi.fn().mockResolvedValue({ id: 4, name: "Niran Suksan", email: "niran@example.com" }),
      },
      ticket: { findFirst },
    } as any);

    const response = await request(app)
      .get("/api/tickets/99")
      .set("X-Requester-Id", "4");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: "TICKET_NOT_FOUND", message: "Ticket not found." },
    });
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 99, requesterId: 4 },
    }));
  });
});
