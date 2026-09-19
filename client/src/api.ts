const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type UserRole = "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  itPriority?: "LOW" | "MEDIUM" | "HIGH";
  status: "NEW" | "OPEN" | "IN_PROGRESS" | "WAITING_FOR_REQUESTER" | "RESOLVED" | "CLOSED" | "REOPENED" | "CANCELLED";
  ownerId?: number | null;
  requesterResolutionIndicatedAt?: string | null;
  summary: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  requester?: Requester;
  category?: Category;
  relatedSystem?: RelatedSystem;
  attachments: Attachment[];
}

export interface PublicComment {
  id: number;
  ticketId: number;
  content: string;
  author: { id: number; name: string; role: UserRole };
  createdAt: string;
}

export interface StaffPerson {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface InternalNote {
  id: number;
  ticketId: number;
  content: string;
  author: StaffPerson;
  createdAt: string;
}

export interface StaffTicket extends Ticket {
  requester?: StaffPerson;
  owner?: StaffPerson | null;
  comments: PublicComment[];
  notes: InternalNote[];
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

export interface StaffTicketList {
  items: StaffTicket[];
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
    status?: number;
    code?: string;
  };
  error.fields = data.error?.fields;
  error.status = response.status;
  error.code = data.error?.code;
  return error;
}

let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  const response = await fetch(API_URL + "/api/auth/csrf", { credentials: "include" });
  if (!response.ok) throw await readError(response);
  const data = (await response.json()) as { csrfToken: string };
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const method = String(init.method ?? "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers.set("X-CSRF-Token", csrfToken ?? await getCsrfToken());
  }
  const response = await fetch(API_URL + path, { ...init, headers, credentials: "include" });
  if (!response.ok) throw await readError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function getCurrentUser(): Promise<{ user: User; mustChangePassword: boolean }> {
  return request<{ user: User; mustChangePassword: boolean }>("/api/auth/me");
}

export async function login(email: string, password: string): Promise<{ user: User; mustChangePassword: boolean }> {
  return request<{ user: User; mustChangePassword: boolean }>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ user: User; mustChangePassword: boolean }> {
  return request<{ user: User; mustChangePassword: boolean }>("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function logout(): Promise<void> {
  await request<void>("/api/auth/logout", { method: "POST" });
  csrfToken = null;
}

export type AdminUserFilters = {
  search?: string;
  role?: UserRole | "";
};

export type AdminUserCreate = {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  initialPassword: string;
};

export type AdminUserPatch = Partial<Pick<User, "name" | "email" | "role" | "isActive">>;

export async function listAdminUsers(filters: AdminUserFilters = {}): Promise<User[]> {
  const query = new URLSearchParams();
  if (filters.search?.trim()) query.set("search", filters.search.trim());
  if (filters.role) query.set("role", filters.role);
  const suffix = query.toString() ? "?" + query.toString() : "";
  const data = await request<{ users: User[] }>("/api/admin/users" + suffix);
  return data.users;
}

export async function createAdminUser(payload: AdminUserCreate): Promise<User> {
  const data = await request<{ user: User }>("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function updateAdminUser(userId: number, payload: AdminUserPatch): Promise<User> {
  const data = await request<{ user: User }>(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function resetAdminInitialPassword(userId: number, initialPassword: string): Promise<User> {
  const data = await request<{ user: User }>(`/api/admin/users/${userId}/initial-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initialPassword }),
  });
  return data.user;
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

type TicketPayload = {
    categoryId: number;
    relatedSystemId: number;
    requestedPriority: "LOW" | "MEDIUM" | "HIGH";
    summary: string;
    description: string;
    attachments: File[];
};

export async function createTicket(payload: TicketPayload): Promise<Ticket>;
export async function createTicket(_requesterId: number, payload: TicketPayload): Promise<Ticket>;
export async function createTicket(first: number | TicketPayload, second?: TicketPayload): Promise<Ticket> {
  const payload = typeof first === "number" ? second! : first;
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
  });
  return data.ticket;
}

type TicketParams = {
    search?: string;
    categoryId?: number | "";
    requestedPriority?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    page?: number;
    pageSize?: number;
};

export async function listTickets(params?: TicketParams): Promise<TicketList>;
export async function listTickets(_requesterId: number, params?: TicketParams): Promise<TicketList>;
export async function listTickets(first: number | TicketParams = {}, second: TicketParams = {}): Promise<TicketList> {
  const params = typeof first === "number" ? second : first;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const suffix = query.toString() ? "?" + query.toString() : "";
  return request<TicketList>("/api/tickets" + suffix);
}

export async function getTicket(ticketId: number): Promise<Ticket>;
export async function getTicket(_requesterId: number, ticketId: number): Promise<Ticket>;
export async function getTicket(first: number, second?: number): Promise<Ticket> {
  const ticketId = second ?? first;
  const data = await request<{ ticket: Ticket }>("/api/tickets/" + ticketId);
  return data.ticket;
}

export async function uploadAttachments(ticketId: number, files: File[]): Promise<Attachment[]>;
export async function uploadAttachments(_requesterId: number, ticketId: number, files: File[]): Promise<Attachment[]>;
export async function uploadAttachments(first: number, second: number | File[], third?: File[]): Promise<Attachment[]> {
  const ticketId = typeof second === "number" ? second : first;
  const files = (typeof second === "number" ? third : second)!;
  const form = new FormData();
  files.forEach((file) => form.append("attachments", file, file.name));
  const data = await request<{ attachments: Attachment[] }>(
    "/api/tickets/" + ticketId + "/attachments",
    { method: "POST", body: form },
  );
  return data.attachments;
}

export async function downloadAttachment(attachmentId: number): Promise<{ blob: Blob; filename: string }>;
export async function downloadAttachment(_requesterId: number, attachmentId: number): Promise<{ blob: Blob; filename: string }>;
export async function downloadAttachment(first: number, second?: number): Promise<{ blob: Blob; filename: string }> {
  const attachmentId = second ?? first;
  const response = await fetch(API_URL + "/api/attachments/" + attachmentId + "/download", {
    credentials: "include",
  });
  if (!response.ok) throw await readError(response);
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = /filename="([^"]+)"/i.exec(disposition);
  return { blob: await response.blob(), filename: match?.[1] ?? "attachment" };
}

export async function removeAttachment(attachmentId: number, reason: string): Promise<Attachment>;
export async function removeAttachment(_requesterId: number, attachmentId: number, reason: string): Promise<Attachment>;
export async function removeAttachment(first: number, second: number | string, third?: string): Promise<Attachment> {
  const attachmentId = typeof second === "number" ? second : first;
  const reason = typeof second === "number" ? third! : second;
  const data = await request<{ attachment: Attachment }>(
    "/api/attachments/" + attachmentId,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  );
  return data.attachment;
}

export async function getComments(ticketId: number): Promise<PublicComment[]> {
  const data = await request<{ comments: PublicComment[] }>(`/api/tickets/${ticketId}/comments`);
  return data.comments;
}

export async function addComment(ticketId: number, content: string): Promise<PublicComment> {
  const data = await request<{ comment: PublicComment }>(`/api/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return data.comment;
}

export async function setResolution(ticketId: number, appearsResolved: boolean): Promise<{ appearsResolved: boolean; indicatedAt: string | null }> {
  return request<{ appearsResolved: boolean; indicatedAt: string | null }>(`/api/tickets/${ticketId}/resolution-indication`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appearsResolved }),
  });
}

export type StaffTicketParams = {
  search?: string;
  status?: string;
  requestedPriority?: string;
  itPriority?: string;
  ownerId?: number;
  ownership?: "assigned" | "unassigned" | "";
  sortBy?: "updatedAt" | "createdAt" | "ticketNumber" | "status" | "requestedPriority" | "itPriority" | "owner";
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function listStaffTickets(params: StaffTicketParams = {}): Promise<StaffTicketList> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const suffix = query.toString() ? "?" + query.toString() : "";
  return request<StaffTicketList>("/api/staff/tickets" + suffix);
}

export async function getStaffTicket(ticketId: number): Promise<StaffTicket> {
  const data = await request<{ ticket: StaffTicket }>(`/api/staff/tickets/${ticketId}`);
  return data.ticket;
}

export async function updateStaffOwner(ticketId: number, ownerId: number | null): Promise<StaffTicket> {
  const data = await request<{ ticket: StaffTicket }>(`/api/staff/tickets/${ticketId}/owner`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ownerId }),
  });
  return data.ticket;
}

export async function updateStaffPriority(ticketId: number, itPriority: "LOW" | "MEDIUM" | "HIGH"): Promise<StaffTicket> {
  const data = await request<{ ticket: StaffTicket }>(`/api/staff/tickets/${ticketId}/priority`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itPriority }),
  });
  return data.ticket;
}

export async function updateStaffStatus(ticketId: number, status: Ticket["status"], confirm = false): Promise<StaffTicket> {
  const data = await request<{ ticket: StaffTicket }>(`/api/staff/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, confirm }),
  });
  return data.ticket;
}

export async function getStaffNotes(ticketId: number): Promise<InternalNote[]> {
  const data = await request<{ notes: InternalNote[] }>(`/api/staff/tickets/${ticketId}/notes`);
  return data.notes;
}

export async function addStaffNote(ticketId: number, content: string): Promise<InternalNote> {
  const data = await request<{ note: InternalNote }>(`/api/staff/tickets/${ticketId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return data.note;
}
