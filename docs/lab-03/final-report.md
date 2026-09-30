# Lab 3 Final Report

Submission status: AUDIT REPAIRS IN PROGRESS; NOT YET FINAL-MAIN VERIFIED.
The original Lab 3 GitHub workflow is complete, and the board screenshot is
embedded on report page 2. This audit added meaningful authentication unit,
Requester workflow, and UI-style tests and corrected false test mappings.
Current local test/build results are from a dirty working tree at the old main
SHA; they are not final-main evidence. Docker-backed migration/data-preservation,
seed-twice, integrated E2E, responsive-overflow, and keyboard checks passed on
uniquely named disposable databases and remain local dirty-tree evidence.
The editable report and its evidence index are current local deliverables, not
an integrated update to `main`. The current local copy of `reviewer.md` records
the actual GitHub workflow, while the version fetched from remote `main` still
contains placeholder tracking rows. No push or follow-up PR was made.

The complete page 16-18 mapping is in [`submission-evidence.md`](submission-evidence.md).

Final commit: `493758be65850504de7b970e50f7a61b846584f0`.

## Answer Part 1 - Git Use with Engineering Workflow

The five approved units used one feature branch and one linked feature PR each.
PRs #41-#45 targeted `lab3-staging`; reviewed release PR #46 promoted
`lab3-staging` to `main`. Punge089 reviewed and merged the PRs. Issues #36-#40
are closed and the Kanban board shows `Done`; Issue #38 was corrected from
`No status` to `Done` after closure.

See [`reviewer.md`](reviewer.md) for the complete Issue, branch, PR, review,
reply, approval, merge, and board links. The repository includes the required
README and `.gitignore`. The report includes the board screenshot on page 2 and
renders the reviewer evidence table. Read-only GitHub checks on 2026-09-29
confirmed Issues #36-#40, PRs #41-#46, their merged states, and reviewer
comments, author replies, and approvals. Punge089's historical review events
are verified; the current collaborator-permission endpoint returned 403, so the
current permission level could not be established. The live board was not
rechecked. Lab 2 remains a separate completed baseline.

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

[`tests.md`](tests.md) now maps the actual assertion and file for every
test-matrix row. On 2026-09-29, the dirty local tree passed 8 server files/26
tests and 7 client files/16 tests; both builds passed. Prisma schema
validation passed using a throwaway process-local URL and did not connect to a
database. These runs include local uncommitted code/tests and must not be
represented as results from commit `493758b`.

The 2026-09-21 release ledger historically summarizes 22 server tests, 11
client tests, nine clean-disposable-database E2E tests, migration/seed commands,
and post-run counts. Its complete raw terminal output is not retained, and the
historical run does not prove existing Lab 2 Ticket/Attachment rows survived.
In this audit, the Lab 3 migration ran against a real pre-Lab-3 schema on a
task-created disposable Docker database; SQL assertions confirmed Requester,
Ticket, and Attachment IDs, ownership, metadata, and linkage survived. Two seed
runs produced stable counts and ownership/authorship checks. The corrected
current E2E run passed 15 tests in 24.6 seconds on a fresh fixture-ready
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
server behavior in `server/src/auth.ts`. Current local client tests cover the
authenticated Requester shell, safe login error, visible busy state, and
mandatory password change. Earlier browser captures remain supporting
artifacts; current E2E captures now revalidate these flows locally.

Responsive Login and mandatory Change Password screenshots (Figures 34-39) were
captured from the actual client at desktop, tablet, and mobile sizes. Their API
responses are mocked, so they prove layout only. Current-tree E2E and
inactive/logout behavior were not rerun.

Status: Passed locally - UI/API tests and current E2E cover login, inactive and
invalid failure, first-password change, role shell, logout, and direct blocking.
Responsive auth screenshots use mocked API responses and prove layout only; the
results are not final-main evidence.

## Answer Part 6 - Working IT Staff Ticket Queue UI

The implementation is in `client/src/staff.tsx`, with queue authorization and
query behavior in `server/src/staff-workflow.ts`. Local tests cover a filtered
paginated API result and client filters/empty/no-results states. The current
Docker-backed E2E created 21 real queue fixtures, verified Page 2 of 3, and
captured the populated second page in Figure 40. Empty/failure captures remain
labelled as controlled API-state evidence.

