import type { Express, Request, Response } from "express";
import { getPrisma } from "./prisma.js";
import { fail, requireCsrf, requireRole, safeUser, type AuthContext } from "./auth.js";

const COMMENT_ROLES = ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"] as const;

function positiveTicketId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function commentJson(comment: any) {
  const author = comment.author ? safeUser(comment.author) : null;
  return {
    id: comment.id,
    ticketId: comment.ticketId,
    content: comment.content,
    author: author ? { id: author.id, name: author.name, role: author.role } : undefined,
    createdAt: comment.createdAt,
  };
}

async function visibleTicket(context: AuthContext, ticketId: number) {
  const where = context.user.role === "REQUESTER"
    ? { id: ticketId, requesterId: context.user.id }
    : { id: ticketId };
  return getPrisma().ticket.findFirst({ where, select: { id: true } });
}

function contentInput(value: unknown): { content: string; error?: string } {
  const content = typeof value === "string" ? value.trim() : "";
  if (!content) return { content, error: "Comment cannot be empty." };
  if (content.length > 4000) return { content, error: "Comment must be 4,000 characters or fewer." };
  return { content };
}

export function registerRequesterRegressionRoutes(app: Express) {
  app.get("/api/tickets/:ticketId/comments", async (req: Request, res: Response) => {
    const context = await requireRole(req, res, [...COMMENT_ROLES]);
    if (!context) return;
    const ticketId = positiveTicketId(req.params.ticketId);
    if (ticketId === null) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
    try {
      if (!(await visibleTicket(context, ticketId))) {
        return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
      }
      const comments = await getPrisma().publicComment.findMany({
        where: { ticketId },
        include: { author: true },
        orderBy: { createdAt: "asc" },
      });
      return res.json({ comments: comments.map(commentJson) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to load comments.");
    }
  });

  app.post("/api/tickets/:ticketId/comments", async (req: Request, res: Response) => {
    const context = await requireRole(req, res, [...COMMENT_ROLES]);
    if (!context) return;
    if (!requireCsrf(req, res)) return;
    const ticketId = positiveTicketId(req.params.ticketId);
    if (ticketId === null) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
    const input = contentInput(req.body?.content);
    if (input.error) return fail(res, 400, "VALIDATION_ERROR", input.error, { content: input.error });
    try {
      if (!(await visibleTicket(context, ticketId))) {
        return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
      }
      const comment = await getPrisma().publicComment.create({
        data: { ticketId, authorId: context.user.id, content: input.content },
        include: { author: true },
      });
      return res.status(201).json({ comment: commentJson(comment) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to add the comment.");
    }
  });

  app.post("/api/tickets/:ticketId/resolution-indication", async (req: Request, res: Response) => {
    const context = await requireRole(req, res, ["REQUESTER"]);
    if (!context) return;
    if (!requireCsrf(req, res)) return;
    const ticketId = positiveTicketId(req.params.ticketId);
    if (ticketId === null) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
    if (typeof req.body?.appearsResolved !== "boolean") {
      return fail(res, 400, "VALIDATION_ERROR", "Choose whether the problem appears resolved.", {
        appearsResolved: "Choose true or false.",
      });
    }
    try {
      const ticket = await getPrisma().ticket.findFirst({
        where: { id: ticketId, requesterId: context.user.id },
        select: { id: true },
      });
      if (!ticket) return fail(res, 404, "RESOURCE_NOT_FOUND", "Ticket not found.");
      const indicatedAt = req.body.appearsResolved ? new Date() : null;
      await getPrisma().ticket.update({
        where: { id: ticketId },
        data: { requesterResolutionIndicatedAt: indicatedAt },
      });
      return res.json({ appearsResolved: Boolean(indicatedAt), indicatedAt });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to update the resolution indication.");
    }
  });
}
