import { FormEvent, useEffect, useState } from "react";
import {
  addComment,
  addStaffNote,
  getStaffNotes,
  getStaffTicket,
  InternalNote,
  listStaffTickets,
  PublicComment,
  StaffTicket,
  StaffTicketParams,
  Ticket,
  updateStaffOwner,
  updateStaffPriority,
  updateStaffStatus,
  User,
} from "./api.js";

type AsyncStatus = "idle" | "loading" | "ready" | "error";
type Priority = "LOW" | "MEDIUM" | "HIGH";
type QueueFilters = {
  search: string;
  status: string;
  requestedPriority: string;
  itPriority: string;
  ownership: "" | "assigned" | "unassigned";
  sortBy: NonNullable<StaffTicketParams["sortBy"]>;
  sortDirection: "asc" | "desc";
  pageSize: number;
};

const statuses: Ticket["status"][] = [
  "NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED",
];
const priorities: Priority[] = ["LOW", "MEDIUM", "HIGH"];
const confirmationStatuses = new Set<Ticket["status"]>(["RESOLVED", "CLOSED", "CANCELLED"]);
const allowedTransitions: Record<Ticket["status"], Ticket["status"][]> = {
  NEW: ["OPEN", "CANCELLED"],
  OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  CANCELLED: ["REOPENED"],
};

