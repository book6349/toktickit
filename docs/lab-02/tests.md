# Lab 2 Test Plan, Traceability, and Results

## 1. Test strategy

Testing follows Spec-Driven Development and Test-Driven Development. Unit
tests cover pure validation and ticket-number formatting; API tests use
Supertest with controlled Prisma boundaries; UI tests use Vitest and React
Testing Library; and the committed Playwright suite exercises the real
Docker-backed application. A check is marked `Passed` only after the command
ran and its output was observed. Fixture-only checks remain labelled as
historical context, not database evidence.

## 2. Planned tests and final status

| ID | Type | Requirement / AC | What it tests | Automated test file | Final result |
|---|---|---|---|---|---|
| UNIT-01 | Unit | BR-01, AC-06 | Ticket-number date segment and format helper | `server/tests/lab-02/ticket-number.unit.test.ts` | Passed — server suite |
| UNIT-02 | Unit | BR-09–BR-13, AC-07 | Trimming, field boundaries, references, priority, and attachment limits | `server/tests/lab-02/validation.unit.test.ts` | Passed — server suite |
| API-01 | API | FR-01–FR-03, AC-01–AC-03 | Active requester retrieval | `server/tests/lab-02/requester-context.api.test.ts` | Passed |
| API-02 | API | AC-03 | Reference-data database failure | `server/tests/lab-02/reference-data.api.test.ts` | Passed |
| API-03 | API | FR-08–FR-10, AC-05–AC-06 | Valid ticket creation and generated fields | `server/tests/lab-02/create-ticket.api.test.ts` | Passed |
| API-04 | API | FR-11, AC-07 | Invalid fields and no persistence | `server/tests/lab-02/create-ticket.api.test.ts` | Passed |
| API-05 | API | BR-04–BR-08, AC-01, AC-04, AC-15 | Missing, inactive, and cross-requester context | `server/tests/lab-02/requester-context.api.test.ts`, `ticket-detail.api.test.ts` | Passed |
| API-06 | API | FR-15, BR-16–BR-18, AC-10 | File type, size, and count limits | `server/tests/lab-02/create-ticket.api.test.ts` | Passed |
| API-07 | API | FR-16–FR-17, AC-11–AC-12 | Owner-scoped search, filters, sorting, and pagination | `server/tests/lab-02/my-tickets.api.test.ts` | Passed |
| API-08 | API | BR-24–BR-27, AC-13 | Empty/no-results metadata and invalid query handling | `server/tests/lab-02/my-tickets.api.test.ts` | Passed |
| API-09 | API | FR-19–FR-20, AC-14–AC-15 | Owned detail and safe unauthorized response | `server/tests/lab-02/ticket-detail.api.test.ts` | Passed |
| API-10 | API | FR-21, AC-16 | Add attachments to an owned ticket | `server/tests/lab-02/attachments.api.test.ts` | Passed |
| API-11 | API | FR-22, BR-23, AC-17, AC-19 | Active download and removed-file blocking | `server/tests/lab-02/attachments.api.test.ts` | Passed |
| API-12 | API | FR-23–FR-24, AC-18–AC-19 | Soft removal, reason, and retained metadata | `server/tests/lab-02/attachments.api.test.ts` | Passed |
| UI-01 | UI | FR-01–FR-06, AC-01–AC-04 | Requester loading, selection, persistence, failure, and switching | `client/tests/lab-02/RequesterContext.test.tsx` | Passed |
| UI-02 | UI | FR-07–FR-10 | Create form references and system-generated context | `client/tests/lab-02/CreateTicket.test.tsx` | Passed |
| UI-03 | UI | FR-11, AC-07 | Field-level validation without API call | `client/tests/lab-02/CreateTicket.test.tsx` | Passed |
| UI-04 | UI | FR-12, BR-14, AC-08 | Busy and duplicate-submit behavior | `client/tests/lab-02/CreateTicket.test.tsx` | Passed |
| UI-05 | UI | FR-14, AC-06 | Backend ticket number in success state | `client/tests/lab-02/CreateTicket.test.tsx` | Passed |
| UI-06 | UI | FR-13, BR-15, AC-09 | API failure preserves entered values | `client/tests/lab-02/CreateTicket.test.tsx` | Passed |
| UI-07 | UI | FR-15, AC-10 | Browser attachment validation | `client/tests/lab-02/CreateTicket.test.tsx` | Passed |
| UI-08 | UI | FR-16–FR-18, AC-11–AC-13 | My Tickets filters, sort, pagination, and no-results | `client/tests/lab-02/MyTickets.test.tsx` | Passed |
| UI-09 | UI | FR-19–FR-20, AC-14–AC-15 | Read-only detail and safe access failure | `client/tests/lab-02/RequesterTicketDetail.test.tsx` | Passed (React act warnings only) |
| UI-10 | UI | FR-21–FR-24, AC-16–AC-19 | Attachment active, upload, removed, and action visibility | `client/tests/lab-02/AttachmentSection.test.tsx` | Passed |
| STYLE-01 | UI style | UI rules, AC-21 | Exact Zen Green tokens, button hierarchy, active nav, focusable controls | `client/tests/lab-02/ui-style.test.tsx` | Passed |
| DOC-01 | Documentation | AC-22 | Every AC maps to at least one planned automated test | This file and `specification.md` traceability table | Passed — reviewed 2026-09-05 |
| E2E-01 | E2E | AC-01, AC-04–AC-06, AC-11 | Select requester, create a real ticket, and find it | `e2e/lab-02/requester-ticket-flow.spec.ts` | Passed — Docker/PostgreSQL |
| E2E-02 | E2E | AC-11, AC-15 | Requester switching and ownership isolation | `e2e/lab-02/requester-ticket-flow.spec.ts` | Passed — Docker/PostgreSQL |
| E2E-03 | E2E | AC-16–AC-19 | Add, download, soft-remove, and block removed download | `e2e/lab-02/requester-ticket-flow.spec.ts` | Passed — Docker/PostgreSQL |
| E2E-04 | Responsive | AC-20 | Nine required viewports and overflow check | `e2e/lab-02/requester-ticket-flow.spec.ts` | Passed — 9 PNGs |
| E2E-05 | Accessibility | AC-21 | Keyboard focus through requester gate, create controls, filters, detail, and attachment actions | `e2e/lab-02/requester-ticket-flow.spec.ts` | Passed for available controls; pagination button is conditional when one page is returned |

