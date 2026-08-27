const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Requester {
  id: number;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface RelatedSystem {
  id: number;
  name: string;
}

export interface Attachment {
  id: number;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  removedAt: string | null;
  removalReason: string | null;
  isRemoved: boolean;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  ticketDate: string;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  requestedPriority: "LOW" | "MEDIUM" | "HIGH";
  status: "NEW";
  summary: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  requester?: Requester;
  category?: Category;
  relatedSystem?: RelatedSystem;
  attachments: Attachment[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface TicketList {
  items: Ticket[];
  pagination: Pagination;
}

export interface ApiErrorShape {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

async function readError(response: Response): Promise<Error & { fields?: Record<string, string> }> {
  let data: ApiErrorShape = {};
  try {
    data = (await response.json()) as ApiErrorShape;
  } catch {
    // Keep the status-derived fallback below.
  }
  const error = new Error(data.error?.message || "The TokTickIT API request failed.") as Error & {
    fields?: Record<string, string>;
  };
  error.fields = data.error?.fields;
  return error;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  requesterId?: number,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (requesterId !== undefined) headers.set("X-Requester-Id", String(requesterId));
  const response = await fetch(API_URL + path, { ...init, headers });
  if (!response.ok) throw await readError(response);
  return (await response.json()) as T;
}

export async function getActiveRequesters(): Promise<Requester[]> {
  const data = await request<{ requesters: Requester[] }>("/api/requesters/active");
  return data.requesters;
}

export async function getReferenceData(): Promise<{
  categories: Category[];
  relatedSystems: RelatedSystem[];
}> {
  const [categories, relatedSystems] = await Promise.all([
    request<{ categories: Category[] }>("/api/categories"),
    request<{ relatedSystems: RelatedSystem[] }>("/api/related-systems"),
  ]);
  return { categories: categories.categories, relatedSystems: relatedSystems.relatedSystems };
}

export async function checkSystem(): Promise<SystemStatus> {
  const healthRes = await fetch(API_URL + "/api/health");
  if (!healthRes.ok) throw new Error("Unable to connect to TokTickIT API");
  let categories: Category[] = [];
  try {
    const categoryRes = await fetch(API_URL + "/api/categories");
    if (categoryRes.ok) {
      const data = (await categoryRes.json()) as Category[] | { categories: Category[] };
      categories = Array.isArray(data) ? data : data.categories;
    }
  } catch {
    // The health result is still useful when reference data is unavailable.
  }
  return { online: true, categories };
}

export async function createTicket(
  requesterId: number,
  payload: {
    categoryId: number;
    relatedSystemId: number;
    requestedPriority: "LOW" | "MEDIUM" | "HIGH";
    summary: string;
    description: string;
    attachments: File[];
  },
): Promise<Ticket> {
  const form = new FormData();
  form.set("categoryId", String(payload.categoryId));
  form.set("relatedSystemId", String(payload.relatedSystemId));
  form.set("requestedPriority", payload.requestedPriority);
  form.set("summary", payload.summary);
  form.set("description", payload.description);
  payload.attachments.forEach((file) => form.append("attachments", file, file.name));
  const data = await request<{ ticket: Ticket }>("/api/tickets", {
    method: "POST",
    body: form,
  }, requesterId);
  return data.ticket;
}

export async function listTickets(
  requesterId: number,
  params: {
    search?: string;
    categoryId?: number | "";
    requestedPriority?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    page?: number;
    pageSize?: number;
  } = {},
): Promise<TicketList> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const suffix = query.toString() ? "?" + query.toString() : "";
  return request<TicketList>("/api/tickets" + suffix, {}, requesterId);
}

export async function getTicket(requesterId: number, ticketId: number): Promise<Ticket> {
  const data = await request<{ ticket: Ticket }>("/api/tickets/" + ticketId, {}, requesterId);
  return data.ticket;
}

export async function uploadAttachments(
  requesterId: number,
  ticketId: number,
  files: File[],
): Promise<Attachment[]> {
  const form = new FormData();
  files.forEach((file) => form.append("attachments", file, file.name));
  const data = await request<{ attachments: Attachment[] }>(
    "/api/tickets/" + ticketId + "/attachments",
    { method: "POST", body: form },
    requesterId,
  );
  return data.attachments;
}

export async function downloadAttachment(
  requesterId: number,
  attachmentId: number,
): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(API_URL + "/api/attachments/" + attachmentId + "/download", {
    headers: { "X-Requester-Id": String(requesterId) },
  });
  if (!response.ok) throw await readError(response);
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = /filename="([^"]+)"/i.exec(disposition);
  return { blob: await response.blob(), filename: match?.[1] ?? "attachment" };
}

export async function removeAttachment(
  requesterId: number,
  attachmentId: number,
  reason: string,
): Promise<Attachment> {
  const data = await request<{ attachment: Attachment }>(
    "/api/attachments/" + attachmentId,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
    requesterId,
  );
  return data.attachment;
}