const defaultQueueFilters: QueueFilters = {
  search: "",
  status: "",
  requestedPriority: "",
  itPriority: "",
  ownership: "",
  sortBy: "updatedAt",
  sortDirection: "desc",
  pageSize: 10,
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function personLabel(person: { name: string; email?: string } | null | undefined) {
  return person ? `${person.name}${person.email ? ` · ${person.email}` : ""}` : "Unassigned";
}

export function StaffWorkspace(props: { user: User; onLogout: () => void }) {
  const [detailId, setDetailId] = useState<number | null>(null);

  return (
    <>
      <header className="topbar">
        <div><p className="eyebrow">TOKTICKIT</p><h1>IT Service Desk</h1></div>
        <div className="requester-chip"><span>{props.user.name} · {props.user.role}</span><button type="button" className="link-button" onClick={props.onLogout}>Log out</button></div>
      </header>
      <nav className="main-nav" aria-label="Main navigation">
        <button type="button" className={detailId === null ? "nav-link active" : "nav-link"} onClick={() => setDetailId(null)}>Ticket Queue</button>
      </nav>
      {detailId === null ? <StaffQueue onOpenTicket={setDetailId} /> : <StaffTicketDetail ticketId={detailId} user={props.user} canOperate onBack={() => setDetailId(null)} />}
    </>
  );
}

function StaffQueue(props: { onOpenTicket: (ticketId: number) => void }) {
  const [draft, setDraft] = useState(defaultQueueFilters);
  const [applied, setApplied] = useState(defaultQueueFilters);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [result, setResult] = useState<{ items: StaffTicket[]; pagination: { page: number; pageSize: number; totalItems: number; totalPages: number; hasPrevious: boolean; hasNext: boolean } } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setError("");
    void listStaffTickets({ ...applied, page }).then((next) => {
      if (!active) return;
      setResult(next);
      setStatus("ready");
    }).catch((reason: any) => {
      if (!active) return;
      setError(reason?.message || "Unable to load the Ticket Queue.");
      setStatus("error");
    });
    return () => { active = false; };
  }, [applied, page]);

  function change<K extends keyof QueueFilters>(key: K, value: QueueFilters[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function apply(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setApplied({ ...draft });
  }

  function clear() {
    setDraft({ ...defaultQueueFilters });
    setApplied({ ...defaultQueueFilters });
    setPage(1);
  }

  const hasFilters = Boolean(applied.search || applied.status || applied.requestedPriority || applied.itPriority || applied.ownership);
  const pagination = result?.pagination;

  return (
    <section className="content-card" aria-labelledby="staff-queue-heading">
      <div className="section-heading">
        <div><p className="eyebrow">OPERATIONS</p><h2 id="staff-queue-heading">Ticket Queue</h2><p className="lead-copy">Find shared work, inspect the detail, and keep ownership visible.</p></div>
      </div>
      <form className="filter-bar" onSubmit={apply}>
        <div className="field"><label htmlFor="staff-ticket-search">Search tickets</label><input id="staff-ticket-search" value={draft.search} onChange={(event) => change("search", event.target.value)} placeholder="Number, summary, description, requester" /></div>
        <div className="field"><label htmlFor="staff-status-filter">Status</label><select id="staff-status-filter" value={draft.status} onChange={(event) => change("status", event.target.value)}><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{formatStatus(value)}</option>)}</select></div>
        <div className="field"><label htmlFor="staff-requested-priority">Requested priority</label><select id="staff-requested-priority" value={draft.requestedPriority} onChange={(event) => change("requestedPriority", event.target.value)}><option value="">All requested priorities</option>{priorities.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="field"><label htmlFor="staff-it-priority">IT priority</label><select id="staff-it-priority" value={draft.itPriority} onChange={(event) => change("itPriority", event.target.value)}><option value="">All IT priorities</option>{priorities.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="field"><label htmlFor="staff-ownership">Owner</label><select id="staff-ownership" value={draft.ownership} onChange={(event) => change("ownership", event.target.value as QueueFilters["ownership"])}><option value="">All ownership</option><option value="assigned">Assigned</option><option value="unassigned">Unassigned</option></select></div>
        <div className="field"><label htmlFor="staff-sort-by">Sort by</label><select id="staff-sort-by" value={draft.sortBy} onChange={(event) => change("sortBy", event.target.value as QueueFilters["sortBy"])}><option value="updatedAt">Last updated</option><option value="createdAt">Created</option><option value="ticketNumber">Ticket number</option><option value="status">Status</option><option value="requestedPriority">Requested priority</option><option value="itPriority">IT priority</option><option value="owner">Owner</option></select></div>
        <div className="field"><label htmlFor="staff-sort-direction">Sort direction</label><select id="staff-sort-direction" value={draft.sortDirection} onChange={(event) => change("sortDirection", event.target.value as QueueFilters["sortDirection"])}><option value="desc">Descending</option><option value="asc">Ascending</option></select></div>
        <div className="field"><label htmlFor="staff-page-size">Tickets per page</label><select id="staff-page-size" value={draft.pageSize} onChange={(event) => change("pageSize", Number(event.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></div>
        <div className="filter-actions"><button className="primary-button" type="submit">Apply filters</button><button className="secondary-button" type="button" onClick={clear}>Clear filters</button></div>
      </form>
      {status === "loading" && <div className="loading-panel" role="status">Loading Ticket Queue…</div>}
      {status === "error" && <div className="notice error" role="alert">{error}<button type="button" className="link-button" onClick={() => setApplied({ ...applied })}>Retry</button></div>}
      {status === "ready" && result && result.items.length === 0 && <div className="empty-panel"><strong>{hasFilters ? "No matching tickets" : "No tickets yet"}</strong><span>{hasFilters ? "Clear or adjust the filters to broaden the Queue search." : "New tickets will appear here when they are submitted."}</span>{hasFilters && <button type="button" className="link-button" onClick={clear}>Clear filters</button>}</div>}
      {status === "ready" && result && result.items.length > 0 && <>
        <div className="ticket-list" aria-label="Ticket Queue results">
          {result.items.map((ticket) => <article className="ticket-row staff-ticket-row" key={ticket.id}>
            <div className="ticket-main"><strong>{ticket.ticketNumber}</strong><span>{ticket.summary}</span><small>{ticket.category?.name || "No category"} · {ticket.requester?.name || "Unknown requester"} · Updated {formatDate(ticket.updatedAt)}</small></div>
            <div className="ticket-meta"><span className="priority">Requested {ticket.requestedPriority}</span><span className="priority">IT {ticket.itPriority || ticket.requestedPriority}</span><span className="status-pill">{formatStatus(ticket.status)}</span><small>{ticket.owner ? `Owner: ${ticket.owner.name}` : "Unassigned"}</small><button className="secondary-button" type="button" onClick={() => props.onOpenTicket(ticket.id)}>Open Detail</button></div>
          </article>)}
        </div>
        {pagination && pagination.totalPages > 1 && <div className="pagination-controls"><button className="secondary-button" type="button" disabled={!pagination.hasPrevious} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {pagination.page} of {pagination.totalPages}</span><button className="secondary-button" type="button" disabled={!pagination.hasNext} onClick={() => setPage((current) => current + 1)}>Next</button></div>}
      </>}
    </section>
  );
}

export function StaffTicketDetail(props: { ticketId: number; user: User; canOperate: boolean; onBack: () => void }) {
  const [ticket, setTicket] = useState<StaffTicket | null>(null);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState<AsyncStatus>("idle");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [itPriority, setItPriority] = useState<Priority>("MEDIUM");
  const [statusTarget, setStatusTarget] = useState<Ticket["status"] | "">("");
  const [commentContent, setCommentContent] = useState("");
  const [noteContent, setNoteContent] = useState("");

  async function load() {
    setStatus("loading");
    setError("");
    try {
      const [loadedTicket, loadedNotes] = await Promise.all([getStaffTicket(props.ticketId), getStaffNotes(props.ticketId)]);
      setTicket(loadedTicket);
      setNotes(loadedNotes);
      setOwnerId(loadedTicket.owner ? String(loadedTicket.owner.id) : "");
      setItPriority(loadedTicket.itPriority || loadedTicket.requestedPriority);
      setStatusTarget("");
      setStatus("ready");
    } catch (reason: any) {
      setError(reason?.message || "Unable to load Ticket Detail.");
      setStatus("error");
    }
  }

  useEffect(() => { void load(); }, [props.ticketId]);

  async function perform(label: string, operation: () => Promise<unknown>) {
    setActionStatus("loading");
    setActionError("");
    setActionMessage("");
    try {
      await operation();
      await load();
      setActionMessage(label);
      setActionStatus("ready");
    } catch (reason: any) {
      setActionError(reason?.message || "Unable to save the Ticket change.");
      setActionStatus("error");
    }
  }

  function assignOwner() {
    const value = Number(ownerId);
    if (!Number.isSafeInteger(value) || value < 1) {
      setActionError("Enter a valid active IT Staff or Administrator owner ID.");
      setActionStatus("error");
      return;
    }
    void perform("Ownership updated.", () => updateStaffOwner(props.ticketId, value));
  }

  function updateStatus() {
    if (!statusTarget) return;
    if (confirmationStatuses.has(statusTarget) && !window.confirm(`Confirm changing this Ticket to ${formatStatus(statusTarget)}?`)) return;
    void perform("Status updated.", () => updateStaffStatus(props.ticketId, statusTarget, confirmationStatuses.has(statusTarget)));
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!commentContent.trim()) return;
    setActionStatus("loading");
    setActionError("");
    try {
      const comment = await addComment(props.ticketId, commentContent.trim());
      setTicket((current) => current ? { ...current, comments: [...current.comments, comment] } : current);
      setCommentContent("");
      setActionMessage("Public comment added.");
      setActionStatus("ready");
    } catch (reason: any) {
      setActionError(reason?.message || "Unable to add the public comment.");
      setActionStatus("error");
    }
  }

  async function submitNote(event: FormEvent) {
    event.preventDefault();
    if (!noteContent.trim()) return;
    setActionStatus("loading");
    setActionError("");
    try {
      const note = await addStaffNote(props.ticketId, noteContent.trim());
      setNotes((current) => [...current, note]);
      setNoteContent("");
      setActionMessage("Internal Note added.");
      setActionStatus("ready");
    } catch (reason: any) {
      setActionError(reason?.message || "Unable to add the Internal Note.");
      setActionStatus("error");
    }
  }

  return (
    <section className="content-card staff-detail-card" aria-labelledby="staff-detail-heading">
      <button type="button" className="back-link" onClick={props.onBack}>← Back to {props.user.role === "ADMINISTRATOR" ? "Administrator workspace" : "Ticket Queue"}</button>
      {status === "loading" && <div className="loading-panel" role="status">Loading Ticket Detail…</div>}
      {status === "error" && <div className="notice error" role="alert">{error}<button type="button" className="link-button" onClick={() => void load()}>Retry</button></div>}
      {status === "ready" && ticket && <>
        <div className="section-heading"><div><p className="eyebrow">{ticket.ticketNumber}</p><h2 id="staff-detail-heading">{ticket.summary}</h2></div><span className="status-pill">{formatStatus(ticket.status)}</span></div>
        {actionError && <div className="notice error" role="alert">{actionError}</div>}
        {actionMessage && <div className="notice success" role="status">{actionMessage}</div>}
        <dl className="detail-grid"><div><dt>Requester</dt><dd>{personLabel(ticket.requester)}</dd></div><div><dt>Category</dt><dd>{ticket.category?.name || "—"}</dd></div><div><dt>Related system</dt><dd>{ticket.relatedSystem?.name || "—"}</dd></div><div><dt>Created</dt><dd>{formatDate(ticket.createdAt)}</dd></div><div><dt>Updated</dt><dd>{formatDate(ticket.updatedAt)}</dd></div><div><dt>Requested priority</dt><dd><span className={`priority ${ticket.requestedPriority.toLowerCase()}`}>{ticket.requestedPriority}</span></dd></div><div><dt>IT priority</dt><dd><span className={`priority ${(ticket.itPriority || ticket.requestedPriority).toLowerCase()}`}>{ticket.itPriority || ticket.requestedPriority}</span></dd></div><div><dt>Owner</dt><dd>{personLabel(ticket.owner)}</dd></div></dl>
        <div className="description-block"><h3>Description</h3><p>{ticket.description}</p></div>
        <div className="staff-control-grid">
          <section className="operation-panel" aria-labelledby="ownership-heading"><h3 id="ownership-heading">Ownership</h3><p className="field-help">Only active IT Staff or Administrators may own a Ticket.</p>{props.canOperate ? <><div className="inline-actions"><button className="secondary-button" type="button" disabled={actionStatus === "loading"} onClick={() => { setOwnerId(String(props.user.id)); void perform("Ticket claimed.", () => updateStaffOwner(props.ticketId, props.user.id)); }}>Claim as me</button><button className="secondary-button" type="button" disabled={actionStatus === "loading"} onClick={() => void perform("Ticket unassigned.", () => updateStaffOwner(props.ticketId, null))}>Unassign</button></div><div className="field"><label htmlFor="staff-owner-id">Assign owner ID</label><input id="staff-owner-id" type="number" min="1" value={ownerId} onChange={(event) => setOwnerId(event.target.value)} /><button className="secondary-button" type="button" disabled={actionStatus === "loading"} onClick={assignOwner}>Assign owner</button></div></> : <p className="muted">Administrator access is read-only. Current owner: {personLabel(ticket.owner)}.</p>}</section>
          <section className="operation-panel" aria-labelledby="priority-heading"><h3 id="priority-heading">IT Priority and status</h3><div className="field"><label htmlFor="staff-it-priority-detail">IT Priority</label><select id="staff-it-priority-detail" disabled={!props.canOperate || actionStatus === "loading"} value={itPriority} onChange={(event) => setItPriority(event.target.value as Priority)}>{priorities.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>{props.canOperate && <button className="secondary-button" type="button" disabled={actionStatus === "loading"} onClick={() => void perform("IT Priority updated.", () => updateStaffPriority(props.ticketId, itPriority))}>Save IT Priority</button>}<div className="field"><label htmlFor="staff-next-status">Next status</label><select id="staff-next-status" disabled={!props.canOperate || actionStatus === "loading"} value={statusTarget} onChange={(event) => setStatusTarget(event.target.value as Ticket["status"] | "")}><option value="">Choose a permitted transition</option>{allowedTransitions[ticket.status].map((value) => <option key={value} value={value}>{formatStatus(value)}</option>)}</select></div>{props.canOperate && <button className="secondary-button" type="button" disabled={!statusTarget || actionStatus === "loading"} onClick={updateStatus}>Update status</button>}</section>
        </div>
        <div className="attachments-block"><div className="section-heading compact"><div><h3>Attachments</h3><p className="field-help">Existing Ticket files.</p></div></div>{ticket.attachments.length === 0 ? <p className="muted">No attachments.</p> : <ul className="attachment-list">{ticket.attachments.map((attachment) => <li key={attachment.id} className={attachment.isRemoved ? "removed" : ""}><div><strong>{attachment.originalFilename}</strong><span>{attachment.isRemoved ? "Removed" : `Uploaded ${formatDate(attachment.uploadedAt)}`}</span></div></li>)}</ul>}</div>
        <section className="description-block public-panel" aria-labelledby="public-comments-heading"><div className="section-heading compact"><div><h3 id="public-comments-heading">Public Comments</h3><p className="field-help">Visible to Requesters, IT Staff, and Administrators.</p></div><span className="status-pill">{ticket.comments.length}</span></div><ul className="comment-list">{ticket.comments.length === 0 && <li className="muted">No public comments.</li>}{ticket.comments.map((comment: PublicComment) => <li key={comment.id}><strong>{comment.author.name}</strong><span>{formatDate(comment.createdAt)}</span><p>{comment.content}</p></li>)}</ul>{props.canOperate && <form className="requester-form" onSubmit={submitComment}><label htmlFor="staff-public-comment">Add a public comment</label><textarea id="staff-public-comment" rows={4} maxLength={4000} value={commentContent} onChange={(event) => setCommentContent(event.target.value)} required /><button className="secondary-button" type="submit" disabled={actionStatus === "loading"}>Add public comment</button></form>}</section>
        <section className="description-block internal-notes-panel" aria-labelledby="internal-notes-heading"><div className="section-heading compact"><div><h3 id="internal-notes-heading">Internal Notes</h3><p className="field-help">Private to IT Staff and Administrators; never shown in the Requester workspace.</p></div><span className="status-pill">{notes.length}</span></div><ul className="comment-list">{notes.length === 0 && <li className="muted">No Internal Notes.</li>}{notes.map((note: InternalNote) => <li key={note.id}><strong>{note.author.name}</strong><span>{formatDate(note.createdAt)}</span><p>{note.content}</p></li>)}</ul>{props.canOperate && <form className="requester-form" onSubmit={submitNote}><label htmlFor="internal-note-content">Add an Internal Note</label><textarea id="internal-note-content" rows={4} maxLength={4000} value={noteContent} onChange={(event) => setNoteContent(event.target.value)} required /><button className="secondary-button" type="submit" disabled={actionStatus === "loading"}>Add Internal Note</button></form>}</section>
      </>}
    </section>
  );
}

export function AdminDirectDetail(props: { user: User; onLogout: () => void }) {
  const [ticketIdText, setTicketIdText] = useState("");
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [error, setError] = useState("");

  function open(event: FormEvent) {
    event.preventDefault();
    const value = Number(ticketIdText);
    if (!Number.isSafeInteger(value) || value < 1) {
      setError("Enter a valid Ticket ID.");
      return;
    }
    setError("");
    setTicketId(value);
  }

  return <>
    <header className="topbar"><div><p className="eyebrow">TOKTICKIT</p><h1>IT Service Desk</h1></div><div className="requester-chip"><span>{props.user.name} · {props.user.role}</span><button type="button" className="link-button" onClick={props.onLogout}>Log out</button></div></header>
    <nav className="main-nav" aria-label="Main navigation"><span className="nav-link active">User Management</span></nav>
    {ticketId === null ? <section className="content-card" aria-labelledby="admin-workspace-heading"><p className="eyebrow">ADMINISTRATOR</p><h2 id="admin-workspace-heading">Administrator workspace</h2><p className="lead-copy">The shared IT Staff Queue is not available to Administrators. Open an explicitly permitted Ticket Detail directly when you have a Ticket ID.</p><form className="form-grid direct-detail-form" onSubmit={open}><div className="field"><label htmlFor="admin-ticket-id">Ticket ID</label><input id="admin-ticket-id" type="number" min="1" value={ticketIdText} onChange={(event) => setTicketIdText(event.target.value)} required />{error && <span className="field-error">{error}</span>}</div><div className="form-actions"><button className="primary-button" type="submit">Open Ticket Detail</button></div></form></section> : <StaffTicketDetail ticketId={ticketId} user={props.user} canOperate={false} onBack={() => setTicketId(null)} />}
  </>;
}