## 3. Acceptance-criterion traceability

| AC | Planned/automated evidence | Result |
|---|---|---|
| AC-01 | API-01/API-05, UI-01, E2E-01 | Passed |
| AC-02 | API-01, UI-01 | Passed |
| AC-03 | API-01/API-02, UI-01 | Passed |
| AC-04 | UI-01, E2E-01/E2E-02 | Passed |
| AC-05 | API-03, E2E-01 | Passed |
| AC-06 | UNIT-01/API-03/UI-05, E2E-01 | Passed |
| AC-07 | UNIT-02/API-04/UI-03 | Passed |
| AC-08 | API-03/UI-04 | Passed |
| AC-09 | API-04/UI-06 | Passed |
| AC-10 | API-06/UI-07, E2E-01 | Passed |
| AC-11 | API-07/UI-08, E2E-01/E2E-02 | Passed |
| AC-12 | API-07/UI-08 | Passed |
| AC-13 | API-08/UI-08 | Passed |
| AC-14 | API-09/UI-09, E2E-03 detail step | Passed |
| AC-15 | API-05/API-09/UI-09, E2E-02 | Passed |
| AC-16 | API-10/UI-10, E2E-03 | Passed |
| AC-17 | API-11/UI-10, E2E-03 | Passed (Chromium observed filename fallback below) |
| AC-18 | API-12/UI-10, E2E-03 | Passed |
| AC-19 | API-11/API-12/UI-10, E2E-03 | Passed |
| AC-20 | E2E-04 and nine screenshot files | Passed — no horizontal overflow |
| AC-21 | STYLE-01/E2E-05 | Passed for tested controls; manual visual review remains part of the checklist |
| AC-22 | DOC-01 | Passed |

