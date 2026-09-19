import { FormEvent, useEffect, useState } from "react";
import {
  createAdminUser,
  listAdminUsers,
  resetAdminInitialPassword,
  updateAdminUser,
  User,
  UserRole,
} from "./api.js";
import { StaffTicketDetail } from "./staff.js";

const roles: UserRole[] = ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"];
const roleLabels: Record<UserRole, string> = {
  REQUESTER: "Requester",
  IT_STAFF: "IT Staff",
  ADMINISTRATOR: "Administrator",
};

type AsyncStatus = "idle" | "loading" | "ready" | "error";
type FormMode = "create" | "edit";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function roleLabel(role: UserRole) {
  return roleLabels[role] ?? role;
}

export function AdminWorkspace(props: { user: User; onLogout: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({ search: "", role: "" as UserRole | "" });
  const [applied, setApplied] = useState({ search: "", role: "" as UserRole | "" });
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<FormMode | null>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [directTicketId, setDirectTicketId] = useState<number | null>(null);

  async function load() {
    setStatus("loading");
    setError("");
    try {
      setUsers(await listAdminUsers(applied));
      setStatus("ready");
    } catch (requestError: any) {
      setStatus("error");
      setError(requestError?.message || "Unable to load users.");
    }
  }

  useEffect(() => {
    void load();
  }, [applied.search, applied.role]);

  function applyFilters(event: FormEvent) {
    event.preventDefault();
    setApplied(filters);
  }

  function startCreate() {
    setSelected(null);
    setMode("create");
  }

  function startEdit(user: User) {
    setSelected(user);
    setMode("edit");
  }

  function closeForm() {
    setMode(null);
    setSelected(null);
  }

  function replaceUser(updated: User) {
    setUsers((current) => {
      const exists = current.some((item) => item.id === updated.id);
      return exists ? current.map((item) => item.id === updated.id ? updated : item) : [updated, ...current];
    });
  }

  return (
    <>
      <header className="topbar">
        <div><p className="eyebrow">TOKTICKIT</p><h1>IT Service Desk</h1></div>
        <div className="requester-chip"><span>{props.user.name} · {roleLabel(props.user.role)}</span><button type="button" className="link-button" onClick={props.onLogout}>Log out</button></div>
      </header>
      <nav className="main-nav" aria-label="Main navigation"><span className="nav-link active">User Management</span></nav>
      {directTicketId === null && !mode && <AdminDirectDetailLauncher onOpen={setDirectTicketId} />}
      {mode && (
        <AdminUserForm
          mode={mode}
          currentUser={props.user}
          user={selected}
          onCancel={closeForm}
          onSaved={(updated) => { replaceUser(updated); closeForm(); }}
        />
      )}
      {directTicketId !== null && <StaffTicketDetail ticketId={directTicketId} user={props.user} canOperate={false} onBack={() => setDirectTicketId(null)} />}
      {!mode && directTicketId === null && (
        <section className="content-card user-management-card" aria-labelledby="users-heading">
          <div className="section-heading"><div><p className="eyebrow">ADMINISTRATOR</p><h2 id="users-heading">User Management</h2></div><button type="button" className="primary-button" onClick={startCreate}>Create user</button></div>
          <p className="lead-copy">Manage the minimum account fields required by Lab 3. Password reset is a separate action and requires a change at the user’s next login.</p>
          <form className="filter-bar user-filter-bar" onSubmit={applyFilters}>
            <label className="visually-hidden" htmlFor="admin-user-search">Search users</label>
            <input id="admin-user-search" placeholder="Search name or email" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
            <label className="visually-hidden" htmlFor="admin-user-role">Filter by role</label>
            <select id="admin-user-role" value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value as UserRole | "" })}><option value="">All roles</option>{roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select>
            <div className="filter-actions"><button className="secondary-button" type="submit">Apply filters</button><button className="link-button" type="button" onClick={() => { const cleared = { search: "", role: "" as UserRole | "" }; setFilters(cleared); setApplied(cleared); }}>Clear filters</button></div>
          </form>
          {status === "loading" && <div className="loading-panel" role="status">Loading users…</div>}
          {status === "error" && <div className="notice error" role="alert">{error}<button type="button" className="link-button" onClick={() => void load()}>Retry</button></div>}
          {status === "ready" && users.length === 0 && <div className="empty-panel"><strong>No matching users</strong><p>Try a different search or role filter.</p></div>}
          {status === "ready" && users.length > 0 && <div className="user-list" role="list">{users.map((item) => <article className="user-row" role="listitem" key={item.id}><div className="user-main"><strong>{item.name}</strong><span>{item.email}</span><small>Updated {formatDate(item.updatedAt)}</small></div><div className="user-meta"><span className="role-pill">{roleLabel(item.role)}</span><span className={item.isActive ? "status-pill" : "status-pill inactive"}>{item.isActive ? "Active" : "Inactive"}</span></div><button type="button" className="secondary-button" onClick={() => startEdit(item)}>Edit</button></article>)}</div>}
        </section>
      )}
    </>
  );
}

function AdminDirectDetailLauncher(props: { onOpen: (ticketId: number) => void }) {
  const [ticketIdText, setTicketIdText] = useState("");
  const [error, setError] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    const ticketId = Number(ticketIdText);
    if (!Number.isSafeInteger(ticketId) || ticketId < 1) {
      setError("Enter a valid Ticket ID.");
      return;
    }
    setError("");
    props.onOpen(ticketId);
  }
  return (
    <section className="content-card admin-direct-launcher" aria-labelledby="admin-workspace-heading">
      <p className="eyebrow">ADMINISTRATOR</p>
      <h2 id="admin-workspace-heading">Administrator workspace</h2>
      <p className="lead-copy">The shared IT Staff Queue is not available to Administrators. Open an explicitly permitted Ticket Detail directly when you have a Ticket ID.</p>
      <form className="form-grid direct-detail-form" onSubmit={submit}>
        <div className="field"><label htmlFor="admin-ticket-id">Ticket ID</label><input id="admin-ticket-id" type="number" min="1" value={ticketIdText} onChange={(event) => setTicketIdText(event.target.value)} required />{error && <span className="field-error">{error}</span>}</div>
        <div className="form-actions"><button className="primary-button" type="submit">Open Ticket Detail</button></div>
      </form>
    </section>
  );
}

