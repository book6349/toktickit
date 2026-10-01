# Lab 3 Test Plan, Traceability, and Results

## Current supplemental acceptance evidence

| ID | Type | Requirement / AC | Actual assertion and path | Current result |
|---|---|---|---|---|
| AUTH-04 | API authorization | FR-04, AC-04 | Expired/revoked/inactive sessions rejected; logout revokes token; `server/tests/lab-03/auth.api.test.ts` | Passed locally, included in 190-test run |
| CONTENT-01 | API validation/security | AC-09, AC-17 | Comment/note boundaries, session authorship, append-only endpoints; `server/tests/lab-03/comments-notes.api.test.ts`; safe text rendering `client/tests/lab-03/RequesterWorkflow.test.tsx` | Passed locally |
| QUEUE-04 | API queries | AC-11 | Seven sort fields in both directions, owner/filter combinations and invalid queries; `server/tests/lab-03/staff-queue.api.test.ts` | Passed locally; combined owner bug repaired |
| STATUS-04 | API operations | AC-14–AC-16 | All 64 status pairs, terminal confirmation, active owner and role rules; `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Passed locally with mocked delegates; browser exercises representative transitions |
| ADMIN-04 | API authorization | AC-24–AC-25 | Self/last-active-admin guards, demotion and every non-admin management operation; `server/tests/lab-03/users-admin.api.test.ts` | Passed locally; real self-removal/denial output retained separately |
| MIG-04 | Real PostgreSQL | AC-26 | Actual deploy, before/after baseline fields/IDs/relationships, seed twice counts/authorship/ownership and attachment bytes; `server/prisma/prepare-lab3-e2e.ts` | Executed; database-run2.txt exit 0; synthetic disposable data only |
| REG-01 | Regression | AC-06–AC-10 | Authenticated Requester legacy tests plus `client/tests/lab-03/RequesterWorkflow.test.tsx` and `e2e/lab-03/authentication.spec.ts` | Passed locally; UI-03 is not attributed to Login tests |
| UI-07 | UI and E2E | AC-10, AC-13 | Indication shown for Staff/Admin when present, absent when null, no status mutation; `client/tests/lab-03/StaffTicketDetail.test.tsx`; real Staff browser case `e2e/lab-03/staff-ticket-flow.spec.ts` | Added before fix: 2 failed; after fix full client 36 passed and E2E 16 passed |
| STYLE-03 | UI style/visual | AC-27 | Actual `client/tests/lab-03/ui-style.test.tsx`; role/viewport/browser checks plus real Login/Change Password captures | Passed within asserted/captured states; not universal accessibility certification |

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

Status: Test DD created before Lab 3 implementation. This revision audits each
matrix row against the actual assertion and path. Section 7 records verification
on the merged `main` commit `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02` on
2026-09-30: the focused Lab 3 server/client suites passed (26 and 16 tests),
both builds passed, and Prisma schema validation passed. The unfiltered server
and client suites did not pass because legacy Lab 1/2 tests are not aligned
with the new session flow. Docker was unreachable, so migration, seed-twice,
data-preservation, and integrated E2E checks were not rerun on final main.
Sections 3-6 preserve the distinct 2026-09-29 dirty-tree test matrix and
database/E2E results; they are not final-main evidence. The 2026-09-21 ledger
is historical summary evidence without complete raw output.

## 1. Test Principles

- Tests are written from the approved specification and acceptance criteria,
  not reconstructed after implementation.
- Server tests verify authentication, authorization, ownership, validation,
  safe errors, migration behavior, and data visibility directly at the API.
- Client tests verify role navigation, form behavior, feedback, accessibility
  semantics, and Zen Green presentation.
- E2E tests verify integrated browser behavior against the real application and
  disposable PostgreSQL data.
- Responsive evidence uses the required desktop, tablet, and mobile sizes.
- A planned test is not evidence. Results are labeled Planned, Passed,
  Failed, Deferred, or Unavailable only after observation.

## 2. Planned Automated Test Files

### Server/API

Required server files:

- server/tests/lab-03/auth.api.test.ts
- server/tests/lab-03/authorization.api.test.ts
- server/tests/lab-03/staff-queue.api.test.ts
- server/tests/lab-03/staff-ticket-detail.api.test.ts
- server/tests/lab-03/comments-notes.api.test.ts
- server/tests/lab-03/users-admin.api.test.ts

Additional focused migration coverage:

- server/tests/lab-03/migration-regression.test.ts
- server/tests/lab-03/auth.unit.test.ts

### Client/UI

Required client files:

- client/tests/lab-03/Login.test.tsx
- client/tests/lab-03/ChangePassword.test.tsx
- client/tests/lab-03/StaffTicketQueue.test.tsx
- client/tests/lab-03/StaffTicketDetail.test.tsx
- client/tests/lab-03/UserManagement.test.tsx

Additional shared visual assertions:

- client/tests/lab-03/ui-style.test.tsx
- client/tests/lab-03/RequesterWorkflow.test.tsx

### End to end

- e2e/lab-03/authentication.spec.ts
- e2e/lab-03/staff-ticket-flow.spec.ts
- e2e/lab-03/user-administration.spec.ts
- e2e/lab-03/z-accessibility-evidence.spec.ts (runs after first-login flows)

## 3. Test Matrix (historical 2026-09-29 dirty-tree execution)

| ID | Type | Requirement / AC | What it tests | Automated file | Result |
|---|---|---|---|---|---|
| UNIT-01 | Unit | BR-03, BR-07, AC-01–AC-03 | Email normalization and password boundaries/composition | auth.unit.test.ts | Passed locally: 2 assertions groups in 2 tests; dirty tree |
| UNIT-02 | Unit | BR-03 | Salted scrypt digest, no plaintext, correct/wrong/malformed verification | auth.unit.test.ts | Passed locally: 2 tests; dirty tree |
| API-01 | API | FR-01, AC-01 | Valid-CSRF login returns safe user data | auth.api.test.ts | Passed locally; dirty tree |
| API-02 | API | FR-02, AC-02 | Missing and inactive accounts share safe 401 behavior | auth.api.test.ts | Passed locally; dirty tree |
| API-03 | API | FR-05, AC-03 | Mandatory password gate and old-session revocation after password change | auth.api.test.ts | Passed locally; does not test logout or expiry |
| API-04 | Security | FR-09, AC-06, AC-08 | Ticket creation uses session identity and ignores requesterId input | authorization.api.test.ts | Passed locally; dirty tree |
| API-05 | Security | FR-10, AC-07–AC-08 | Cross-requester ticket access returns safe not-found response | authorization.api.test.ts | Passed locally; does not exercise migrated legacy rows |
| API-06 | API | FR-12, FR-14, AC-09–AC-10 | Public comments and Requester resolution indication | authorization.api.test.ts | Passed locally; dirty tree |
| API-07 | API | FR-15–FR-16, AC-11 | Staff-only filtered paginated Queue response | staff-queue.api.test.ts | Passed locally; one filtered query, not all sort/filter combinations |
| API-08 | Validation | FR-16, AC-11 | Invalid queue query rejected before ticket query | staff-queue.api.test.ts | Passed locally; dirty tree |
| API-09 | Security | FR-15, AC-12, AC-25 | Requester and Administrator denied Queue access | staff-queue.api.test.ts | Passed locally; dirty tree |
| API-10 | API | FR-20, AC-16 | Backend status transition/confirmation requirements | staff-ticket-detail.api.test.ts | Passed locally; representative transitions only |
| API-11 | API | FR-20, AC-16 | Status update checks current state before changing it | staff-ticket-detail.api.test.ts | Passed locally; dirty tree |
| API-12 | Security | FR-18–FR-19, AC-14–AC-15 | Requester owner rejected; permitted IT Priority update accepted | staff-ticket-detail.api.test.ts | Passed locally; limited role/operation cases |
| API-13 | API | FR-21, AC-09, AC-17 | Staff Notes endpoint records session author | comments-notes.api.test.ts | Passed locally; dirty tree |
| API-14 | Security | FR-21, AC-09, AC-17 | Requester cannot read Internal Notes | comments-notes.api.test.ts | Passed locally; append-only behavior not directly tested |
| API-15 | API | FR-22–FR-23, AC-18–AC-19 | Safe Administrator list, case-insensitive search, one role filter | users-admin.api.test.ts | Passed locally; dirty tree |
| API-16 | Security | FR-22–FR-23, AC-25 | Non-Administrator and invalid role-filter rejection | users-admin.api.test.ts | Passed locally; dirty tree |
| API-17 | API | FR-24, AC-20 | User creation hashes initial password and sets forced-change state | users-admin.api.test.ts | Passed locally; dirty tree |
| API-18 | Validation | FR-24, AC-20–AC-22 | Duplicate email and invalid create input rejected safely | users-admin.api.test.ts | Passed locally; invalid-field UI not covered |
| API-19 | API | FR-25–FR-26, AC-21–AC-23 | Permitted edit fields and initial-password reset | users-admin.api.test.ts | Passed locally; next-login E2E not rerun |
| API-20 | Security | FR-28, AC-24–AC-25 | Self-deactivation and last-active-Administrator protection | users-admin.api.test.ts | Passed locally; explicit named assertion in verbose output |
| MIG-01 | Migration | FR-33, AC-26 | Static schema/SQL assertions plus Prisma migration deploy/status | migration-regression.test.ts and disposable PostgreSQL run | Passed locally; dirty tree; not final-main |
| MIG-02 | Regression | FR-09–FR-14, AC-06–AC-07 | Existing RequesterUser, Ticket, Attachment IDs, ownership, and continuity through migration | Disposable PostgreSQL before/after assertions plus E2E attachment display | Passed: fixture IDs 7301/7401/7501 and attachment metadata/relationship preserved; dirty tree |
| MIG-03 | Seed | FR-33, AC-26 | Seed fixture counts, idempotence, roles/ownership/authorship, and attachment continuity | migration-regression.test.ts plus two seed runs and SQL assertions | Passed locally: 10 seed users/3 tickets per run; counts and links stable; dirty tree |
| UI-01 | UI | FR-01–FR-04, AC-01–AC-02 | Authenticated Requester shell, safe login error, pending/busy feedback | Login.test.tsx | Passed locally: 3 tests; logout/inactive UI not covered by this file |
| UI-02 | UI | FR-05, AC-03 | Mandatory password gate, valid continuation, mismatch disabled | ChangePassword.test.tsx | Passed locally: 2 tests; dirty tree |
| UI-03 | UI | FR-09–FR-14, AC-06–AC-10 | Requester Public Comment submission and resolution indication | RequesterWorkflow.test.tsx | Passed locally: 2 tests; no attachment-continuity UI assertion |
| UI-04 | UI | FR-15–FR-16, AC-11–AC-12 | Queue filters, empty/no-results feedback | StaffTicketQueue.test.tsx and staff-ticket-flow.spec.ts | Passed locally: UI states plus E2E page-2 navigation with real queue data; sort/filter matrix not exhaustive |
| UI-05 | UI | FR-17–FR-21, AC-13–AC-17 | Public/Private panel separation, claim, status action, Admin read-only detail | StaffTicketDetail.test.tsx | Passed locally: 2 tests; limited operations, no attachment continuity |
| UI-06 | UI | FR-22–FR-28, AC-18–AC-25 | User list/filter, create, edit, reset confirmation | UserManagement.test.tsx | Passed locally: 3 tests; no UI test of safety guards |
| STYLE-01 | UI style | FR-31–FR-32, AC-27 | Palette tokens, focus rule, mobile media rule, sign-in labels/button class | ui-style.test.tsx | Passed locally: 2 tests; does not audit every role screen or badge |
| STYLE-02 | Responsive | FR-32, AC-27 | Viewport behavior and overflow | Local `fixtures.ts` assertion plus E2E; separate auth-gate capture | Passed locally: E2E viewport assertions for Requester, Queue, Detail, and Admin; Login/Change Password layout screenshots use mocked API; dirty tree |
| E2E-01 | E2E | AC-01–AC-05 | Login, initial password, role shell, logout, direct blocking | authentication.spec.ts | Passed in final local 15-test disposable-DB run; not final-main |
| E2E-02 | E2E | AC-06–AC-10 | Requester create/list/detail/comment/resolution and regression | authentication.spec.ts | Passed locally; resolution state has a new actual browser screenshot; not final-main |
| E2E-03 | E2E | AC-11–AC-17 | Queue, detail, claim/reassign, priority/status, comments/notes, Attachment | staff-ticket-flow.spec.ts | Passed locally, including real page-2 and migrated Attachment/operations scenario; not all transition combinations exercised |
| E2E-04 | E2E | AC-18–AC-25 | Admin management, reset, and direct-route restrictions | user-administration.spec.ts plus server API safety tests | E2E list/search/create/edit/reset/direct-route passed; self/last-admin and non-admin denial passed in API tests; no safety-state screenshot |
| E2E-05 | Responsive | AC-27 | Desktop/tablet/mobile E2E captures and overflow assertions | all E2E files | Passed locally: 15 tests, required viewport overflow assertions, dirty-tree evidence only |
| A11Y-01 | Accessibility | FR-31–FR-32, AC-27 | Keyboard/focus audit | z-accessibility-evidence.spec.ts | Passed locally: three keyboard-only journeys and one delayed-login/busy-state test; not final-main |

## 4. Acceptance-Criterion Traceability (historical local-run status)

| AC | Planned/observed coverage | Current status |
|---|---|---|
| AC-01 | API-01, UI-01, E2E-01 | Passed locally for valid login and destination; not final-main |
| AC-02 | API-02, UI-01, E2E-01 | Passed locally for safe invalid/inactive failure; not final-main |
| AC-03 | API-03, UI-02, E2E-01 | Passed locally for mandatory first-login password change; not final-main |
| AC-04 | API-03, UI-01, E2E-01 | Passed locally for logout and blocked return to authenticated content; token-expiry behavior is not exercised |
| AC-05 | UI-01, STYLE-01, E2E-01 | Passed locally for Requester identity and role-specific shell; not final-main |
| AC-06 | API-04, UI-03, E2E-02 | Passed locally for session-derived ticket create, public comment, and resolution indication |
| AC-07 | API-05, MIG-02, E2E-02 | Passed locally: migrated requester/ticket/attachment rows preserved; not final-main |
| AC-08 | API-04–API-05, E2E-02 | Passed locally for session identity and cross-owner API denial; not final-main |
| AC-09 | API-06, API-13–API-14, UI-03, UI-05 | Partial - public comments/Internal Notes are separated and role-checked; append-only behavior is not directly tested |
| AC-10 | API-06, UI-03, E2E-02 | Passed locally; resolution indication is visibly captured and distinct from formal status |
| AC-11 | API-07–API-08, UI-04, E2E-03 | Passed for representative filters and real page-2 navigation; full sort/filter combination matrix remains untested |
| AC-12 | API-09, UI-04, STYLE-02, E2E-03 | Passed locally for role denial, responsive layouts, no-result state, and overflow assertions |
| AC-13 | API-10–API-12, UI-05, E2E-03 | Passed locally for detail rendering and representative staff operations; not final-main |
| AC-14 | API-12, UI-05, E2E-03 | Passed locally for reassignment to active IT Staff and rejection of Requester owner; not final-main |
| AC-15 | API-12, UI-05, E2E-03 | Passed locally for permitted IT Priority update; not final-main |
| AC-16 | API-10–API-11, UI-05, E2E-03 | Partial - permitted NEW-to-OPEN transition passed; exhaustive matrix/confirmation combinations not all run in E2E |
| AC-17 | API-13–API-14, UI-05, E2E-03 | Partial - Staff Notes and Requester denial passed; append-only behavior is not directly tested |
| AC-18 | API-15, UI-06, E2E-04 | Passed locally for Administrator list and fields; not final-main |
| AC-19 | API-15, UI-06, E2E-04 | Passed locally for search and role filtering; not final-main |
| AC-20 | API-17–API-18, UI-06, E2E-04 | Passed locally for create/hash/forced-change and duplicate API input; not final-main |
| AC-21 | API-19, UI-06, E2E-04 | Passed locally for Administrator edits; not final-main |
| AC-22 | API-18–API-19, UI-06, E2E-04 | Partial - duplicate and invalid API input passed; no distinct invalid-field browser screenshot |
| AC-23 | API-19, UI-06, E2E-04 | Partial - reset response and persistent confirmation passed; reset user’s next-login gate is represented by existing UI evidence, not this E2E run |
| AC-24 | API-20, UI-06, E2E-04 | Passed locally in named API tests for self-deactivation and last-active-Administrator protections; no safety-state screenshot |
| AC-25 | API-09, API-16, UI-05, E2E-04 | Passed locally for selected non-Administrator denial and read-only Administrator detail; not final-main |
| AC-26 | MIG-01–MIG-03 | Passed locally: Prisma migration, before/after row preservation, seed counts/idempotence, ownership/authorship, attachment continuity |
| AC-27 | STYLE-01–STYLE-02, A11Y-01, E2E-05 | Passed locally for style rules, required viewports, no-overflow assertions, and three keyboard journeys; evidence remains dirty/local |

## 5. Commands and observed local results (2026-09-29)

Context for every result below: branch `main`, HEAD
`493758be65850504de7b970e50f7a61b846584f0`, dirty working tree. These are
local working-tree results and must not be labelled final-main.

| Working directory | Exact command | Exit/result |
|---|---|---|
| `server` | `npm test -- --run tests/lab-03 --reporter=verbose` | 0; 8 files, 26 tests passed at 17:20:10 Asia/Bangkok |
| `client` | `npm test -- --run tests/lab-03 --reporter=verbose` | 0; 7 files, 16 tests passed at 17:20:10 Asia/Bangkok |
| `server` | `npm run build` | 0; TypeScript build passed |
| `client` | `npm run build` | 0; TypeScript and Vite build passed, 31 modules |
| `server` | `npx prisma validate` with process-local `DATABASE_URL=postgresql://lab3:lab3@127.0.0.1:5432/toktickit_audit?schema=public` | 0; schema valid; no database connection made |
| `server` | `npx prisma validate` without `DATABASE_URL` | 1; setup error P1012, environment variable absent; rerun above succeeded |
| repository root | `docker ps --filter name=toktickit-postgres --format '{{.Names}} {{.Status}}'` | Exit 0; Docker Postgres container running |
| `server` | `npx prisma migrate resolve --applied 20260824000000_lab2_foundation`; `npx prisma migrate deploy` | Exit 0 on new `toktickit_lab3_migration_recheck_20260929`; initial unbaselined deploy failed P3005 and is logged |
| `server` | `npx prisma migrate status` | Exit 0; database schema up to date |
| `server` | `npm run prisma:seed` twice | Final two runs exit 0; 10 users/3 tickets each; initial P2002 fixture-sequence setup failure and correction are logged |
| repository root | `npm run test:e2e` | Final fixture-ready run exit 0; 15 passed in 24.6s on `toktickit_lab3_e2e_recheck2_20260929`; earlier missing-fixture run retained |

