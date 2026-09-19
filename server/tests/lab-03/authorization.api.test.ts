import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

const requester = {
  id: 1,
  name: "Ariya Somchai",
  email: "ariya.somchai@example.com",
  role: "REQUESTER",
  isActive: true,
  mustChangePassword: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const session = {
  id: 9,
  userId: 1,
  expiresAt: new Date(Date.now() + 60_000),
  revokedAt: null,
  user: requester,
};
const cookie = "toktickit_session=requester-token; toktickit_csrf=csrf-token";

describe("Lab 3 Requester authorization", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("uses session identity for Ticket creation and ignores requesterId input", async () => {
    const create = vi.fn().mockResolvedValue({ id: 31 });
    const findUnique = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
      id: 31,
      ticketNumber: "TT-20260919-000031",
      ticketDate: new Date(),
      requesterId: 1,
      categoryId: 2,
      relatedSystemId: 3,
      requestedPriority: "HIGH",
      itPriority: "HIGH",
      status: "NEW",
      summary: "VPN access request",
      description: "Please restore access to the corporate VPN.",
      createdAt: new Date(),
      updatedAt: new Date(),
      requester,
      category: { id: 2, name: "Hardware" },
      relatedSystem: { id: 3, name: "VPN" },
      attachments: [],
      });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue(session) },
      user: { findFirst: vi.fn().mockResolvedValue(requester) },
      category: { findFirst: vi.fn().mockResolvedValue({ id: 2, name: "Hardware" }) },
      relatedSystem: { findFirst: vi.fn().mockResolvedValue({ id: 3, name: "VPN" }) },
      ticket: { create, findUnique },
    } as any);
    const response = await request(app).post("/api/tickets").set("Cookie", cookie).set("X-CSRF-Token", "csrf-token").send({ requesterId: 999, categoryId: "2", relatedSystemId: "3", requestedPriority: "HIGH", summary: "VPN access request", description: "Please restore access to the corporate VPN." });
    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ requesterId: 1, itPriority: "HIGH" }) });
    expect(create.mock.calls[0][0].data.requesterId).not.toBe(999);
  });

  it("returns the same safe not-found response for cross-requester Ticket access", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { findFirst } } as any);
    const response = await request(app).get("/api/tickets/44").set("Cookie", cookie).set("X-Requester-Id", "44");
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("RESOURCE_NOT_FOUND");
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 44, requesterId: 1 } }));
  });

  it("returns Public Comments only and records a requester resolution indication", async () => {
    const findFirst = vi.fn().mockResolvedValue({ id: 44 });
    const publicComment = { id: 2, ticketId: 44, content: "Please try again.", createdAt: new Date(), author: requester };
    const update = vi.fn().mockResolvedValue({});
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      session: { findUnique: vi.fn().mockResolvedValue(session) },
      ticket: { findFirst, update },
      publicComment: { findMany: vi.fn().mockResolvedValue([publicComment]) },
    } as any);
    const comments = await request(app).get("/api/tickets/44/comments").set("Cookie", cookie);
    const resolution = await request(app).post("/api/tickets/44/resolution-indication").set("Cookie", cookie).set("X-CSRF-Token", "csrf-token").send({ appearsResolved: true });
    expect(comments.status).toBe(200);
    expect(comments.body.comments[0]).toMatchObject({ content: "Please try again.", author: { role: "REQUESTER" } });
    expect(comments.body).not.toHaveProperty("notes");
    expect(resolution.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ where: { id: 44 }, data: { requesterResolutionIndicatedAt: expect.any(Date) } });
    expect(crypto.createHash("sha256").update("requester-token").digest("hex")).toHaveLength(64);
  });
});
