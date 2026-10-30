-- Add Ticket resolution state and immutable workflow history.
-- Existing statuses and rows are preserved; no legacy resolution times are invented.
BEGIN;

ALTER TABLE "Ticket"
  ADD COLUMN "resolutionSummary" TEXT,
  ADD COLUMN "resolvedAt" TIMESTAMPTZ(3),
  ADD COLUMN "resolvedById" INTEGER REFERENCES "RequesterUser"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "Ticket_resolutionSummary_length"
    CHECK ("resolutionSummary" IS NULL OR char_length(btrim("resolutionSummary")) BETWEEN 1 AND 2000);
CREATE INDEX "Ticket_status_resolvedAt_idx" ON "Ticket"("status", "resolvedAt");

CREATE TABLE "TicketWorkflowEvent" (
  "id" SERIAL PRIMARY KEY,
  "ticketId" INTEGER NOT NULL REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "actorId" INTEGER NOT NULL REFERENCES "RequesterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "fromStatus" "TicketStatus" NOT NULL,
  "toStatus" "TicketStatus" NOT NULL,
  "version" INTEGER NOT NULL CHECK ("version" > 0),
  "reason" TEXT,
  "resolutionSummary" TEXT,
  "resolvedAt" TIMESTAMPTZ(3),
  "resolvedById" INTEGER REFERENCES "RequesterUser"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketWorkflowEvent_reason_length"
    CHECK ("reason" IS NULL OR char_length(btrim("reason")) BETWEEN 1 AND 1000),
  CONSTRAINT "TicketWorkflowEvent_resolutionSummary_length"
    CHECK ("resolutionSummary" IS NULL OR char_length(btrim("resolutionSummary")) BETWEEN 1 AND 2000)
);
CREATE UNIQUE INDEX "TicketWorkflowEvent_ticketId_version_key" ON "TicketWorkflowEvent"("ticketId", "version");
CREATE INDEX "TicketWorkflowEvent_ticketId_createdAt_id_idx" ON "TicketWorkflowEvent"("ticketId", "createdAt", "id");

CREATE FUNCTION "reject_ticket_workflow_event_mutation"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'TicketWorkflowEvent records are append-only' USING ERRCODE = '55000';
END;
$$;
CREATE TRIGGER "TicketWorkflowEvent_append_only"
  BEFORE UPDATE OR DELETE ON "TicketWorkflowEvent"
  FOR EACH ROW EXECUTE FUNCTION "reject_ticket_workflow_event_mutation"();

COMMIT;