### Disposable database observations

Migration/data-preservation checks used the newly created
`toktickit_lab3_migration_recheck_20260929` database. The Lab 2 baseline was
applied before synthetic Requester 7301, Ticket 7401, and Attachment 7501 were
inserted and snapshotted. Prisma then recorded the applied Lab 2 baseline,
deployed the Lab 3 migration, and reported the schema up to date. Before/after
values show the same IDs, Requester identity/active state, Ticket number,
requester/category/system links, requested priority/status/summary, and
Attachment filename/storage key/type/size/ticket link. Lab 3 supplied the
expected Requester role/password-change defaults and Ticket IT-priority/owner
defaults. This is disposable-database preservation evidence, not a static
source-string assertion.

Before seeding, the migration database had 1 user, 1 ticket, and 1 attachment,
with no comments or internal notes. Both final seed runs reported 10 users and
3 tickets. After the second run, totals were 11 users, 4 tickets, 5 categories,
7 systems, and 1 attachment. The 10 seeded users were 5 Requesters, 4 IT Staff,
and 1 Administrator; seeded tickets had valid Requester/owner relations, with
3 public comments, 3 internal notes, and no invalid user references. The
preserved Attachment remained linked to its original Ticket. Counts and links
were stable after the second run. An initial seed attempt failed P2002 because
the synthetic fixture sequences had not been advanced; only those sequences
were corrected in this disposable DB before the two successful runs.

