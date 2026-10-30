import type { Express, Request, Response } from "express";
import { fail, requireRole } from "./auth.js";
import { getPrisma } from "./prisma.js";

const ACTIVE_STATUSES = ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "REOPENED"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
const TICKET_STATUSES = new Set(["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "REOPENED"]);
const WINDOW_7_DAYS = 7 * 24 * 60 * 60 * 1000;
const WINDOW_30_DAYS = 30 * 24 * 60 * 60 * 1000;
const ticketSummarySelect = {
  id: true,
  ticketNumber: true,
  status: true,
  summary: true,
  updatedAt: true,
  resolvedAt: true,
  requestedPriority: true,
  itPriority: true,
  ownerId: true,
  owner: { select: { id: true, name: true } },
} as const;

function failure(res: Response, status: number, code: string, message: string) {
  return fail(res, status, code, message);
}

function asOfDate(req: Request, res: Response): Date | null {
  const raw = req.query.asOf;
  if (raw === undefined) return new Date();
  const value = String(raw);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) {
    failure(res, 400, "INVALID_QUERY", "The asOf value must be an ISO 8601 timestamp with a timezone.");
    return null;
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    failure(res, 400, "INVALID_QUERY", "The asOf value must be a valid timestamp.");
    return null;
  }
  return date;
}

function ticketJson(ticket: any) {
  return {
    ...ticket,
    resolvedAt: ticket.resolvedAt ?? null,
    itPriority: ticket.itPriority ?? ticket.requestedPriority,
    owner: ticket.owner ?? null,
  };
}

function queryDate(value: unknown): Date | null | undefined {
  if (value === undefined || value === "") return undefined;
  const text = String(value);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(text)) return null;
  const parsed = new Date(text);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function positiveInt(value: unknown): number | null {
  const text = String(value ?? "");
  if (!/^[1-9]\d*$/.test(text)) return null;
  const number = Number(text);
  return Number.isSafeInteger(number) ? number : null;
}

export function registerDashboardRoutes(app: Express) {
  app.get("/api/requester/dashboard", async (req: Request, res: Response) => {
    const context = await requireRole(req, res, ["REQUESTER"]);
    if (!context) return;
    const asOf = asOfDate(req, res);
    if (!asOf) return;
    const weekStart = new Date(asOf.getTime() - WINDOW_7_DAYS);
    const monthStart = new Date(asOf.getTime() - WINDOW_30_DAYS);
    const owner = { requesterId: context.user.id };
    const openWhere = { ...owner, status: { in: ACTIVE_STATUSES } };
    const waitingWhere = { ...owner, status: "WAITING_FOR_REQUESTER" };
    const updatedWhere = { ...owner, updatedAt: { gte: weekStart, lte: asOf } };
    const resolvedWhere = {
      ...owner,
      status: { in: ["RESOLVED", "CLOSED"] },
      resolvedAt: { gte: monthStart, lte: asOf },
    };
    try {
      const prisma = getPrisma();
      const [openCount, waitingCount, updatedCount, updatedItems, resolvedCount, resolvedItems] = await Promise.all([
        prisma.ticket.count({ where: openWhere }),
        prisma.ticket.count({ where: waitingWhere }),
        prisma.ticket.count({ where: updatedWhere }),
        prisma.ticket.findMany({ where: updatedWhere, select: ticketSummarySelect, orderBy: [{ updatedAt: "desc" }, { id: "asc" }], take: 5 }),
        prisma.ticket.count({ where: resolvedWhere }),
        prisma.ticket.findMany({ where: resolvedWhere, select: ticketSummarySelect, orderBy: [{ resolvedAt: "desc" }, { id: "asc" }], take: 5 }),
      ]);
      return res.json({
        asOfUtc: asOf.toISOString(),
        metrics: {
          openTickets: { count: openCount },
          waitingForRequester: { count: waitingCount },
          recentlyUpdated: { count: updatedCount, items: updatedItems.map(ticketJson) },
          recentlyResolved: { count: resolvedCount, items: resolvedItems.map(ticketJson) },
        },
      });
    } catch {
      return failure(res, 500, "INTERNAL_ERROR", "Unable to load the Requester dashboard.");
    }
  });

  app.get("/api/staff/dashboard", async (req: Request, res: Response) => {
    const context = await requireRole(req, res, ["IT_STAFF", "ADMINISTRATOR"]);
    if (!context) return;
    const asOf = asOfDate(req, res);
    if (!asOf) return;
    const activeWhere = { status: { in: ACTIVE_STATUSES } };
    const recentWhere = { ...activeWhere, updatedAt: { gte: new Date(asOf.getTime() - WINDOW_7_DAYS), lte: asOf } };
    const actionWhere = { assigneeId: context.user.id, status: { in: ["PLANNED", "IN_PROGRESS"] } };
    try {
      const prisma = getPrisma();
      const [unassignedCount, myActiveCount, statusGroups, priorityGroups, recentCount, recentItems, myActionCount, myActions] = await Promise.all([
        prisma.ticket.count({ where: { ...activeWhere, ownerId: null } }),
        prisma.ticket.count({ where: { ...activeWhere, ownerId: context.user.id } }),
        prisma.ticket.groupBy({ by: ["status"], where: activeWhere, _count: { _all: true } }),
        prisma.ticket.groupBy({ by: ["itPriority"], where: activeWhere, _count: { _all: true } }),
        prisma.ticket.count({ where: recentWhere }),
        prisma.ticket.findMany({ where: recentWhere, select: ticketSummarySelect, orderBy: [{ updatedAt: "desc" }, { id: "asc" }], take: 5 }),
        prisma.actionTaken.count({ where: actionWhere }),
        prisma.actionTaken.findMany({
          where: actionWhere,
          select: {
            id: true, ticketId: true, actionDateTime: true, description: true, result: true, status: true,
            performedBy: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
            ticket: { select: { id: true, ticketNumber: true, summary: true, status: true } },
          },
          orderBy: [{ actionDateTime: "asc" }, { id: "asc" }],
          take: 5,
        }),
      ]);
      const statusCounts = new Map(statusGroups.map((group: any) => [group.status, group._count._all]));
      const priorityCounts = new Map(priorityGroups.map((group: any) => [group.itPriority, group._count._all]));
      return res.json({
        asOfUtc: asOf.toISOString(),
        metrics: {
          unassignedActive: { count: unassignedCount },
          myActiveTickets: { count: myActiveCount },
          activeByStatus: ACTIVE_STATUSES.map((status) => ({ value: status, count: statusCounts.get(status) ?? 0 })),
          activeByItPriority: PRIORITIES.map((priority) => ({ value: priority, count: priorityCounts.get(priority) ?? 0 })),
          recentlyUpdatedActive: { count: recentCount, items: recentItems.map(ticketJson) },
          myActiveActionsTaken: {
            count: myActionCount,
            items: myActions.map((action: any) => ({ ...action, ticket: action.ticket })),
          },
        },
      });
    } catch {
      return failure(res, 500, "INTERNAL_ERROR", "Unable to load the Staff dashboard.");
    }
  });

  app.get("/api/staff/dashboard/tickets", async (req: Request, res: Response) => {
    const context = await requireRole(req, res, ["IT_STAFF", "ADMINISTRATOR"]);
    if (!context) return;
    const query = req.query;
    const pageRaw = String(query.page ?? "1");
    const sizeRaw = String(query.pageSize ?? "10");
    const page = positiveInt(pageRaw);
    const pageSize = positiveInt(sizeRaw);
    const status = String(query.status ?? "").trim().toUpperCase();
    const itPriority = String(query.itPriority ?? "").trim().toUpperCase();
    const ownership = String(query.ownership ?? "").trim().toLowerCase();
    const ownerScope = String(query.ownerScope ?? "").trim().toLowerCase();
    const updatedFrom = queryDate(query.updatedFrom);
    const updatedTo = queryDate(query.updatedTo);
    const invalid = page === null || pageSize === null || ![10, 20, 50].includes(pageSize) ||
      (status !== "" && !TICKET_STATUSES.has(status)) ||
      (itPriority !== "" && !PRIORITIES.includes(itPriority as (typeof PRIORITIES)[number])) ||
      (ownership !== "" && ownership !== "unassigned") ||
      (ownerScope !== "" && ownerScope !== "me") ||
      updatedFrom === null || updatedTo === null ||
      (updatedFrom && updatedTo && updatedFrom > updatedTo);
    if (invalid) return failure(res, 400, "INVALID_QUERY", "The dashboard Ticket filter is invalid.");
    const where: Record<string, any> = { status: { in: ACTIVE_STATUSES } };
    const and: Record<string, any>[] = [];
    if (status) and.push({ status });
    if (ownership === "unassigned") and.push({ ownerId: null });
    if (ownerScope === "me") and.push({ ownerId: context.user.id });
    if (and.length) where.AND = and;
    if (itPriority) where.itPriority = itPriority;
    if (updatedFrom || updatedTo) where.updatedAt = { ...(updatedFrom ? { gte: updatedFrom } : {}), ...(updatedTo ? { lte: updatedTo } : {}) };
    try {
      const prisma = getPrisma();
      const [totalItems, tickets] = await Promise.all([
        prisma.ticket.count({ where }),
        prisma.ticket.findMany({
          where,
          select: ticketSummarySelect,
          orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
          skip: (page! - 1) * pageSize!,
          take: pageSize,
        }),
      ]);
      const totalPages = Math.ceil(totalItems / pageSize!);
      return res.json({
        items: tickets.map(ticketJson),
        pagination: {
          page, pageSize, totalItems, totalPages,
          hasPrevious: page! > 1,
          hasNext: page! < totalPages,
        },
      });
    } catch {
      return failure(res, 500, "INTERNAL_ERROR", "Unable to load dashboard Tickets.");
    }
  });
}
