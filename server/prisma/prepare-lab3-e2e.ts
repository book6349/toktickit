import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyPassword } from "../src/auth.js";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.dirname(serverRoot);
const initialPassword = "Local-development-password";
const baselineNumber = "TT-DOCKER-PRELAB3-001";

export function disposableDatabaseName(value: string | undefined): string {
  if (!value) throw new Error("Set DATABASE_URL explicitly to a new disposable Lab 3 E2E database.");
  const url = new URL(value);
  const name = decodeURIComponent(url.pathname.slice(1));
  if (!["postgres:", "postgresql:"].includes(url.protocol) ||
      !["localhost", "127.0.0.1"].includes(url.hostname) ||
      !/^toktickit_lab3_e2e_[a-z0-9_]+$/.test(name) || name.length > 63) {
    throw new Error("E2E preparation requires a local database named toktickit_lab3_e2e_<unique_run>.");
  }
  return name;
}

export async function prepareQueueFixtures(prisma: any, databaseURL: string | undefined) {
  const databaseName = disposableDatabaseName(databaseURL);
  if (await prisma.session.count() !== 0) {
    throw new Error("This database has already been exercised. Use a new disposable database; existing data is not reset.");
  }
  const users = await prisma.user.findMany();
  const byEmail = new Map<string, any>(users.map((user: any) => [user.email, user]));
  for (const [email, role] of [
    ["ariya.somchai@example.com", "REQUESTER"],
    ["somchai.staff@example.com", "IT_STAFF"],
    ["admin@example.com", "ADMINISTRATOR"],
  ]) {
    const user = byEmail.get(email);
    if (!user || user.role !== role || !user.isActive || !user.mustChangePassword ||
        !verifyPassword(initialPassword, user.passwordHash)) {
      throw new Error(`The seeded first-login fixture is not pristine: ${email}`);
    }
  }
  const owner = byEmail.get("kanya.staff@example.com");
  if (!owner?.isActive || owner.role !== "IT_STAFF") throw new Error("Active Kanya Staff fixture is missing.");
  const baseline = await prisma.ticket.findUnique({ where: { ticketNumber: baselineNumber }, include: { attachments: true } });
  if (!baseline || baseline.status !== "NEW" || !baseline.attachments.some((attachment: any) =>
    attachment.originalFilename === "baseline.txt" && attachment.removedAt === null && attachment.ticketId === baseline.id)) {
    throw new Error("The migrated baseline Ticket/Attachment fixture is missing or has already been modified.");
  }
  const category = await prisma.category.findUnique({ where: { name: "Hardware" } });
  const system = await prisma.relatedSystem.findUnique({ where: { name: "Corporate Laptop" } });
  const requesters = users.filter((user: any) => user.role === "REQUESTER" && user.isActive);
  if (!category || !system || requesters.length < 4) throw new Error("Required reference or active Requester fixtures are missing.");
  const priorities = ["LOW", "MEDIUM", "HIGH"];
  const statuses = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED"];
  for (let index = 0; index < 16; index += 1) {
    const ticketNumber = `TT-LAB3-E2E-QUEUE-${String(index + 1).padStart(6, "0")}`;
    await prisma.ticket.upsert({
      where: { ticketNumber }, update: {},
      create: {
        ticketNumber, requesterId: requesters[index % requesters.length].id,
        categoryId: category.id, relatedSystemId: system.id,
        requestedPriority: priorities[index % priorities.length], itPriority: priorities[(index + 1) % priorities.length],
        status: statuses[index % statuses.length], ownerId: index % 2 === 0 ? owner.id : null,
        summary: `Queue fixture ${index + 1}: workstation support`,
        description: "Synthetic local E2E pagination fixture. No personal data.",
      },
    });
  }
  return { databaseName, baselineTicketId: baseline.id, reassignmentOwnerId: owner.id, queueTotal: await prisma.ticket.count() };
}

function runPrisma(args: string[], input?: string) {
  console.log(`server: npx --no-install prisma ${args.join(" ")}`);
  execFileSync(process.execPath, [path.join(serverRoot, "node_modules/prisma/build/index.js"), ...args], {
    cwd: serverRoot, env: process.env, input, stdio: [input === undefined ? "inherit" : "pipe", "inherit", "inherit"],
  });
}

