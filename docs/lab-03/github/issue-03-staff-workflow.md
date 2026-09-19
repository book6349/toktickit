# Issue 03 — IT Staff Queue, Ticket Detail, and ticket operations

## Context

IT Staff need a shared operational workflow to find work, inspect Tickets,
communicate with Requesters, manage ownership and IT Priority, and perform
permitted status transitions. Internal Notes must remain private from
Requesters.

## Scope

- IT Staff Ticket Queue API and responsive UI.
- Search, documented filters, sorting, pagination, empty/no-results,
  forbidden, and failure states.
- IT Staff Ticket Detail with ownership, IT Priority, status, comments, notes,
  and existing Attachments.
- Claim, assign, and reassign to valid active owners.
- Public Comments and append-only Internal Notes.
- Status transition validation and confirmation behavior.
- Explicit Administrator read-only detail, Internal Note, and IT Priority
  permissions without Administrator Queue navigation.

## Acceptance criteria

- [ ] IT Staff can retrieve realistic Queue data.
- [ ] Queue search, filters, sorting, pagination, and invalid-query handling
      match the approved API contract.
- [ ] Queue shows ownership, status, Requested Priority, and IT Priority.
- [ ] Queue supports safe loading, empty, no-results, forbidden, and failure
      states.
- [ ] IT Staff can open Ticket Detail and claim/reassign ownership.
- [ ] Only valid active IT Staff or Administrator owners can be assigned.
- [ ] IT Priority initially copies Requested Priority and is updated only by
      permitted roles.
- [ ] Only permitted status transitions succeed; required confirmations are
      enforced by the backend.
- [ ] Public Comments are visible to Requesters, IT Staff, and Administrators.
- [ ] Internal Notes are visible only to IT Staff and Administrators.
- [ ] Comments and notes reject empty content, record author/time, and are
      append-only.
- [ ] Desktop, tablet, and mobile Queue/Detail layouts have no overflow.

## Planned tests and evidence

- server/tests/lab-03/staff-queue.api.test.ts
- server/tests/lab-03/staff-ticket-detail.api.test.ts
- server/tests/lab-03/comments-notes.api.test.ts
- client/tests/lab-03/StaffTicketQueue.test.tsx
- client/tests/lab-03/StaffTicketDetail.test.tsx
- e2e/lab-03/staff-ticket-flow.spec.ts
- Queue and Detail screenshots under artifacts/lab-03/screenshots/

## Dependencies

ISSUE-01 and ISSUE-02 must be merged into lab3-staging first.

## Out of scope

Administrator user creation/editing and final release integration.

## Workflow

Use one branch named feature/lab3-staff-workflow, one PR targeting
lab3-staging, one linked Issue, one friend review, same-branch review fixes,
reviewer-led merge, and board/Issue updates only when permitted.
