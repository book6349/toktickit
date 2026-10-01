# Lab 3 Final Report

## Current local verification 2026-10-01

The approved local repairs now pass 190 server tests, 36 client tests, both
builds, Prisma validation, and 16 integrated E2E scenarios. Migration
preservation and seed-twice assertions passed on a fresh disposable Docker
PostgreSQL database. The missing Staff Requester-resolution indicator was
fixed and verified without changing formal status. Complete output and new
Staff captures are retained in `output/docs/evidence-20261001-step5/`.

These are dirty local working-tree results based on
`1fb8df040eb12ac443bb4246a314babfde1564e9`, not committed-main evidence.
Recorded main remains `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`.
No new GitHub events are claimed. Reviewed staging/release integration and
clean-main reruns remain required. The older dated records below are retained
as history; earlier Docker-unavailable and missing-indicator statements do
not describe this new local run.

## Historical committed-main record before the current local repairs

The editable report and PDF were locally updated and all 121 pages visually
checked in step 5. See `output/docs/evidence-20261001-step5/verification.md`.
The dated record below describes the earlier committed-main audit, not the
current local report or Docker availability.

Submission status: NOT READY FOR FINAL SUBMISSION; final-main verification is
partial. PR #47 merged to `lab3-staging`; reviewed PR #48 merged to `main` at
`0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`. On that commit, the focused Lab 3
server/client suites passed (26 and 16 tests), both builds passed, and Prisma
schema validation passed. The full unfiltered server/client test commands
failed in legacy Lab 1/2 suites; Docker was unreachable, so final-main
migration, seed-twice, data-preservation, and integrated E2E checks were not
run. Existing responsive/E2E screenshots were captured before the final merge
and were not recaptured on a clean main checkout. The PDF/DOCX still require
their final evidence update, export, and full visual recheck. Lab 2 source and
the completed Lab 2 report were not changed.

The complete page 16-18 mapping is in [`submission-evidence.md`](submission-evidence.md).

Final main commit: `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`.

## Answer Part 1 - Git Use with Engineering Workflow

The five approved units used one feature branch and one linked feature PR each.
PRs #41-#45 targeted `lab3-staging`; PR #47 delivered the reviewed post-audit
correction to `lab3-staging`; and reviewed release PR #48 promoted it to `main`.
Punge089 reviewed and merged them. Issues #36-#40 are closed and the Kanban
board shows `Done`.

See [`reviewer.md`](reviewer.md) for the complete Issue, branch, PR, review,
reply, approval, merge, and board links. The repository includes the required
README and `.gitignore`. The report includes the board screenshot on page 2 and
renders the reviewer evidence table. Read-only GitHub checks on 2026-09-30
confirmed Issues #36-#40, PRs #41-#48, review comments, author replies,
approvals, merges, and Issue #40's final closed/Done state. Lab 2 remains a
separate completed baseline.

## Answer Part 2 - Spec DD

The engineering contract is [`specification.md`](specification.md), supported
by [`api-spec.md`](api-spec.md) and [`ui-spec.md`](ui-spec.md). It defines
authentication and sessions, password policy, User/Session migration, role
separation, Requester ownership, staff queue/detail operations, Administrator
safety, validation/error behavior, status transitions, acceptance criteria,
Zen Green tokens, responsive rules, and the Definition of Done.

The contract and Test DD were merged in PR #41 before the implementation PRs.
This preserves the required specification-before-implementation evidence.
The final report includes rendered specification, API, and UI contract
appendices rather than relying only on a link.

## Answer Part 3 - Test DD and Traceability

[`tests.md`](tests.md) maps assertions to their files and preserves the
complete passing Lab 3 test output from merged main `0353a40`: server 8/8 files
and 26/26 tests, client 7/7 files and 16/16 tests. Both production builds and
Prisma schema validation also passed. The unfiltered `npm test` commands did
not pass: 10 of 45 server tests and 15 of 31 client tests failed in legacy
Lab 1/2 suites using the pre-session test setup. Docker was unreachable, so
final-main migration deployment/status, row-preservation assertions, seed
twice, and integrated E2E were not run. Prior 2026-09-29 database/E2E results
are dirty-tree evidence and do not certify `0353a40`.

The 2026-09-21 release ledger historically summarizes 22 server tests, 11
client tests, nine clean-disposable-database E2E tests, migration/seed commands,
and post-run counts. Its complete raw terminal output is not retained, and the
historical run does not prove existing Lab 2 Ticket/Attachment rows survived.
In the 2026-09-29 dirty-tree audit, the Lab 3 migration ran against a real pre-Lab-3 schema on a
task-created disposable Docker database; SQL assertions confirmed Requester,
Ticket, and Attachment IDs, ownership, metadata, and linkage survived. Two seed
runs produced stable counts and ownership/authorship checks. The corrected
2026-09-29 E2E run passed 15 tests in 24.6 seconds on a fresh fixture-ready
disposable clone. Its first fresh-clone attempt missed two E2E fixtures and
failed 2 tests; that failure and the setup correction are documented. No pre-existing database was
reset.

## Answer Part 4 - AI Use with Reflection

[`ai-use.md`](ai-use.md) records Codex as the AI assistant, seven representative
prompts, the human-controlled GitHub boundary, and the reflection. The exact
model identifier used for earlier project work was not recorded and is not
guessed. Punge089 made the recorded review and merge decisions.

## Answer Part 5 - Working Login and Password Change UI

