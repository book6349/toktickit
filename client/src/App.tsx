import { FormEvent, useEffect, useState } from "react";
import {
  Attachment,
  addComment,
  changePassword,
  Category,
  createTicket,
  downloadAttachment,
  getComments,
  getCurrentUser,
  getReferenceData,
  getTicket,
  listTickets,
  login,
  logout,
  RelatedSystem,
  removeAttachment,
  setResolution,
  Ticket,
  User,
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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AsyncStatus>("loading");
  const [authError, setAuthError] = useState("");
  const [references, setReferences] = useState<{ categories: Category[]; relatedSystems: RelatedSystem[] }>({
    categories: [],
    relatedSystems: [],
  });
  const [referenceStatus, setReferenceStatus] = useState<AsyncStatus>("idle");
  const [referenceError, setReferenceError] = useState("");
  const [view, setView] = useState<View>("list");
  const [detailId, setDetailId] = useState<number | null>(null);

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
    if (user?.role === "REQUESTER" && !user.mustChangePassword) void loadReferences();
  }, [user?.id, user?.role, user?.mustChangePassword]);

  useEffect(() => {
    void getCurrentUser()
      .then((result) => {
        setUser(result.user);
        setAuthStatus("ready");
      })
      .catch((error: any) => {
        if (error?.status === 401) {
          setAuthStatus("idle");
          return;
        }
        setAuthError(error?.message || "Unable to restore your session.");
        setAuthStatus("error");
      });
  }, []);

  async function handleLogin(email: string, password: string) {
    setAuthStatus("loading");
    setAuthError("");
    try {
      const result = await login(email, password);
      setUser(result.user);
      setView("list");
      setDetailId(null);
      setAuthStatus("ready");
    } catch (error: any) {
      setAuthError(error?.message || "Unable to sign in.");
      setAuthStatus("idle");
    }
  }

  async function handlePasswordChange(currentPassword: string, newPassword: string) {
    setAuthStatus("loading");
    setAuthError("");
    try {
      const result = await changePassword(currentPassword, newPassword);
      setUser(result.user);
      setAuthStatus("ready");
    } catch (error: any) {
      setAuthError(error?.message || "Unable to change the password.");
      setAuthStatus("ready");
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
      setAuthStatus("idle");
      setView("list");
      setDetailId(null);
    }
  }

  async function retrySession() {
    setAuthStatus("loading");
    setAuthError("");
    try {
      const result = await getCurrentUser();
      setUser(result.user);
      setAuthStatus("ready");
    } catch (error: any) {
      setAuthError(error?.message || "Unable to restore your session.");
      setAuthStatus("error");
    }
  }

  return (
    <main className="app-shell">
      <div className="container py-4 py-lg-5">
        {authStatus === "loading" && !user && <div className="loading-panel" role="status">Checking your session…</div>}
        {authStatus === "error" && !user && (
          <div className="gate-card"><div className="notice error" role="alert">{authError}<button type="button" className="link-button" onClick={() => void retrySession()}>Retry</button></div></div>
        )}
        {authStatus === "idle" && !user && <LoginView onSubmit={(email, password) => void handleLogin(email, password)} error={authError} busy={false} />}
        {user?.mustChangePassword && (
          <ChangePasswordView user={user} onSubmit={(current, next) => void handlePasswordChange(current, next)} onLogout={() => void handleLogout()} error={authError} busy={authStatus === "loading"} />
        )}
        {user && !user.mustChangePassword && user.role === "REQUESTER" && (
          <ServiceDesk
            user={user}
            view={view}
            setView={setView}
            detailId={detailId}
            setDetailId={setDetailId}
            references={references}
            referenceStatus={referenceStatus}
            referenceError={referenceError}
            onRetryReferences={() => void loadReferences()}
            onLogout={() => void handleLogout()}
          />
        )}
        {user && !user.mustChangePassword && user.role !== "REQUESTER" && <RolePlaceholder user={user} onLogout={() => void handleLogout()} />}
      </div>
    </main>
  );
}

