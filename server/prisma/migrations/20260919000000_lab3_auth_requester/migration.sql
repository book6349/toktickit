DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('REQUESTER', 'IT_STAFF', 'ADMINISTRATOR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "RequesterUser"
  ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'REQUESTER',
  ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "RequesterUser"
SET "passwordHash" = 'scrypt$toktickit-lab3-migration$0c0fc7af7bc09e055881d248866234ac04fd2157c9993caa1ad0918acedcad5c7aba14f26db0f2e1c5950902c8f92b4942267a34fa9e128f28a9459d30eb0999',
    "role" = 'REQUESTER',
    "mustChangePassword" = true
WHERE "passwordHash" = '';

CREATE UNIQUE INDEX IF NOT EXISTS "RequesterUser_email_lower_key"
  ON "RequesterUser" (LOWER("email"));
CREATE INDEX IF NOT EXISTS "RequesterUser_role_isActive_idx"
  ON "RequesterUser" ("role", "isActive");

CREATE TABLE IF NOT EXISTS "Session" (
  "id" SERIAL NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Session_tokenHash_key" ON "Session" ("tokenHash");
CREATE INDEX IF NOT EXISTS "Session_userId_revokedAt_idx" ON "Session" ("userId", "revokedAt");
CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session" ("expiresAt");
DO $$ BEGIN
  ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "RequesterUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'OPEN';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'WAITING_FOR_REQUESTER';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'RESOLVED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'CLOSED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'REOPENED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE "Ticket"
  ADD COLUMN IF NOT EXISTS "ownerId" INTEGER,
  ADD COLUMN IF NOT EXISTS "itPriority" "RequestedPriority" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS "requesterResolutionIndicatedAt" TIMESTAMP(3);
UPDATE "Ticket" SET "itPriority" = "requestedPriority" WHERE "itPriority" = 'MEDIUM';
CREATE INDEX IF NOT EXISTS "Ticket_ownerId_updatedAt_idx" ON "Ticket" ("ownerId", "updatedAt");
DO $$ BEGIN
  ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "RequesterUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "PublicComment" (
  "id" SERIAL NOT NULL,
  "ticketId" INTEGER NOT NULL,
  "authorId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PublicComment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PublicComment_ticketId_createdAt_idx"
  ON "PublicComment" ("ticketId", "createdAt");
DO $$ BEGIN
  ALTER TABLE "PublicComment" ADD CONSTRAINT "PublicComment_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "PublicComment" ADD CONSTRAINT "PublicComment_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "RequesterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "InternalNote" (
  "id" SERIAL NOT NULL,
  "ticketId" INTEGER NOT NULL,
  "authorId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "InternalNote_ticketId_createdAt_idx"
  ON "InternalNote" ("ticketId", "createdAt");
DO $$ BEGIN
  ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "RequesterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
