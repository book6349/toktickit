import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import type { Express } from "express";
// The scaffold does not ship a declaration file for formidable. Its runtime
// package is present through the test dependencies; the direct dependency is
// recorded in package.json for production installs.
// @ts-expect-error formidable 3.x currently has no bundled TypeScript types.
import formidable from "formidable";
import { getPrisma } from "./prisma.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH"]);
const SORT_FIELDS = new Set([
  "updatedAt",
  "createdAt",
  "ticketNumber",
  "requestedPriority",
]);
const PAGE_SIZES = new Set([10, 20, 50]);

type UploadedFile = {
  filepath: string;
  originalFilename?: string | null;
  mimetype?: string | null;
  size: number;
};

type ParsedInput = {
  fields: Record<string, string | string[]>;
  files: UploadedFile[];
};

function errorBody(code: string, message: string, fields?: Record<string, string>) {
  return { error: { code, message, ...(fields ? { fields } : {}) } };
}

function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) {
  return res.status(status).json(errorBody(code, message, fields));
}

function fieldValue(fields: Record<string, string | string[]>, name: string): string {
  const value = fields[name];
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  return String(value ?? "").trim();
}

function positiveInt(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function requesterIdFrom(req: Request): number | null {
  const raw = req.header("X-Requester-Id");
  return raw ? positiveInt(raw.trim()) : null;
}

async function requireRequester(req: Request, res: Response): Promise<number | null> {
  const requesterId = requesterIdFrom(req);
  if (requesterId === null) {
    fail(res, 400, "INVALID_REQUESTER_CONTEXT", "Select an active requester before continuing.");
    return null;
  }
  try {
    const requester = await activeRequester(requesterId);
    if (!requester) {
      fail(res, 400, "INVALID_REQUESTER_CONTEXT", "Select an active requester before continuing.");
      return null;
    }
  } catch {
    fail(res, 500, "INTERNAL_ERROR", "Unable to verify requester context.");
    return null;
  }
  return requesterId;
}

function safeFilename(filename: string): string {
  const normalized = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized || "attachment";
}

function extensionFor(filename: string, mimeType: string): string {
  const fromName = path.extname(filename).replace(/[^a-zA-Z0-9.]/g, "");
  if (fromName) return fromName.toLowerCase();
  const byMime: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
  };
  return byMime[mimeType] ?? "";
}

async function ensureStorage() {
  const root = path.resolve(process.cwd(), "storage");
  const uploads = path.join(root, "uploads");
  const temp = path.join(root, "tmp");
  await fs.mkdir(uploads, { recursive: true });
  await fs.mkdir(temp, { recursive: true });
  return { root, uploads, temp };
}

function flattenFiles(files: Record<string, unknown>): UploadedFile[] {
  const result: UploadedFile[] = [];
  for (const value of Object.values(files)) {
    if (Array.isArray(value)) {
      result.push(...(value as UploadedFile[]));
    } else if (value) {
      result.push(value as UploadedFile);
    }
  }
  return result;
}

async function removeTempFiles(files: UploadedFile[]) {
  await Promise.all(
    files.map(async (file) => {
      if (file.filepath) await fs.rm(file.filepath, { force: true }).catch(() => undefined);
    }),
  );
}

async function parseMultipart(req: Request): Promise<ParsedInput> {
  const storage = await ensureStorage();
  return new Promise((resolve, reject) => {
    const parser = formidable({
      multiples: true,
      uploadDir: storage.temp,
      keepExtensions: true,
      allowEmptyFiles: false,
      maxFileSize: MAX_FILE_SIZE,
      maxTotalFileSize: MAX_FILE_SIZE * MAX_ATTACHMENTS,
    }) as any;
    parser.parse(req, (err: any, fields: any, files: any) => {
      if (err) {
        const parseError = new Error(err.message || "Unable to parse multipart data.") as Error & {
          code?: number;
        };
        parseError.code = err.code;
        reject(parseError);
        return;
      }
      resolve({ fields: fields as Record<string, string | string[]>, files: flattenFiles(files ?? {}) });
    });
  });
}

async function parseInput(req: Request): Promise<ParsedInput> {
  const contentType = String(req.headers["content-type"] ?? "");
  if (contentType.toLowerCase().startsWith("multipart/form-data")) {
    return parseMultipart(req);
  }
  const body = (req.body ?? {}) as Record<string, unknown>;
  const fields: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value)) fields[key] = value.map(String);
    else if (value !== undefined && value !== null) fields[key] = String(value);
  }
  return { fields, files: [] };
}

