# Lab 2 Test Plan and Results

## 1. Test Strategy

Testing follows Test-Driven Development and Spec-Driven Development.

- Unit tests verify pure validation and Ticket Number behavior.
- API tests use Supertest against the Express application and a controlled database.
- UI tests use Vitest and React Testing Library.
- Style tests verify required labels, states, classes, and button behavior.
- Responsive and visual checks use Playwright screenshots at desktop, tablet, and mobile sizes.
- E2E tests verify the complete multi-Requester workflow.
- Every Acceptance Criterion maps to at least one planned test.
- No test is marked `Pass` until it has actually run.
- Tests must cover happy paths, invalid input, boundaries, failures, loading, empty results, ownership, and soft removal.

## 2. Planned Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
|---|---|---|---|---|---|---|
| UNIT-01 | Unit | BR-01, AC-06 | Ticket Number format and collision retry | Valid unique `TT-YYYYMMDD-XXXXXX` number | `server/tests/lab-02/ticket-number.unit.test.ts` | Planned |
| UNIT-02 | Unit | BR-09–BR-13, AC-07 | Shared field trimming and validation | Correct normalized values and field errors | `server/tests/lab-02/validation.unit.test.ts` | Planned |
| API-01 | API | FR-01–FR-03, AC-01–AC-03 | Active requester retrieval | Active requesters returned; inactive excluded | `server/tests/lab-02/requester-context.api.test.ts` | Planned |
| API-02 | API | AC-03 | Reference-data database failure | Safe `500` response; no fabricated success data | `server/tests/lab-02/reference-data.api.test.ts` | Planned |
| API-03 | API | FR-08–FR-10, AC-05–AC-06 | Valid ticket creation | `201`; one persisted ticket; requester, status, date, and number correct | `server/tests/lab-02/create-ticket.api.test.ts` | Planned |
| API-04 | API | FR-11, AC-07 | Invalid ticket fields | `400`; field errors; no ticket persisted | `server/tests/lab-02/create-ticket.api.test.ts` | Planned |
| API-05 | API | BR-04–BR-08, AC-01, AC-04, AC-15 | Missing, inactive, and cross-requester context | Safe requester or ownership failure | `server/tests/lab-02/requester-context.api.test.ts` | Planned |
| API-06 | API | FR-15, BR-16–BR-18, AC-10 | Initial attachment limits | Valid files accepted; invalid type, size, and count rejected | `server/tests/lab-02/create-ticket.api.test.ts` | Planned |
| API-07 | API | FR-16–FR-17, AC-11–AC-12 | Owned ticket list queries | Search, filters, sort, pagination, and ownership work correctly | `server/tests/lab-02/my-tickets.api.test.ts` | Planned |
| API-08 | API | BR-24–BR-27, AC-13 | Empty, no-results, and invalid query behavior | Correct metadata and safe `400` for invalid parameters | `server/tests/lab-02/my-tickets.api.test.ts` | Planned |
| API-09 | API | FR-19–FR-20, AC-14–AC-15 | Owned and unauthorized detail access | Owned ticket returned; cross-requester ticket hidden | `server/tests/lab-02/ticket-detail.api.test.ts` | Planned |
| API-10 | API | FR-21, AC-16 | Add attachments to owned ticket | Valid batch returns `201`; invalid batch persists nothing | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| API-11 | API | FR-22, BR-23, AC-17, AC-19 | Active and removed attachment download | Active file downloads; removed file returns `404` | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| API-12 | API | FR-23–FR-24, AC-18–AC-19 | Soft removal and retained metadata | Reason required; metadata retained; download blocked | `server/tests/lab-02/attachments.api.test.ts` | Planned |
| UI-01 | UI | FR-01–FR-06, AC-01–AC-04 | Requester selector states and switching | Loading, empty, failure, selection, display, and change work | `client/tests/lab-02/RequesterContext.test.tsx` | Planned |
| UI-02 | UI | FR-07–FR-10 | Create form initial state and references | Reference data loads; read-only fields are distinct | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| UI-03 | UI | FR-11, AC-07 | Field-level validation | Messages appear near fields; API is not called | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| UI-04 | UI | FR-12, BR-14, AC-08 | Busy and duplicate-submit behavior | Submit is disabled and shows busy state | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| UI-05 | UI | FR-14, AC-06 | Creation success state | Backend Ticket Number is displayed with next action | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| UI-06 | UI | FR-13, BR-15, AC-09 | API failure handling | Error is safe and all form values remain | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| UI-07 | UI | FR-15, AC-10 | Client attachment validation | Valid file accepted; invalid file explains reason | `client/tests/lab-02/CreateTicket.test.tsx` | Planned |
| UI-08 | UI | FR-16–FR-18, AC-11–AC-13 | My Tickets states and controls | Ownership, filters, sort, pagination, empty, no-results, error | `client/tests/lab-02/MyTickets.test.tsx` | Planned |
| UI-09 | UI | FR-19–FR-20, AC-14–AC-15 | Read-only detail and access failure | Fields are read-only; unauthorized state is safe | `client/tests/lab-02/RequesterTicketDetail.test.tsx` | Planned |
| UI-10 | UI | FR-21–FR-24, AC-16–AC-19 | Attachment lifecycle states | Active, uploading, invalid, removed, unavailable states work | `client/tests/lab-02/AttachmentSection.test.tsx` | Planned |
| STYLE-01 | UI Style | UI rules, AC-21 | Labels, required markers, focus, validation, button states | Required visual and accessibility conventions are present | `client/tests/lab-02/ui-style.test.tsx` | Planned |
| DOC-01 | Documentation | AC-22 | Verify every AC maps to a planned test | Complete traceability matrix | `docs/lab-02/tests.md` | Planned |
| E2E-01 | E2E | AC-01, AC-04–AC-06, AC-11 | Requester creates a ticket and finds it | Official backend number appears and ticket is listed | `e2e/lab-02/requester-ticket-flow.spec.ts` | Planned |
| E2E-02 | E2E | AC-11, AC-15 | Requester switching and isolation | Requester B cannot see Requester A’s ticket | `e2e/lab-02/requester-ticket-flow.spec.ts` | Planned |
| E2E-03 | E2E | AC-16–AC-19 | Attachment lifecycle | Add, download, soft-remove, retain metadata, block download | `e2e/lab-02/requester-ticket-flow.spec.ts` | Planned |
| E2E-04 | Responsive | AC-20 | Desktop, tablet, and mobile layouts | No clipping, overlap, or horizontal overflow | `e2e/lab-02/requester-ticket-flow.spec.ts` | Planned |
| E2E-05 | Accessibility | AC-21 | Keyboard navigation and accessible feedback | Selection, forms, errors, and actions are keyboard usable | `e2e/lab-02/requester-ticket-flow.spec.ts` | Planned |

