# Lab 2 UI smoke and responsive evidence

This record captures browser-visible checks after the release merge. It keeps
the original deterministic fixture smoke run and the later Docker-backed run
separate so that the evidence shows exactly which checks exercised persistence.

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

## Docker-backed E2E and responsive result (2026-09-05)

The real Express/Prisma application was run against a local PostgreSQL 18
container from Docker Desktop. The tested checkout was the
`docs/lab2-ui-smoke-evidence` branch after the release; its application source
is the released `main` tree plus the documented Lab 2 palette-token correction.

Database setup for the disposable container was:

```text
npx prisma db push --accept-data-loss
npx prisma migrate resolve --applied 20260824000000_lab2_foundation
npm run prisma:seed
```

The direct `prisma migrate deploy` path currently cannot initialize a fresh
database because the committed migration assumes a pre-existing Lab 1
`Category` table. The commands above are a test-environment baseline only; no
application source was changed.

The committed command
`npx playwright test e2e/lab-02/requester-ticket-flow.spec.ts` passed two tests
against the real API. The earlier temporary command
`cd LAB2; node .lab2-real-e2e.mjs` is retained only as a historical run record.
The committed run verified:

1. API health and active requester selection succeeded.
2. A ticket (`TT-20260905-391070`) was created and opened from My Tickets.
3. `initial.png` and `follow-up.png` were uploaded; download completed
   (Chromium reported the blob fallback name `attachment.png`).
4. `initial.png` was soft-removed with a valid reason and no longer exposed a
   download action.
5. Switching to requester 2 hid requester 1's ticket.
6. Create Ticket, My Tickets, and Ticket Detail were captured at all nine
   required viewports with no horizontal overflow.
7. Keyboard focus was verified for requester selection, create controls, list
   filters, detail navigation, upload, and active attachment actions.

The exact committed-spec command, result, and screenshot paths are in
[`committed-playwright-run.json`](../../artifacts/lab-02/screenshots/committed-playwright-run.json).
The earlier temporary harness check list is in
[`screenshots-real/run-notes.json`](../../artifacts/lab-02/screenshots-real/run-notes.json);
its nine comparison captures are under
`artifacts/lab-02/screenshots-real/`. The tracked screenshot files under
`artifacts/lab-02/screenshots/` were refreshed by the committed spec; the
earlier fixture metadata remains in `run-notes.json` for historical comparison.

## Responsive screenshot matrix

The committed Docker-backed run's nine screenshots are stored at the required
paths. The image dimensions and overflow measurements are recorded in
[`run-notes.json`](../../artifacts/lab-02/screenshots/run-notes.json). The
earlier temporary harness captured the comparison matrix under
`../../artifacts/lab-02/screenshots-real/`; its measurements are in
[`screenshots-real/run-notes.json`](../../artifacts/lab-02/screenshots-real/run-notes.json).

| Screen | Desktop (1280×900) | Tablet (900×900) | Mobile (390×844) |
|---|---|---|---|
| Create Ticket | [PNG](../../artifacts/lab-02/screenshots/create-ticket/desktop-1280x900.png) | [PNG](../../artifacts/lab-02/screenshots/create-ticket/tablet-900x900.png) | [PNG](../../artifacts/lab-02/screenshots/create-ticket/mobile-390x844.png) |
| My Tickets | [PNG](../../artifacts/lab-02/screenshots/my-tickets/desktop-1280x900.png) | [PNG](../../artifacts/lab-02/screenshots/my-tickets/tablet-900x900.png) | [PNG](../../artifacts/lab-02/screenshots/my-tickets/mobile-390x844.png) |
| Ticket Detail | [PNG](../../artifacts/lab-02/screenshots/ticket-detail/desktop-1280x900.png) | [PNG](../../artifacts/lab-02/screenshots/ticket-detail/tablet-900x900.png) | [PNG](../../artifacts/lab-02/screenshots/ticket-detail/mobile-390x844.png) |

## Limitations and interpretation

The committed E2E run covers the controls available in the tested single-page
dataset. Pagination buttons are conditional and were not rendered for that
dataset, so the multiple-page keyboard path remains a manual checklist item.
The migration baseline workaround and Chromium download-name observation are
documented in `tests.md`; neither should be generalized into a claim of real
authentication or complete AC-01–AC-22 integration coverage.
