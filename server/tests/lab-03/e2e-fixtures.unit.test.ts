import { describe, expect, it, vi } from "vitest";
import { hashPassword } from "../../src/auth.js";
import { disposableDatabaseName, prepareQueueFixtures } from "../../prisma/prepare-lab3-e2e.js";

const databaseURL = "postgresql://local:local@localhost:5432/toktickit_lab3_e2e_unit_20261001?schema=public";
const passwordHash = hashPassword("Local-development-password");

function fixtureDatabase() {
  const record = (id: number, email: string, role: string) => ({ id, email, role, isActive: true, mustChangePassword: true, passwordHash });
  const users = [
    record(101, "ariya.somchai@example.com", "REQUESTER"),
    record(204, "narin.kittisak@example.com", "REQUESTER"),
    record(309, "mali.chantarangsu@example.com", "REQUESTER"),
    record(410, "pimchanok.rattanakul@example.com", "REQUESTER"),
    record(501, "somchai.staff@example.com", "IT_STAFF"),
    record(632, "kanya.staff@example.com", "IT_STAFF"),
    record(900, "admin@example.com", "ADMINISTRATOR"),
  ];
  const prisma = {
    session: { count: vi.fn().mockResolvedValue(0) },
    user: { findMany: vi.fn().mockResolvedValue(users), update: vi.fn(), deleteMany: vi.fn() },
    category: { findUnique: vi.fn().mockResolvedValue({ id: 17 }) },
    relatedSystem: { findUnique: vi.fn().mockResolvedValue({ id: 29 }) },
    ticket: {
      findUnique: vi.fn().mockResolvedValue({ id: 981, status: "NEW", attachments: [{ id: 990, ticketId: 981, originalFilename: "baseline.txt", removedAt: null }] }),
      upsert: vi.fn().mockResolvedValue({}), count: vi.fn().mockResolvedValue(20), deleteMany: vi.fn(),
    },
  };
  return { prisma, users };
}

describe("Lab 3 disposable E2E preparation safeguards", () => {
  it.each([
    undefined,
    "postgresql://local:local@localhost:5432/toktickit",
    "postgresql://local:local@example.com:5432/toktickit_lab3_e2e_unit",
    "postgresql://local:local@localhost:5432/toktickit_lab3_e2e_bad%22name",
    "postgresql://local:local@localhost:5432/" + "toktickit_lab3_e2e_" + "x".repeat(64),
  ])("rejects an absent, shared, remote, or invalid database URL (%s)", (value) => {
    expect(() => disposableDatabaseName(value)).toThrow();
  });

  it("allows an explicitly named local disposable database", () => {
    expect(disposableDatabaseName(databaseURL)).toBe("toktickit_lab3_e2e_unit_20261001");
  });

  it("refuses a shared database before any database operation", async () => {
    const { prisma } = fixtureDatabase();
    await expect(prepareQueueFixtures(prisma, "postgresql://local:local@localhost:5432/toktickit")).rejects.toThrow();
    expect(prisma.session.count).not.toHaveBeenCalled();
    expect(prisma.ticket.upsert).not.toHaveBeenCalled();
  });

  it("refuses previously exercised fixtures without resetting accounts or deleting data", async () => {
    const { prisma } = fixtureDatabase();
    prisma.session.count.mockResolvedValue(1);
    await expect(prepareQueueFixtures(prisma, databaseURL)).rejects.toThrow("already been exercised");
    expect(prisma.user.findMany).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.ticket.upsert).not.toHaveBeenCalled();
    expect(prisma.ticket.deleteMany).not.toHaveBeenCalled();
  });

  it("requires the preexisting migration-baseline attachment before adding pagination data", async () => {
    const { prisma } = fixtureDatabase();
    prisma.ticket.findUnique.mockResolvedValue({ id: 981, status: "NEW", attachments: [] });
    await expect(prepareQueueFixtures(prisma, databaseURL)).rejects.toThrow("migrated baseline");
    expect(prisma.ticket.upsert).not.toHaveBeenCalled();
  });

  it("rejects an already changed first-login account before creating fixtures", async () => {
    const { prisma, users } = fixtureDatabase();
    users[0].mustChangePassword = false;
    await expect(prepareQueueFixtures(prisma, databaseURL)).rejects.toThrow("not pristine");
    expect(prisma.ticket.upsert).not.toHaveBeenCalled();
  });

  it("uses actual email-based IDs, preserves accounts, and populates stable realistic Queue fixtures", async () => {
    const { prisma } = fixtureDatabase();
    const result = await prepareQueueFixtures(prisma, databaseURL);
    expect(result).toMatchObject({ baselineTicketId: 981, reassignmentOwnerId: 632, queueTotal: 20 });
    expect(prisma.ticket.upsert).toHaveBeenCalledTimes(16);
    const records = prisma.ticket.upsert.mock.calls.map(([input]) => input);
    expect(new Set(records.map((record) => record.create.status)).size).toBe(8);
    expect(new Set(records.map((record) => record.create.requestedPriority)).size).toBe(3);
    expect(new Set(records.map((record) => record.create.requesterId))).toEqual(new Set([101, 204, 309, 410]));
    expect(new Set(records.map((record) => record.create.ownerId))).toEqual(new Set([null, 632]));
    expect(records.every((record) => Object.keys(record.update).length === 0)).toBe(true);
    await prepareQueueFixtures(prisma, databaseURL);
    const secondKeys = prisma.ticket.upsert.mock.calls.slice(16).map(([input]) => input.where.ticketNumber);
    expect(secondKeys).toEqual(records.map((record) => record.where.ticketNumber));
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.user.deleteMany).not.toHaveBeenCalled();
    expect(prisma.ticket.deleteMany).not.toHaveBeenCalled();
  });
});
