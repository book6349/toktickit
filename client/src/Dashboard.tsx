import { useEffect, useState } from "react";
import {
  DashboardTicketSummary,
  getRequesterDashboard,
  getStaffDashboard,
  listStaffDashboardTickets,
  listTickets,
  RequesterDashboardData,
  StaffDashboardData,
  StaffDashboardTicketParams,
  Ticket,
  TicketParams,
  TicketStatus,
  User,
} from "./api.js";

type LoadState = "loading" | "ready" | "error";
type TicketRow = Pick<DashboardTicketSummary, "id" | "ticketNumber" | "status" | "summary" | "updatedAt" | "requestedPriority"> & {
  itPriority?: DashboardTicketSummary["itPriority"];
  owner?: DashboardTicketSummary["owner"];
};
type RequesterFilter = Omit<TicketParams, "page" | "pageSize">;
type StaffFilter = Omit<StaffDashboardTicketParams, "page" | "pageSize">;
type Drilldown = { title: string; description: string };

const formatStatus = (status: string) => status.replaceAll("_", " ");

function localDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function range(asOf: string, days: number) {
  const end = new Date(asOf);
  return { updatedFrom: new Date(end.getTime() - days * 24 * 60 * 60 * 1000).toISOString(), updatedTo: end.toISOString() };
}

function resolvedRange(asOf: string, days: number) {
  const end = new Date(asOf);
  return { resolvedFrom: new Date(end.getTime() - days * 24 * 60 * 60 * 1000).toISOString(), resolvedTo: end.toISOString() };
}

function SummaryCard(props: { label: string; count: number; help: string; onClick: () => void }) {
  return (
    <button type="button" className="dashboard-card" onClick={props.onClick} aria-label={`${props.label}: ${props.count}. ${props.help}`}>
      <span className="dashboard-card-label">{props.label}</span>
      <strong className="dashboard-count">{props.count}</strong>
      <span className="dashboard-card-help">{props.help}</span>
    </button>
  );
}

function AsOf(props: { value: string }) {
  return <p className="dashboard-asof">Updated <time dateTime={props.value} title={`UTC: ${props.value}`}>{localDate(props.value)}</time> <span>(UTC source: {props.value})</span></p>;
}