The final E2E run used a separate clean clone,
`toktickit_lab3_e2e_recheck2_20260929`, with 21 deterministic queue fixtures
and the expected baseline ticket/Attachment labels. All 15 tests passed in
24.6 seconds at 21:56 on 2026-09-29. A first fresh clone lacked those test
prerequisites: 13 passed and 2 failed because the queue was not three pages
and the expected baseline label was absent. That failure and its trace were
retained at `output/docs/evidence-20260929/failed-e2e-recheck/`; the
fixture-ready rerun passed. Results are current dirty-tree evidence only, not
evidence from committed `main`.

The historical 2026-09-21 release record summarizes 22 server tests, 11 client
tests, and nine E2E tests; its full raw output is unavailable. Current local
records preserve the failed wrong-directory launch, the initial 6-pass/7-fail
order-dependent run, and two 14-pass/1-fail runs while the operations scenario
was refined. The additional 2026-09-29 fresh-clone setup failure (13/15) was
caused by omitted deterministic Queue/migration labels and is also retained.
Corrections moved keyboard checks after first-login flows, used
the seeded initial password for the first Administrator login, and matched the
exact accessible control/status text. The final clean-database run passed all
15 tests. See the raw-output appendix; failures were not silently relabeled.

## 6. Evidence Rules

