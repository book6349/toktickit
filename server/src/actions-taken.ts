import { createHash, randomUUID } from "node:crypto";
import type { Express, Request, Response } from "express";
import { fail, requireCsrf, requireRole, type AuthContext } from "./auth.js";
import { getPrisma } from "./prisma.js";

type ActionStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type ActionInput = {
  actionDateTime: Date; description: string; result: string; assigneeId: number;
  status: ActionStatus; followUpRequired: boolean; followUpNote: string | null; attachmentNotes: string | null;
};
const statuses: Record<ActionStatus, ActionStatus[]> = {
  PLANNED: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"], COMPLETED: [], CANCELLED: [],
};
const editableFields = ["actionDateTime", "description", "result", "assigneeId", "followUpRequired", "followUpNote", "attachmentNotes"] as const;
const personSelect = { id: true, name: true } as const;
const actionInclude = { performedBy: { select: personSelect }, assignee: { select: personSelect } };

class ActionError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string>, public current?: any) {
    super(message);
  }
}
function invalid(fields: Record<string, string>): never {
  throw new ActionError(422, "VALIDATION_ERROR", "Check the action fields.", fields);
}
function positiveInt(value: unknown): number | null {
  if ((typeof value !== "string" && typeof value !== "number") || !/^[1-9]\d*$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
function bodyObject(body: unknown): Record<string, any> {
  if (!body || typeof body !== "object" || Array.isArray(body)) invalid({ body: "A JSON object is required." });
  return body as Record<string, any>;
}
function offsetDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi, s, offset] = match;
  const year = Number(y), month = Number(mo), day = Number(d);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1] ||
      Number(h) > 23 || Number(mi) > 59 || Number(s) > 59 ||
      (offset !== "Z" && (Number(offset.slice(1, 3)) > 23 || Number(offset.slice(4)) > 59))) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}
function parseInput(body: Record<string, any>, current?: any): ActionInput {
  // Only the documented editable fields are read; client attribution and unknown fields are ignored.
  const merged: Record<string, any> = current ? { ...current } : {};
  for (const name of editableFields) if (Object.hasOwn(body, name)) merged[name] = body[name];
  const fields: Record<string, string> = {};
  const text = (name: string, max: number, required: boolean): string | null => {
    const value = merged[name];
    if (!required && (value === undefined || value === null)) return null;
    if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) {
      fields[name] = required ? `Enter 1–${max} characters.` : `Enter at most ${max} characters.`;
      return null;
    }
    return value.trim() || null;
  };
  const actionDateTime = current && !Object.hasOwn(body, "actionDateTime")
    ? new Date(current.actionDateTime) : offsetDate(merged.actionDateTime);
  if (!actionDateTime || !Number.isFinite(actionDateTime.getTime())) fields.actionDateTime = "Use a valid ISO 8601 date/time with an offset.";
  const description = text("description", 2000, true);
  const result = text("result", 2000, true);
  const assigneeId = typeof merged.assigneeId === "number" ? positiveInt(merged.assigneeId) : null;
  if (!assigneeId) fields.assigneeId = "Choose an eligible assignee.";
  if (typeof merged.followUpRequired !== "boolean") fields.followUpRequired = "Choose whether follow-up is required.";
  const followUpRequired = merged.followUpRequired === true;
  const followUpNote = followUpRequired ? text("followUpNote", 1000, true) : null;
  const attachmentNotes = text("attachmentNotes", 1000, false);
  const status = current?.status ?? body.status;
  if (!current && !["PLANNED", "IN_PROGRESS", "COMPLETED"].includes(status)) fields.status = "Choose PLANNED, IN_PROGRESS or COMPLETED.";
  if (Object.keys(fields).length) invalid(fields);
  return { actionDateTime: actionDateTime!, description: description!, result: result!, assigneeId: assigneeId!, status,
    followUpRequired, followUpNote, attachmentNotes };
}
function actionJson(action: any) {
  return {
    id: action.id, ticketId: action.ticketId, actionDateTime: action.actionDateTime,
    description: action.description, result: action.result,
    performedBy: { id: action.performedBy.id, name: action.performedBy.name },
    assignee: { id: action.assignee.id, name: action.assignee.name },
    status: action.status, followUpRequired: action.followUpRequired, followUpNote: action.followUpNote,
    attachmentNotes: action.attachmentNotes, version: action.version, createdAt: action.createdAt, updatedAt: action.updatedAt,
  };
}
async function accessibleTicket(db: any, id: number, context: AuthContext) {
  const ticket = await db.ticket.findFirst({
    where: { id, ...(context.user.role === "REQUESTER" ? { requesterId: context.user.id } : {}) },
    select: { id: true, requesterId: true, workflowVersion: true },
  });
  if (!ticket) throw new ActionError(404, "NOT_FOUND", "Ticket not found.");
  return ticket;
}
async function validAssignee(db: any, id: number) {
  const user = await db.user.findFirst({ where: { id, isActive: true, role: { in: ["IT_STAFF", "ADMINISTRATOR"] } }, select: { id: true } });
  if (!user) throw new ActionError(422, "INVALID_ASSIGNEE", "The assignee must be active IT Staff or an Administrator.", { assigneeId: "Choose an active Staff or Administrator." });
}
async function touchTicket(db: any, ticket: any) {
  // All Lab 4 action and workflow mutations share this compare-and-set.
  const changed = await db.ticket.updateMany({
    where: { id: ticket.id, workflowVersion: ticket.workflowVersion },
    data: { workflowVersion: { increment: 1 }, updatedAt: new Date() },
  });
  if (changed.count !== 1) throw new ActionError(409, "VERSION_CONFLICT", "The Ticket changed. Refresh and retry.");
}
async function findAction(db: any, ticketId: number, id: number) {
  const action = await db.actionTaken.findFirst({ where: { id, ticketId }, include: actionInclude });
  if (!action) throw new ActionError(404, "NOT_FOUND", "Action not found.");
  return action;
}
const hash = (text: string) => createHash("sha256").update(text).digest("hex");
function replay(record: any, requestHash: string) {
  if (record.requestHash !== requestHash) throw new ActionError(409, "IDEMPOTENCY_CONFLICT", "This key was already used for different action data.");
  return record.responseJson;
}
function route(handler: (req: Request, res: Response) => Promise<any>) {
  return async (req: Request, res: Response) => {
    try { await handler(req, res); }
    catch (error) {
      if (error instanceof ActionError) {
        return res.status(error.status).json({ error: { code: error.code, message: error.message,
          ...(error.fields ? { fields: error.fields } : {}) }, ...(error.current ? { current: error.current } : {}) });
      }
      const correlationId = randomUUID();
      console.error("Actions Taken request failed", { correlationId, code: (error as any)?.code ?? "UNEXPECTED" });
      res.setHeader("X-Correlation-ID", correlationId);
      return fail(res, 500, "INTERNAL_ERROR", "Unable to complete the action request.");
    }
  };
}
function ids(req: Request): { ticketId: number; actionId?: number } {
  const ticketId = positiveInt(req.params.ticketId);
  const actionId = req.params.actionId === undefined ? undefined : positiveInt(req.params.actionId);
  if (!ticketId || actionId === null) throw new ActionError(404, "NOT_FOUND", "Resource not found.");
  return { ticketId, actionId };
}
function expectedVersion(body: Record<string, any>): number {
  if (typeof body.expectedVersion !== "number" || !Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 1) {
    invalid({ expectedVersion: "A positive integer version is required." });
  }
  return body.expectedVersion;
}

