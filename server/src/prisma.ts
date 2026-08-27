import { PrismaClient } from "@prisma/client";

// Lazy singleton: the client is created on first use, not at import time.
// This keeps route modules and tests that don't touch the DB (e.g. /api/health)
// free of database side effects.
let client: PrismaClient | null = null;

// The generated client is refreshed after schema changes. Keeping this
// boundary structurally open lets the API compile in a checkout whose
// generated client still reflects the Lab 1 schema.
export function getPrisma(): any {
  if (!client) client = new PrismaClient();
  return client;
}
