import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

describe("Lab 2 reference data failures", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns active related systems in the documented wrapper", async () => {
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      relatedSystem: {
        findMany: vi.fn().mockResolvedValue([{ id: 1, name: "VPN" }]),
      },
    } as any);

    const response = await request(app).get("/api/related-systems");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ relatedSystems: [{ id: 1, name: "VPN" }] });
  });

  it("returns a safe 500 instead of fabricated categories when the database fails", async () => {
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      category: {
        findMany: vi.fn().mockRejectedValue(new Error("database unavailable")),
      },
    } as any);

    const response = await request(app).get("/api/categories");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { code: "INTERNAL_ERROR", message: "Unable to load categories." },
    });
  });
});
