import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

// Issue 4 — Supertest test for GET /api/categories.
// We mock getPrisma() so the test doesn't require a live DB.
describe("GET /api/categories", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the four seeded categories in id order", async () => {
    const fakeCategories = [
      { id: 1, name: "Account and Access" },
      { id: 2, name: "Hardware" },
      { id: 3, name: "Software" },
      { id: 4, name: "Network" },
    ];

    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({
      category: {
        findMany: vi.fn().mockResolvedValue(fakeCategories),
      },
    } as any);

    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeCategories);
    expect(res.body[0].name).toBe("Account and Access");
    expect(res.body[3].name).toBe("Network");
  });
});