## 4. Responsive and visual checklist

The committed E2E run captured Create Ticket, My Tickets, and Ticket Detail at
1280×900, 900×900, and 390×844. The `capture` helper asserts that
`document.documentElement.scrollWidth <= document.documentElement.clientWidth`
before each screenshot. The nine PNGs and machine-readable measurements are
indexed in `artifacts/lab-02/screenshots/run-notes.json`.

- Exact Zen Green tokens are asserted in `ui-style.test.tsx` and documented in
  `ui-spec.md`.
- Required labels, visible focus, field-level messages, disabled/busy buttons,
  safe errors, empty/no-results messaging, and removed-file action hiding are
  covered by UI tests and the committed flow.
- Long text and filenames use the responsive CSS rules; visual sign-off is
  supported by the screenshot matrix rather than inferred from code alone.

## 5. Commands and observed output

Commands were run from the `docs/lab2-ui-smoke-evidence` branch on 2026-09-05.
The server and client suites were run with their repository scripts; the E2E
command below starts the Vite client and Express API and uses Docker Desktop
PostgreSQL 18.

```text
cd server
npm test -- --run
10 files passed, 19 tests passed

cd client
npm test -- --run
7 files passed, 15 tests passed

npx playwright test e2e/lab-02/requester-ticket-flow.spec.ts
2 tests passed (real Docker-backed flow and keyboard traversal)

cd server
npm run build
passed

cd client
npm run build
passed
```

The committed E2E run identity is recorded in
`artifacts/lab-02/screenshots/committed-playwright-run.json`. It exercised a
fresh Playwright ticket; the earlier temporary real-harness record generated
ticket `TT-20260905-391070`. The recorded download event has Chromium’s
observed suggested filename
`attachment.png`; the API still preserves the original filename in metadata.

## 6. Final results register

| Test level | Exact command / evidence | Result |
|---|---|---|
| Unit + API | `cd server; npm test -- --run` | Passed — 10 files, 19 tests |
| UI + style | `cd client; npm test -- --run` | Passed — 7 files, 15 tests; existing React act warnings only |
| E2E | `npx playwright test e2e/lab-02/requester-ticket-flow.spec.ts` | Passed — 2 tests against Docker-backed PostgreSQL |
| Responsive | `artifacts/lab-02/screenshots/` and `committed-playwright-run.json` | Passed — 9 captures, no horizontal overflow |
| Server build | `cd server; npm run build` | Passed |
| Client build | `cd client; npm run build` | Passed |
| Prisma schema | `cd server; npx prisma validate` | Passed |

## 7. Known limitations and environment notes

- Real authentication is intentionally deferred to Lab 3. `X-Requester-Id`
  remains a clearly labelled testing context and is not a security boundary.
- IT Staff workflows, comments, notes, actions, and post-`NEW` status changes
  are outside Lab 2.
- On a disposable PostgreSQL 18 database, the committed migration history
  currently assumes a pre-existing Lab 1 `Category` table. The documented test
  baseline is `npx prisma db push --accept-data-loss`,
  `npx prisma migrate resolve --applied 20260824000000_lab2_foundation`, then
  `npm run prisma:seed`; this is not a production migration recommendation.
- Chromium’s cross-origin download event reports the safe fallback name
  `attachment.png`; removed attachments retain metadata and expose no download
  or preview action.
- E2E-05 checks keyboard focus for every control available in the tested flow.
  Pagination controls are conditional and were not present when the single-page
  dataset was returned; the visual/accessibility checklist still requires
  manual review of that control when multiple pages exist.