- Record date, branch, commit SHA, command, exit status, and relevant output.
- Store E2E screenshots under artifacts/lab-03/screenshots/ using stable
  screen and viewport names.
- Keep failed, deferred, unavailable, and partially evidenced checks visible.
- Keep setup failures and partial visual/a11y evidence visible.
- A final result is accepted only when the exact test or visual capture exists
  on the documented branch.
- Do not use static migration source checks as proof that database rows or
  Attachment relationships survived.
- Do not call a dirty-tree test result final-main; after reviewed integration,
  rerun against the committed `main` revision and retain complete output.

## 7. Final-main verification (2026-09-30)

Commit: `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02` (`origin/main`, detached
HEAD). Verification ran in the isolated checkout
`C:\Users\Jitvoottikrai\AppData\Local\Temp\toktickit-main-verify-0353a40`.
Git status was clean before and after the commands. The original Lab 3
worktree was not modified. Node was `v24.14.0`; npm was `11.9.0`. All times
emitted by Vitest are local Asia/Bangkok time (UTC+7).

### Passing Lab 3 server tests

Working directory: `server`. Command: `npm test -- --run tests/lab-03 --reporter=verbose`.
Exit code: 0.

```text
> toktickit-server@1.0.0 test
> vitest run --run tests/lab-03 --reporter=verbose

RUN  v2.1.9 C:/Users/Jitvoottikrai/AppData/Local/Temp/toktickit-main-verify-0353a40/server

✓ tests/lab-03/migration-regression.test.ts > Lab 3 migration and seed contract > maps the canonical User model to the Lab 2 table and preserves ownership fields
✓ tests/lab-03/migration-regression.test.ts > Lab 3 migration and seed contract > keeps role fixtures and local-only initial credentials in the idempotent seed
✓ tests/lab-03/auth.unit.test.ts > Lab 3 authentication primitives > normalizes email consistently
✓ tests/lab-03/auth.unit.test.ts > Lab 3 authentication primitives > enforces the documented password boundaries and composition
✓ tests/lab-03/auth.unit.test.ts > Lab 3 authentication primitives > stores a salted scrypt digest rather than the supplied password
✓ tests/lab-03/auth.unit.test.ts > Lab 3 authentication primitives > verifies the correct password and rejects wrong or malformed digests
✓ tests/lab-03/staff-queue.api.test.ts > Lab 3 IT Staff Queue > enforces staff-only access and returns filtered paginated queue data
✓ tests/lab-03/staff-queue.api.test.ts > Lab 3 IT Staff Queue > rejects invalid queries before touching ticket data
✓ tests/lab-03/staff-queue.api.test.ts > Lab 3 IT Staff Queue > does not expose the Queue to Requesters or Administrators
✓ tests/lab-03/comments-notes.api.test.ts > Lab 3 Public Comments and Internal Notes > keeps Internal Notes on separate staff endpoints and records the session author
✓ tests/lab-03/comments-notes.api.test.ts > Lab 3 Public Comments and Internal Notes > does not allow Requesters to read staff notes
✓ tests/lab-03/authorization.api.test.ts > Lab 3 Requester authorization > uses session identity for Ticket creation and ignores requesterId input
✓ tests/lab-03/authorization.api.test.ts > Lab 3 Requester authorization > returns the same safe not-found response for cross-requester Ticket access
✓ tests/lab-03/authorization.api.test.ts > Lab 3 Requester authorization > returns Public Comments only and records a requester resolution indication
✓ tests/lab-03/staff-ticket-detail.api.test.ts > Lab 3 IT Staff Ticket Detail > requires the approved confirmation and transition matrix on the backend
✓ tests/lab-03/staff-ticket-detail.api.test.ts > Lab 3 IT Staff Ticket Detail > updates a permitted status only when the current state still matches
✓ tests/lab-03/staff-ticket-detail.api.test.ts > Lab 3 IT Staff Ticket Detail > rejects requester owners and allows a permitted priority update
✓ tests/lab-03/auth.api.test.ts > Lab 3 authentication contract > requires CSRF and returns safe user data on login
✓ tests/lab-03/users-admin.api.test.ts > Lab 3 Administrator User Management API > lists safe users with case-insensitive search and one role filter
✓ tests/lab-03/auth.api.test.ts > Lab 3 authentication contract > uses the same safe 401 for missing and inactive accounts
✓ tests/lab-03/auth.api.test.ts > Lab 3 authentication contract > gates normal routes until password change and revokes the old session
✓ tests/lab-03/users-admin.api.test.ts > Lab 3 Administrator User Management API > rejects non-Administrators and invalid role filters
✓ tests/lab-03/users-admin.api.test.ts > Lab 3 Administrator User Management API > creates an active user with a hashed initial password and forced change
✓ tests/lab-03/users-admin.api.test.ts > Lab 3 Administrator User Management API > rejects duplicate email and invalid create input safely 574ms
✓ tests/lab-03/users-admin.api.test.ts > Lab 3 Administrator User Management API > edits permitted account fields and resets the initial password 387ms
✓ tests/lab-03/users-admin.api.test.ts > Lab 3 Administrator User Management API > blocks self-deactivation and removal of the last active Administrator 408ms

Test Files  8 passed (8)
     Tests  26 passed (26)
  Start at  22:59:47
  Duration  3.46s (transform 573ms, setup 0ms, collect 4.35s, tests 3.07s, environment 2ms, prepare 2.41s)
```

