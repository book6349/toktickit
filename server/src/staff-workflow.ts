import type { Express, Request, Response } from "express";
import { getPrisma } from "./prisma.js";
import { fail, requireCsrf, requireRole, safeUser, type UserRole } from "./auth.js";

const PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH"]);
const TICKET_STATUSES = new Set([
  "NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED",
]);
const QUEUE_SORT_FIELDS = new Set([
  "updatedAt", "createdAt", "ticketNumber", "status", "requestedPriority", "itPriority", "owner",
]);
const PAGE_SIZES = new Set([10, 20, 50]);

const transitions: Record<string, Set<string>> = {
  NEW: new Set(["OPEN", "CANCELLED"]),
  OPEN: new Set(["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"]),
  IN_PROGRESS: new Set(["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"]),
  WAITING_FOR_REQUESTER: new Set(["IN_PROGRESS", "RESOLVED", "CANCELLED"]),
  RESOLVED: new Set(["CLOSED", "REOPENED"]),
  CLOSED: new Set(["REOPENED"]),
  REOPENED: new Set(["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"]),
  CANCELLED: new Set(["REOPENED"]),
};
const confirmationTargets = new Set(["RESOLVED", "CLOSED", "CANCELLED"]);

const personSelect = { id: true, name: true, email: true, role: true } as const;
const queueInclude = {
  requester: { select: personSelect },
  owner: { select: personSelect },
  category: { select: { id: true, name: true } },
  relatedSystem: { select: { id: true, name: true } },
} as const;
const detailInclude = {
  ...queueInclude,
  attachments: { orderBy: { uploadedAt: "asc" as const } },
  comments: { include: { author: { select: personSelect } }, orderBy: { createdAt: "asc" as const } },
  notes: { include: { author: { select: personSelect } }, orderBy: { createdAt: "asc" as const } },
} as const;

