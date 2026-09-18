# Lab 3 Zen Green UI Specification

Status: Draft planning contract. Visual states remain Planned until they are
implemented, tested, and captured.

## 1. Design Continuity

Lab 3 extends the Lab 2 Zen Green system. Existing tokens, form conventions,
cards, badges, buttons, validation placement, responsive rules, and keyboard
expectations remain in force. New screens must look like one application.

### Design tokens

| Token | Value | Use |
|---|---|---|
| Primary green | #006B3C | Header, primary actions, strong emphasis |
| Secondary green | #0B7A46 | Links, focus accents, active navigation |
| Pale green | #EAF6EF | Selected areas, success panels |
| Page background | #F5F7F6 | Application canvas |
| Surface | #FFFFFF | Cards, panels, forms |
| Ink | Dark charcoal-green | Primary readable text |
| Read-only surface | Soft gray-green | System-generated fields |
| Error | Dark red | Errors and invalid borders |
| Warning | Amber | Warnings and attention badges |
| Success | Green | Completion feedback |

Use the existing 4px/8px spacing rhythm, restrained card shadows, readable
system sans-serif typography, and visible focus outlines.

## 2. Application Shell

### Unauthenticated shell

The Login screen is the only normal unauthenticated destination. It contains:

- TokTickIT identity and IT Service Desk label.
- Email and Password fields.
- Sign in action.
- Field validation, busy state, safe failure, and inactive-account response.
- Keyboard-accessible labels and focus.

### Authenticated shell

The shell contains:

- TokTickIT identity.
- Current user's name and role badge.
- Logout action.
- Role-specific navigation.
- Clear active navigation state.
- Responsive mobile navigation.

Navigation rules:

| Role | Visible destinations |
|---|---|
| Requester | My Tickets, Create Ticket |
| IT Staff | Ticket Queue |
| Administrator | User Management |

The shell may show a direct Ticket Detail route when reached from an allowed
link, but it must not present an unauthorized destination as usable
navigation.

## 3. Mandatory Change Password

The Change Password screen is shown immediately after a successful login when
mustChangePassword=true. It contains:

- A clear explanation that an initial password must be replaced.
- Current password, New password, and Confirm new password fields.
- Visible password rules.
- Field-level validation and mismatch feedback.
- Busy state that prevents duplicate submission.
- Safe failure feedback that preserves entered values.
- Success feedback followed by normal shell access.

While this screen is required, normal application screens and APIs remain
blocked. Logout remains available.

## 4. Requester Regression

The Lab 2 Requester views continue using the authenticated Requester. The
Development Requester selector and Change Requester action are removed.

### My Tickets

Keep the Lab 2 list behavior:

- Search, category, requested-priority, and status filters.
- Sorting, page size, pagination, and clear filters.
- Empty and filtered no-results states.
- Owned Ticket rows/cards and Open action.
- Authenticated Requester identity in the shell.

### Create Ticket

Keep the Lab 2 fields, validation, attachments, busy state, and generated
Ticket success behavior. The Requester field is read-only and comes from the
authenticated user. The client never sends a requesterId override.

### Requester Ticket Detail

Preserve read-only Ticket information and Attachment lifecycle. Add:

- Public Comment list and composer.
- Problem Appears Resolved action with clear current state.
- A visible explanation that only IT Staff formally resolve or close Tickets.
- No IT Priority, owner assignment, Internal Note, or status controls.

Requester comments and resolution indication must be visually separate from
staff-only controls and must not reveal Internal Notes.

## 5. IT Staff Ticket Queue

The Queue is a work-finding screen, not an unreadable mega-grid.

### Desktop information hierarchy

The default desktop table or grid includes:

- Ticket Number.
- Created or last-updated date.
- Summary.
- Category.
- Requester.
- Requested Priority badge.
- IT Priority badge.
- Current Status badge.
- Ticket Owner or Unassigned.
- Open Detail action.

The final visible set must be justified in the final evidence. Secondary data
may be placed in the detail screen.

### Controls

- Search input with an accessible label and clear action.
- Status filter.
- Requested Priority filter.
- IT Priority filter.
- Owner/assigned filter.
- Sort field and direction.
- Page-size selector and pagination.
- Apply and Clear actions where the chosen interaction model needs them.

### Queue states

- Loading: visible progress message and non-jarring disabled controls.
- Empty: no seeded or existing work, with a next-step explanation.
- No results: query has no matches, with Clear filters.
- Forbidden: safe role message with no ticket data.
- Failure: safe API error and Retry action.
- Success: readable rows/cards with ownership, status, and priority badges.

### Responsive representation

At tablet width, retain the important columns while allowing controlled
wrapping. At mobile width, convert each row to a card or stacked record with
Ticket Number, Summary, status, priorities, owner, and Open Detail visible
without horizontal scrolling.

## 6. IT Staff Ticket Detail

Group the screen into:

1. Ticket identity and dates.
2. Requester and classification.
3. Ownership and operational controls.
4. Description and existing Attachments.
5. Public Comments.
6. Internal Notes.

