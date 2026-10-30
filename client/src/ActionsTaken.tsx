import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionAssignee,
  ActionStatus,
  ActionTaken,
  ActionTakenEdit,
  ActionTakenInput,
  changeActionTakenStatus,
  createActionTaken,
  getActionAssignees,
  getActionsTaken,
  updateActionTaken,
  UserRole,
} from "./api.js";

type FormValues = {
  actionDateTime: string;
  description: string;
  result: string;
  assigneeId: string;
  status: ActionStatus;
  followUpRequired: "yes" | "no";
  followUpNote: string;
  attachmentNotes: string;
};

type ApiFailure = Error & {
  status?: number;
  code?: string;
  fields?: Record<string, string>;
};

const initialForm = (): FormValues => ({
  actionDateTime: toLocalInput(new Date()),
  description: "",
  result: "",
  assigneeId: "",
  status: "PLANNED",
  followUpRequired: "no",
  followUpNote: "",
  attachmentNotes: "",
});

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toOffsetDateTime(value: string) {
  const localDate = new Date(value);
  if (!Number.isFinite(localDate.getTime())) return "";
  const offset = -localDate.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = pad(Math.floor(Math.abs(offset) / 60));
  const minutes = pad(Math.abs(offset) % 60);
  const [date, time = "00:00"] = value.split("T");
  const [hour = "00", minute = "00", second = "00"] = time.split(":");
  return `${date}T${hour}:${minute}:${second}${sign}${hours}:${minutes}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function localZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "local time";
}

function orderActions(items: ActionTaken[]) {
  return [...items].sort((left, right) => {
    const timeDifference = Date.parse(left.actionDateTime) - Date.parse(right.actionDateTime);
    return timeDifference || left.id - right.id;
  });
}

function nextStatuses(status: ActionStatus): ActionStatus[] {
  if (status === "PLANNED") return ["IN_PROGRESS", "COMPLETED", "CANCELLED"];
  if (status === "IN_PROGRESS") return ["COMPLETED", "CANCELLED"];
  return [];
}

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function errorMessage(error: ApiFailure) {
  if (error.status === 403) return "You don’t have permission to change Actions Taken on this Ticket.";
  if (error.status === 404) return "This Ticket or action is no longer available. Refresh the list before continuing.";
  if (error.status === 409) return "This record changed or the request was already used. Refresh the list and review the current version before trying again.";
  if (error.status === 422) return error.message || "Check the action fields and try again.";
  return error.message || "The action could not be saved. Your entries are still here; you can retry.";
}

function actionFieldId(ticketId: number, field: keyof FormValues) {
  return `action-${ticketId}-${field}`;
}

export function ActionsTakenPanel(props: { ticketId: number; role: UserRole }) {
  const canManage = props.role === "IT_STAFF" || props.role === "ADMINISTRATOR";
  const [items, setItems] = useState<ActionTaken[]>([]);
  const [readOnly, setReadOnly] = useState(!canManage);
  const [listStatus, setListStatus] = useState<"loading" | "ready" | "error">("loading");
  const [listError, setListError] = useState("");
  const [assignees, setAssignees] = useState<ActionAssignee[]>([]);
  const [assigneeStatus, setAssigneeStatus] = useState<"loading" | "ready" | "error">(canManage ? "loading" : "ready");
  const [assigneeError, setAssigneeError] = useState("");
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormValues>(initialForm);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [nextStatus, setNextStatus] = useState<Record<number, ActionStatus | "">>({});
  const formRef = useRef<HTMLFormElement>(null);
  const createKey = useRef("");
  const createPayloadFingerprint = useRef("");
  const headingId = `actions-taken-heading-${props.ticketId}`;
  const formTitleId = `actions-form-heading-${props.ticketId}`;
  const activeAssignee = useMemo(() => assignees.find((person) => String(person.id) === form.assigneeId), [assignees, form.assigneeId]);

  async function loadActions(showLoading = false) {
    if (showLoading) setListStatus("loading");
    setListError("");
    try {
      const response = await getActionsTaken(props.ticketId);
      setItems(orderActions(response.items));
      setReadOnly(response.readOnly || !canManage);
      setListStatus("ready");
    } catch (reason) {
      setListError((reason as Error)?.message || "Unable to load Actions Taken.");
      setListStatus("error");
    }
  }

  async function loadAssignees() {
    if (!canManage) return;
    setAssigneeStatus("loading");
    setAssigneeError("");
    try {
      setAssignees(await getActionAssignees(props.ticketId));
      setAssigneeStatus("ready");
    } catch (reason) {
      setAssigneeError((reason as Error)?.message || "Unable to load eligible assignees.");
      setAssigneeStatus("error");
    }
  }

  useEffect(() => {
    void loadActions(true);
    void loadAssignees();
  }, [props.ticketId, canManage]);

  useEffect(() => {
    if (Object.keys(fieldErrors).length) {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    }
  }, [fieldErrors]);

  function startCreate() {
    setForm(initialForm());
    setMode("create");
    setEditingId(null);
    setFieldErrors({});
    setSaveError("");
    setSuccess("");
    setSaveStatus("idle");
    createKey.current = "";
    createPayloadFingerprint.current = "";
  }

  function startEdit(action: ActionTaken) {
    setForm({
      actionDateTime: toLocalInput(new Date(action.actionDateTime)),
      description: action.description,
      result: action.result,
      assigneeId: String(action.assignee.id),
      status: action.status,
      followUpRequired: action.followUpRequired ? "yes" : "no",
      followUpNote: action.followUpNote ?? "",
      attachmentNotes: action.attachmentNotes ?? "",
    });
    setMode("edit");
    setEditingId(action.id);
    setFieldErrors({});
    setSaveError("");
    setSuccess("");
    setSaveStatus("idle");
  }

  function closeForm() {
    setMode(null);
    setEditingId(null);
    setFieldErrors({});
    setSaveError("");
    setSaveStatus("idle");
  }

  function changeField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSaveError("");
  }

  function toPayload(): ActionTakenInput | null {
    const actionDateTime = toOffsetDateTime(form.actionDateTime);
    if (!actionDateTime || !form.assigneeId) return null;
    return {
      actionDateTime,
      description: form.description,
      result: form.result,
      assigneeId: Number(form.assigneeId),
      status: form.status,
      followUpRequired: form.followUpRequired === "yes",
      followUpNote: form.followUpRequired === "yes" ? form.followUpNote : null,
      attachmentNotes: form.attachmentNotes.trim() || null,
    };
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saveStatus === "loading" || !mode) return;
    setSaveStatus("loading");
    setSaveError("");
    setFieldErrors({});
    setSuccess("");
    const payload = toPayload();
    if (!payload) {
      const invalid = !form.actionDateTime ? "actionDateTime" : "assigneeId";
      setFieldErrors({ [invalid]: "Complete this field before saving." });
      setSaveStatus("error");
      return;
    }
    if (mode === "create" && payload.status === "COMPLETED" && !window.confirm("Mark this action complete as soon as it is created?")) {
      setSaveStatus("idle");
      return;
    }
    try {
      if (mode === "create") {
        const fingerprint = JSON.stringify(payload);
        if (createPayloadFingerprint.current !== fingerprint) {
          createPayloadFingerprint.current = fingerprint;
          createKey.current = makeIdempotencyKey();
        }
        const created = await createActionTaken(props.ticketId, payload, createKey.current);
        setItems((current) => orderActions([...current, created]));
        setSuccess("Action added to the Ticket.");
        setForm(initialForm());
        setMode(null);
        createKey.current = "";
        createPayloadFingerprint.current = "";
      } else if (editingId !== null) {
        const edit: ActionTakenEdit = {
          actionDateTime: payload.actionDateTime,
          description: payload.description,
          result: payload.result,
          assigneeId: payload.assigneeId,
          followUpRequired: payload.followUpRequired,
          followUpNote: payload.followUpNote,
          attachmentNotes: payload.attachmentNotes,
        };
        const updated = await updateActionTaken(props.ticketId, editingId, items.find((item) => item.id === editingId)?.version ?? 0, edit);
        setItems((current) => orderActions(current.map((item) => item.id === updated.id ? updated : item)));
        setSuccess("Action updated.");
        setMode(null);
        setEditingId(null);
      }
      setSaveStatus("idle");
    } catch (reason) {
      const error = reason as ApiFailure;
      setFieldErrors(error.fields ?? {});
      setSaveError(errorMessage(error));
      setSaveStatus("error");
    }
  }

  async function updateStatus(action: ActionTaken, status: ActionStatus) {
    if (!status) return;
    if ((status === "COMPLETED" || status === "CANCELLED") && !window.confirm(`Confirm marking this action ${status.toLowerCase()}? This cannot be undone.`)) return;
    setSaveStatus("loading");
    setSaveError("");
    setSuccess("");
    try {
      const updated = await changeActionTakenStatus(props.ticketId, action.id, action.version, status);
      setItems((current) => orderActions(current.map((item) => item.id === updated.id ? updated : item)));
      setNextStatus((current) => ({ ...current, [action.id]: "" }));
      setSuccess(`Action marked ${status.toLowerCase()}.`);
      setSaveStatus("idle");
    } catch (reason) {
      setSaveError(errorMessage(reason as ApiFailure));
      setSaveStatus("error");
    }
  }

  return (
    <section className="description-block actions-taken-panel" aria-labelledby={headingId}>
      <div className="section-heading compact actions-heading">
        <div>
          <h3 id={headingId}>Actions Taken</h3>
          <p className="field-help">Times are shown in your local timezone ({localZone()}).</p>
        </div>
        {!readOnly && <button className="secondary-button" type="button" disabled={saveStatus === "loading"} onClick={startCreate}>Add Action</button>}
      </div>

      {success && <div className="notice success" role="status">{success}</div>}
      {saveError && <div className="notice error" role="alert">
        <span>{saveError}</span>
        {(saveError.includes("changed") || saveError.includes("no longer available")) && <button className="link-button" type="button" onClick={() => { closeForm(); void loadActions(true); }}>Refresh current actions</button>}
      </div>}

      {listStatus === "loading" && <div className="loading-panel" role="status">Loading Actions Taken…</div>}
      {listStatus === "error" && <div className="notice error" role="alert">{listError}<button className="link-button" type="button" onClick={() => void loadActions(true)}>Retry</button></div>}
      {listStatus === "ready" && items.length === 0 && <div className="empty-panel"><strong>No Actions Taken yet</strong><span>Actions recorded for this Ticket will appear here.</span></div>}
      {listStatus === "ready" && items.length > 0 && <ol className="actions-list">
        {items.map((action) => <li key={action.id}>
          <article className="action-card" aria-label={`Action ${action.id}: ${action.status}`}>
            <div className="action-card-heading"><div><p className="eyebrow">{formatDate(action.actionDateTime)}</p><h4>{action.description}</h4></div><span className={`status-pill action-status ${action.status.toLowerCase()}`}>{action.status.replaceAll("_", " ")}</span></div>
            <p className="action-result">{action.result}</p>
            <dl className="action-meta">
              <div><dt>Performed by</dt><dd>{action.performedBy.name}</dd></div>
              <div><dt>Assigned to</dt><dd>{action.assignee.name}</dd></div>
              <div><dt>Follow-up</dt><dd>{action.followUpRequired ? "Required" : "Not required"}</dd></div>
              {action.followUpRequired && action.followUpNote && <div><dt>Follow-up note</dt><dd>{action.followUpNote}</dd></div>}
              {action.attachmentNotes && <div className="action-meta-wide"><dt>Attachment notes</dt><dd>{action.attachmentNotes}</dd></div>}
            </dl>
            {!readOnly && <div className="inline-actions action-controls">
              {(action.status === "PLANNED" || action.status === "IN_PROGRESS") && <button className="link-button" type="button" disabled={saveStatus === "loading"} onClick={() => startEdit(action)}>Edit action</button>}
              {nextStatuses(action.status).length > 0 && <>
                <label className="action-transition-label" htmlFor={`action-next-${props.ticketId}-${action.id}`}>Next status</label>
                <select id={`action-next-${props.ticketId}-${action.id}`} aria-label={`Next status for action ${action.id}`} value={nextStatus[action.id] ?? ""} disabled={saveStatus === "loading"} onChange={(event) => setNextStatus((current) => ({ ...current, [action.id]: event.target.value as ActionStatus | "" }))}>
                  <option value="">Choose a transition</option>
                  {nextStatuses(action.status).map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
                </select>
                <button className="secondary-button" type="button" disabled={!nextStatus[action.id] || saveStatus === "loading"} onClick={() => void updateStatus(action, nextStatus[action.id] as ActionStatus)}>Update status</button>
              </>}
            </div>}
          </article>
        </li>)}
      </ol>}

      {mode && <form ref={formRef} className="actions-form" aria-labelledby={formTitleId} onSubmit={(event) => void submit(event)} noValidate>
        <h4 id={formTitleId}>{mode === "create" ? "Record an action" : "Edit action"}</h4>
        {Object.keys(fieldErrors).length > 0 && <div className="notice error" role="alert"><div><strong>Review these fields:</strong><ul>{Object.entries(fieldErrors).map(([field, message]) => <li key={field}>{message}</li>)}</ul></div></div>}
        {assigneeError && <div className="notice error" role="alert">{assigneeError}<button className="link-button" type="button" onClick={() => void loadAssignees()}>Retry assignee list</button></div>}
        {assigneeStatus === "loading" && <p className="field-help" role="status">Loading eligible assignees…</p>}
        {assigneeStatus === "ready" && assignees.length === 0 && <p className="field-error">No active Staff or Administrator accounts are available to assign actions.</p>}
        <div className="action-form-grid">
          <div className="field">
            <label htmlFor={actionFieldId(props.ticketId, "actionDateTime")}>Action date and time</label>
            <input id={actionFieldId(props.ticketId, "actionDateTime")} type="datetime-local" step="60" value={form.actionDateTime} onChange={(event) => changeField("actionDateTime", event.target.value)} aria-invalid={Boolean(fieldErrors.actionDateTime)} required />
            {fieldErrors.actionDateTime && <span className="field-error">{fieldErrors.actionDateTime}</span>}
          </div>
          <div className="field">
            <label htmlFor={actionFieldId(props.ticketId, "assigneeId")}>Assignee</label>
            <select id={actionFieldId(props.ticketId, "assigneeId")} value={form.assigneeId} onChange={(event) => changeField("assigneeId", event.target.value)} aria-invalid={Boolean(fieldErrors.assigneeId)} required disabled={assigneeStatus !== "ready"}>
              <option value="">Choose an active Staff or Administrator</option>
              {form.assigneeId && !activeAssignee && <option value={form.assigneeId} disabled>{items.find((item) => item.id === editingId)?.assignee.name ?? "Current assignee"} (no longer eligible)</option>}
              {assignees.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
            {fieldErrors.assigneeId && <span className="field-error">{fieldErrors.assigneeId}</span>}
          </div>
          <div className="field action-field-wide">
            <label htmlFor={actionFieldId(props.ticketId, "description")}>Description</label>
            <textarea id={actionFieldId(props.ticketId, "description")} rows={3} maxLength={2000} value={form.description} onChange={(event) => changeField("description", event.target.value)} aria-invalid={Boolean(fieldErrors.description)} required />
            <span className="field-help">{form.description.length}/2000 characters</span>
            {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
          </div>
          <div className="field action-field-wide">
            <label htmlFor={actionFieldId(props.ticketId, "result")}>Result</label>
            <textarea id={actionFieldId(props.ticketId, "result")} rows={3} maxLength={2000} value={form.result} onChange={(event) => changeField("result", event.target.value)} aria-invalid={Boolean(fieldErrors.result)} required />
            <span className="field-help">{form.result.length}/2000 characters</span>
            {fieldErrors.result && <span className="field-error">{fieldErrors.result}</span>}
          </div>
          {mode === "create" && <div className="field">
            <label htmlFor={actionFieldId(props.ticketId, "status")}>Action status</label>
            <select id={actionFieldId(props.ticketId, "status")} value={form.status} onChange={(event) => changeField("status", event.target.value as ActionStatus)}>
              <option value="PLANNED">Planned</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option>
            </select>
          </div>}
          <div className="field">
            <label htmlFor={actionFieldId(props.ticketId, "followUpRequired")}>Follow-up required?</label>
            <select id={actionFieldId(props.ticketId, "followUpRequired")} value={form.followUpRequired} onChange={(event) => changeField("followUpRequired", event.target.value as FormValues["followUpRequired"])} aria-invalid={Boolean(fieldErrors.followUpRequired)}>
              <option value="no">No</option><option value="yes">Yes</option>
            </select>
            {fieldErrors.followUpRequired && <span className="field-error">{fieldErrors.followUpRequired}</span>}
          </div>
          {form.followUpRequired === "yes" && <div className="field action-field-wide">
            <label htmlFor={actionFieldId(props.ticketId, "followUpNote")}>Follow-up note</label>
            <textarea id={actionFieldId(props.ticketId, "followUpNote")} rows={2} maxLength={1000} value={form.followUpNote} onChange={(event) => changeField("followUpNote", event.target.value)} aria-invalid={Boolean(fieldErrors.followUpNote)} required />
            <span className="field-help">{form.followUpNote.length}/1000 characters</span>
            {fieldErrors.followUpNote && <span className="field-error">{fieldErrors.followUpNote}</span>}
          </div>}
          <div className="field action-field-wide">
            <label htmlFor={actionFieldId(props.ticketId, "attachmentNotes")}>Attachment notes <span className="field-help">(optional)</span></label>
            <textarea id={actionFieldId(props.ticketId, "attachmentNotes")} rows={2} maxLength={1000} value={form.attachmentNotes} onChange={(event) => changeField("attachmentNotes", event.target.value)} aria-invalid={Boolean(fieldErrors.attachmentNotes)} />
            <span className="field-help">{form.attachmentNotes.length}/1000 characters</span>
            {fieldErrors.attachmentNotes && <span className="field-error">{fieldErrors.attachmentNotes}</span>}
          </div>
        </div>
        {saveStatus === "error" && <p className="field-help">Your form values are still here. Correct the fields or retry the save.</p>}
        <div className="form-actions actions-form-actions">
          <button className="secondary-button" type="button" disabled={saveStatus === "loading"} onClick={closeForm}>Cancel</button>
          <button className="primary-button" type="submit" disabled={saveStatus === "loading" || assigneeStatus !== "ready" || assignees.length === 0}>{saveStatus === "loading" ? "Saving…" : mode === "create" ? "Save action" : "Save changes"}</button>
        </div>
      </form>}
    </section>
  );
}
