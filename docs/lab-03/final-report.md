# Lab 3 Final Report - Working Evidence Draft

This report is a working evidence draft for Unit 5. It is intentionally honest
about checks that still require PostgreSQL, Playwright, screenshots, and the
reviewed GitHub release workflow.

## Answer Part 1 - Scope and objectives

Lab 3 integrates the completed authentication, Requester, IT Staff, and
Administrator workflows; verifies them with API, UI, and E2E checks; records
responsive visual evidence; and prepares a reviewed release from
`lab3-staging` to `main`.

The local Unit 5 implementation is on
`feature/lab3-integration-evidence` at commit
`70cc7de8dca6509639f0bc9176801433fbcca9ec`. Lab 2 remains a separate completed
baseline and was not modified in this worktree.

## Answer Part 2 - Architecture and data model

The server remains the TypeScript/Express/Prisma service backed by PostgreSQL.
The client remains the React/Vite application. Lab 3 adds the integration test
entry point at the repository root while keeping server and client unit tests
in their existing package boundaries.

The integrated scenarios use the seeded Requester, IT Staff, Administrator,
and inactive-user identities described by the Lab 3 test specification. The
database migration, seed, and post-migration checks still require a configured
PostgreSQL environment and are not claimed as executed here.

## Answer Part 3 - API, ownership, and validation

The server Lab 3 suite passed 22 tests across seven files, covering CSRF-safe
authentication, password-change gating, authorization, migration regression,
staff queue/detail operations, comments and notes, and Administrator user
management. The tested safety rules include separate public/internal content,
role restrictions, and protection against self-deactivation or removal of the
last active Administrator.

The client suite passed 11 tests across five files. The integrated E2E specs
exercise the same contracts through the browser, but those scenarios were not
executed because the local Playwright package/browser and PostgreSQL
prerequisites were unavailable.

## Answer Part 4 - UI, responsive behavior, and accessibility

The Unit 5 E2E definitions cover the Requester shell and regression flow, IT
Staff Queue and Ticket Detail, and Administrator User Management. The shared
fixture defines the required desktop, tablet, and mobile dimensions and stable
artifact names.

The responsive screenshots, overflow checks, keyboard/focus observations, and
visual PDF review remain pending. The source and client unit tests provide
partial evidence for labels, role navigation, validation, and announcements,
but they do not replace a real browser capture.

## Answer Part 5 - Acceptance-criterion traceability

| Acceptance criteria | Planned coverage | Current status |
|---|---|---|
| AC-01 to AC-05 | Auth API/UI tests and `authentication.spec.ts` | Partially evidenced: API/UI passed; E2E unavailable |
| AC-06 to AC-10 | Requester API/UI tests and `authentication.spec.ts` | Partially evidenced: API/UI passed; E2E unavailable |
| AC-11 to AC-17 | Staff API/UI tests and `staff-ticket-flow.spec.ts` | Partially evidenced: API/UI passed; E2E unavailable |
| AC-18 to AC-25 | Administrator API/UI tests and `user-administration.spec.ts` | Partially evidenced: API/UI passed; E2E unavailable |
| AC-26 | Migration regression, Prisma validation, migration/seed checks | Unavailable: `DATABASE_URL` missing; migration/seed deferred |
| AC-27 | Responsive, style, accessibility, and screenshot evidence | Unavailable for browser/visual proof; source/UI tests provide partial evidence |

The detailed planned matrix remains in [`docs/lab-03/tests.md`](tests.md), and
the current screenshot filenames and captions are in
[`docs/lab-03/screenshot-index.md`](screenshot-index.md).

## Answer Part 6 - Executed tests, builds, and database checks

All results below were run on the Unit 5 implementation commit listed in Part
1.

| Command | Result |
|---|---|
| `cd server` then `npm test -- --run tests/lab-03` | Passed - 7 files, 22 tests |
| `cd server` then `npm run build` | Passed |
| `cd server` then `npx prisma validate` | Failed - P1012 because `DATABASE_URL` was not set |
| `cd client` then `npm test -- --run tests/lab-03` | Passed - 5 files, 11 tests |
| `cd client` then `npm run build` | Passed - Vite transformed 31 modules |
| From repository root, `npx --no-install playwright test e2e/lab-03` | Unavailable - Playwright package was not installed |
| PostgreSQL migration and seed sequence | Deferred - no configured database service |

The exact output and labels are retained in
[`docs/lab-03/release-evidence.md`](release-evidence.md).

## Answer Part 7 - Screenshot index and visual audit

The required twelve-image index is in
[`docs/lab-03/screenshot-index.md`](screenshot-index.md). No PNG is linked as
Passed because the browser/database prerequisites were unavailable. This
working-draft PDF was rendered to ten pages and every page was visually
inspected, but the final submission PDF remains pending until real application
captures exist.

## Answer Part 8 - Peer review, merge, and issue tracking

The completed feature units are recorded by the following real GitHub links:

- [Lab 3 Issue 1 (#36)](https://github.com/book6349/toktickit/issues/36) and [PR 1 (#41)](https://github.com/book6349/toktickit/pull/41)
- [Lab 3 Issue 2 (#37)](https://github.com/book6349/toktickit/issues/37) and [PR 2 (#42)](https://github.com/book6349/toktickit/pull/42)
- [Lab 3 Issue 3 (#38)](https://github.com/book6349/toktickit/issues/38) and [PR 3 (#43)](https://github.com/book6349/toktickit/pull/43)
- [Lab 3 Issue 4 (#39)](https://github.com/book6349/toktickit/issues/39) and [PR 4 (#44)](https://github.com/book6349/toktickit/pull/44)
- [Lab 3 Issue 5 (#40)](https://github.com/book6349/toktickit/issues/40) is the approved Unit 5 issue.

PR 1 through PR 4 were reviewed and merged into `lab3-staging`. PR 5 has not
been opened in this draft, so there is no PR 5 number or link to invent. The
required Development-panel link, reviewer request, reviewer approval, merge,
Issue #40 closure, and the separate reviewed `lab3-staging` to `main` release
PR remain pending real GitHub events.

## Answer Part 9 - Limitations and next actions

The remaining work is environmental and workflow evidence, not a claim of
success by inference:

1. Install the declared Playwright dependency and its Chromium browser.
2. Provide PostgreSQL and `DATABASE_URL`; run migration and idempotent seed
   checks.
3. Run the three Lab 3 E2E specs and capture twelve readable screenshots.
4. Update the evidence ledger and PDF with the actual integrated branch/SHA,
   commands, results, captions, and links.
5. Use the approved PR 5 body, link Issue #40 through Development, request the
   designated review, reply to every comment, and wait for approval.
6. Have the reviewer merge PR 5 into `lab3-staging`, update the board, and
   close Issue #40 only when the workflow permits it.
7. Prepare the separate reviewed release PR from `lab3-staging` to `main` and
   update the final report only after those real events occur.