Status: Passed locally - filter/empty UI, real-data page-2 navigation, required
viewport layouts, and overflow assertions passed. The full sort/filter matrix
is not exhaustive; results are not final-main.

## Answer Part 7 - Working IT Staff Ticket Detail UI

Ticket Detail ownership, priority, status, public Comments, Internal Notes,
and authorization are covered by `server/src/staff-workflow.ts` and
`client/src/staff.tsx`. Figures 7-9 show the responsive detail layout and the
separation between public and internal content. Direct API authorization is
covered by the server Lab 3 suite.

Local API/client tests cover representative claim/status/priority behavior and
the separation of Public Comments and Internal Notes. Figure 41 shows the
current E2E visibly reassigning a migrated ticket, changing priority to LOW,
transitioning NEW to OPEN, and displaying its preserved Attachment. Figure 42
shows the Requester resolution indication. Not every status transition
combination was run.

Status: Passed locally for representative operations and migrated Attachment
continuity in E2E. Append-only note behavior and exhaustive transition coverage
remain bounded; this is not final-main evidence.

## Answer Part 8 - Working Administrator User Management UI

Administrator list, search, create, edit, initial-password reset, activation
safety, and role restrictions are implemented in `server/src/admin-users.ts`
and `client/src/admin.tsx`. Figures 10-12 show the responsive User Management
screen. Current server API tests explicitly cover self-deactivation, last
active-Administrator protection, and non-Administrator denial. Local client
tests and E2E cover list/search/create/edit/reset and direct-route behavior.
The safety cases are identifiable in passing API output, but no dedicated
safety-state screenshot was captured.

Status: Passed locally for the required API safety cases and integrated user
management flows. No safety-state screenshot was captured; this is not
final-main evidence.

## Answer Part 9 - Zen Green UI and Responsive Evidence

[`ui-spec.md`](ui-spec.md) defines the Zen Green tokens, role shells, states,
responsive rules, accessibility expectations, and screenshot matrix.
[`screenshot-index.md`](screenshot-index.md) records the 12 required desktop,
tablet, and mobile captures plus additional states. Figures 34-39 add responsive
Login and mandatory Change Password layouts using a mocked API. Visual inspection found
that the original full-page mobile images on PDF pages 12, 17, and 22 were too
small to read. They have been replaced with lossless viewport-sized sections
and captioned continuations in the editable report. Every page of the 2026-09-29
candidate PDF was rendered and visually inspected; figure numbering is
sequential. The integrated E2E viewport-overflow assertions passed for
Requester, Queue, Ticket Detail, and Admin. Three keyboard-only journeys and a
delayed-login busy-state test also passed. Login/Change Password screenshots
use mocked API responses and remain layout-only evidence.

## Verification summary

| Check | Status |
|---|---|
| Source context | Dirty local tree: branch `main`, HEAD `493758be65850504de7b970e50f7a61b846584f0` |
| GitHub Issues/PRs/reviews/merges | Historical events recorded in `reviewer.md`; not changed in this audit |
| Server Lab 3 tests | Passed locally - 8 files, 26 tests; not final-main |
| Client Lab 3 tests | Passed locally - 7 files, 16 tests; not final-main |
| Server/client builds | Passed locally |
| Prisma schema validation | Passed with a throwaway URL; database not contacted |
| Migration deploy/status, existing-row preservation, and seed twice | Passed on disposable Docker databases; dirty local tree, not final-main |
| Current integrated Playwright E2E | Passed - 15 tests in 24.6s on fixture-ready disposable DB; dirty local tree, not final-main |
| Historical final-main E2E | Release ledger summarizes 9 passes; raw terminal log unavailable |
| Historical post-E2E counts | Summarized in release ledger; not a migration-preservation proof |
| Mobile screenshot readability | Figures 20-33 placement visually inspected in rendered PDF; sources remain local/dirty |
| Responsive Login / Change Password | Figures 34-39 visually inspected; mocked API, layout-only evidence |
| Current automated overflow check | Passed for Requester, Queue, Detail, and Admin required viewports; dirty local tree |
| Current keyboard-only audit | Passed: three keyboard journeys; dirty local tree |
| Login busy feedback | Passed in client test and delayed-login browser capture |
