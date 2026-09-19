import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import * as prismaModule from "../../src/prisma.js";

const staff = { id: 7, name: "Somchai Staff", email: "staff@example.com", role: "IT_STAFF", isActive: true, mustChangePassword: false, createdAt: new Date(), updatedAt: new Date() };
const session = { id: 11, userId: 7, expiresAt: new Date(Date.now() + 60_000), revokedAt: null, user: staff };
const note = { id: 4, ticketId: 44, authorId: 7, content: "Checked device policy.", createdAt: new Date(), author: staff };

describe("Lab 3 Public Comments and Internal Notes", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("keeps Internal Notes on separate staff endpoints and records the session author", async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: 44 });
    const findMany = vi.fn().mockResolvedValue([note]);
    const create = vi.fn().mockResolvedValue(note);
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ session: { findUnique: vi.fn().mockResolvedValue(session) }, ticket: { findUnique }, internalNote: { findMany, create } } as any);
    const notes = await request(app).get("/api/staff/tickets/44/notes").set("Cookie", "toktickit_session=staff-token");
    const blank = await request(app).post("/api/staff/tickets/44/notes").set("Cookie", "toktickit_session=staff-token; toktickit_csrf=csrf-token").set("X-CSRF-Token", "csrf-token").send({ content: "   " });
    const added = await request(app).post("/api/staff/tickets/44/notes").set("Cookie", "toktickit_session=staff-token; toktickit_csrf=csrf-token").set("X-CSRF-Token", "csrf-token").send({ content: "  Checked device policy.  " });
    expect(notes.status).toBe(200);
    expect(notes.body.notes[0]).toMatchObject({ content: note.content, author: { role: "IT_STAFF" } });
    expect(blank.status).toBe(400);
    expect(added.status).toBe(201);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ data: { ticketId: 44, authorId: 7, content: "Checked device policy." } }));
  });

  it("does not allow Requesters to read staff notes", async () => {
    const requesterSession = { ...session, user: { ...staff, role: "REQUESTER" } };
    vi.spyOn(prismaModule, "getPrisma").mockReturnValue({ session: { findUnique: vi.fn().mockResolvedValue(requesterSession) }, ticket: { findUnique: vi.fn() }, internalNote: { findMany: vi.fn() } } as any);
    const response = await request(app).get("/api/staff/tickets/44/notes").set("Cookie", "toktickit_session=requester-token");
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});
