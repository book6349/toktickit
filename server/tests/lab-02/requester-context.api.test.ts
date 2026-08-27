import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

describe("Lab 2 requester context and reference data", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns active requesters only", async () => {
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      requesterUser: {
        findMany: vi.fn().mockResolvedValue([
          { id: 1, name: "Ariya Somchai", email: "ariya.somchai@example.com" },
        ]),
      },
    } as any);

    const response = await request(app).get("/api/requesters/active");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      requesters: [{ id: 1, name: "Ariya Somchai", email: "ariya.somchai@example.com" }],
    });
  });

  it("rejects a missing or inactive requester context safely", async () => {
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      requesterUser: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as any);

    const missing = await request(app).get("/api/tickets");
    const inactive = await request(app).get("/api/tickets").set("X-Requester-Id", "999");

    expect(missing.status).toBe(400);
    expect(missing.body.error.code).toBe("INVALID_REQUESTER_CONTEXT");
    expect(inactive.status).toBe(400);
    expect(inactive.body.error.code).toBe("INVALID_REQUESTER_CONTEXT");
  });
});