function AdminUserForm(props: { mode: FormMode; currentUser: User; user: User | null; onCancel: () => void; onSaved: (user: User) => void }) {
  const editing = props.mode === "edit" && props.user !== null;
  const [name, setName] = useState(props.user?.name ?? "");
  const [email, setEmail] = useState(props.user?.email ?? "");
  const [role, setRole] = useState<UserRole>(props.user?.role ?? "REQUESTER");
  const [isActive, setIsActive] = useState(props.user?.isActive ?? true);
  const [initialPassword, setInitialPassword] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const [resetStatus, setResetStatus] = useState<AsyncStatus>("idle");
  const [error, setError] = useState("");
  const [resetError, setResetError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setSuccess("");
    setFieldErrors({});
    try {
      const updated = editing
        ? await updateAdminUser(props.user!.id, { name: name.trim(), email: email.trim(), role, isActive })
        : await createAdminUser({ name: name.trim(), email: email.trim(), role, isActive, initialPassword });
      setStatus("ready");
      setSuccess(editing ? "User updated." : "User created. The initial password must be changed at first login.");
      props.onSaved(updated);
    } catch (requestError: any) {
      setStatus("error");
      setError(requestError?.message || "Unable to save the user.");
      setFieldErrors(requestError?.fields ?? {});
    }
  }

  async function reset(event: FormEvent) {
    event.preventDefault();
    if (!props.user) return;
    setResetStatus("loading");
    setResetError("");
    setResetSuccess("");
    try {
      const updated = await resetAdminInitialPassword(props.user.id, resetPassword);
      setResetStatus("ready");
      setResetPassword("");
      setResetSuccess("Initial password reset. The user must change it at next login.");
      props.onSaved(updated);
    } catch (requestError: any) {
      setResetStatus("error");
      setResetError(requestError?.message || "Unable to reset the initial password.");
    }
  }

  return (
    <section className="content-card user-form-card" aria-labelledby="user-form-heading">
      <button type="button" className="back-link" onClick={props.onCancel}>← Back to User Management</button>
      <div className="section-heading"><div><p className="eyebrow">{editing ? "EDIT ACCOUNT" : "NEW ACCOUNT"}</p><h2 id="user-form-heading">{editing ? "Edit user" : "Create user"}</h2></div>{editing && <span className="status-pill">User #{props.user!.id}</span>}</div>
      {error && <div className="notice error" role="alert">{error}</div>}
      {success && <div className="notice success" role="status">{success}</div>}
      <form className="requester-form" onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="field"><label htmlFor="admin-user-name">Name</label><input id="admin-user-name" value={name} onChange={(event) => setName(event.target.value)} required />{fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}</div>
          <div className="field"><label htmlFor="admin-user-email">Email</label><input id="admin-user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />{fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}</div>
          <div className="field"><label htmlFor="admin-user-role-edit">Role</label><select id="admin-user-role-edit" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>{roles.map((item) => <option key={item} value={item}>{roleLabel(item)}</option>)}</select>{fieldErrors.role && <span className="field-error">{fieldErrors.role}</span>}</div>
          <div className="field checkbox-field"><label htmlFor="admin-user-active"><input id="admin-user-active" type="checkbox" checked={isActive} disabled={editing && props.user!.id === props.currentUser.id} onChange={(event) => setIsActive(event.target.checked)} /> Active account</label>{editing && props.user!.id === props.currentUser.id && <span className="field-help">You cannot deactivate your own Administrator account.</span>}{fieldErrors.isActive && <span className="field-error">{fieldErrors.isActive}</span>}</div>
          {!editing && <div className="field"><label htmlFor="admin-user-initial-password">Initial password</label><input id="admin-user-initial-password" type="password" autoComplete="new-password" value={initialPassword} onChange={(event) => setInitialPassword(event.target.value)} required aria-describedby="admin-password-help" />{fieldErrors.initialPassword && <span className="field-error">{fieldErrors.initialPassword}</span>}</div>}
        </div>
        <p id="admin-password-help" className="field-help">Passwords use 12–128 characters with at least one letter and one number. New and reset passwords require a change at next login.</p>
        <div className="form-actions"><button className="primary-button" type="submit" disabled={status === "loading"}>{status === "loading" ? "Saving…" : editing ? "Save changes" : "Create user"}</button><button className="link-button" type="button" onClick={props.onCancel}>Cancel</button></div>
      </form>
      {editing && <section className="reset-password-panel" aria-labelledby="reset-password-heading"><h3 id="reset-password-heading">Reset initial password</h3><p className="field-help">This is separate from account editing and forces a password change at next login.</p>{resetError && <div className="notice error" role="alert">{resetError}</div>}{resetSuccess && <div className="notice success" role="status">{resetSuccess}</div>}<form className="inline-reset-form" onSubmit={reset}><label htmlFor="admin-reset-password">New initial password</label><input id="admin-reset-password" type="password" autoComplete="new-password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} required /><button className="secondary-button" type="submit" disabled={resetStatus === "loading"}>{resetStatus === "loading" ? "Resetting…" : "Reset password"}</button></form></section>}
    </section>
  );
}
