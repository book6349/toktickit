# Lab 4 Sprint Engineering Specification

Status: Draft for peer review in Issue #51. This unit defines the contract and test plan only; application and test behavior changes belong to later approved Issues.

## 1. Sprint goal

Complete TokTickIT’s service-desk workflow by recording auditable Actions Taken under each Ticket, enforcing the final Ticket lifecycle, adding concise role-specific dashboards, and verifying that Labs 1–3 behavior remains available and secure.

## 2. Stakeholder interpretation

A Ticket Owner coordinates the Ticket as a whole. Each work action is a separate child record with its own actor, assignee, date/time, result, follow-up state and lifecycle. Requesters can read every Action Taken on their own Tickets but cannot create or change one. IT Staff and Administrators can create and update actions; the server derives the performer from the authenticated session. Dashboards summarize authoritative server data and link to detailed screens. A Requester’s “appears resolved” indication remains advisory; an authorized IT Staff member makes the formal Ticket transition.

## 3. Scope

### Included

- One-to-many Ticket-to-ActionTaken relationship, action lifecycle and append-only event history.
- Active-user assignee validation and automatic, immutable performed-by attribution.
- Read-only Requester access to actions on owned Tickets.
- Complete eight-status Ticket transition matrix, server-side resolution gate, confirmation and conflict handling.
- Requester and Staff dashboards, concise calculations, date boundaries, empty states and drill-downs. Administrator receives the Staff dashboard; user-account counts are excluded.
- Additive Prisma migration, legacy-data preservation, idempotent seed coverage and recovery plan.
- Zen Green UI additions, responsive/accessibility behavior, safe failures, duplicate-submit protection and full Lab 1–3 regression.

### Explicitly excluded

Automatic SLA clocks, escalation, on-call scheduling, external notifications, inventory/cost accounting, timesheets/payroll, multi-level approvals, custom BI/report builders, data warehouse/export, multi-tenancy, production cloud operations, and features not approved by the Sprint 4 Issues.

## 4. Roles and authorization

| Role | Actions Taken | Dashboards | Ticket status |
|---|---|---|---|
| Requester | Read-only; owned Tickets only | Requester dashboard; owned data only | Cannot change formal status or resolution |
| IT Staff | Read, create, assign, edit and transition actions on accessible Tickets | Staff dashboard and operational drill-downs | May use the documented matrix |
| Administrator | Same action permissions as IT Staff; may be an action assignee | Staff dashboard; no account counts | Read-only for formal status in this increment |

Every read/write is authorized by the backend. Hiding a control is not authorization. A cross-owner Requester lookup returns the same safe not-found result as a nonexistent Ticket.

## 5. Data model and decisions

### 5.1 ActionTaken

| Field | Contract |
|---|---|
| id | Primary key |
| ticketId | Required foreign key to exactly one Ticket |
| actionDateTime | Required effective work/plan timestamp with ISO 8601 offset; stored and compared in UTC |
| description | Required, trimmed, 1–2,000 characters |
| result | Required, trimmed, 1–2,000 characters |
| performedById | Required User foreign key; set from the session on create and never accepted from the client |
| assigneeId | Required User foreign key; active IT Staff or Administrator; distinct from Ticket Owner and performer |
| status | PLANNED, IN_PROGRESS, COMPLETED or CANCELLED |
| followUpRequired | Required boolean |
| followUpNote | Required, trimmed, 1–1,000 characters when followUpRequired is true; otherwise null |
| attachmentNotes | Optional plain text, up to 1,000 characters; describes a file to look for, not an upload |
| version | Integer starting at 1; incremented for each accepted edit or lifecycle change |
| createdAt, updatedAt | Server-managed timestamps |

List order is actionDateTime ascending, then id ascending. This is chronological with a deterministic tie-breaker. Changing actionDateTime may change position; the tie-breaker is never omitted.

### 5.2 Audit and concurrency records

ActionTakenEvent is append-only and records action id, event time, authenticated actor, event kind, prior/new status when relevant, resulting version and changed field names. It does not duplicate sensitive field values. Ticket.workflowVersion supports compare-and-set workflow writes. TicketWorkflowEvent records Ticket id, actor, event time, from/to status and resulting version. Resolution and resolved-by snapshots are retained in history after reopening; reopening reasons are returned to staff and administrators only. Ticket resolution adds nullable resolutionSummary, resolvedAt and resolvedById. Client actor ids and attribution timestamps are never authoritative.
### 5.3 Ticket workflow and migration

Ticket gains workflowVersion (integer, starts at 1), nullable resolutionSummary (trimmed, 1–2,000 characters when resolved), resolvedAt and resolvedById. TicketWorkflowEvent is append-only. Existing Ticket ids, owners, assignees, comments, attachments and statuses remain intact. The additive migration creates no ActionTaken rows and invents no resolution timestamps. Existing resolved/closed Tickets without resolvedAt remain visible; they are excluded from time-window resolved metrics until a real transition records the timestamp.

The migration is transactional where supported, has an explicit backup/restore procedure, and is safe to apply once. Seeds use stable keys/upserts and can run twice without duplicate Users, Tickets, actions or events. A failed migration must leave the prior schema/data recoverable; rollback instructions restore the pre-migration backup and redeploy the prior revision.

### 5.4 Deliberate data decisions

1. The session actor and the action assignee are separate required identities. The server records the authenticated actor; the assignee represents who owns the work. Neither is inferred from Ticket Owner.
2. Actions have planned and actual timestamps in one actionDateTime field. This keeps sorting simple; status says whether the recorded work is planned, underway, done or cancelled. The API accepts an offset timestamp and stores UTC.
3. History is append-only and stores changed field names and versions, not duplicate descriptions/results. This provides attribution and conflict diagnosis without creating a second mutable copy of potentially sensitive text.
4. Legacy Tickets are not backfilled with fictional actions or dates. Metrics exclude unknown dates, preserving honest counts.