export function validateTicketFields(fields: Record<string, string | string[]>) {
  const errors: Record<string, string> = {};
  const categoryId = positiveInt(fieldValue(fields, "categoryId"));
  const relatedSystemId = positiveInt(fieldValue(fields, "relatedSystemId"));
  const requestedPriority = fieldValue(fields, "requestedPriority").toUpperCase();
  const summary = fieldValue(fields, "summary");
  const description = fieldValue(fields, "description");

  if (categoryId === null) errors.categoryId = "Choose a valid category.";
  if (relatedSystemId === null) errors.relatedSystemId = "Choose a valid related system.";
  if (!PRIORITIES.has(requestedPriority)) errors.requestedPriority = "Choose LOW, MEDIUM, or HIGH.";
  if (summary.length < 5 || summary.length > 150) {
    errors.summary = "Summary must be between 5 and 150 characters.";
  }
  if (description.length < 10 || description.length > 5000) {
    errors.description = "Description must be between 10 and 5000 characters.";
  }

  return {
    errors,
    categoryId,
    relatedSystemId,
    requestedPriority,
    summary,
    description,
  };
}

export function validateFiles(files: UploadedFile[], existingCount = 0) {
  if (files.length + existingCount > MAX_ATTACHMENTS) {
    return {
      status: 413,
      code: "PAYLOAD_TOO_LARGE",
      message: "A ticket can have at most five active attachments.",
    };
  }
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return {
        status: 413,
      code: "PAYLOAD_TOO_LARGE",
        message: "Each attachment must be 5 MB or smaller.",
      };
    }
    const mimeType = String(file.mimetype ?? "").toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return {
        status: 415,
      code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Only JPEG, PNG, WEBP, and PDF attachments are supported.",
      };
    }
  }
  return null;
}

export function dateStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return String(year) + month + day;
}

async function nextTicketNumber() {
  const prisma = getPrisma();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const candidate = "TT-" + dateStamp() + "-" + suffix;
    const existing = await prisma.ticket.findUnique({ where: { ticketNumber: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  throw new Error("Unable to allocate a ticket number.");
}

const ticketInclude = {
  requester: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true } },
  relatedSystem: { select: { id: true, name: true } },
  attachments: {
    orderBy: { uploadedAt: "asc" as const },
  },
};

function attachmentJson(attachment: any) {
  return {
    id: attachment.id,
    originalFilename: attachment.originalFilename,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    uploadedAt: attachment.uploadedAt,
    removedAt: attachment.removedAt,
    removalReason: attachment.removalReason,
    isRemoved: Boolean(attachment.removedAt),
  };
}

function ticketJson(ticket: any) {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    ticketDate: ticket.ticketDate,
    requesterId: ticket.requesterId,
    categoryId: ticket.categoryId,
    relatedSystemId: ticket.relatedSystemId,
    requestedPriority: ticket.requestedPriority,
    status: ticket.status,
    summary: ticket.summary,
    description: ticket.description,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    requester: ticket.requester,
    category: ticket.category,
    relatedSystem: ticket.relatedSystem,
    attachments: Array.isArray(ticket.attachments)
      ? ticket.attachments.map(attachmentJson)
      : [],
  };
}

async function activeRequester(requesterId: number) {
  return getPrisma().requesterUser.findFirst({
    where: { id: requesterId, isActive: true },
    select: { id: true, name: true, email: true },
  });
}

async function moveToStorage(file: UploadedFile, uploads: string) {
  const originalFilename = safeFilename(String(file.originalFilename ?? "attachment"));
  const mimeType = String(file.mimetype ?? "").toLowerCase();
  const storageKey =
    crypto.randomUUID() + extensionFor(originalFilename, mimeType);
  const destination = path.join(uploads, storageKey);
  await fs.rename(file.filepath, destination);
  return { originalFilename, mimeType, storageKey, destination };
}