The implementation is in `client/src/App.tsx` and `client/src/api.ts`, with
server behavior in `server/src/auth.ts`. Final-main client tests cover the
authenticated Requester shell, safe login error, visible busy state, and
mandatory password change. Existing integrated browser captures are from the
pre-merge local run; final-main E2E was not available for this audit.

Responsive Login and mandatory Change Password screenshots (Figures 34-39) were
captured from the actual client at desktop, tablet, and mobile sizes. Their API
responses are mocked, so they prove layout only. Inactive/logout E2E behavior
was not rerun on final main.

Status: Partially evidenced. Main client/API tests passed; integrated E2E was
not rerun. Existing Login and mandatory Change Password screenshots show the
actual UI with mocked API responses and prove layout only; they were not
recaptured from a clean final-main run.

## Answer Part 6 - Working IT Staff Ticket Queue UI

The implementation is in `client/src/staff.tsx`, with queue authorization and
query behavior in `server/src/staff-workflow.ts`. Final-main tests cover a
filtered paginated API result and client filters/empty/no-results states. The
2026-09-29 dirty-tree Docker-backed E2E used 21 real queue fixtures, verified
Page 2 of 3, and captured the populated second page in Figure 40. Empty/failure
captures remain labelled as controlled API-state evidence.

Status: Partially evidenced. Main queue API/UI tests passed. Real-data page-2
navigation and responsive/overflow screenshots come from the earlier local
dirty-tree E2E run, not a rerun on final main. The full sort/filter matrix is
not exhaustive.

## Answer Part 7 - Working IT Staff Ticket Detail UI

Ticket Detail ownership, priority, status, public Comments, Internal Notes,
and authorization are covered by `server/src/staff-workflow.ts` and
`client/src/staff.tsx`. Figures 7-9 show the responsive detail layout and the
separation between public and internal content. Direct API authorization is
covered by the server Lab 3 suite.

Final-main API/client tests cover representative claim/status/priority
behavior and the separation of Public Comments and Internal Notes. Figure 41
shows the 2026-09-29 dirty-tree E2E reassigning a migrated ticket, changing
priority to LOW, transitioning NEW to OPEN, and displaying its preserved
Attachment. Figure 42 shows the Requester resolution indication. Not every
status transition combination was run; final-main E2E was not rerun.

Status: Partially evidenced. Main API/UI tests passed for representative
operations and authorization. Attachment continuity and the reassignment,
priority, and status sequence were captured only in the earlier dirty-tree
E2E run. Append-only note behavior and exhaustive transition coverage remain
incomplete.

## Answer Part 8 - Working Administrator User Management UI

Administrator list, search, create, edit, initial-password reset, activation
safety, and role restrictions are implemented in `server/src/admin-users.ts`
and `client/src/admin.tsx`. Figures 10-12 show the responsive User Management
screen. Final-main server API tests explicitly cover self-deactivation, last
active-Administrator protection, and non-Administrator denial. Integrated
client flows are from the pre-merge E2E run. The safety cases are identifiable
in passing API output, but no dedicated safety-state screenshot was captured.

Status: Partially evidenced. Main API tests passed for self-deactivation,
last-active-Administrator protection, and non-Administrator denial. Integrated
user-management flows are from the earlier dirty-tree E2E run, and no dedicated
safety-state screenshot was captured.

## Answer Part 9 - Zen Green UI and Responsive Evidence

[`ui-spec.md`](ui-spec.md) defines the Zen Green tokens, role shells, states,
responsive rules, accessibility expectations, and screenshot matrix.
[`screenshot-index.md`](screenshot-index.md) records the 12 required desktop,
tablet, and mobile captures plus additional states. Figures 34-39 show actual
Login and mandatory Change Password screens with mocked API responses; they
prove layout only. The prior PDF's mobile sections were split for readability
and visually inspected on 2026-09-29, but this report update has not yet been
exported or visually rechecked. Overflow and keyboard E2E checks passed on the
earlier dirty tree, not in a final-main rerun. Existing screenshots are not
described as clean final-main captures.

## Verification summary

| Check | Status |
|---|---|
| Source context | Isolated clean checkout of `origin/main` at `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02` |
| GitHub Issues/PRs/reviews/merges | PRs #41-#48 and Issue #40 final state verified; see `reviewer.md` |
| Focused Lab 3 server tests | Passed - 8 files, 26 tests on merged main |
| Focused Lab 3 client tests | Passed - 7 files, 16 tests on merged main |
| Unfiltered server/client suites | Failed - 10/45 server and 15/31 client tests in legacy Lab 1/2 suites |
| Server/client builds | Passed on merged main |
| Prisma schema validation | Passed with process-local placeholder URL; no database connection |
| Migration deploy/status, existing-row preservation, and seed twice | Not rerun on final main; Docker API pipe unavailable |
| Integrated Playwright E2E | Not rerun on final main; Docker API pipe unavailable |
| Historical final-main E2E | Release ledger summarizes 9 passes; raw terminal log unavailable |
| Historical post-E2E counts | Summarized in release ledger; not a migration-preservation proof |
| Mobile screenshot readability | Figures 20-33 placement visually inspected in rendered PDF; sources remain local/dirty |
| Responsive Login / Change Password | Figures 34-39 visually inspected; mocked API, layout-only evidence |
| Automated overflow/keyboard checks | Earlier dirty-tree pass only; not rerun on final main |
| Login busy feedback | Lab 3 client test passed on main; prior browser capture not recaptured |