### Passing Lab 3 client tests

Working directory: `client`. Command: `npm test -- --run tests/lab-03 --reporter=verbose`.
Exit code: 0.

```text
> toktickit-client@1.0.0 test
> vitest run --run tests/lab-03 --reporter=verbose

RUN  v2.1.9 C:/Users/Jitvoottikrai/AppData/Local/Temp/toktickit-main-verify-0353a40/client

✓ tests/lab-03/ui-style.test.tsx > Lab 3 Zen Green styling and responsive rules > defines the documented palette, visible focus treatment, and mobile layout
✓ tests/lab-03/ui-style.test.tsx > Lab 3 Zen Green styling and responsive rules > renders accessible sign-in controls with the primary action hierarchy
✓ tests/lab-03/Login.test.tsx > Lab 3 Login > shows the login form and enters the authenticated Requester shell without a selector
✓ tests/lab-03/Login.test.tsx > Lab 3 Login > shows a safe login failure
✓ tests/lab-03/UserManagement.test.tsx > Lab 3 Administrator User Management > lists users, applies search and role filters, and keeps the direct detail entry point
✓ tests/lab-03/ChangePassword.test.tsx > Lab 3 mandatory Change Password > blocks the normal shell until a valid replacement password is saved
✓ tests/lab-03/ChangePassword.test.tsx > Lab 3 mandatory Change Password > shows confirmation mismatch and keeps the save action disabled
✓ tests/lab-03/Login.test.tsx > Lab 3 Login > shows and disables the visible sign-in busy state while authentication is pending
✓ tests/lab-03/RequesterWorkflow.test.tsx > Lab 3 Requester ticket regression > adds a public comment to the owned ticket and never renders Internal Notes
✓ tests/lab-03/StaffTicketQueue.test.tsx > Lab 3 IT Staff Ticket Queue > loads the authenticated Staff Queue and sends the documented filters
✓ tests/lab-03/StaffTicketQueue.test.tsx > Lab 3 IT Staff Ticket Queue > distinguishes an empty Queue from a filtered no-result state
✓ tests/lab-03/UserManagement.test.tsx > Lab 3 Administrator User Management > creates a user with clear initial-password behavior
✓ tests/lab-03/RequesterWorkflow.test.tsx > Lab 3 Requester ticket regression > shows the Requester resolution indication after the API confirms it
✓ tests/lab-03/StaffTicketDetail.test.tsx > Lab 3 Staff Ticket Detail > keeps public comments and Internal Notes separate and supports staff operations 378ms
✓ tests/lab-03/UserManagement.test.tsx > Lab 3 Administrator User Management > edits an account and exposes reset initial password as a separate action
✓ tests/lab-03/StaffTicketDetail.test.tsx > Lab 3 Staff Ticket Detail > keeps Administrators out of the Queue and exposes only direct read-only detail

Test Files  7 passed (7)
     Tests  16 passed (16)
  Start at  22:59:50
  Duration  3.42s (transform 843ms, setup 2.01s, collect 3.27s, tests 2.34s, environment 10.06s, prepare 2.34s)
```