export function registerActionsTakenRoutes(app: Express) {
  app.get("/api/tickets/:ticketId/action-assignees", route(async (req, res) => {
    const context = await requireRole(req, res, ["IT_STAFF", "ADMINISTRATOR"]);
    if (!context) return;
    const { ticketId } = ids(req);
    const db = getPrisma();
    await accessibleTicket(db, ticketId, context);
    const items = await db.user.findMany({ where: { isActive: true, role: { in: ["IT_STAFF", "ADMINISTRATOR"] } },
      select: personSelect, orderBy: [{ name: "asc" }, { id: "asc" }] });
    return res.json({ items });
  }));

  app.get("/api/tickets/:ticketId/actions", route(async (req, res) => {
    const context = await requireRole(req, res, ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"]);
    if (!context) return;
    const { ticketId } = ids(req);
    const db = getPrisma();
    await accessibleTicket(db, ticketId, context);
    const items = await db.actionTaken.findMany({ where: { ticketId }, include: actionInclude, orderBy: [{ actionDateTime: "asc" }, { id: "asc" }] });
    return res.json({ items: items.map(actionJson), ticketId, readOnly: context.user.role === "REQUESTER" });
  }));

  app.post("/api/tickets/:ticketId/actions", route(async (req, res) => {
    const context = await requireRole(req, res, ["IT_STAFF", "ADMINISTRATOR"]);
    if (!context || !requireCsrf(req, res)) return;
    const { ticketId } = ids(req);
    const input = parseInput(bodyObject(req.body));
    const key = req.header("Idempotency-Key");
    if (!key || !/^[A-Za-z0-9._:-]{1,128}$/.test(key)) invalid({ idempotencyKey: "Supply an Idempotency-Key of 1–128 letters, digits, dots, underscores, colons or hyphens." });
    const requestHash = hash(JSON.stringify(input));
    const where = { actorId_ticketId_keyHash: { actorId: context.user.id, ticketId, keyHash: hash(key) } };
    const db = getPrisma();
    let output;
    try {
      output = await db.$transaction(async (tx: any) => {
        const ticket = await accessibleTicket(tx, ticketId, context);
        const prior = await tx.actionCreateRequest.findUnique({ where });
        if (prior) return replay(prior, requestHash);
        await validAssignee(tx, input.assigneeId);
        await touchTicket(tx, ticket);
        const action = await tx.actionTaken.create({ data: { ...input, ticketId, performedById: context.user.id }, include: actionInclude });
        await tx.actionTakenEvent.create({ data: { actionId: action.id, actorId: context.user.id, kind: "CREATED",
          toStatus: action.status, version: 1, changedFields: [...editableFields, "status"] } });
        const responseJson = JSON.parse(JSON.stringify(actionJson(action)));
        await tx.actionCreateRequest.create({ data: { ...where.actorId_ticketId_keyHash, actionId: action.id, requestHash, responseJson } });
        return responseJson;
      });
    } catch (error) {
      if ((error as any)?.code === "P2002" || (error as any)?.code === "VERSION_CONFLICT") {
        const prior = await db.actionCreateRequest.findUnique({ where });
        if (prior) output = replay(prior, requestHash);
        else if ((error as any)?.code === "P2002") throw new ActionError(409, "VERSION_CONFLICT", "An action request changed concurrently. Retry.");
        else throw error;
      } else throw error;
    }
    return res.status(201).json(output);
  }));

  async function mutate(req: Request, res: Response, lifecycle: boolean) {
    const context = await requireRole(req, res, ["IT_STAFF", "ADMINISTRATOR"]);
    if (!context || !requireCsrf(req, res)) return;
    const { ticketId, actionId } = ids(req);
    const body = bodyObject(req.body), version = expectedVersion(body);
    const db = getPrisma();
    let output;
    try {
      output = await db.$transaction(async (tx: any) => {
        const ticket = await accessibleTicket(tx, ticketId, context);
        const current = await findAction(tx, ticketId, actionId!);
        if (current.version !== version) throw new ActionError(409, "VERSION_CONFLICT", "The action changed. Review the current version.", undefined, actionJson(current));
        let data: Record<string, any>, changedFields: string[];
        if (lifecycle) {
          const next = body.status;
          if (typeof next !== "string" || !statuses[current.status as ActionStatus]?.includes(next as ActionStatus)) {
            throw new ActionError(422, "INVALID_TRANSITION", "This action status transition is not permitted.");
          }
          data = { status: next }; changedFields = ["status"];
        } else {
          if (!["PLANNED", "IN_PROGRESS"].includes(current.status)) throw new ActionError(422, "INVALID_TRANSITION", "Completed or cancelled actions are read-only. Record a new action for corrections.");
          if (!editableFields.some(name => Object.hasOwn(body, name))) invalid({ body: "Supply at least one editable action field." });
          const validated = parseInput(body, current);
          await validAssignee(tx, validated.assigneeId);
          data = Object.fromEntries(editableFields.map(name => [name, validated[name]]));
          changedFields = editableFields.filter(name => name === "actionDateTime"
            ? new Date(current[name]).getTime() !== validated[name].getTime() : current[name] !== validated[name]);
          if (!changedFields.length) invalid({ body: "No action fields have changed." });
        }
        await touchTicket(tx, ticket);
        const changed = await tx.actionTaken.updateMany({ where: { id: actionId, ticketId, version }, data: { ...data, version: { increment: 1 } } });
        if (changed.count !== 1) throw new ActionError(409, "VERSION_CONFLICT", "The action changed. Refresh and retry.");
        await tx.actionTakenEvent.create({ data: { actionId, actorId: context.user.id, kind: lifecycle ? "STATUS_CHANGED" : "UPDATED",
          fromStatus: lifecycle ? current.status : null, toStatus: lifecycle ? data.status : null, version: version + 1, changedFields } });
        return actionJson(await findAction(tx, ticketId, actionId!));
      });
    } catch (error) {
      if (error instanceof ActionError && error.code === "VERSION_CONFLICT") {
        const current = await db.actionTaken.findFirst({ where: { id: actionId, ticketId }, include: actionInclude });
        throw new ActionError(409, "VERSION_CONFLICT", error.message, undefined, current ? actionJson(current) : undefined);
      }
      throw error;
    }
    return res.json(output);
  }
  app.patch("/api/tickets/:ticketId/actions/:actionId", route((req, res) => mutate(req, res, false)));
  app.post("/api/tickets/:ticketId/actions/:actionId/status", route((req, res) => mutate(req, res, true)));
}