## 3. Acceptance-Criterion Traceability

| AC | Planned Tests |
|---|---|
| AC-01 | API-01, API-05, UI-01, E2E-01 |
| AC-02 | API-01, UI-01 |
| AC-03 | API-01, API-02, UI-01 |
| AC-04 | UI-01, E2E-01 |
| AC-05 | API-03, E2E-01 |
| AC-06 | UNIT-01, API-03, UI-05, E2E-01 |
| AC-07 | UNIT-02, API-04, UI-03 |
| AC-08 | API-03, UI-04 |
| AC-09 | API-04, UI-06 |
| AC-10 | API-06, UI-07, E2E-01 |
| AC-11 | API-07, UI-08, E2E-01, E2E-02 |
| AC-12 | API-07, UI-08 |
| AC-13 | API-08, UI-08 |
| AC-14 | API-09, UI-09 |
| AC-15 | API-05, API-09, UI-09, E2E-02 |
| AC-16 | API-10, UI-10, E2E-03 |
| AC-17 | API-11, UI-10, E2E-03 |
| AC-18 | API-12, UI-10, E2E-03 |
| AC-19 | API-11, API-12, UI-10, E2E-03 |
| AC-20 | E2E-04 |
| AC-21 | STYLE-01, E2E-05 |
| AC-22 | DOC-01 |

## 4. Responsive and Visual Checklist

For Create Ticket, My Tickets, and Ticket Detail:

- Desktop screenshot captured at 992px or wider.
- Tablet screenshot captured at 768–991px.
- Mobile screenshot captured below 768px.
- Zen Green color tokens match `ui-spec.md`.
- Editable and read-only fields are distinguishable.
- Required markers and field-level messages are visible.
- Busy, disabled, success, error, empty, and no-results states are visible.
- No clipping, overlap, or unintended horizontal scrolling exists.
- Long summaries, descriptions, and filenames remain readable.
- Priority and status badges are consistent.
- Keyboard focus is visible.
- Icon-only controls have accessible labels.
- Removed Attachments show metadata but no download or preview action.

Screenshot directories:

- `artifacts/lab-02/screenshots/create-ticket/`
- `artifacts/lab-02/screenshots/my-tickets/`
- `artifacts/lab-02/screenshots/ticket-detail/`

## 5. Test Commands

Planned commands:

```text
cd server
npm test

cd client
npm test

npx playwright test e2e/lab-02/requester-ticket-flow.spec.ts

cd server
npm run build

cd client
npm run build
```

Final evidence must record the exact command, branch, date, and real terminal output.

## 6. Final Results

This section remains unfilled until implementation and verification are complete.

| Test Level | Command / Evidence | Result |
|---|---|---|
| Unit | `cd server; npm test` | Pending |
| API | `cd server; npm test` | Pending |
| UI | `cd client; npm test` | Pending |
| Style | `cd client; npm test` | Pending |
| Responsive | Playwright screenshots | Pending |
| E2E | Playwright requester flow | Pending |
| Build | Server and client build commands | Pending |

No test may be reported as passing without actual output from the final `main` branch.

## 7. Known Limitations or Deferred Tests

- Real authentication is intentionally deferred to Lab 3.
- IT Staff workflows are outside Lab 2.
- Visual comparison is partly manual and must be supported by the completed checklist.
- Final pass statuses remain pending until implementation, peer review, integration, and release verification are complete.
