import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Attachment,
  Category,
  checkSystem,
  createTicket,
  downloadAttachment,
  getActiveRequesters,
  getReferenceData,
  getTicket,
  listTickets,
  RelatedSystem,
  removeAttachment,
  Requester,
  Ticket,
  uploadAttachments,
} from "./api.js";

type View = "list" | "create" | "detail";
type AsyncStatus = "idle" | "loading" | "ready" | "error";
type Priority = "LOW" | "MEDIUM" | "HIGH";
type TicketSortField = "updatedAt" | "createdAt" | "ticketNumber" | "requestedPriority";
type TicketFilters = {
  search: string;
  categoryId: string;
  requestedPriority: string;
  status: string;
  sortBy: TicketSortField;
  sortDirection: "asc" | "desc";
  pageSize: number;
};

const REQUESTER_STORAGE_KEY = "toktickit.requesterId";
const emptyForm = {
  categoryId: "",
  relatedSystemId: "",
  requestedPriority: "MEDIUM" as Priority,
  summary: "",
  description: "",
};

const defaultTicketFilters: TicketFilters = {
  search: "",
  categoryId: "",
  requestedPriority: "",
  status: "",
  sortBy: "updatedAt",
  sortDirection: "desc",
  pageSize: 10,
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function savedRequesterId() {
  if (typeof window === "undefined") return null;
  const value = Number(window.sessionStorage.getItem(REQUESTER_STORAGE_KEY));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function App() {
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [requesterId, setRequesterId] = useState<number | null>(savedRequesterId);
  const [requesterStatus, setRequesterStatus] = useState<AsyncStatus>("loading");
  const [requesterError, setRequesterError] = useState("");
  const [selectedRequesterInput, setSelectedRequesterInput] = useState(
    savedRequesterId ? String(savedRequesterId) : "",
  );
  const [references, setReferences] = useState<{ categories: Category[]; relatedSystems: RelatedSystem[] }>({
    categories: [],
    relatedSystems: [],
  });
  const [referenceStatus, setReferenceStatus] = useState<AsyncStatus>("idle");
  const [referenceError, setReferenceError] = useState("");
  const [view, setView] = useState<View>("list");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [legacyState, setLegacyState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [legacyCategories, setLegacyCategories] = useState<Category[]>([]);
  const [legacyError, setLegacyError] = useState("");

  async function loadRequesters() {
    setRequesterStatus("loading");
    setRequesterError("");
    try {
      const result = await getActiveRequesters();
      setRequesters(result);
      setRequesterStatus("ready");
      const stored = savedRequesterId();
      if (stored && result.some((requester) => requester.id === stored)) {
        setRequesterId(stored);
        setSelectedRequesterInput(String(stored));
      } else if (stored) {
        window.sessionStorage.removeItem(REQUESTER_STORAGE_KEY);
        setRequesterId(null);
      }
    } catch (error: any) {
      setRequesterStatus("error");
      setRequesterError(error?.message || "Unable to load active requesters.");
    }
  }

  async function loadReferences() {
    setReferenceStatus("loading");
    setReferenceError("");
    try {
      setReferences(await getReferenceData());
      setReferenceStatus("ready");
    } catch (error: any) {
      setReferenceStatus("error");
      setReferenceError(error?.message || "Unable to load ticket reference data.");
    }
  }

  useEffect(() => {
    void loadRequesters();
  }, []);

  useEffect(() => {
    if (requesterId !== null) void loadReferences();
  }, [requesterId]);

  async function handleCheckSystem() {
    setLegacyState("loading");
    setLegacyError("");
    try {
      const result = await checkSystem();
      setLegacyCategories(result.categories);
      setLegacyState("success");
    } catch (error: any) {
      setLegacyError(error?.message || "Unable to connect to TokTickIT API");
      setLegacyState("error");
    }
  }

  function chooseRequester(event: FormEvent) {
    event.preventDefault();
    const id = Number(selectedRequesterInput);
    if (!requesters.some((requester) => requester.id === id)) return;
    window.sessionStorage.setItem(REQUESTER_STORAGE_KEY, String(id));
    setRequesterId(id);
    setView("list");
  }

  function changeRequester() {
    window.sessionStorage.removeItem(REQUESTER_STORAGE_KEY);
    setRequesterId(null);
    setSelectedRequesterInput("");
    setDetailId(null);
  }

  return (
    <main className="app-shell">
      <div className="container py-4 py-lg-5">
        {requesterId === null ? (
          <RequesterGate
            requesters={requesters}
            selectedRequesterInput={selectedRequesterInput}
            setSelectedRequesterInput={setSelectedRequesterInput}
            status={requesterStatus}
            error={requesterError}
            onSubmit={chooseRequester}
            onRetry={() => void loadRequesters()}
            legacyState={legacyState}
            legacyCategories={legacyCategories}
            legacyError={legacyError}
            onCheckSystem={() => void handleCheckSystem()}
          />
        ) : (
          <ServiceDesk
            requesterId={requesterId}
            requesters={requesters}
            view={view}
            setView={setView}
            detailId={detailId}
            setDetailId={setDetailId}
            references={references}
            referenceStatus={referenceStatus}
            referenceError={referenceError}
            onRetryReferences={() => void loadReferences()}
            onChangeRequester={changeRequester}
          />
        )}
      </div>
    </main>
  );
}

function RequesterGate(props: {
  requesters: Requester[];
  selectedRequesterInput: string;
  setSelectedRequesterInput: (value: string) => void;
  status: AsyncStatus;
  error: string;
  onSubmit: (event: FormEvent) => void;
  onRetry: () => void;
  legacyState: "idle" | "loading" | "success" | "error";
  legacyCategories: Category[];
  legacyError: string;
  onCheckSystem: () => void;
}) {
  return (
    <section className="gate-card" aria-labelledby="app-title">
      <p className="eyebrow">IT SERVICE DESK</p>
      <h1 id="app-title">TokTickIT <span>IT Service Desk</span></h1>
      <p className="lead-copy">
        Choose your requester identity to create and track support tickets.
      </p>
      <form onSubmit={props.onSubmit} className="requester-form">
        <label htmlFor="requester">Requester</label>
        <select
          id="requester"
          value={props.selectedRequesterInput}
          onChange={(event) => props.setSelectedRequesterInput(event.target.value)}
          disabled={props.status === "loading" || props.requesters.length === 0}
          required
        >
          <option value="">Select your name</option>
          {props.requesters.map((requester) => (
            <option value={requester.id} key={requester.id}>
              {requester.name} ({requester.email})
            </option>
          ))}
        </select>
        {props.status === "loading" && <p className="field-help">Loading active requesters…</p>}
        {props.status === "error" && (
          <div className="notice error" role="alert">
            <span>{props.error}</span>
            <button type="button" className="link-button" onClick={props.onRetry}>Retry</button>
          </div>
        )}
        <button className="primary-button" type="submit" disabled={!props.selectedRequesterInput}>
          Continue
        </button>
      </form>

      <div className="system-check">
        <div>
          <strong>Connection check</strong>
          <p className="field-help">Use this quick check if the service desk is not loading.</p>
        </div>
        <button className="secondary-button" type="button" onClick={props.onCheckSystem} disabled={props.legacyState === "loading"}>
          {props.legacyState === "loading" ? "Checking…" : "Check System"}
        </button>
      </div>
      {props.legacyState === "success" && (
        <div className="notice success" role="status">
          <strong>Online</strong>
          {props.legacyCategories.length > 0 && (
            <ul>
              {props.legacyCategories.map((category) => <li key={category.id}>{category.name}</li>)}
            </ul>
          )}
        </div>
      )}
      {props.legacyState === "error" && <div className="notice error" role="alert"><strong>Offline</strong><span>{props.legacyError}</span></div>}
    </section>
  );
}

function ServiceDesk(props: {
  requesterId: number;
  requesters: Requester[];
  view: View;
  setView: (view: View) => void;
  detailId: number | null;
  setDetailId: (id: number | null) => void;
  references: { categories: Category[]; relatedSystems: RelatedSystem[] };
  referenceStatus: AsyncStatus;
  referenceError: string;
  onRetryReferences: () => void;
  onChangeRequester: () => void;
}) {
  const requester = props.requesters.find((item) => item.id === props.requesterId);
  function openDetail(id: number) {
    props.setDetailId(id);
    props.setView("detail");
  }
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">TOKTICKIT</p>
          <h1>IT Service Desk</h1>
        </div>
        <div className="requester-chip">
          <span>{requester?.name || "Requester"}</span>
          <button type="button" className="link-button" onClick={props.onChangeRequester}>Change requester</button>
        </div>
      </header>
      <nav className="main-nav" aria-label="Main navigation">
        <button type="button" className={props.view === "list" ? "nav-link active" : "nav-link"} onClick={() => props.setView("list")}>My Tickets</button>
        <button type="button" className={props.view === "create" ? "nav-link active" : "nav-link"} onClick={() => props.setView("create")}>Create Ticket</button>
      </nav>
      {props.view === "create" && (
        <CreateTicketView
          requesterId={props.requesterId}
          categories={props.references.categories}
          relatedSystems={props.references.relatedSystems}
          referenceStatus={props.referenceStatus}
          referenceError={props.referenceError}
          onRetryReferences={props.onRetryReferences}
          onCreated={(ticket) => openDetail(ticket.id)}
        />
      )}
      {props.view === "list" && (
        <TicketListView
          requesterId={props.requesterId}
          categories={props.references.categories}
          onOpenTicket={openDetail}
        />
      )}
      {props.view === "detail" && props.detailId !== null && (
        <TicketDetailView
          requesterId={props.requesterId}
          ticketId={props.detailId}
          onBack={() => props.setView("list")}
        />
      )}
    </>
  );
}

function CreateTicketView(props: {
  requesterId: number;
  categories: Category[];
  relatedSystems: RelatedSystem[];
  referenceStatus: AsyncStatus;
  referenceError: string;
  onRetryReferences: () => void;
  onCreated: (ticket: Ticket) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  function update(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function selectFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const nextErrors: Record<string, string> = {};
    if (selected.length > 5) nextErrors.attachments = "Choose no more than five files.";
    if (selected.some((file) => file.size > 5 * 1024 * 1024)) nextErrors.attachments = "Each file must be 5 MB or smaller.";
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (selected.some((file) => !allowed.includes(file.type))) nextErrors.attachments = "Use JPEG, PNG, WEBP, or PDF files.";
    setFiles(selected.slice(0, 5));
    setErrors((current) => ({ ...current, attachments: nextErrors.attachments ?? "" }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.categoryId) nextErrors.categoryId = "Choose a category.";
    if (!form.relatedSystemId) nextErrors.relatedSystemId = "Choose a related system.";
    if (form.summary.trim().length < 5 || form.summary.trim().length > 150) nextErrors.summary = "Use 5–150 characters.";
    if (form.description.trim().length < 10 || form.description.trim().length > 5000) nextErrors.description = "Use 10–5000 characters.";
    if (Object.keys(nextErrors).length > 0 || errors.attachments) {
      setErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }
    setStatus("loading");
    setErrorMessage("");
    setSuccess("");
    try {
      const ticket = await createTicket(props.requesterId, {
        categoryId: Number(form.categoryId),
        relatedSystemId: Number(form.relatedSystemId),
        requestedPriority: form.requestedPriority,
        summary: form.summary.trim(),
        description: form.description.trim(),
        attachments: files,
      });
      setStatus("ready");
      setSuccess("Ticket " + ticket.ticketNumber + " was created.");
      setCreatedTicket(ticket);
      setForm(emptyForm);
      setFiles([]);
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error?.message || "Unable to create ticket.");
      if (error?.fields) setErrors((current) => ({ ...current, ...error.fields }));
    }
  }

  return (
    <section className="content-card" aria-labelledby="create-heading">
      <div className="section-heading">
        <div><p className="eyebrow">NEW REQUEST</p><h2 id="create-heading">Create a ticket</h2></div>
        <span className="status-pill">Starts as NEW</span>
      </div>
      {props.referenceStatus === "loading" && <div className="notice info">Loading categories and related systems…</div>}
      {props.referenceStatus === "error" && <div className="notice error" role="alert"><span>{props.referenceError}</span><button className="link-button" type="button" onClick={props.onRetryReferences}>Retry</button></div>}
      {status === "error" && <div className="notice error" role="alert">{errorMessage}</div>}
      {success && <div className="notice success" role="status"><span>{success}</span>{createdTicket && <button className="link-button" type="button" onClick={() => props.onCreated(createdTicket)}>View ticket</button>}</div>}
      <form className="ticket-form" onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="Category" id="categoryId" error={errors.categoryId}>
            <select id="categoryId" value={form.categoryId} onChange={(event) => update("categoryId", event.target.value)} aria-invalid={Boolean(errors.categoryId)} required>
              <option value="">Select a category</option>
              {props.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
          <Field label="Related system" id="relatedSystemId" error={errors.relatedSystemId}>
            <select id="relatedSystemId" value={form.relatedSystemId} onChange={(event) => update("relatedSystemId", event.target.value)} aria-invalid={Boolean(errors.relatedSystemId)} required>
              <option value="">Select a system</option>
              {props.relatedSystems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}
            </select>
          </Field>
          <Field label="Requested priority" id="requestedPriority">
            <select id="requestedPriority" value={form.requestedPriority} onChange={(event) => update("requestedPriority", event.target.value)}>
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
            </select>
          </Field>
          <Field label="Summary" id="summary" hint="5–150 characters" error={errors.summary}>
            <input id="summary" value={form.summary} maxLength={150} onChange={(event) => update("summary", event.target.value)} aria-invalid={Boolean(errors.summary)} required />
          </Field>
        </div>
        <Field label="Description" id="description" hint="10–5,000 characters" error={errors.description}>
          <textarea id="description" rows={7} value={form.description} maxLength={5000} onChange={(event) => update("description", event.target.value)} aria-invalid={Boolean(errors.description)} required />
        </Field>
        <Field label="Attachments" id="attachments" hint="Optional · up to 5 files · 5 MB each" error={errors.attachments}>
          <input id="attachments" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" onChange={selectFiles} />
          {files.length > 0 && <ul className="file-list">{files.map((file) => <li key={file.name + file.lastModified}>{file.name} <span>{formatSize(file.size)}</span></li>)}</ul>}
        </Field>
        <div className="form-actions"><button className="primary-button" type="submit" disabled={status === "loading"}>{status === "loading" ? "Creating…" : "Submit ticket"}</button></div>
      </form>
    </section>
  );
}

function Field(props: { label: string; id: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={props.id}>{props.label}</label>
      {props.children}
      {props.hint && <span className="field-help">{props.hint}</span>}
      {props.error && <span className="field-error" role="alert">{props.error}</span>}
    </div>
  );
}

function TicketListView(props: { requesterId: number; categories: Category[]; onOpenTicket: (id: number) => void }) {
  const [filters, setFilters] = useState<TicketFilters>({ ...defaultTicketFilters });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0, hasPrevious: false, hasNext: false });
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [error, setError] = useState("");
  const [applied, setApplied] = useState<TicketFilters>({ ...defaultTicketFilters });

  async function load(page = 1) {
    setStatus("loading");
    setError("");
    try {
      const result = await listTickets(props.requesterId, { ...applied, categoryId: applied.categoryId ? Number(applied.categoryId) : "", page, pageSize: applied.pageSize });
      setTickets(result.items);
      setPagination(result.pagination);
      setStatus("ready");
    } catch (error: any) {
      setStatus("error");
      setError(error?.message || "Unable to load tickets.");
    }
  }

  useEffect(() => {
    void load(1);
  }, [props.requesterId, JSON.stringify(applied)]);

  function applyFilters(event: FormEvent) {
    event.preventDefault();
    setApplied(filters);
  }

  function clearFilters() {
    const cleared = { ...defaultTicketFilters };
    setFilters(cleared);
    setApplied(cleared);
  }

  const hasActiveFilters = Boolean(applied.search || applied.categoryId || applied.requestedPriority || applied.status);

  return (
    <section className="content-card" aria-labelledby="tickets-heading">
      <div className="section-heading"><div><p className="eyebrow">REQUEST HISTORY</p><h2 id="tickets-heading">My tickets</h2></div><span className="muted">{pagination.totalItems} total</span></div>
      <form className="filter-bar" onSubmit={applyFilters}>
        <label className="visually-hidden" htmlFor="ticket-search">Search tickets</label>
        <input id="ticket-search" placeholder="Search summary or description" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        <label className="visually-hidden" htmlFor="ticket-category">Category</label>
        <select id="ticket-category" value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}><option value="">All categories</option>{props.categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select>
        <label className="visually-hidden" htmlFor="ticket-priority">Priority</label>
        <select id="ticket-priority" value={filters.requestedPriority} onChange={(event) => setFilters({ ...filters, requestedPriority: event.target.value })}><option value="">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select>
        <label className="visually-hidden" htmlFor="ticket-status">Status</label>
        <select id="ticket-status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option><option value="NEW">New</option></select>
        <label className="visually-hidden" htmlFor="ticket-sort">Sort by</label>
        <select id="ticket-sort" value={filters.sortBy} onChange={(event) => setFilters({ ...filters, sortBy: event.target.value as TicketSortField })}><option value="updatedAt">Recently updated</option><option value="createdAt">Date created</option><option value="ticketNumber">Ticket number</option><option value="requestedPriority">Priority</option></select>
        <label className="visually-hidden" htmlFor="ticket-sort-direction">Sort direction</label>
        <select id="ticket-sort-direction" value={filters.sortDirection} onChange={(event) => setFilters({ ...filters, sortDirection: event.target.value as "asc" | "desc" })}><option value="desc">Descending</option><option value="asc">Ascending</option></select>
        <label className="visually-hidden" htmlFor="ticket-page-size">Tickets per page</label>
        <select id="ticket-page-size" value={filters.pageSize} onChange={(event) => setFilters({ ...filters, pageSize: Number(event.target.value) })}><option value={10}>10 per page</option><option value={20}>20 per page</option><option value={50}>50 per page</option></select>
        <div className="filter-actions">
          <button className="secondary-button" type="submit">Apply filters</button>
          <button className="link-button" type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      </form>
      {status === "loading" && <div className="loading-panel" role="status">Loading tickets…</div>}
      {status === "error" && <div className="notice error" role="alert">{error}<button className="link-button" type="button" onClick={() => void load(pagination.page)}>Retry</button></div>}
      {status === "ready" && tickets.length === 0 && <div className="empty-panel"><strong>{hasActiveFilters ? "No matching tickets" : "No tickets yet"}</strong><p>{hasActiveFilters ? "Try a different filter." : "Create your first ticket to see it here."}</p></div>}
      {status === "ready" && tickets.length > 0 && <div className="ticket-list">{tickets.map((ticket) => <button type="button" className="ticket-row" key={ticket.id} onClick={() => props.onOpenTicket(ticket.id)}><span className="ticket-main"><strong>{ticket.ticketNumber}</strong><span>{ticket.summary}</span><small>{ticket.category?.name || "Category"} · Updated {formatDate(ticket.updatedAt)}</small></span><span className="ticket-meta"><span className={"priority " + ticket.requestedPriority.toLowerCase()}>{ticket.requestedPriority}</span><span className="status-pill">{ticket.status}</span></span></button>)}</div>}
      {status === "ready" && pagination.totalPages > 1 && <div className="pagination-controls"><button className="secondary-button" type="button" disabled={!pagination.hasPrevious} onClick={() => void load(pagination.page - 1)}>Previous</button><span>Page {pagination.page} of {pagination.totalPages}</span><button className="secondary-button" type="button" disabled={!pagination.hasNext} onClick={() => void load(pagination.page + 1)}>Next</button></div>}
    </section>
  );
}

function TicketDetailView(props: { requesterId: number; ticketId: number; onBack: () => void }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState<AsyncStatus>("idle");
  const [uploadError, setUploadError] = useState("");
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [removeReason, setRemoveReason] = useState("");

  async function load() {
    setStatus("loading");
    try {
      setTicket(await getTicket(props.requesterId, props.ticketId));
      setStatus("ready");
    } catch (error: any) {
      setStatus("error");
      setError(error?.message || "Unable to load ticket.");
    }
  }

  useEffect(() => {
    void load();
  }, [props.requesterId, props.ticketId]);

  async function chooseUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploadStatus("loading");
    setUploadError("");
    try {
      const added = await uploadAttachments(props.requesterId, props.ticketId, files);
      setTicket((current) => current ? { ...current, attachments: [...current.attachments, ...added] } : current);
      setUploadStatus("ready");
      event.target.value = "";
    } catch (error: any) {
      setUploadStatus("error");
      setUploadError(error?.message || "Unable to upload attachments.");
    }
  }

  async function download(attachment: Attachment) {
    try {
      const result = await downloadAttachment(props.requesterId, attachment.id);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      setUploadError(error?.message || "Unable to download attachment.");
    }
  }

  async function remove(event: FormEvent, attachmentId: number) {
    event.preventDefault();
    if (removeReason.trim().length < 5) return;
    try {
      const removed = await removeAttachment(props.requesterId, attachmentId, removeReason.trim());
      setTicket((current) => current ? { ...current, attachments: current.attachments.map((item) => item.id === removed.id ? removed : item) } : current);
      setRemoveId(null);
      setRemoveReason("");
    } catch (error: any) {
      setUploadError(error?.message || "Unable to remove attachment.");
    }
  }

  return (
    <section className="content-card" aria-labelledby="detail-heading">
      <button type="button" className="back-link" onClick={props.onBack}>← Back to My Tickets</button>
      {status === "loading" && <div className="loading-panel" role="status">Loading ticket…</div>}
      {status === "error" && <div className="notice error" role="alert">{error}<button type="button" className="link-button" onClick={() => void load()}>Retry</button></div>}
      {status === "ready" && ticket && (
        <>
          <div className="section-heading"><div><p className="eyebrow">{ticket.ticketNumber}</p><h2 id="detail-heading">{ticket.summary}</h2></div><span className="status-pill">{ticket.status}</span></div>
          <dl className="detail-grid"><div><dt>Category</dt><dd>{ticket.category?.name || "—"}</dd></div><div><dt>Related system</dt><dd>{ticket.relatedSystem?.name || "—"}</dd></div><div><dt>Priority</dt><dd><span className={"priority " + ticket.requestedPriority.toLowerCase()}>{ticket.requestedPriority}</span></dd></div><div><dt>Submitted</dt><dd>{formatDate(ticket.createdAt)}</dd></div></dl>
          <div className="description-block"><h3>Description</h3><p>{ticket.description}</p></div>
          <div className="attachments-block"><div className="section-heading compact"><div><h3>Attachments</h3><p className="field-help">Active files can be downloaded or removed.</p></div><label className="secondary-button upload-label" htmlFor="detail-upload">Add files<input id="detail-upload" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" onChange={chooseUpload} /></label></div>
            {uploadStatus === "loading" && <div className="notice info">Uploading…</div>}
            {uploadError && <div className="notice error" role="alert">{uploadError}</div>}
            {ticket.attachments.length === 0 && <p className="muted">No attachments.</p>}
            <ul className="attachment-list">{ticket.attachments.map((attachment) => <li key={attachment.id} className={attachment.isRemoved ? "removed" : ""}><div><strong>{attachment.originalFilename}</strong><span>{formatSize(attachment.sizeBytes)} · {attachment.isRemoved ? "Removed" : "Uploaded " + formatDate(attachment.uploadedAt)}</span></div>{!attachment.isRemoved && <div className="attachment-actions"><button className="link-button" type="button" onClick={() => void download(attachment)}>Download</button><button className="danger-link" type="button" onClick={() => setRemoveId(attachment.id)}>Remove</button></div>}{removeId === attachment.id && <form className="remove-form" onSubmit={(event) => void remove(event, attachment.id)}><label htmlFor={"remove-reason-" + attachment.id}>Removal reason</label><input id={"remove-reason-" + attachment.id} value={removeReason} onChange={(event) => setRemoveReason(event.target.value)} minLength={5} maxLength={250} required /><button className="danger-button" type="submit">Confirm removal</button></form>}</li>)}</ul>
          </div>
        </>
      )}
    </section>
  );
}

export default App;