function queryParams(req: Request) {
  const query = req.query;
  const pageRaw = String(query.page ?? "1");
  const pageSizeRaw = String(query.pageSize ?? "10");
  const pageCandidate = positiveInt(pageRaw);
  const pageSizeCandidate = positiveInt(pageSizeRaw);
  const page = pageCandidate ?? 1;
  const safePageSizeCandidate = pageSizeCandidate ?? 10;
  const pageSize = PAGE_SIZES.has(safePageSizeCandidate) ? safePageSizeCandidate : 10;
  const sortByRaw = String(query.sortBy ?? "updatedAt");
  const sortBy = SORT_FIELDS.has(sortByRaw) ? sortByRaw : "updatedAt";
  const sortDirectionRaw = String(query.sortDirection ?? "desc").toLowerCase();
  const sortDirection = sortDirectionRaw === "asc" ? "asc" : "desc";
  const categoryRaw = String(query.categoryId ?? "");
  const invalid =
    pageCandidate === null ||
    pageSizeCandidate === null ||
    !PAGE_SIZES.has(safePageSizeCandidate) ||
    !SORT_FIELDS.has(sortByRaw) ||
    !["asc", "desc"].includes(sortDirectionRaw) ||
    (categoryRaw !== "" && positiveInt(categoryRaw) === null);
  return {
    search: String(query.search ?? "").trim(),
    categoryId: positiveInt(categoryRaw),
    requestedPriority: String(query.requestedPriority ?? "").trim().toUpperCase(),
    status: String(query.status ?? "").trim().toUpperCase(),
    sortBy,
    sortDirection,
    page,
    pageSize,
    invalid,
  };
}

