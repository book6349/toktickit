# Lab 4 UI Contract

Status: Draft for Issue #51 review. This file specifies visible behavior and accessibility requirements; it does not implement the screens.

Related: [engineering specification](specification.md), [API contract](api-spec.md), [test plan](tests.md).

## 1. Shared interaction rules

- Keep the Lab 1–3 Zen Green visual language, navigation and session behavior. Reuse existing design tokens and controls where available.
- Every page has a clear heading, role-specific navigation, loading state, empty state, retryable error state and accessible announcement of async updates.
- Do not rely on color alone for priority, status, validation or action lifecycle. Include text labels and recognizable icons with accessible names.
- Mutation controls are hidden or disabled when unavailable, while the API remains the enforcement boundary. Explain permission restrictions without revealing another Requester's data.
- Preserve form entries on recoverable network or validation errors. Show field messages next to fields and a summary near the form heading. On conflict, explain that the record changed and offer refresh/review before retry; never silently overwrite.
- Prevent double submission while a request is pending. Respect server idempotency behavior.
- On narrow viewport (320 CSS px and above), content reflows without horizontal page scrolling; tables become stacked rows or horizontally scrollable within their own region with labels preserved.

## 2. Actions Taken panel

### 2.1 Ticket detail

Display a labelled “Actions Taken” section below Ticket details, sorted by actionDateTime ascending and then id. Each entry shows action date/time in the viewer's local zone with a visible zone or tooltip, status, description, result, assignee, performer, follow-up state/note and attachment notes when present. Provide an explicit empty state when no actions exist.

A Requester sees the same history for owned Tickets in read-only mode and no edit/create/status controls. IT Staff and Administrator see create/edit/status controls for accessible Tickets. Performer is displayed separately from assignee so responsibility is clear.

### 2.2 Create/edit form

Fields: action date/time with offset-aware input; required description and result; required active assignee selector; status on create from allowed initial states; required follow-up yes/no choice; conditional required follow-up note; optional attachment notes. Display remaining-length guidance and server validation errors. The server response supplies actor, version and timestamps; these are display-only.

The form marks the selected assignee and action status before submit. On a validation failure retain other field values and focus the first invalid field. On success show confirmation and insert/update the action without losing Ticket context.

### 2.3 Lifecycle controls

Offer only legal next statuses. Confirm irreversible completion/cancellation with a concise dialog. Completed and cancelled entries remain in history and cannot be edited into a different lifecycle state; authorized correction is a separate new action. Show a conflict message and current version if another user changed the record.

## 3. Ticket workflow and resolution

The status control is visible only to IT Staff. It presents legal next statuses from the server, plus a confirmation dialog for RESOLVED, CLOSED and CANCELLED. A resolution form requires a summary and shows the completed-action count and any planned/in-progress actions blocking resolution. A blocked resolution gives a direct link to the Actions Taken section. Reopening requires a reason.

Requesters may provide resolution feedback, clearly labelled as advisory. It does not change formal status. When a Ticket is reopened, show the latest workflow history and preserve prior resolution event details. Administrator has read-only formal Ticket status in this increment.

## 4. Dashboards

All metrics show a short definition or accessible help text. The page displays the backend-provided `asOfUtc` in the viewer's local time with the source UTC value available to assist verification. Counts are links to filtered lists; no count or list is computed from currently loaded pages only. Zero values remain visible and lead to an explicit empty state.

Window definitions use an inclusive rolling interval: `[asOfUtc - duration, asOfUtc]`. A row exactly on the lower boundary is included; future dates are excluded. The server returns the count and top-five rows separately. Recently updated dashboard rows sort by `updatedAt` descending then Ticket id ascending. Recently resolved rows sort by `resolvedAt` descending then Ticket id ascending. Staff action rows sort by `actionDateTime` ascending then action id ascending and show at most five while the count covers every active action assigned to the signed-in user.

### 4.1 Requester dashboard

Show only Tickets owned by the signed-in Requester:

| Metric/list | Definition and drill-down |
|---|---|
| Open Tickets | Count with status NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER or REOPENED; opens all matching owned Tickets |
| Waiting for Requester | Count with status WAITING_FOR_REQUESTER; opens all matching owned Tickets |
| Recently updated | Top five owned Tickets with updatedAt in inclusive 7-day window; opens the full matching list |
| Recently resolved | Top five owned Tickets whose current status is RESOLVED or CLOSED and actual resolvedAt is in inclusive 30-day window; opens the full matching list |

Tickets with null resolvedAt are never counted as recently resolved. If a Ticket was reopened, it is no longer in the currently-resolved set. Present the resolved feedback action as advisory only.

### 4.2 Staff and Administrator dashboard

Show operational Ticket metrics within the signed-in Staff/Admin user's authorized scope:

| Metric/list | Definition and drill-down |
|---|---|
| Unassigned active | Count of active Tickets with no assignee |
| My active Tickets | Count of active Tickets assigned to the signed-in user |
| Active by status | Count for every active status, including zero; opens that status filter |
| Active by IT priority | Count for every configured IT triage priority, including zero; opens that priority filter |
| Recently updated active | Top five active Tickets updated in inclusive 7-day window; opens the full matching list |
| My active Actions Taken | Count of all PLANNED or IN_PROGRESS actions assigned to the signed-in user and a list of up to five, earliest scheduled first; action performer and assignee are labelled separately |

Active Ticket statuses are NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER and REOPENED. Administrator receives this Staff dashboard without user-account counts. Action performers and assignees remain separate labels.

## 5. Accessibility and responsive behavior

- All controls work with keyboard alone and use a logical tab order, visible focus, semantic heading levels, associated labels and buttons with action-specific names.
- Dialogs trap focus, announce title/instructions, support Escape when safe, and return focus to their launch control.
- Validation, save success, conflicts and loading changes are conveyed to assistive technology through suitable live regions; focus moves to the error summary only after failed submit.
- Text and controls meet WCAG AA contrast against the existing theme. Status and priority have text labels. Respect reduced-motion preferences.
- Date/time inputs expose timezone context. Avoid ambiguous locale-only dates in stored or API values.
- At 320 CSS px through desktop, action details wrap; forms stack fields; metric cards reflow; charts (if any) have an equivalent text/table summary.

## 6. UI acceptance checklist

- Requester sees their own action history and no mutation controls.
- Staff/Admin can complete the action flows and understand performer versus assignee.
- Illegal transitions are unavailable in the UI and rejected by the backend.
- Resolution blockers are explained and linked to their source actions.
- Dashboard counts and drill-down filters agree with server results and show boundary-consistent records.
- Loading, empty, validation, authorization, network and concurrency states are understandable and keyboard accessible.
- Narrow layout has no page-level horizontal overflow.
