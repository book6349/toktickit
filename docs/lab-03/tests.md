# Lab 3 Test Plan, Traceability, and Results

Status: Test DD created before Lab 3 implementation. This revision audits each
matrix row against the actual assertion and path. The results below are from
the dirty local working tree on 2026-09-29, branch `main` at HEAD
`493758be65850504de7b970e50f7a61b846584f0`; they are not results from that
committed SHA. Docker-backed migration/data-preservation, seed-twice,
integrated E2E, responsive-overflow, and keyboard checks were run against
uniquely named disposable databases on 2026-09-29. The final integrated run
passed 15 tests. These are local dirty-tree results, not final-main evidence.
The earlier 2026-09-21 final-main record remains historical summary evidence;
its complete raw output is not retained here.

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

## 3. Test Matrix

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

## 4. Acceptance-Criterion Traceability

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
