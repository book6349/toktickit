# Lab 4 API Contract

Status: Draft for Issue #51 review. Routes describe the required contract; they are not implemented by this documentation-only change.

Related: [engineering specification](specification.md), [test plan](tests.md), [UI contract](ui-spec.md).

## 1. Common rules

- All routes require an authenticated session. The server authorizes each read and write. The client never supplies authoritative actor ids or timestamps.
- JSON responses use ISO 8601 UTC timestamps. Requests carrying a date/time must include an ISO 8601 offset.
- JSON errors use the established envelope `{ "error": { "code": "...", "message": "...", "fields": { "field": "reason" } } }`; omit `fields` when not applicable.
- Validation errors return 422, unauthenticated requests 401, forbidden writes 403, inaccessible Requester-owned Ticket reads 404, missing resources 404, stale versions 409, and unexpected failures a safe 500 response.
- Every mutation is transactional. A failed validation, authorization check or version comparison leaves the Ticket, ActionTaken and events unchanged.
- Text is trimmed before length validation. Unknown client fields are rejected or ignored consistently; actor, version, status timestamp and event fields are server controlled.

## 2. Actions Taken

### GET /api/tickets/:ticketId/actions

Allowed: IT Staff, Administrator, and Requester who owns the Ticket. Requester cross-owner and nonexistent Ticket responses are indistinguishable.

Returns `{ "items": ActionTaken[], "ticketId": "...", "readOnly": true|false }`. Items sort by `actionDateTime ASC, id ASC`. Empty Tickets return `items: []`.

Each ActionTaken includes `id, ticketId, actionDateTime, description, result, performedBy, assignee, status, followUpRequired, followUpNote, attachmentNotes, version, createdAt, updatedAt`. User fields contain only display-safe id/name data.

### POST /api/tickets/:ticketId/actions

Allowed: IT Staff and Administrator. Requester writes are forbidden.

Required JSON: `actionDateTime, description, result, assigneeId, status, followUpRequired`; `followUpNote` is required only when followUpRequired is true; `attachmentNotes` is optional. Creation may use PLANNED, IN_PROGRESS or COMPLETED. CANCELLED is reached through the lifecycle route, not initial create. Require an `Idempotency-Key` for duplicate-submit protection.

The server verifies the Ticket is accessible, assignee exists/is active/has IT Staff or Administrator role, parses the offset timestamp, trims and validates fields, sets `performedById` from the session, sets `version: 1`, and appends one creation event. Return 201 with the ActionTaken and its version. Reuse of the same key and same payload returns the original result; reuse with a different payload returns 409.

### PATCH /api/tickets/:ticketId/actions/:actionId

Allowed: IT Staff and Administrator. Require `expectedVersion` and one or more editable fields: `actionDateTime, description, result, assigneeId, followUpRequired, followUpNote, attachmentNotes`. Status is changed only through the lifecycle route. Revalidate all required fields as a complete record. Actor, createdAt, version and event fields are not editable.

Success returns the updated ActionTaken with incremented version and one event. A stale version returns 409 with code `VERSION_CONFLICT` and the current safe record/version. Unknown action or an action belonging to another Ticket returns 404.

### POST /api/tickets/:ticketId/actions/:actionId/status

Allowed: IT Staff and Administrator. JSON: `{ "expectedVersion": 3, "status": "IN_PROGRESS" }`. Legal transitions are PLANNED -> IN_PROGRESS, COMPLETED or CANCELLED; IN_PROGRESS -> COMPLETED or CANCELLED; COMPLETED and CANCELLED are terminal. Same-state writes are rejected. Return updated record/version and append exactly one event.

## 3. Ticket workflow

### PATCH /api/staff/tickets/:ticketId/status

Only IT Staff can change formal status in this increment. JSON includes `expectedVersion` and `status`; include `confirm: true` for RESOLVED, CLOSED or CANCELLED and `resolutionSummary` for RESOLVED. Reopening a resolved, closed or cancelled Ticket requires a trimmed `reason` (1–1,000 characters).