function positiveInt(value: unknown): number | null {
  const text = String(value ?? "");
  if (!/^[1-9]\d*$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function ticketId(value: string): number | null {
  return positiveInt(value);
}

function parseQueueQuery(req: Request) {
  const query = req.query;
  const pageRaw = String(query.page ?? "1");
  const pageSizeRaw = String(query.pageSize ?? "10");
  const page = positiveInt(pageRaw);
  const pageSize = positiveInt(pageSizeRaw);
  const sortBy = String(query.sortBy ?? "updatedAt");
  const sortDirection = String(query.sortDirection ?? "desc").toLowerCase();
  const status = String(query.status ?? "").trim().toUpperCase();
  const requestedPriority = String(query.requestedPriority ?? "").trim().toUpperCase();
  const itPriority = String(query.itPriority ?? "").trim().toUpperCase();
  const ownerRaw = String(query.ownerId ?? "");
  const ownerId = ownerRaw ? positiveInt(ownerRaw) : null;
  const ownership = String(query.ownership ?? "").trim().toLowerCase();
  const invalid =
    page === null || pageSize === null || !PAGE_SIZES.has(pageSize) ||
    !QUEUE_SORT_FIELDS.has(sortBy) || !["asc", "desc"].includes(sortDirection) ||
    (status !== "" && !TICKET_STATUSES.has(status)) ||
    (requestedPriority !== "" && !PRIORITIES.has(requestedPriority)) ||
    (itPriority !== "" && !PRIORITIES.has(itPriority)) ||
    (ownerRaw !== "" && ownerId === null) ||
    (ownership !== "" && !["assigned", "unassigned"].includes(ownership));
  return {
    invalid, search: String(query.search ?? "").trim(), status, requestedPriority, itPriority,
    ownerId, ownership, sortBy, sortDirection: sortDirection as "asc" | "desc",
    page: page ?? 1, pageSize: pageSize ?? 10,
  };
}

function personJson(person: any) {
  if (!person) return null;
  const user = safeUser(person);
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function attachmentJson(attachment: any) {
  return {
    id: attachment.id, originalFilename: attachment.originalFilename, mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes, uploadedAt: attachment.uploadedAt,
    removedAt: attachment.removedAt ?? null, removalReason: attachment.removalReason ?? null,
    isRemoved: Boolean(attachment.removedAt),
  };
}

function commentJson(comment: any) {
  return { id: comment.id, ticketId: comment.ticketId, content: comment.content, author: personJson(comment.author), createdAt: comment.createdAt };
}

function noteJson(note: any) {
  return { id: note.id, ticketId: note.ticketId, content: note.content, author: personJson(note.author), createdAt: note.createdAt };
}

function ticketJson(ticket: any, includePrivate = true) {
  return {
    id: ticket.id, ticketNumber: ticket.ticketNumber, ticketDate: ticket.ticketDate,
    requesterId: ticket.requesterId, categoryId: ticket.categoryId, relatedSystemId: ticket.relatedSystemId,
    requestedPriority: ticket.requestedPriority, itPriority: ticket.itPriority ?? ticket.requestedPriority,
    status: ticket.status, ownerId: ticket.ownerId ?? null, owner: personJson(ticket.owner),
    requester: personJson(ticket.requester), category: ticket.category, relatedSystem: ticket.relatedSystem,
    summary: ticket.summary, description: ticket.description,
    requesterResolutionIndicatedAt: ticket.requesterResolutionIndicatedAt ?? null,
    createdAt: ticket.createdAt, updatedAt: ticket.updatedAt,
    attachments: Array.isArray(ticket.attachments) ? ticket.attachments.map(attachmentJson) : [],
    comments: Array.isArray(ticket.comments) ? ticket.comments.map(commentJson) : [],
    notes: includePrivate && Array.isArray(ticket.notes) ? ticket.notes.map(noteJson) : [],
  };
}

function pagination(page: number, pageSize: number, totalItems: number) {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  return { page, pageSize, totalItems, totalPages, hasPrevious: page > 1 && totalPages > 0, hasNext: totalPages > 0 && page < totalPages };
}

function queryOrder(sortBy: string, direction: "asc" | "desc") {
  const field = sortBy === "owner" ? "ownerId" : sortBy;
  return [{ [field]: direction }, { id: direction }];
}

function contentInput(value: unknown) {
  const content = typeof value === "string" ? value.trim() : "";
  if (!content) return { content, error: "Content cannot be empty." };
  if (content.length > 4000) return { content, error: "Content must be 4,000 characters or fewer." };
  return { content };
}

async function requireStaff(req: Request, res: Response) {
  return requireRole(req, res, ["IT_STAFF"]);
}

async function requireStaffOrAdmin(req: Request, res: Response) {
  return requireRole(req, res, ["IT_STAFF", "ADMINISTRATOR"]);
}

async function findDetail(id: number) {
  return getPrisma().ticket.findUnique({ where: { id }, include: detailInclude });
}

export function registerStaffWorkflowRoutes(app: Express) {
  app.get("/api/staff/tickets", async (req: Request, res: Response) => {
    const context = await requireStaff(req, res);
    if (!context) return;
    const params = parseQueueQuery(req);
    if (params.invalid) return fail(res, 400, "INVALID_QUERY", "The Queue query is invalid.");
    const where: Record<string, any> = {};
    if (params.search) {
      where.OR = [
        { ticketNumber: { contains: params.search, mode: "insensitive" } },
        { summary: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
        { requester: { name: { contains: params.search, mode: "insensitive" } } },
        { requester: { email: { contains: params.search, mode: "insensitive" } } },
      ];
    }
    if (params.status) where.status = params.status;
    if (params.requestedPriority) where.requestedPriority = params.requestedPriority;
    if (params.itPriority) where.itPriority = params.itPriority;
    if (params.ownerId !== null) where.ownerId = params.ownerId;
    if (params.ownership === "assigned") where.ownerId = { not: null };
    if (params.ownership === "unassigned") where.ownerId = null;
    try {
      const prisma = getPrisma();
      const [totalItems, tickets] = await Promise.all([
        prisma.ticket.count({ where }),
        prisma.ticket.findMany({ where, include: queueInclude, orderBy: queryOrder(params.sortBy, params.sortDirection), skip: (params.page - 1) * params.pageSize, take: params.pageSize }),
      ]);
      return res.json({ items: tickets.map((ticket: any) => ticketJson(ticket, false)), pagination: pagination(params.page, params.pageSize, totalItems) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to load the Ticket Queue.");
    }
  });

  app.get("/api/staff/tickets/:ticketId", async (req: Request, res: Response) => {
    const context = await requireStaffOrAdmin(req, res);
    if (!context) return;
    const id = ticketId(req.params.ticketId);
    if (id === null) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
    try {
      const ticket = await findDetail(id);
      if (!ticket) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
      return res.json({ ticket: ticketJson(ticket) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to load Ticket Detail.");
    }
  });

  app.patch("/api/staff/tickets/:ticketId/owner", async (req: Request, res: Response) => {
    const context = await requireStaff(req, res);
    if (!context) return;
    if (!requireCsrf(req, res)) return;
    const id = ticketId(req.params.ticketId);
    if (id === null) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
    const rawOwnerId = req.body?.ownerId;
    const ownerId = rawOwnerId === null ? null : positiveInt(rawOwnerId);
    if (rawOwnerId !== null && ownerId === null) return fail(res, 400, "VALIDATION_ERROR", "Choose a valid owner ID.", { ownerId: "Owner ID must be a positive integer or null." });
    try {
      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id }, select: { id: true } });
      if (!ticket) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
      if (ownerId !== null) {
        const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { id: true, role: true, isActive: true } });
        if (!owner) return fail(res, 404, "RESOURCE_NOT_FOUND", "Owner not found.");
        if (!owner.isActive || !["IT_STAFF", "ADMINISTRATOR"].includes(owner.role)) return fail(res, 409, "CONFLICT", "Only active IT Staff or Administrators can own a Ticket.");
      }
      await prisma.ticket.update({ where: { id }, data: { ownerId } });
      const updated = await findDetail(id);
      return res.json({ ticket: ticketJson(updated) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to update Ticket ownership.");
    }
  });

  app.patch("/api/staff/tickets/:ticketId/priority", async (req: Request, res: Response) => {
    const context = await requireStaffOrAdmin(req, res);
    if (!context) return;
    if (!requireCsrf(req, res)) return;
    const id = ticketId(req.params.ticketId);
    if (id === null) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
    const itPriority = String(req.body?.itPriority ?? "").trim().toUpperCase();
    if (!PRIORITIES.has(itPriority)) return fail(res, 400, "VALIDATION_ERROR", "Choose LOW, MEDIUM, or HIGH.", { itPriority: "Choose LOW, MEDIUM, or HIGH." });
    try {
      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id }, select: { id: true } });
      if (!ticket) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
      await prisma.ticket.update({ where: { id }, data: { itPriority } });
      const updated = await findDetail(id);
      return res.json({ ticket: ticketJson(updated) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to update IT Priority.");
    }
  });

  app.patch("/api/staff/tickets/:ticketId/status", async (req: Request, res: Response) => {
    const context = await requireStaff(req, res);
    if (!context) return;
    if (!requireCsrf(req, res)) return;
    const id = ticketId(req.params.ticketId);
    if (id === null) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
    const target = String(req.body?.status ?? "").trim().toUpperCase();
    if (!TICKET_STATUSES.has(target)) return fail(res, 400, "VALIDATION_ERROR", "Choose a valid Ticket status.");
    try {
      const prisma = getPrisma();
      const currentTicket = await prisma.ticket.findUnique({ where: { id }, select: { id: true, status: true } });
      if (!currentTicket) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
      if (!transitions[currentTicket.status]?.has(target)) return fail(res, 400, "INVALID_TRANSITION", "That status transition is not permitted.");
      if (confirmationTargets.has(target) && req.body?.confirm !== true) return fail(res, 400, "INVALID_TRANSITION", "This status change requires explicit confirmation.");
      const result = await prisma.ticket.updateMany({ where: { id, status: currentTicket.status }, data: { status: target } });
      if (!result?.count) return fail(res, 409, "CONFLICT", "The Ticket changed before the status update.");
      const updated = await findDetail(id);
      return res.json({ ticket: ticketJson(updated) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to update Ticket status.");
    }
  });

  app.get("/api/staff/tickets/:ticketId/notes", async (req: Request, res: Response) => {
    const context = await requireStaffOrAdmin(req, res);
    if (!context) return;
    const id = ticketId(req.params.ticketId);
    if (id === null) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
    try {
      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id }, select: { id: true } });
      if (!ticket) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
      const notes = await prisma.internalNote.findMany({ where: { ticketId: id }, include: { author: { select: personSelect } }, orderBy: { createdAt: "asc" } });
      return res.json({ notes: notes.map(noteJson) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to load Internal Notes.");
    }
  });

  app.post("/api/staff/tickets/:ticketId/notes", async (req: Request, res: Response) => {
    const context = await requireStaffOrAdmin(req, res);
    if (!context) return;
    if (!requireCsrf(req, res)) return;
    const id = ticketId(req.params.ticketId);
    if (id === null) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
    const input = contentInput(req.body?.content);
    if (input.error) return fail(res, 400, "VALIDATION_ERROR", input.error, { content: input.error });
    try {
      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id }, select: { id: true } });
      if (!ticket) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
      const note = await prisma.internalNote.create({ data: { ticketId: id, authorId: context.user.id, content: input.content }, include: { author: { select: personSelect } } });
      return res.status(201).json({ note: noteJson(note) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to add the Internal Note.");
    }
  });
}