### Build and schema validation output

Server working directory: `server`. Command: `npm run build`. Exit code: 0.

```text
> toktickit-server@1.0.0 build
> tsc
```

Client working directory: `client`. Command: `npm run build`. Exit code: 0.

```text
> toktickit-client@1.0.0 build
> tsc && vite build
vite v6.4.3 building for production...
transforming...
✓ 31 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.41 kB │ gzip:  0.28 kB
dist/assets/index-LW7_0rpz.css  241.29 kB │ gzip: 33.52 kB
dist/assets/index-CdRWtPuy.js   201.34 kB │ gzip: 58.68 kB
✓ built in 1.30s
```

Server working directory: `server`. Command: `npm exec prisma validate` with
`DATABASE_URL` unset. Exit code: 1; Prisma returned P1012 because the required
environment variable was missing. No database was contacted.

Rerun: set a process-local placeholder
`DATABASE_URL=postgresql://lab3:lab3@127.0.0.1:5432/toktickit_verify`, then run
`npm exec prisma validate`. Exit code: 0. This command validated the schema
only and did not connect to the URL.

```text
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid.
```

### Unfiltered suite outcome and unavailable database checks

`npm test` in `server` exited 1: 18 test files, 35 of 45 tests passed; 10
Lab 2 API tests returned 401 where their existing tests expected 200, 400, or
404 using the pre-session requester context. `npm test` in `client` exited 1:
14 test files, 16 of 31 tests passed; 15 Lab 1/2 UI tests did not satisfy the
new session/auth startup and remained at loading or `fetch failed`. These
legacy test files were not modified. The Lab 3-only results above remain
passing, but the combined repository test run is **not green**.