async function baselineSnapshot(prisma: PrismaClient) {
  const tables: Record<string, string> = {
    requesters: 'SELECT "id", "name", "email", "isActive", "createdAt" FROM "RequesterUser" ORDER BY "id"',
    tickets: 'SELECT "id", "ticketNumber", "requesterId", "categoryId", "relatedSystemId", "requestedPriority", "status", "summary", "description" FROM "Ticket" ORDER BY "id"',
    attachments: 'SELECT "id", "ticketId", "originalFilename", "storageKey", "mimeType", "sizeBytes", "removedAt" FROM "Attachment" ORDER BY "id"',
    categories: 'SELECT "id", "name", "isActive", "createdAt" FROM "Category" ORDER BY "id"',
    systems: 'SELECT "id", "name", "isActive", "createdAt" FROM "RelatedSystem" ORDER BY "id"',
  };
  const result: Record<string, unknown> = {};
  for (const [name, sql] of Object.entries(tables)) result[name] = await prisma.$queryRawUnsafe(sql);
  return result;
}

async function seedSnapshot(prisma: PrismaClient) {
  return {
    users: await prisma.user.count(), tickets: await prisma.ticket.count(), attachments: await prisma.attachment.count(),
    comments: await prisma.publicComment.count(), notes: await prisma.internalNote.count(),
    activeRequesters: await prisma.user.count({ where: { role: "REQUESTER", isActive: true } }),
    inactiveRequesters: await prisma.user.count({ where: { role: "REQUESTER", isActive: false } }),
    activeStaff: await prisma.user.count({ where: { role: "IT_STAFF", isActive: true } }),
    inactiveStaff: await prisma.user.count({ where: { role: "IT_STAFF", isActive: false } }),
    activeAdmins: await prisma.user.count({ where: { role: "ADMINISTRATOR", isActive: true } }),
    seededRequesterOwnership: await prisma.ticket.count({ where: { ticketNumber: { startsWith: "TT-20260919-" }, requester: { role: "REQUESTER" } } }),
    seededStaffOwnership: await prisma.ticket.count({ where: { ticketNumber: { startsWith: "TT-20260919-" }, owner: { role: "IT_STAFF", isActive: true } } }),
    commentAuthors: await prisma.publicComment.count({ where: { author: { role: "REQUESTER" } } }),
    noteAuthors: await prisma.internalNote.count({ where: { author: { role: { in: ["IT_STAFF", "ADMINISTRATOR"] } } } }),
    baselineAttachment: await prisma.attachment.count({ where: { originalFilename: "baseline.txt", ticket: { ticketNumber: baselineNumber } } }),
  };
}

