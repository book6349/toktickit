-- Additive Lab 4 Actions Taken foundation; no legacy rows are rewritten or fabricated.
BEGIN;

CREATE TYPE "ActionTakenStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ActionTakenEventKind" AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED');
ALTER TABLE "Ticket" ADD COLUMN "workflowVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_workflowVersion_positive" CHECK ("workflowVersion" > 0);

CREATE TABLE "ActionTaken" (
  "id" SERIAL PRIMARY KEY,
  "ticketId" INTEGER NOT NULL REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "actionDateTime" TIMESTAMPTZ(3) NOT NULL,
  "description" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "performedById" INTEGER NOT NULL REFERENCES "RequesterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "assigneeId" INTEGER NOT NULL REFERENCES "RequesterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "status" "ActionTakenStatus" NOT NULL,
  "followUpRequired" BOOLEAN NOT NULL,
  "followUpNote" TEXT,
  "attachmentNotes" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "seedKey" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "ActionTaken_description_length" CHECK (char_length(btrim("description")) BETWEEN 1 AND 2000),
  CONSTRAINT "ActionTaken_result_length" CHECK (char_length(btrim("result")) BETWEEN 1 AND 2000),
  CONSTRAINT "ActionTaken_followUp_valid" CHECK (
    ("followUpRequired" AND "followUpNote" IS NOT NULL AND char_length(btrim("followUpNote")) BETWEEN 1 AND 1000)
    OR (NOT "followUpRequired" AND "followUpNote" IS NULL)),
  CONSTRAINT "ActionTaken_attachmentNotes_length" CHECK ("attachmentNotes" IS NULL OR char_length("attachmentNotes") <= 1000),
  CONSTRAINT "ActionTaken_version_positive" CHECK ("version" > 0)
);
CREATE UNIQUE INDEX "ActionTaken_seedKey_key" ON "ActionTaken"("seedKey");
CREATE INDEX "ActionTaken_ticketId_actionDateTime_id_idx" ON "ActionTaken"("ticketId", "actionDateTime", "id");
CREATE INDEX "ActionTaken_assigneeId_status_idx" ON "ActionTaken"("assigneeId", "status");

CREATE TABLE "ActionTakenEvent" (
  "id" SERIAL PRIMARY KEY,
  "actionId" INTEGER NOT NULL REFERENCES "ActionTaken"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "actorId" INTEGER NOT NULL REFERENCES "RequesterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "kind" "ActionTakenEventKind" NOT NULL,
  "fromStatus" "ActionTakenStatus",
  "toStatus" "ActionTakenStatus",
  "version" INTEGER NOT NULL CHECK ("version" > 0),
  "changedFields" TEXT[] NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "ActionTakenEvent_actionId_version_key" ON "ActionTakenEvent"("actionId", "version");
CREATE INDEX "ActionTakenEvent_actionId_createdAt_id_idx" ON "ActionTakenEvent"("actionId", "createdAt", "id");

CREATE TABLE "ActionCreateRequest" (
  "id" SERIAL PRIMARY KEY,
  "ticketId" INTEGER NOT NULL REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "actorId" INTEGER NOT NULL REFERENCES "RequesterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "keyHash" CHAR(64) NOT NULL,
  "requestHash" CHAR(64) NOT NULL,
  "actionId" INTEGER NOT NULL REFERENCES "ActionTaken"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "responseJson" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "ActionCreateRequest_actionId_key" ON "ActionCreateRequest"("actionId");
CREATE UNIQUE INDEX "ActionCreateRequest_actorId_ticketId_keyHash_key" ON "ActionCreateRequest"("actorId", "ticketId", "keyHash");

CREATE FUNCTION "reject_action_event_mutation"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'ActionTakenEvent records are append-only' USING ERRCODE = '55000';
END;
$$;
CREATE TRIGGER "ActionTakenEvent_append_only"
  BEFORE UPDATE OR DELETE ON "ActionTakenEvent"
  FOR EACH ROW EXECUTE FUNCTION "reject_action_event_mutation"();

COMMIT;
