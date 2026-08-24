import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

describe("Lab 2 ticket creation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns field errors without persisting an invalid ticket", async () => {
    const create = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      requesterUser: {
        findFirst: vi.fn().mockResolvedValue({ id: 1, name: "Ariya", email: "ariya@example.com" }),
      },
      ticket: { create },
    } as any);

    const response = await request(app)
      .post("/api/tickets")
      .set("X-Requester-Id", "1")
      .send({
        categoryId: "not-an-id",
        relatedSystemId: "2",
        requestedPriority: "HIGH",
        summary: "bad",
        description: "short",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.fields).toMatchObject({
      categoryId: expect.any(String),
      summary: expect.any(String),
      description: expect.any(String),
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("creates a new ticket with the official number and NEW status", async () => {
    const created = {
      id: 10,
      ticketNumber: "TT-20260824-123456",
      ticketDate: new Date("2026-08-24T10:00:00.000Z"),
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 3,
      requestedPriority: "HIGH",
      status: "NEW",
      summary: "VPN access request",
      description: "Please restore access to the corporate VPN.",
      createdAt: new Date("2026-08-24T10:00:00.000Z"),
      updatedAt: new Date("2026-08-24T10:00:00.000Z"),
    };
    const create = vi.fn().mockResolvedValue(created);
    const findUnique = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...created,
        requester: { id: 1, name: "Ariya", email: "ariya@example.com" },
        category: { id: 2, name: "Hardware" },
        relatedSystem: { id: 3, name: "VPN" },
        attachments: [],
      });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      requesterUser: {
        findFirst: vi.fn().mockResolvedValue({ id: 1, name: "Ariya", email: "ariya@example.com" }),
      },
      category: { findFirst: vi.fn().mockResolvedValue({ id: 2, name: "Hardware" }) },
      relatedSystem: { findFirst: vi.fn().mockResolvedValue({ id: 3, name: "VPN" }) },
      ticket: { findUnique, create },
    } as any);

    const response = await request(app)
      .post("/api/tickets")
      .set("X-Requester-Id", "1")
      .send({
        categoryId: "2",
        relatedSystemId: "3",
        requestedPriority: "HIGH",
        summary: "VPN access request",
        description: "Please restore access to the corporate VPN.",
      });

    expect(response.status).toBe(201);
    expect(response.body.ticket.ticketNumber).toMatch(/^TT-\d{8}-\d{6}$/);
    expect(response.body.ticket.status).toBe("NEW");
    expect(create).toHaveBeenCalledOnce();
  });
});
