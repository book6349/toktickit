import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

const activeAttachment = {
  id: 55,
  originalFilename: "vpn-error.png",
  storageKey: "private-vpn-error.png",
  mimeType: "image/png",
  sizeBytes: 2048,
  uploadedAt: new Date("2026-08-24T10:00:00.000Z"),
  removedAt: null,
  removalReason: null,
};

describe("Lab 2 attachment lifecycle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists attachments only after confirming ticket ownership", async () => {
    const ticketFindFirst = vi.fn().mockResolvedValue({ id: 10 });
    const attachmentFindMany = vi.fn().mockResolvedValue([activeAttachment]);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      requesterUser: {
        findFirst: vi.fn().mockResolvedValue({ id: 4, name: "Niran Suksan", email: "niran@example.com" }),
      },
      ticket: { findFirst: ticketFindFirst },
      attachment: { findMany: attachmentFindMany },
    } as any);

    const response = await request(app)
      .get("/api/tickets/10/attachments")
      .set("X-Requester-Id", "4");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      attachments: [{
        id: 55,
        originalFilename: "vpn-error.png",
        mimeType: "image/png",
        sizeBytes: 2048,
        uploadedAt: activeAttachment.uploadedAt.toISOString(),
        removedAt: null,
        removalReason: null,
        isRemoved: false,
      }],
    });
    expect(ticketFindFirst).toHaveBeenCalledWith({
      where: { id: 10, requesterId: 4 },
      select: { id: true },
    });
    expect(attachmentFindMany).toHaveBeenCalledWith({
      where: { ticketId: 10 },
      orderBy: { uploadedAt: "asc" },
    });
  });

  it("soft-removes an owned attachment and retains its audit metadata", async () => {
    const attachmentFindFirst = vi.fn().mockResolvedValue(activeAttachment);
    const update = vi.fn().mockResolvedValue({
      ...activeAttachment,
      removedAt: new Date("2026-08-24T12:00:00.000Z"),
      removalReason: "No longer needed",
      removedByRequesterId: 4,
    });
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      requesterUser: {
        findFirst: vi.fn().mockResolvedValue({ id: 4, name: "Niran Suksan", email: "niran@example.com" }),
      },
      attachment: { findFirst: attachmentFindFirst, update },
    } as any);

    const response = await request(app)
      .delete("/api/attachments/55")
      .set("X-Requester-Id", "4")
      .send({ reason: "No longer needed" });

    expect(response.status).toBe(200);
    expect(response.body.attachment).toMatchObject({
      id: 55,
      originalFilename: "vpn-error.png",
      removalReason: "No longer needed",
      isRemoved: true,
    });
    expect(attachmentFindFirst).toHaveBeenCalledWith({
      where: { id: 55, removedAt: null, ticket: { requesterId: 4 } },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 55 },
      data: expect.objectContaining({
        removalReason: "No longer needed",
        removedByRequesterId: 4,
        removedAt: expect.any(Date),
      }),
    });
  });

  it("requires a useful removal reason before touching the database", async () => {
    const findFirst = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      requesterUser: {
        findFirst: vi.fn().mockResolvedValue({ id: 4, name: "Niran Suksan", email: "niran@example.com" }),
      },
      attachment: { findFirst },
    } as any);

    const response = await request(app)
      .delete("/api/attachments/55")
      .set("X-Requester-Id", "4")
      .send({ reason: "no" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_REMOVAL_REASON");
    expect(findFirst).not.toHaveBeenCalled();
  });
});
