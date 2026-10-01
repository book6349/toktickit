import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";
import { regressionCookie, requesterSession } from "../lab-03/regression-fixtures.js";

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

  it("rejects missing sessions and inactive accounts without accepting the old requester header", async () => {
    const count = vi.fn();
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      ...requesterSession(999, false),
      ticket: { count },
    } as any);

    const missing = await request(app).get("/api/tickets");
    const forgedHeader = await request(app).get("/api/tickets").set("X-Requester-Id", "1");
    const inactive = await request(app).get("/api/tickets").set("Cookie", regressionCookie);

    expect(missing.status).toBe(401);
    expect(missing.body.error.code).toBe("UNAUTHENTICATED");
    expect(forgedHeader.status).toBe(401);
    expect(inactive.status).toBe(401);
    expect(inactive.body).toEqual(missing.body);
    expect(count).not.toHaveBeenCalled();
  });
});
