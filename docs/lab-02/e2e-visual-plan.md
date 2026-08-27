# Lab 2 E2E and visual-audit plan

This document defines the repeatable checks for Issue 12. Every result stays
`Pending` until the exact command is run and its terminal output or screenshot
is stored. A planned check is not a passing check.

## Prerequisites

1. Install dependencies in `server` and `client`.
2. Start PostgreSQL, apply the Lab 2 migration, and run the idempotent seed.
3. Start the API from `server` and the Vite client from `client`.
4. Use a browser test runner with screenshot support. The repository does not
   currently include a Playwright dependency, so installing/configuring it is
   an explicit setup step before the automated flow is run.

## Execution note (2026-08-27)

The released source tree was exercised with a temporary Playwright runner and
a loopback fixture API. The fixture run passed the visible create/list/detail/
attachment/requester-switch flow, recorded a five-control keyboard traversal,
and captured all nine viewport screenshots with no horizontal overflow. This
does not replace the real Express/Prisma E2E run: PostgreSQL was unavailable on
the machine, so the database-backed result remains pending. See
[`ui-smoke-evidence.md`](ui-smoke-evidence.md) for the exact SHA, command,
measurements, screenshots, and limitation.

## E2E scenarios

| ID | Flow | Evidence required | Status |
|---|---|---|---|
| E2E-01 | Select an active requester, create a valid ticket, and open My Tickets | Generated ticket number and list result | Fixture UI passed; DB-backed Pending |
| E2E-02 | Switch to another requester and verify the first requester’s ticket is absent | Before/after requester views | Fixture UI passed; DB-backed Pending |
| E2E-03 | Add an allowed attachment, download it, soft-remove it, and verify download is unavailable | Attachment metadata and removal state | Fixture UI passed; DB-backed Pending |
| E2E-04 | Run the core flow at desktop, tablet, and mobile widths | Three viewport screenshots per screen | 9 fixture screenshots captured; real flow Pending |
| E2E-05 | Complete selection, creation, filtering, pagination, detail, and attachment actions by keyboard | Focus and feedback observations | Fixture traversal recorded; full audit Pending |

## Responsive screenshot matrix

Capture Create Ticket, My Tickets, and Ticket Detail at these viewports:

| Viewport | Size | Required checks |
|---|---:|---|
| Desktop | 1280 × 900 | Grid alignment, readable content, no overflow |
| Tablet | 900 × 900 | Responsive filter/form wrapping, no clipping |
| Mobile | 390 × 844 | Stacked controls, readable ticket rows, no horizontal scroll |

Store files under:

```text
artifacts/lab-02/screenshots/create-ticket/
artifacts/lab-02/screenshots/my-tickets/
artifacts/lab-02/screenshots/ticket-detail/
```

Use names such as `desktop-1280x900.png`, `tablet-900x900.png`, and
`mobile-390x844.png`. Include the date and branch in the evidence notes.

## Commands to record

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

For each command, record the exact branch, date, exit status, and relevant
terminal output. Record a screenshot only after the corresponding flow reaches
the expected state. If setup is unavailable or a check fails, keep the result
marked `Pending` or `Failed` and explain why.

## Final evidence table

| Evidence | Location | Result |
|---|---|---|
| Unit/API/UI tests | Terminal output from documented commands | Passed on 2026-08-27; see release evidence |
| E2E requester flow | `e2e/lab-02/requester-ticket-flow.spec.ts` output | Fixture smoke passed; database-backed run Pending |
| Responsive screenshots | `artifacts/lab-02/screenshots/` | 9 fixture screenshots captured; no horizontal overflow |
| Accessibility/keyboard audit | Dated checklist notes | Five-control traversal recorded; complete audit Pending |
| Build verification | Server and client build output | Passed on 2026-08-27; see release evidence |