## 6. Ticket workflow

### 6.1 Status transition matrix

| From | Allowed destinations | Confirmation required |
|---|---|---|
| NEW | OPEN, CANCELLED | CANCELLED |
| OPEN | IN_PROGRESS, WAITING_FOR_REQUESTER, RESOLVED, CANCELLED | RESOLVED, CANCELLED |
| IN_PROGRESS | WAITING_FOR_REQUESTER, RESOLVED, CANCELLED | RESOLVED, CANCELLED |
| WAITING_FOR_REQUESTER | IN_PROGRESS, RESOLVED, CANCELLED | RESOLVED, CANCELLED |
| RESOLVED | CLOSED, REOPENED | CLOSED |
| CLOSED | REOPENED | — |
| REOPENED | IN_PROGRESS, WAITING_FOR_REQUESTER, RESOLVED, CANCELLED | RESOLVED, CANCELLED |
| CANCELLED | REOPENED | — |

An unspecified transition is rejected. The server re-reads the Ticket and checks both the current state and workflowVersion in the write transaction.

### 6.2 Resolution and action rules

- Only IT Staff may change formal Ticket status in this increment. Requesters cannot resolve a Ticket; Administrators retain read-only status access.
- RESOLVED requires explicit confirmation, a non-empty resolutionSummary, at least one COMPLETED action, and no PLANNED or IN_PROGRESS action. CANCELLED actions do not block resolution.
- CLOSED is allowed only from RESOLVED, with confirmation and the existing resolution summary retained.
- Reopening from RESOLVED, CLOSED or CANCELLED requires a trimmed 1–1,000 character reason in the workflow event. Reopened Tickets follow the REOPENED transitions above.
- Resolution feedback from a Requester is advisory and does not transition status.
- followUpRequired describes recorded work only. It does not itself change Ticket status or send a notification.

## 7. Numbered functional requirements

- **FR-01** Persist one or more zero-to-many ActionTaken records per Ticket; a Ticket may have no actions.
- **FR-02** Validate the required fields and active Staff/Admin assignee; derive immutable performedById from the authenticated session.
- **FR-03** Permit Requesters to list actions only for their own Tickets; deny their action writes and cross-owner access server-side.
- **FR-04** Permit authorized Staff/Admin to create, edit and transition actions; append an event for each accepted write; never hard-delete actions.
- **FR-05** Apply the action and Ticket status matrices, resolution gate, confirmation and version check atomically.
- **FR-06** Return safe, consistent validation, authorization, not-found and stale-version errors without leaking another Requester’s Ticket.
- **FR-07** Provide Requester and Staff dashboards with server-calculated metrics, explicit UTC boundaries, empty states and drill-downs; Admin uses the Staff dashboard.
- **FR-08** Migrate additively, preserve prior rows/relationships, avoid fabricated history, recover from failed rollout and seed idempotently.
- **FR-09** Meet keyboard, focus, contrast, semantic-label, responsive and accessible error-state requirements in the UI contract.
- **FR-10** Preserve Lab 1–3 behavior and verify server, client, browser and migration regression paths listed in the test plan.

## 8. Product acceptance criteria

- **AC-01** Authorized Staff/Admin create an action and the server stores the authenticated performer, validated assignee, timestamp, required description/result, follow-up choice and initial version/event.
- **AC-02** Requesters see an ordered action history only on owned Tickets and cannot mutate it; unauthorized/cross-owner requests fail safely.
- **AC-03** Action edits and transitions follow the documented lifecycle, increment version and append one event; stale or duplicate requests do not partially apply.
- **AC-04** Every Ticket transition matches the matrix; invalid transitions and unauthorized role attempts are rejected.
- **AC-05** Resolution and closure enforce confirmation and the resolution gate, store server attribution/time, and preserve the resolution data in history.
- **AC-06** Dashboard counts use all matching rows, not a page subset; definitions, UTC boundaries, zero/empty behavior and drill-down filters match this specification.
- **AC-07** Migration preserves every pre-existing record and relation, creates no fabricated actions/dates, and passes rollback/recovery and twice-run seed checks.
- **AC-08** UI behavior is usable by keyboard and assistive technology, fits supported narrow viewports, and presents validation, authorization, conflict and loading states accessibly.
- **AC-09** Lab 1–3 regression suites pass with the new workflow and migration in place.
- **AC-10** Evidence, actual AI-use prompts, reviewer outcome, and implementation test results are recorded before the final Lab 4 release.

## 9. Product Definition of Done

A product increment is Done only when its approved acceptance criteria have passing named tests, reviewer feedback is resolved, API and UI behavior match this contract, migration and seed recovery are verified, access control is tested for every role, dashboards are checked against authoritative data and UTC boundaries, accessibility/responsive checks pass, and Lab 1–3 regression passes. Screenshots/logs are dated and linked from evidence records. No test is reported as passing until it has actually run. This contract-only Issue does not claim implementation or test completion.

## 10. Dependencies and deferred decisions

Issue #51 establishes the contract. Issue #52 implements Actions Taken persistence/API; #53 implements its UI; #54 implements formal workflow/resolution; #55 implements dashboards; #56 performs final regression and evidence. Later Issues must resolve framework-specific details without weakening these constraints. Exact component names, visual spacing and query indexes may be selected during implementation and recorded in the corresponding PR.

## 11. Source contract

This draft reflects the Lab 4 handout, approved Issue #51 scope and observed Lab 3 status transition behavior. It is documentation for review, not a claim that code already implements Lab 4. Any conflict found during peer review should be resolved in this document before implementation begins.