function TicketItems(props: { items: TicketRow[]; onOpenTicket: (id: number) => void; owner?: boolean }) {
  if (!props.items.length) return <p className="dashboard-empty">No matching Tickets.</p>;
  return (
    <div className="dashboard-list" role="list">
      {props.items.map((ticket) => (
        <div role="listitem" className="dashboard-list-item" key={ticket.id}>
          <button type="button" className="dashboard-row" onClick={() => props.onOpenTicket(ticket.id)} aria-label={`Open Ticket ${ticket.ticketNumber}: ${ticket.summary}`}>
            <span className="dashboard-row-main"><strong>{ticket.ticketNumber}</strong><span>{ticket.summary}</span><small>{formatStatus(ticket.status)} · Updated {localDate(ticket.updatedAt)}{props.owner ? ` · ${ticket.owner?.name ?? "Unassigned"}` : ""}</small></span>
            <span className="status-pill">{formatStatus(ticket.status)}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

function TicketDrilldown(props: {
  drilldown: Drilldown | null;
  status: LoadState;
  error: string;
  items: TicketRow[];
  page: number;
  totalPages: number;
  totalItems: number;
  onBack: () => void;
  onRetry: () => void;
  onPage: (page: number) => void;
  onOpenTicket: (id: number) => void;
  owner?: boolean;
}) {
  if (!props.drilldown) return null;
  return (
    <section className="content-card dashboard-drilldown" aria-labelledby="dashboard-drilldown-heading">
      <div className="section-heading"><div><p className="eyebrow">FILTERED TICKETS</p><h2 id="dashboard-drilldown-heading">{props.drilldown.title}</h2><p className="lead-copy">{props.drilldown.description}</p></div><button className="secondary-button" type="button" onClick={props.onBack}>Back to dashboard</button></div>
      {props.status === "loading" && <div className="loading-panel" role="status">Loading matching Tickets…</div>}
      {props.status === "error" && <div className="notice error" role="alert">{props.error}<button className="link-button" type="button" onClick={props.onRetry}>Retry</button></div>}
      {props.status === "ready" && <p className="muted">{props.totalItems} matching Tickets</p>}
      {props.status === "ready" && <TicketItems items={props.items} onOpenTicket={props.onOpenTicket} owner={props.owner} />}
      {props.status === "ready" && props.totalPages > 1 && <div className="pagination-controls"><button className="secondary-button" type="button" disabled={props.page <= 1} onClick={() => props.onPage(props.page - 1)}>Previous</button><span>Page {props.page} of {props.totalPages}</span><button className="secondary-button" type="button" disabled={props.page >= props.totalPages} onClick={() => props.onPage(props.page + 1)}>Next</button></div>}
    </section>
  );
}

export function RequesterDashboard(props: { user: User; onOpenTicket: (id: number) => void }) {
  const [data, setData] = useState<RequesterDashboardData | null>(null);
  const [status, setStatus] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [drilldown, setDrilldown] = useState<Drilldown | null>(null);
  const [filter, setFilter] = useState<RequesterFilter>({});
  const [items, setItems] = useState<Ticket[]>([]);
  const [listStatus, setListStatus] = useState<LoadState>("ready");
  const [listError, setListError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  async function load() {
    setStatus("loading"); setError("");
    try { setData(await getRequesterDashboard()); setStatus("ready"); }
    catch (reason: any) { setError(reason?.message || "Unable to load the dashboard."); setStatus("error"); }
  }

  async function loadList(nextFilter = filter, nextPage = 1) {
    setListStatus("loading"); setListError("");
    try {
      const result = await listTickets({ ...nextFilter, page: nextPage, pageSize: 10 });
      setItems(result.items); setPage(result.pagination.page); setTotalPages(result.pagination.totalPages); setTotalItems(result.pagination.totalItems); setListStatus("ready");
    } catch (reason: any) { setListError(reason?.message || "Unable to load matching Tickets."); setListStatus("error"); }
  }

  useEffect(() => { void load(); }, [props.user.id]);

  function openList(title: string, description: string, nextFilter: RequesterFilter) {
    setDrilldown({ title, description }); setFilter(nextFilter); void loadList(nextFilter, 1);
  }

  if (status === "loading" && !data) return <section className="content-card"><div className="loading-panel" role="status">Loading dashboard…</div></section>;
  if (status === "error" && !data) return <section className="content-card"><div className="notice error" role="alert">{error}<button type="button" className="link-button" onClick={() => void load()}>Retry</button></div></section>;
  if (!data) return null;
  const metrics = data.metrics;
  return (
    <>
      {!drilldown && <section className="content-card dashboard" aria-labelledby="requester-dashboard-heading">
        <div className="section-heading"><div><p className="eyebrow">REQUESTER</p><h2 id="requester-dashboard-heading">My Dashboard</h2><p className="lead-copy">A summary of your Tickets and recent changes.</p></div><button className="secondary-button" type="button" onClick={() => void load()}>Refresh</button></div>
        <AsOf value={data.asOfUtc} />
        {status === "loading" && <p className="muted" role="status">Refreshing dashboard…</p>}
        {status === "error" && <div className="notice error" role="alert">{error}</div>}
        <div className="dashboard-grid">
          <SummaryCard label="Open Tickets" count={metrics.openTickets.count} help="Active Tickets you submitted. Select to view all." onClick={() => openList("Open Tickets", "All active Tickets submitted by you.", { statusGroup: "active" })} />
          <SummaryCard label="Waiting for Requester" count={metrics.waitingForRequester.count} help="Tickets waiting for your response. Select to view all." onClick={() => openList("Waiting for Requester", "All your Tickets currently waiting for a requester response.", { status: "WAITING_FOR_REQUESTER" })} />
          <SummaryCard label="Recently updated" count={metrics.recentlyUpdated.count} help="Updated in the last 7 days. Select to view all." onClick={() => openList("Recently updated", "All your Tickets updated in the inclusive 7-day window.", { ...range(data.asOfUtc, 7), sortBy: "updatedAt", sortDirection: "desc" })} />
          <SummaryCard label="Recently resolved" count={metrics.recentlyResolved.count} help="Resolved or closed in the last 30 days. Select to view all." onClick={() => openList("Recently resolved", "Currently resolved Tickets with an actual resolution timestamp in the inclusive 30-day window.", { statusGroup: "resolved", ...resolvedRange(data.asOfUtc, 30), sortBy: "resolvedAt", sortDirection: "desc" })} />
        </div>
        <div className="dashboard-sections">
          <section className="dashboard-section" aria-labelledby="requester-recent-updates"><div className="section-heading"><div><h3 id="requester-recent-updates">Recently updated</h3><p className="muted">Showing the latest five of {metrics.recentlyUpdated.count} matching Tickets.</p></div><button type="button" className="link-button" onClick={() => openList("Recently updated", "All your Tickets updated in the inclusive 7-day window.", { ...range(data.asOfUtc, 7), sortBy: "updatedAt", sortDirection: "desc" })}>View all</button></div><TicketItems items={metrics.recentlyUpdated.items} onOpenTicket={props.onOpenTicket} /></section>
          <section className="dashboard-section" aria-labelledby="requester-recent-resolved"><div className="section-heading"><div><h3 id="requester-recent-resolved">Recently resolved</h3><p className="muted">Showing the latest five of {metrics.recentlyResolved.count} matching Tickets.</p></div><button type="button" className="link-button" onClick={() => openList("Recently resolved", "Currently resolved Tickets with an actual resolution timestamp in the inclusive 30-day window.", { statusGroup: "resolved", ...resolvedRange(data.asOfUtc, 30), sortBy: "resolvedAt", sortDirection: "desc" })}>View all</button></div><TicketItems items={metrics.recentlyResolved.items} onOpenTicket={props.onOpenTicket} /></section>
        </div>
      </section>}
      <TicketDrilldown drilldown={drilldown} status={listStatus} error={listError} items={items} page={page} totalPages={totalPages} totalItems={totalItems} onBack={() => setDrilldown(null)} onRetry={() => void loadList()} onPage={(next) => void loadList(filter, next)} onOpenTicket={props.onOpenTicket} />
    </>
  );
}

export function StaffDashboard(props: { user: User; onOpenTicket: (id: number) => void }) {
  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [status, setStatus] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [drilldown, setDrilldown] = useState<Drilldown | null>(null);
  const [filter, setFilter] = useState<StaffFilter>({});
  const [items, setItems] = useState<DashboardTicketSummary[]>([]);
  const [listStatus, setListStatus] = useState<LoadState>("ready");
  const [listError, setListError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  async function load() {
    setStatus("loading"); setError("");
    try { setData(await getStaffDashboard()); setStatus("ready"); }
    catch (reason: any) { setError(reason?.message || "Unable to load the dashboard."); setStatus("error"); }
  }

  async function loadList(nextFilter = filter, nextPage = 1) {
    setListStatus("loading"); setListError("");
    try {
      const result = await listStaffDashboardTickets({ ...nextFilter, page: nextPage, pageSize: 10 });
      setItems(result.items); setPage(result.pagination.page); setTotalPages(result.pagination.totalPages); setTotalItems(result.pagination.totalItems); setListStatus("ready");
    } catch (reason: any) { setListError(reason?.message || "Unable to load matching Tickets."); setListStatus("error"); }
  }

  useEffect(() => { void load(); }, [props.user.id, props.user.role]);

  function openList(title: string, description: string, nextFilter: StaffFilter) {
    setDrilldown({ title, description }); setFilter(nextFilter); void loadList(nextFilter, 1);
  }

  if (status === "loading" && !data) return <section className="content-card"><div className="loading-panel" role="status">Loading dashboard…</div></section>;
  if (status === "error" && !data) return <section className="content-card"><div className="notice error" role="alert">{error}<button type="button" className="link-button" onClick={() => void load()}>Retry</button></div></section>;
  if (!data) return null;
  const metrics = data.metrics;
  const recentFilter = { ...range(data.asOfUtc, 7) };
  const ownFilter: StaffFilter = { ownerScope: "me" };
  const unassignedFilter: StaffFilter = { ownership: "unassigned" };
  const statusLabel = (value: TicketStatus) => formatStatus(value);
  return (
    <>
      {!drilldown && <section className="content-card dashboard" aria-labelledby="staff-dashboard-heading">
        <div className="section-heading"><div><p className="eyebrow">{props.user.role === "ADMINISTRATOR" ? "ADMINISTRATOR" : "IT STAFF"}</p><h2 id="staff-dashboard-heading">Work Dashboard</h2><p className="lead-copy">Live operational metrics for active Tickets and your assigned Actions Taken.</p></div><button className="secondary-button" type="button" onClick={() => void load()}>Refresh</button></div>
        <AsOf value={data.asOfUtc} />
        {status === "loading" && <p className="muted" role="status">Refreshing dashboard…</p>}
        {status === "error" && <div className="notice error" role="alert">{error}</div>}
        <div className="dashboard-grid">
          <SummaryCard label="Unassigned active" count={metrics.unassignedActive.count} help="Active Tickets with no assignee. Select to view all." onClick={() => openList("Unassigned active Tickets", "All active Tickets without an assigned owner.", unassignedFilter)} />
          <SummaryCard label="My active Tickets" count={metrics.myActiveTickets.count} help="Active Tickets assigned to you. Select to view all." onClick={() => openList("My active Tickets", "All active Tickets assigned to your account.", ownFilter)} />
          <SummaryCard label="Recently updated" count={metrics.recentlyUpdatedActive.count} help="Active Tickets updated in the last 7 days. Select to view all." onClick={() => openList("Recently updated active Tickets", "All active Tickets updated in the inclusive 7-day window.", recentFilter)} />
          <SummaryCard label="My active Actions Taken" count={metrics.myActiveActionsTaken.count} help="Planned or in-progress actions assigned to you." onClick={() => document.getElementById("my-active-actions")?.scrollIntoView?.({ block: "start" })} />
        </div>
        <div className="dashboard-sections">
          <section className="dashboard-section" aria-labelledby="staff-status-breakdown"><h3 id="staff-status-breakdown">Active by status</h3><p className="muted">Counts include every active status, including zero.</p><div className="dashboard-breakdown">{metrics.activeByStatus.map((item) => <button className="dashboard-breakdown-row" type="button" key={item.value} onClick={() => openList(`${statusLabel(item.value)} Tickets`, `All active Tickets currently in ${statusLabel(item.value)} status.`, { status: item.value })}><span>{statusLabel(item.value)}</span><strong>{item.count}</strong></button>)}</div></section>
          <section className="dashboard-section" aria-labelledby="staff-priority-breakdown"><h3 id="staff-priority-breakdown">Active by IT priority</h3><p className="muted">Priority reflects IT triage, with each configured level shown.</p><div className="dashboard-breakdown">{metrics.activeByItPriority.map((item) => <button className="dashboard-breakdown-row" type="button" key={item.value} onClick={() => openList(`${item.value} IT priority`, `All active Tickets with IT priority ${item.value}.`, { itPriority: item.value })}><span>{item.value}</span><strong>{item.count}</strong></button>)}</div></section>
          <section className="dashboard-section" aria-labelledby="staff-recent-updates"><div className="section-heading"><div><h3 id="staff-recent-updates">Recently updated active Tickets</h3><p className="muted">Showing the latest five of {metrics.recentlyUpdatedActive.count} matching Tickets.</p></div><button type="button" className="link-button" onClick={() => openList("Recently updated active Tickets", "All active Tickets updated in the inclusive 7-day window.", recentFilter)}>View all</button></div><TicketItems items={metrics.recentlyUpdatedActive.items} onOpenTicket={props.onOpenTicket} owner /></section>
          <section className="dashboard-section" id="my-active-actions" aria-labelledby="staff-active-actions"><h3 id="staff-active-actions">My active Actions Taken</h3><p className="muted">Showing up to five planned or in-progress actions assigned to you.</p>{metrics.myActiveActionsTaken.items.length === 0 ? <p className="dashboard-empty">No active Actions Taken assigned to you.</p> : <div className="dashboard-list" role="list">{metrics.myActiveActionsTaken.items.map((action) => <div role="listitem" className="dashboard-list-item" key={action.id}><button type="button" className="dashboard-row" onClick={() => props.onOpenTicket(action.ticketId)} aria-label={`Open Ticket ${action.ticket.ticketNumber} for action ${action.id}`}><span className="dashboard-row-main"><strong>{action.ticket.ticketNumber} · Action {action.id}</strong><span>{action.description}</span><small>{formatStatus(action.status)} · {localDate(action.actionDateTime)} · Performed by {action.performedBy.name} · Assigned to {action.assignee.name}</small></span><span className="status-pill">{formatStatus(action.ticket.status)}</span></button></div>)}</div>}</section>
        </div>
      </section>}
      <TicketDrilldown drilldown={drilldown} status={listStatus} error={listError} items={items} page={page} totalPages={totalPages} totalItems={totalItems} onBack={() => setDrilldown(null)} onRetry={() => void loadList()} onPage={(next) => void loadList(filter, next)} onOpenTicket={props.onOpenTicket} owner />
    </>
  );
}
