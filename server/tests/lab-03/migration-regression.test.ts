import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Lab 3 migration and seed contract", () => {
  it("maps the canonical User model to the Lab 2 table and preserves ownership fields", async () => {
    const schema = await readFile(new URL("../../prisma/schema.prisma", import.meta.url), "utf8");
    const migration = await readFile(new URL("../../prisma/migrations/20260919000000_lab3_auth_requester/migration.sql", import.meta.url), "utf8");
    expect(schema).toContain('@@map("RequesterUser")');
    expect(schema).toContain("model Session");
    expect(schema).toContain("model PublicComment");
    expect(schema).toContain("model InternalNote");
    expect(migration).toContain('ALTER TABLE "RequesterUser"');
    expect(migration).toContain('UPDATE "RequesterUser"');
    expect(migration).toContain('ALTER TABLE "Ticket"');
    expect(migration).toContain('FOREIGN KEY ("userId") REFERENCES "RequesterUser"');
  });

  it("keeps role fixtures and local-only initial credentials in the idempotent seed", async () => {
    const seed = await readFile(new URL("../../prisma/seed.ts", import.meta.url), "utf8");
    expect(seed).toContain("Local-development-password");
    expect(seed).toContain('role: "REQUESTER"');
    expect(seed).toContain('role: "IT_STAFF"');
    expect(seed).toContain('role: "ADMINISTRATOR"');
    expect(seed).toContain("upsert");
    expect(seed).not.toContain("passwordHash: \"Local-development-password\"");
  });
});