The server checks the exact matrix in [specification §6](specification.md#6-ticket-workflow), role, transition prerequisites and current workflowVersion in one transaction. Resolving sets server `resolvedAt` and `resolvedById`; reopening clears current resolution fields but retains the prior event; closing preserves the resolution. Return the Ticket status, workflowVersion and current resolution fields. Illegal transition returns 422 `INVALID_TRANSITION`; unmet resolution gate returns 422 `RESOLUTION_GATE_FAILED`; stale version returns 409 `VERSION_CONFLICT`.

### GET /api/tickets/:ticketId/workflow

Allowed to roles that can read the Ticket. Returns current status, workflowVersion, resolution data, permitted next statuses for the role, current resolution-gate counts, and a chronological workflow event list. Requesters can read this data only for their own Tickets; they receive no staff status controls or reopening reasons.

## 4. Dashboards

### GET /api/requester/dashboard?asOf=...

Allowed to Requester. `asOf` is an optional ISO 8601 timestamp with a timezone; default is server UTC now. Returns `asOfUtc` and `metrics`: `openTickets.count`, `waitingForRequester.count`, `recentlyUpdated.count/items`, and `recentlyResolved.count/items`. Counts cover all matching owned Tickets; recent arrays contain at most five rows. The linked Ticket list accepts the same ownership-safe `statusGroup`, `updatedFrom/updatedTo` and `resolvedFrom/resolvedTo` filters and remains paginated.

### GET /api/staff/dashboard?asOf=...

Allowed to IT Staff and Administrator. Returns `asOfUtc` and `metrics`: `unassignedActive.count`, `myActiveTickets.count`, `activeByStatus[]`, `activeByItPriority[]`, `recentlyUpdatedActive.count/items`, and `myActiveActionsTaken.count/items`. Counts cover all matching records, never a paginated subset. Recent Ticket and Action Taken arrays each contain at most five items. Each Ticket summary includes its id and stable detail target. The paginated `GET /api/staff/dashboard/tickets` drill-down is also available to Staff and Administrators; its server-built scope always includes active statuses, then applies the selected status, IT priority, unassigned/assigned-to-me and time-window filters.

Requester metrics and Staff metrics, exact rolling windows and filters are defined in [UI contract](ui-spec.md#4-dashboards). Boundary comparisons are inclusive: a timestamp exactly equal to `asOfUtc - window` is included; future timestamps are excluded.

## 5. Validation and error behavior

| Condition | Status/code | Required behavior |
|---|---|---|
| Missing required or malformed fields | 422 / `VALIDATION_ERROR` | Safe field-level reasons; no mutation |
| Inactive/non-Staff assignee | 422 / `INVALID_ASSIGNEE` | No mutation |
| Requester attempts write | 403 / `FORBIDDEN` | No mutation |
| Requester reads another owner's Ticket | 404 / `NOT_FOUND` | No ownership disclosure |
| Invalid status edge or resolution gate | 422 / `INVALID_TRANSITION` or `RESOLUTION_GATE_FAILED` | No mutation |
| Stale expectedVersion | 409 / `VERSION_CONFLICT` | Return current safe version; no partial write |
| Reused idempotency key, different payload | 409 / `IDEMPOTENCY_CONFLICT` | Preserve original action |
| Missing Ticket/action | 404 / `NOT_FOUND` | No mutation |
| Unexpected server error | 500 / `INTERNAL_ERROR` | Generic message; log correlation id server-side |

## 6. Security and integrity

The backend is authoritative for Ticket ownership, role, assignee validity, actor attribution, timestamps, transitions, dashboard scope and metric calculations. Never trust client-provided role, performer, resolvedBy, event, version increment, total count or dashboard filter authorization. Do not return another Requester's data through either list or dashboard APIs.
