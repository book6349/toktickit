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
was a fixture-only run because PostgreSQL was unavailable on the machine at
that time. The later Docker-backed run is recorded below. See
[`ui-smoke-evidence.md`](ui-smoke-evidence.md) for the exact SHA, command,
measurements, screenshots, and limitation.

## Real execution note (2026-09-05)

Docker Desktop PostgreSQL 18 was started and seeded, then the released
Express/Prisma API and Vite client were exercised with a temporary
workspace-only Playwright harness. The real flow created ticket
`TT-20260905-391070`, uploaded/downloaded/soft-removed attachments, verified
requester isolation, and captured all nine required viewports without
horizontal overflow. See [`ui-smoke-evidence.md`](ui-smoke-evidence.md) and
`artifacts/lab-02/screenshots-real/run-notes.json` for the run identity and
outputs.

Because the repository has no committed Playwright spec, the prescribed
`npx playwright test e2e/lab-02/requester-ticket-flow.spec.ts` command was not
claimed; the temporary harness remains workspace-only and is not part of the
application or evidence commit. The full keyboard audit remains pending.

## E2E scenarios

| ID | Flow | Evidence required | Status |
|---|---|---|---|
| E2E-01 | Select an active requester, create a valid ticket, and open My Tickets | Generated ticket number and list result | Passed against Docker-backed API |
| E2E-02 | Switch to another requester and verify the first requester’s ticket is absent | Before/after requester views | Passed against Docker-backed API |
| E2E-03 | Add an allowed attachment, download it, soft-remove it, and verify download is unavailable | Attachment metadata and removal state | Passed against Docker-backed API |
| E2E-04 | Run the core flow at desktop, tablet, and mobile widths | Three viewport screenshots per screen | 9 real screenshots captured; no horizontal overflow |
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
| E2E requester flow | `artifacts/lab-02/screenshots-real/run-notes.json` | Docker-backed flow passed; temporary harness removed after run |
| Responsive screenshots | `artifacts/lab-02/screenshots-real/` | 9 real screenshots captured; no horizontal overflow |
| Accessibility/keyboard audit | Dated checklist notes | Five-control traversal recorded; complete audit Pending |
| Build verification | Server and client build output | Passed on 2026-08-27; see release evidence |