Operational controls:

- Claim as current IT Staff user.
- Assign or reassign to an active permitted owner.
- IT Priority selector.
- Status selector containing only permitted target transitions.
- Confirmation for Resolved, Closed, and Cancelled.
- Save feedback that identifies the changed field.

Public Comments and Internal Notes must use distinct headings, containers,
labels, colors, and submit actions. The Internal Note composer must never
share the Public Comment submit control or label.

The detail view shows the Requester resolution indication but does not let
the Requester formally change staff status. Administrators may receive
read-only detail, Internal Note, and IT Priority presentation according to
the authorization contract, without receiving the Queue navigation.

## 7. Administrator User Management

Use one intentionally simple screen.

### User list

Display:

- Name.
- Email.
- Role badge.
- Active/Inactive status badge.
- Edit action.

Controls:

- Search by name or email.
- Optional one-role filter.
- Create User action.
- Retry and safe API failure feedback.

### Create and edit

Create fields:

- Name.
- Email.
- One role.
- Active state.
- Initial password.

Edit fields:

- Name.
- Email.
- One role.
- Active state.

Initial password reset is a clearly separate action and explains the required
next-login password change. The UI gives explicit feedback for duplicate
email, invalid role, self-deactivation, and last-active-Administrator
protection.

The screen does not include deletion, bulk actions, import/export, multiple
roles, departments, account-history screens, or advanced recovery controls.

## 8. Shared Feedback and Modes

Every screen identifies its relevant modes:

| Mode | Required behavior |
|---|---|
| Initial | Clear editable or read-only structure |
| Loading | Visible progress and no duplicate actions |
| Saving | Busy action, disabled duplicate submit |
| Validation | Field-level message near the invalid control |
| Success | Specific result and next action |
| Empty | Explain why no records exist |
| No results | Explain query mismatch and offer clearing |
| Forbidden | Role-safe message without protected data |
| Not found | Safe resource message |
| Conflict | Explain duplicate/state conflict and preserve input |
| Failure | Safe API message, retry where useful |

Do not use color alone to communicate status, priority, role, error, or
success.

## 9. Responsive Rules

- Desktop: 992px and above; centered content and multi-column layouts where
  they improve scanability.
- Tablet: 768–991px; controlled two-column forms and wrapped queue fields.
- Mobile: below 768px; stacked forms, touch-sized controls, cards or stacked
  queue records, and no horizontal page scrolling.
- Long summaries, emails, filenames, and comments must wrap or truncate with
  accessible full text.
- No labels, controls, validation messages, badges, or buttons may clip,
  overlap, or disappear at the required widths.

## 10. Accessibility

- Every control has an associated label or accessible name.
- Required state and validation are announced to assistive technology.
- Important error and success feedback uses alert/status semantics.
- Focus remains visible and moves predictably after navigation or submission.
- Busy controls are disabled without trapping focus.
- Keyboard users can complete login, password change, Requester regression,
  Queue filters, detail operations, comments, notes, and User Management.
- Contrast is readable for text, borders, focus rings, status badges, and
  disabled controls.
- Public Comment and Internal Note controls have unambiguous names.

## 11. Reusable Components

Reuse or extend the Lab 2 conventions for:

- Application shell and role navigation.
- Page header and role badge.
- Form field and validation message.
- Read-only field.
- Loading, error, empty, and no-results panels.
- Status, priority, role, and account-state badges.
- Search/filter toolbar and pagination.
- Attachment list.
- Comment and Internal Note panels.
- Confirmation dialog.
- User list and edit form.

## 12. Screenshot and Visual Evidence Matrix

Required screenshot root:

    artifacts/lab-03/screenshots/

Required groups from the handout:

- authentication/
- staff-queue/
- staff-ticket-detail/
- user-management/

Requester regression screenshots may be placed under
authentication/requester-regression/ when they show the authenticated shell,
My Tickets, Create Ticket, or Requester Ticket Detail.

Capture at:

| Viewport | Size | Minimum checks |
|---|---:|---|
| Desktop | 1280 × 900 | hierarchy, alignment, readable data |
| Tablet | 900 × 900 | wrapping, no clipping, usable controls |
| Mobile | 390 × 844 | stacked/card layout, no horizontal overflow |

Each evidence record must include screen, viewport, date, branch/SHA, scenario,
and visible state. A screenshot is not Passed until it is visibly captured and
indexed.

## 13. Visual Checklist

For each major screen and viewport, verify:

- Zen Green tokens and component conventions match Lab 2.
- Authenticated identity and role are clear.
- Role navigation does not expose unauthorized destinations.
- Status, requested priority, IT Priority, role, and account-state badges are
  consistent.
- Editable and read-only fields are distinct.
- Required markers and validation messages are correctly placed.
- Loading, saving, empty, no-results, forbidden, success, and failure states
  are understandable.
- Public Comments and Internal Notes cannot be confused.
- Focus, keyboard order, contrast, wrapping, clipping, overlap, and horizontal
  overflow are acceptable.
