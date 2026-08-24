ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "RequesterUser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RequesterUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RequesterUser_email_key" ON "RequesterUser"("email");

CREATE TABLE IF NOT EXISTS "RelatedSystem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RelatedSystem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RelatedSystem_name_key" ON "RelatedSystem"("name");

DO $$ BEGIN
  CREATE TYPE "RequestedPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "TicketStatus" AS ENUM ('NEW');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Ticket" (
    "id" SERIAL NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "ticketDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requesterId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "relatedSystemId" INTEGER NOT NULL,
    "requestedPriority" "RequestedPriority" NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'NEW',
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");
CREATE INDEX IF NOT EXISTS "Ticket_requesterId_updatedAt_idx" ON "Ticket"("requesterId", "updatedAt");
CREATE INDEX IF NOT EXISTS "Ticket_requesterId_categoryId_idx" ON "Ticket"("requesterId", "categoryId");
CREATE INDEX IF NOT EXISTS "Ticket_requesterId_requestedPriority_idx" ON "Ticket"("requesterId", "requestedPriority");
CREATE INDEX IF NOT EXISTS "Ticket_requesterId_status_idx" ON "Ticket"("requesterId", "status");
CREATE INDEX IF NOT EXISTS "Ticket_ticketDate_idx" ON "Ticket"("ticketDate");

CREATE TABLE IF NOT EXISTS "Attachment" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),
    "removalReason" TEXT,
    "removedByRequesterId" INTEGER,
    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Attachment_storageKey_key" ON "Attachment"("storageKey");
CREATE INDEX IF NOT EXISTS "Attachment_ticketId_removedAt_idx" ON "Attachment"("ticketId", "removedAt");

DO $$ BEGIN
  ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_requesterId_fkey"
    FOREIGN KEY ("requesterId") REFERENCES "RequesterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_relatedSystemId_fkey"
    FOREIGN KEY ("relatedSystemId") REFERENCES "RelatedSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_removedByRequesterId_fkey"
    FOREIGN KEY ("removedByRequesterId") REFERENCES "RequesterUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