async function main() {
  const urlText = process.env.DATABASE_URL;
  const databaseName = disposableDatabaseName(urlText);
  const npmCLI = process.env.npm_execpath;
  if (!npmCLI) throw new Error("Run this preparation through npm run test:e2e:prepare.");
  const adminURL = new URL(urlText!);
  adminURL.pathname = "/postgres";
  adminURL.search = "";
  const admin = new PrismaClient({ datasources: { db: { url: adminURL.toString() } } });
  try {
    const existing = await admin.$queryRawUnsafe<any[]>('SELECT datname FROM pg_database WHERE datname = $1', databaseName);
    if (existing.length) throw new Error("Target database already exists. Choose a new name; no existing database is overwritten.");
    // The identifier is restricted to ASCII letters/digits/underscores above.
    await admin.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`);
  } finally {
    await admin.$disconnect();
  }
  const prisma = new PrismaClient({ datasources: { db: { url: urlText! } } });
  try {
    console.log(`New disposable database: ${databaseName}`);
    const categorySQL = 'CREATE TABLE "Category" ("id" SERIAL PRIMARY KEY, "name" TEXT NOT NULL UNIQUE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);';
    const lab2SQL = readFileSync(path.join(serverRoot, "prisma/migrations/20260824000000_lab2_foundation/migration.sql"), "utf8");
    const storageKey = `${databaseName}-baseline.txt`;
    const bytes = Buffer.from("baseline content\n");
    const baselineSQL = `
      INSERT INTO "Category" ("name") VALUES ('Hardware');
      INSERT INTO "RelatedSystem" ("name") VALUES ('Corporate Laptop');
      INSERT INTO "RequesterUser" ("name", "email") VALUES ('Ariya Somchai', 'ariya.somchai@example.com');
      INSERT INTO "Ticket" ("ticketNumber", "requesterId", "categoryId", "relatedSystemId", "requestedPriority", "summary", "description", "updatedAt")
      SELECT '${baselineNumber}', u."id", c."id", s."id", 'HIGH', 'Pre-Lab 3 preservation fixture', 'Synthetic migration fixture for local verification.', CURRENT_TIMESTAMP
      FROM "RequesterUser" u, "Category" c, "RelatedSystem" s;
      INSERT INTO "Attachment" ("ticketId", "originalFilename", "storageKey", "mimeType", "sizeBytes")
      SELECT "id", 'baseline.txt', '${storageKey}', 'text/plain', ${bytes.length} FROM "Ticket";`;
    runPrisma(["db", "execute", "--schema", "prisma/schema.prisma", "--stdin"], categorySQL + "\n" + lab2SQL + "\n" + baselineSQL);
    const uploads = path.join(serverRoot, "storage/uploads");
    mkdirSync(uploads, { recursive: true });
    const attachmentPath = path.join(uploads, storageKey);
    writeFileSync(attachmentPath, bytes, { flag: "wx" });
    const before = await baselineSnapshot(prisma);
    console.log("Synthetic pre-Lab-3 snapshot:", JSON.stringify(before));
    runPrisma(["migrate", "resolve", "--applied", "20260824000000_lab2_foundation"]);
    runPrisma(["migrate", "deploy"]);
    runPrisma(["migrate", "status"]);
    const after = await baselineSnapshot(prisma);
    console.log("Post-migration snapshot:", JSON.stringify(after));
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error("Migration changed the baseline IDs, fields, or relationships.");
    const migratedRequester = await prisma.user.findUniqueOrThrow({ where: { email: "ariya.somchai@example.com" } });
    const migratedTicket = await prisma.ticket.findUniqueOrThrow({ where: { ticketNumber: baselineNumber } });
    if (migratedRequester.role !== "REQUESTER" || !migratedRequester.mustChangePassword ||
        !verifyPassword(initialPassword, migratedRequester.passwordHash) || migratedTicket.itPriority !== migratedTicket.requestedPriority) {
      throw new Error("Migrated credentials, role, password gate, or initial IT Priority is incorrect.");
    }
    let firstSeed: Awaited<ReturnType<typeof seedSnapshot>> | undefined;
    for (let run = 1; run <= 2; run += 1) {
      console.log(`server: npm run prisma:seed (run ${run})`);
      execFileSync(process.execPath, [npmCLI, "run", "prisma:seed"], { cwd: serverRoot, env: process.env, stdio: "inherit" });
      const counts = await seedSnapshot(prisma);
      console.log(`Seed ${run} assertions:`, JSON.stringify(counts));
      if (counts.users !== 10 || counts.tickets !== 4 || counts.attachments !== 1 || counts.comments !== 3 || counts.notes !== 3 ||
          counts.activeRequesters !== 4 || counts.inactiveRequesters !== 1 || counts.activeStaff !== 3 || counts.inactiveStaff !== 1 || counts.activeAdmins !== 1 ||
          counts.seededRequesterOwnership !== 3 || counts.seededStaffOwnership !== 2 || counts.commentAuthors !== 3 || counts.noteAuthors !== 3 || counts.baselineAttachment !== 1) {
        throw new Error("Required seed counts, activation states, ownership, authorship, or attachment continuity failed.");
      }
      if (firstSeed && JSON.stringify(firstSeed) !== JSON.stringify(counts)) throw new Error("Seed counts or relationships changed on the second run.");
      firstSeed = counts;
    }
    if (!readFileSync(attachmentPath).equals(bytes)) throw new Error("Baseline attachment bytes changed.");
    console.log("Baseline attachment SHA256:", createHash("sha256").update(readFileSync(attachmentPath)).digest("hex"));
    const fixtures = await prepareQueueFixtures(prisma, urlText);
    const runtime = path.join(repoRoot, "artifacts/lab-03/runtime");
    mkdirSync(runtime, { recursive: true });
    writeFileSync(path.join(runtime, "e2e-fixtures.json"), JSON.stringify(fixtures, null, 2));
    console.log("Prepared E2E fixture IDs/count:", JSON.stringify(fixtures));
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