Repository root command: `docker info`. Exit code: 1. Docker reported that the
API pipe `npipe:////./pipe/docker_engine` / `//./pipe/docker_engine` could not
be found. As a result, no final-main database migration, migration status,
data-preservation assertion, seed-twice run, or Playwright E2E run was made.
The passing 2026-09-29 disposable-database/E2E run remains historical dirty-
tree evidence, not a pass for this commit.

### Current final-main criterion boundary

Direct Lab 3 unit/API/client assertions represented by the 42 focused tests
passed on `0353a40`. AC01-AC25 therefore have relevant direct-test coverage on
main, but remain only partially evidenced where the criterion additionally
requires an integrated E2E path, real database state, or a dedicated visible
screenshot. AC26 remains incomplete on main because migration/data preservation
and seed idempotence were not rerun. AC27 remains partial because the current
main responsive/keyboard E2E checks and fresh visual captures were not run.
Older local captures/tests and their explicit boundaries remain in the
historical tables above; they are not silently promoted to final-main passes.

## 8. Supplemental test plan before local repairs (2026-10-01)

These additions address the remaining labsheet coverage gaps. They are planned
against the approved specification before or alongside the repairs. Their
results belong to the local correction branch until reviewed integration;
they must not be described as results from committed `main`.

| ID | Requirement / AC | Planned assertion | Actual target file |
|---|---|---|---|
| REG-01 | FR-09–FR-14, AC-06–AC-08 | Retain ticket/attachment validation, ownership, filters, and pagination using authenticated sessions; reject the old identity header | Existing server/client Lab 1/2 regression files and lab-03/regression-fixtures.ts helpers |
| AUTH-04 | FR-04, BR-08, AC-04 | Expired, revoked, and inactive-user sessions cannot access protected data; logout revokes the session and clears its cookie | server/tests/lab-03/auth.api.test.ts |
| CONTENT-01 | BR-16–BR-18, AC-09, AC-17 | Comments/notes reject whitespace and overlength input, enforce session author and backend timestamp, reject edit/delete requests, and render markup as text | server/tests/lab-03/comments-notes.api.test.ts; client/tests/lab-03/RequesterWorkflow.test.tsx |
| QUEUE-04 | FR-16, AC-11 | Every documented sort field/direction and filter is applied; invalid query values fail before ticket queries; combined owner filters preserve both conditions | server/tests/lab-03/staff-queue.api.test.ts |
| STATUS-04 | BR-22–BR-24, AC-16 | All eight-status source/target pairs follow the approved matrix; terminal transitions require confirmation; concurrent changes fail safely | server/tests/lab-03/staff-ticket-detail.api.test.ts |
| OWNER-04 | BR-19–BR-21, AC-14–AC-15 | Active Staff/Admin owners accepted, inactive/Requester owners rejected, unassignment permitted, role restrictions and IT Priority boundaries enforced | server/tests/lab-03/staff-ticket-detail.api.test.ts |
| ADMIN-04 | FR-26–FR-28, AC-23–AC-25 | Reset account cannot enter the app before changing the new initial password; both non-Administrator roles are denied; last Administrator demotion is rejected | e2e/lab-03/user-administration.spec.ts; server/tests/lab-03/users-admin.api.test.ts |
| FIXTURE-01 | AC-26 and E2E reproducibility | Prepare only an explicitly disposable, migrated and unexercised database; preserve the migration baseline; populate queue data and look up users by email without rewriting IDs | server/prisma/prepare-lab3-e2e.ts; server/tests/lab-03/e2e-fixtures.unit.test.ts; e2e/lab-03/fixtures.ts |