export function registerLab2Routes(app: Express) {
  app.get("/api/requesters/active", async (_req: Request, res: Response) => {
    try {
      const requesters = await getPrisma().requesterUser.findMany({
        where: { isActive: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        select: { id: true, name: true, email: true },
      });
      return res.json({ requesters });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to load requesters.");
    }
  });

  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await getPrisma().category.findMany({
        where: { isActive: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        select: { id: true, name: true },
      });
      return res.json({ categories });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to load categories.");
    }
  });

  app.get("/api/related-systems", async (_req: Request, res: Response) => {
    try {
      const relatedSystems = await getPrisma().relatedSystem.findMany({
        where: { isActive: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        select: { id: true, name: true },
      });
      return res.json({ relatedSystems });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to load related systems.");
    }
  });

  app.post("/api/tickets", async (req: Request, res: Response) => {
    const requesterId = await requireRequester(req, res);
    if (requesterId === null) return;
    let parsed: ParsedInput;
    try {
      parsed = await parseInput(req);
    } catch (error: any) {
      if (error?.code === 1009 || error?.code === 1016) {
        return fail(res, 413, "PAYLOAD_TOO_LARGE", "Each attachment must be 5 MB or smaller.");
      }
      return fail(res, 400, "VALIDATION_ERROR", "Unable to parse the submitted form.");
    }
    const validation = validateTicketFields(parsed.fields);
    const fileError = validateFiles(parsed.files);
    if (Object.keys(validation.errors).length > 0) {
      await removeTempFiles(parsed.files);
      return fail(res, 400, "VALIDATION_ERROR", "Please correct the highlighted fields.", validation.errors);
    }
    if (fileError) {
      await removeTempFiles(parsed.files);
      return fail(res, fileError.status, fileError.code, fileError.message);
    }

    const prisma = getPrisma();
    const requester = await activeRequester(requesterId);
    if (!requester) {
      await removeTempFiles(parsed.files);
      return fail(res, 400, "INVALID_REQUESTER_CONTEXT", "Select an active requester before continuing.");
    }
    const [category, relatedSystem] = await Promise.all([
      prisma.category.findFirst({ where: { id: validation.categoryId!, isActive: true } }),
      prisma.relatedSystem.findFirst({ where: { id: validation.relatedSystemId!, isActive: true } }),
    ]);
    if (!category || !relatedSystem) {
      await removeTempFiles(parsed.files);
      return fail(res, 400, "INVALID_REFERENCE", "Choose an active category and related system.");
    }

    const moved: Array<{ destination: string; originalFilename: string; mimeType: string; storageKey: string; sizeBytes: number }> = [];
    let createdTicketId: number | null = null;
    try {
      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber: await nextTicketNumber(),
          requesterId,
          categoryId: validation.categoryId!,
          relatedSystemId: validation.relatedSystemId!,
          requestedPriority: validation.requestedPriority as any,
          status: "NEW" as any,
          summary: validation.summary,
          description: validation.description,
        },
      });
      createdTicketId = ticket.id;
      const storage = await ensureStorage();
      for (const file of parsed.files) {
        const stored = await moveToStorage(file, storage.uploads);
        moved.push({
          ...stored,
          sizeBytes: file.size,
        });
        await prisma.attachment.create({
          data: {
            ticketId: ticket.id,
            originalFilename: stored.originalFilename,
            storageKey: stored.storageKey,
            mimeType: stored.mimeType,
            sizeBytes: file.size,
          },
        });
      }
      const result = await prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: ticketInclude,
      });
      return res.status(201).json({ ticket: ticketJson(result ?? ticket) });
    } catch {
      if (createdTicketId !== null) {
        await prisma.attachment.deleteMany({ where: { ticketId: createdTicketId } }).catch(() => undefined);
        await prisma.ticket.delete({ where: { id: createdTicketId } }).catch(() => undefined);
      }
      await Promise.all(moved.map((file) => fs.rm(file.destination, { force: true }).catch(() => undefined)));
      await removeTempFiles(parsed.files);
      return fail(res, 500, "INTERNAL_ERROR", "Unable to create the ticket.");
    }
  });

  app.get("/api/tickets", async (req: Request, res: Response) => {
    const requesterId = await requireRequester(req, res);
    if (requesterId === null) return;
    const params = queryParams(req);
    if (params.invalid) {
      return fail(res, 400, "INVALID_QUERY", "One or more query parameters are invalid.");
    }
    if (params.requestedPriority && !PRIORITIES.has(params.requestedPriority)) {
      return fail(res, 400, "INVALID_QUERY", "Unknown requested priority.");
    }
    if (params.status && params.status !== "NEW") {
      return fail(res, 400, "INVALID_QUERY", "Unknown ticket status.");
    }
    try {
      const where: any = { requesterId };
      if (params.search) {
        where.OR = [
          { summary: { contains: params.search, mode: "insensitive" } },
          { description: { contains: params.search, mode: "insensitive" } },
        ];
      }
      if (params.categoryId !== null) where.categoryId = params.categoryId;
      if (params.requestedPriority) where.requestedPriority = params.requestedPriority;
      if (params.status) where.status = params.status;
      const prisma = getPrisma();
      const [total, tickets] = await Promise.all([
        prisma.ticket.count({ where }),
        prisma.ticket.findMany({
          where,
          include: ticketInclude,
          orderBy: [{ [params.sortBy]: params.sortDirection }, { id: "desc" }],
          skip: (params.page - 1) * params.pageSize,
          take: params.pageSize,
        }),
      ]);
      return res.json({
        items: tickets.map(ticketJson),
        pagination: {
          page: params.page,
          pageSize: params.pageSize,
          totalItems: total,
          totalPages: Math.ceil(total / params.pageSize),
          hasPrevious: params.page > 1,
          hasNext: params.page < Math.ceil(total / params.pageSize),
        },
      });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to load tickets.");
    }
  });

  app.get("/api/tickets/:ticketId", async (req: Request, res: Response) => {
    const requesterId = await requireRequester(req, res);
    if (requesterId === null) return;
    const ticketId = positiveInt(req.params.ticketId);
    if (ticketId === null) return fail(res, 404, "TICKET_NOT_FOUND", "Ticket not found.");
    try {
      const ticket = await getPrisma().ticket.findFirst({
        where: { id: ticketId, requesterId },
        include: ticketInclude,
      });
      if (!ticket) return fail(res, 404, "TICKET_NOT_FOUND", "Ticket not found.");
      return res.json({ ticket: ticketJson(ticket) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to load the ticket.");
    }
  });

  app.get("/api/tickets/:ticketId/attachments", async (req: Request, res: Response) => {
    const requesterId = await requireRequester(req, res);
    if (requesterId === null) return;
    const ticketId = positiveInt(req.params.ticketId);
    if (ticketId === null) return fail(res, 404, "TICKET_NOT_FOUND", "Ticket not found.");
    try {
      const ticket = await getPrisma().ticket.findFirst({
        where: { id: ticketId, requesterId },
        select: { id: true },
      });
      if (!ticket) return fail(res, 404, "TICKET_NOT_FOUND", "Ticket not found.");
      const attachments = await getPrisma().attachment.findMany({
        where: { ticketId },
        orderBy: { uploadedAt: "asc" },
      });
      return res.json({ attachments: attachments.map(attachmentJson) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to load attachments.");
    }
  });

  app.post("/api/tickets/:ticketId/attachments", async (req: Request, res: Response) => {
    const requesterId = await requireRequester(req, res);
    if (requesterId === null) return;
    const ticketId = positiveInt(req.params.ticketId);
    if (ticketId === null) return fail(res, 404, "TICKET_NOT_FOUND", "Ticket not found.");
    let parsed: ParsedInput;
    try {
      parsed = await parseMultipart(req);
    } catch (error: any) {
      if (error?.code === 1009 || error?.code === 1016) {
        return fail(res, 413, "PAYLOAD_TOO_LARGE", "Each attachment must be 5 MB or smaller.");
      }
      return fail(res, 400, "VALIDATION_ERROR", "Unable to parse the submitted files.");
    }
    const moved: Array<{ destination: string; originalFilename: string; mimeType: string; storageKey: string; sizeBytes: number }> = [];
    const createdIds: number[] = [];
    try {
      const prisma = getPrisma();
      const ticket = await prisma.ticket.findFirst({
        where: { id: ticketId, requesterId },
        select: { id: true },
      });
      if (!ticket) {
        await removeTempFiles(parsed.files);
        return fail(res, 404, "TICKET_NOT_FOUND", "Ticket not found.");
      }
      const activeCount = await prisma.attachment.count({ where: { ticketId, removedAt: null } });
      const fileError = validateFiles(parsed.files, activeCount);
      if (fileError) {
        await removeTempFiles(parsed.files);
        return fail(res, fileError.status, fileError.code, fileError.message);
      }
      if (parsed.files.length === 0) {
        return fail(res, 400, "VALIDATION_ERROR", "Choose at least one attachment.");
      }
      const storage = await ensureStorage();
      for (const file of parsed.files) {
        const stored = await moveToStorage(file, storage.uploads);
        moved.push({ ...stored, sizeBytes: file.size });
        const created = await prisma.attachment.create({
          data: {
            ticketId,
            originalFilename: stored.originalFilename,
            storageKey: stored.storageKey,
            mimeType: stored.mimeType,
            sizeBytes: file.size,
          },
        });
        createdIds.push(created.id);
      }
      const attachments = await prisma.attachment.findMany({
        where: { id: { in: createdIds } },
        orderBy: { uploadedAt: "asc" },
      });
      return res.status(201).json({ attachments: attachments.map(attachmentJson) });
    } catch {
      const prisma = getPrisma();
      if (createdIds.length > 0) {
        await prisma.attachment.deleteMany({ where: { id: { in: createdIds } } }).catch(() => undefined);
      }
      await Promise.all(moved.map((file) => fs.rm(file.destination, { force: true }).catch(() => undefined)));
      await removeTempFiles(parsed.files);
      return fail(res, 500, "INTERNAL_ERROR", "Unable to upload attachments.");
    }
  });

  app.get("/api/attachments/:attachmentId/download", async (req: Request, res: Response) => {
    const requesterId = await requireRequester(req, res);
    if (requesterId === null) return;
    const attachmentId = positiveInt(req.params.attachmentId);
    if (attachmentId === null) return fail(res, 404, "ATTACHMENT_NOT_FOUND", "Attachment not found.");
    try {
      const attachment = await getPrisma().attachment.findFirst({
        where: {
          id: attachmentId,
          removedAt: null,
          ticket: { requesterId },
        },
      });
      if (!attachment) return fail(res, 404, "ATTACHMENT_NOT_FOUND", "Attachment not found.");
      const storage = await ensureStorage();
      const filePath = path.join(storage.uploads, attachment.storageKey);
      const data = await fs.readFile(filePath).catch(() => null);
      if (!data) return fail(res, 404, "ATTACHMENT_NOT_FOUND", "Attachment file is unavailable.");
      res.setHeader("Content-Type", attachment.mimeType);
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=\"" + safeFilename(attachment.originalFilename) + "\"",
      );
      return res.send(data);
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to download the attachment.");
    }
  });

  app.delete("/api/attachments/:attachmentId", async (req: Request, res: Response) => {
    const requesterId = await requireRequester(req, res);
    if (requesterId === null) return;
    const attachmentId = positiveInt(req.params.attachmentId);
    if (attachmentId === null) return fail(res, 404, "ATTACHMENT_NOT_FOUND", "Attachment not found.");
    const reason = String((req.body as Record<string, unknown> | undefined)?.reason ?? "").trim();
    if (reason.length < 5 || reason.length > 250) {
      return fail(res, 400, "INVALID_REMOVAL_REASON", "Removal reason must be between 5 and 250 characters.", {
        reason: "Enter a reason between 5 and 250 characters.",
      });
    }
    try {
      const prisma = getPrisma();
      const attachment = await prisma.attachment.findFirst({
        where: { id: attachmentId, removedAt: null, ticket: { requesterId } },
      });
      if (!attachment) return fail(res, 404, "ATTACHMENT_NOT_FOUND", "Attachment not found.");
      const removed = await prisma.attachment.update({
        where: { id: attachmentId },
        data: { removedAt: new Date(), removalReason: reason, removedByRequesterId: requesterId },
      });
      return res.json({ attachment: attachmentJson(removed) });
    } catch {
      return fail(res, 500, "INTERNAL_ERROR", "Unable to remove the attachment.");
    }
  });
}
