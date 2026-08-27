# Lab 2 UI smoke and responsive evidence

This record captures the browser-visible checks that could be run after the
release merge. It is intentionally separate from the database-backed E2E
result: this run used a deterministic loopback fixture API because the machine
had no PostgreSQL listener on port 5432.

## Run identity

| Field | Value |
|---|---|
| Date | 2026-08-27 (Asia/Bangkok) |
| Released source | `main` at `8e897963c715c76eebbd0cb75568393e5ec55cc7` |
| Tested source tree | `origin/lab2-staging` at `efaa1fbbaf2292ae254819a397bfa79d28c8892a` |
| Tree comparison | `git diff origin/main origin/lab2-staging` was empty |
| Runtime | Node `v24.14.0`, Vite `6.4.3`, Playwright `1.55.0`, Chromium `140.0.7339.16` |
| Command | `node LAB2/.lab2-e2e-runner.mjs` |
| API used | Temporary loopback fixture at `127.0.0.1:3001` (not the Prisma API) |

The runner and fixture were temporary workspace-only assets used to generate
this record; they were not added to the released application.

## Fixture-backed UI smoke result

The run passed these browser assertions:

1. Select requester 1 and create a valid ticket (`TT-20260827-000002`).
2. Open My Tickets and confirm the generated ticket is listed.
3. Open Ticket Detail, upload an allowed PNG, trigger a download, and soft-remove the attachment.
4. Switch to requester 2 and confirm requester 1's ticket is not shown (`No tickets yet`).
5. Traverse the first five controls with the keyboard: `Change requester`, `My Tickets`, `Create Ticket`, `ticket-search`, `ticket-category`.
6. Check `document.documentElement.scrollWidth <= clientWidth` at every required viewport; no horizontal overflow was observed.

The browser download event completed successfully; Chromium reported the blob
download's suggested name as `attachment.png`.

## Responsive screenshot matrix

All nine screenshots were captured at the exact requested viewport sizes. The
image dimensions and overflow measurements are also recorded in
[`run-notes.json`](../../artifacts/lab-02/screenshots/run-notes.json).

| Screen | Desktop (1280×900) | Tablet (900×900) | Mobile (390×844) |
|---|---|---|---|
| Create Ticket | [PNG](../../artifacts/lab-02/screenshots/create-ticket/desktop-1280x900.png) | [PNG](../../artifacts/lab-02/screenshots/create-ticket/tablet-900x900.png) | [PNG](../../artifacts/lab-02/screenshots/create-ticket/mobile-390x844.png) |
| My Tickets | [PNG](../../artifacts/lab-02/screenshots/my-tickets/desktop-1280x900.png) | [PNG](../../artifacts/lab-02/screenshots/my-tickets/tablet-900x900.png) | [PNG](../../artifacts/lab-02/screenshots/my-tickets/mobile-390x844.png) |
| Ticket Detail | [PNG](../../artifacts/lab-02/screenshots/ticket-detail/desktop-1280x900.png) | [PNG](../../artifacts/lab-02/screenshots/ticket-detail/tablet-900x900.png) | [PNG](../../artifacts/lab-02/screenshots/ticket-detail/mobile-390x844.png) |

## Limitation and next step

This is UI smoke evidence only. PostgreSQL was unavailable locally, so the
actual Express/Prisma server was not started and the prescribed
database-backed command remains pending:

```text
npx playwright test e2e/lab-02/requester-ticket-flow.spec.ts
```

Do not use the fixture result to claim the real API, persistence, or AC-01–AC-22
integration evidence passed. To close that gap, start PostgreSQL, apply the
Lab 2 migration and seed, point the client at the real API, and rerun the same
flow against the real server.