The full baseline failures and subsequent reruns are retained under
`output/docs/evidence-20261001-step1-2/`. Final execution status will be added
after the corresponding commands finish. Browser and database results from
earlier commits remain separately identified.
## Local repair verification — 2026-10-01

These results are from a dirty local working tree based on `1fb8df040eb12ac443bb4246a314babfde1564e9`, not final committed main evidence. Full output is retained under `output/docs/evidence-20261001-step1-2/`.

- Server: `npm test -- --reporter=verbose`, 19 files / 190 tests passed, exit 0 (`server-full-rerun.txt`). Includes authenticated Lab 2 regression, session rejection/revocation, content validation, status transition matrix, Queue filters/sorting, Administrator denial/protection, and disposable-fixture safeguards.
- Client: `npm test -- --reporter=verbose`, 14 files / 32 tests passed, exit 0 (`client-full-rerun.txt`). Includes Requester comments/resolution and safe text rendering, rather than attributing these to Login tests.
- Server and client: `npm run build`, both exit 0 (`server-build.txt`, `client-build.txt`).
- Repository root: `npx --no-install playwright test e2e/lab-03 --list`, 15 scenarios discovered, exit 0 (`e2e-discovery.txt`). **Discovery only: updated browser scenarios have not been executed in this repair run.**
- Baseline failures and the owner-filter red test output are retained, not replaced by successful reruns. The combined exact-owner/ownership filter implementation was corrected after the new tests exposed it.
- Migration preservation, seed assertions, fixture preparation against PostgreSQL, screenshots, and integrated browser execution remain pending the subsequent Docker-backed verification step. See `e2e/lab-03/README.md` for the reproducible fixture workflow.