function LoginView(props: { onSubmit: (email: string, password: string) => void; error: string; busy: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <section className="gate-card" aria-labelledby="login-title">
      <p className="eyebrow">IT SERVICE DESK</p>
      <h1 id="login-title">TokTickIT <span>Sign in</span></h1>
      <p className="lead-copy">Sign in with your TokTickIT account to continue.</p>
      {props.error && <div className="notice error" role="alert">{props.error}</div>}
      <form className="requester-form" onSubmit={(event) => { event.preventDefault(); props.onSubmit(email.trim(), password); }}>
        <div className="field"><label htmlFor="login-email">Email</label><input id="login-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div className="field"><label htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
        <button className="primary-button" type="submit" disabled={props.busy}>{props.busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </section>
  );
}

function ChangePasswordView(props: { user: User; onSubmit: (current: string, next: string) => void; onLogout: () => void; error: string; busy: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const valid = newPassword.length >= 12 && newPassword.length <= 128 && /[A-Za-z]/.test(newPassword) && /\d/.test(newPassword) && newPassword === confirmPassword;
  return (
    <section className="gate-card" aria-labelledby="change-password-title">
      <p className="eyebrow">ACCOUNT SECURITY</p>
      <h1 id="change-password-title">Change your password</h1>
      <p className="lead-copy">Your initial password must be replaced before you can open the service desk.</p>
      <p className="field-help">Signed in as {props.user.email}. Use 12–128 characters with at least one letter and one number.</p>
      {props.error && <div className="notice error" role="alert">{props.error}</div>}
      <form className="requester-form" onSubmit={(event) => { event.preventDefault(); if (valid) props.onSubmit(currentPassword, newPassword); }}>
        <div className="field"><label htmlFor="current-password">Current password</label><input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></div>
        <div className="field"><label htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required aria-describedby="password-rules" /></div>
        <p id="password-rules" className="field-help">12–128 characters; include a letter and a number.</p>
        <div className="field"><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />{mismatch && <span className="field-error">Passwords do not match.</span>}</div>
        <div className="form-actions"><button className="primary-button" type="submit" disabled={props.busy || !valid}>{props.busy ? "Saving…" : "Save password"}</button></div>
      </form>
      <button type="button" className="link-button" onClick={props.onLogout}>Log out</button>
    </section>
  );
}

function RolePlaceholder(props: { user: User; onLogout: () => void }) {
  const label = props.user.role === "IT_STAFF" ? "Ticket Queue" : "User Management";
  return (
    <>
      <header className="topbar"><div><p className="eyebrow">TOKTICKIT</p><h1>IT Service Desk</h1></div><div className="requester-chip"><span>{props.user.name} · {props.user.role}</span><button type="button" className="link-button" onClick={props.onLogout}>Log out</button></div></header>
      <nav className="main-nav" aria-label="Main navigation"><span className="nav-link active">{label}</span></nav>
      <section className="content-card"><h2>{label}</h2><p className="lead-copy">This role workspace is delivered in the next Lab 3 unit.</p></section>
    </>
  );
}

function ServiceDesk(props: {
  user: User;
  view: View;
  setView: (view: View) => void;
  detailId: number | null;
  setDetailId: (id: number | null) => void;
  references: { categories: Category[]; relatedSystems: RelatedSystem[] };
  referenceStatus: AsyncStatus;
  referenceError: string;
  onRetryReferences: () => void;
  onLogout: () => void;
}) {
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
          <span>{props.user.name} · {props.user.role}</span>
          <button type="button" className="link-button" onClick={props.onLogout}>Log out</button>
        </div>
      </header>
      <nav className="main-nav" aria-label="Main navigation">
        <button type="button" className={props.view === "list" ? "nav-link active" : "nav-link"} onClick={() => props.setView("list")}>My Tickets</button>
        <button type="button" className={props.view === "create" ? "nav-link active" : "nav-link"} onClick={() => props.setView("create")}>Create Ticket</button>
      </nav>
      {props.view === "create" && (
        <CreateTicketView
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
          categories={props.references.categories}
          onOpenTicket={openDetail}
        />
      )}
      {props.view === "detail" && props.detailId !== null && (
        <TicketDetailView
          ticketId={props.detailId}
          onBack={() => props.setView("list")}
        />
      )}
    </>
  );
}

function CreateTicketView(props: {
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
      const ticket = await createTicket({
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

function TicketListView(props: { categories: Category[]; onOpenTicket: (id: number) => void }) {
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
      const result = await listTickets({ ...applied, categoryId: applied.categoryId ? Number(applied.categoryId) : "", page, pageSize: applied.pageSize });
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
  }, [JSON.stringify(applied)]);

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

function TicketDetailView(props: { ticketId: number; onBack: () => void }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState<AsyncStatus>("idle");
  const [uploadError, setUploadError] = useState("");
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [comments, setComments] = useState<Awaited<ReturnType<typeof getComments>>>([]);
  const [commentContent, setCommentContent] = useState("");
  const [commentStatus, setCommentStatus] = useState<AsyncStatus>("idle");
  const [resolvedStatus, setResolvedStatus] = useState(false);

  async function load() {
    setStatus("loading");
    try {
      const [loadedTicket, loadedComments] = await Promise.all([
        getTicket(props.ticketId),
        getComments(props.ticketId),
      ]);
      setTicket(loadedTicket);
      setComments(loadedComments);
      setResolvedStatus(Boolean(loadedTicket.requesterResolutionIndicatedAt));
      setStatus("ready");
    } catch (error: any) {
      setStatus("error");
      setError(error?.message || "Unable to load ticket.");
    }
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!commentContent.trim()) return;
    setCommentStatus("loading");
    try {
      const comment = await addComment(props.ticketId, commentContent.trim());
      setComments((current) => [...current, comment]);
      setCommentContent("");
      setCommentStatus("ready");
    } catch (error: any) {
      setUploadError(error?.message || "Unable to add the comment.");
      setCommentStatus("error");
    }
  }

  async function toggleResolution() {
    try {
      const result = await setResolution(props.ticketId, !resolvedStatus);
      setResolvedStatus(result.appearsResolved);
      setTicket((current) => current ? { ...current, requesterResolutionIndicatedAt: result.indicatedAt } : current);
    } catch (error: any) {
      setUploadError(error?.message || "Unable to update the resolution indication.");
    }
  }

  useEffect(() => {
    void load();
  }, [props.ticketId]);

  async function chooseUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploadStatus("loading");
    setUploadError("");
    try {
      const added = await uploadAttachments(props.ticketId, files);
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
      const result = await downloadAttachment(attachment.id);
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
      const removed = await removeAttachment(attachmentId, removeReason.trim());
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
          <div className="comments-block description-block"><div className="section-heading compact"><div><h3>Public comments</h3><p className="field-help">Comments are visible to the service desk team.</p></div><span className="status-pill">{comments.length}</span></div><ul className="file-list">{comments.map((comment) => <li key={comment.id}><span><strong>{comment.author.name}</strong> · {formatDate(comment.createdAt)}<br />{comment.content}</span></li>)}</ul><form className="requester-form" onSubmit={(event) => void submitComment(event)}><label htmlFor="public-comment">Add a public comment</label><textarea id="public-comment" value={commentContent} onChange={(event) => setCommentContent(event.target.value)} maxLength={4000} rows={4} required /><button className="secondary-button" type="submit" disabled={commentStatus === "loading"}>{commentStatus === "loading" ? "Adding…" : "Add comment"}</button></form><div className="resolution-panel"><p><strong>Problem appears resolved?</strong> This does not change the formal ticket status.</p><button className="secondary-button" type="button" onClick={() => void toggleResolution()}>{resolvedStatus ? "Clear resolved indication" : "Mark as appears resolved"}</button>{resolvedStatus && <span className="field-help" role="status">Marked as appears resolved.</span>}</div></div>
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
