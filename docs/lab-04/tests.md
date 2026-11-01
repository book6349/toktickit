# Lab 4 Test Plan

Status: T-20 and T-25 Passed on 31 October 2026. Candidate 3ddd3930b2c83d3193164257d3bf7dd3bcfb14e9 passed 306 server, 66 client and 22 browser tests, both builds, Prisma validation and production health. The project board shows Issues #51–#56 Done. See release-evidence.md for commands, logs, review history and the pending peer-review/merge boundary of this follow-up.

Related: [engineering specification](specification.md), [API contract](api-spec.md), [UI contract](ui-spec.md).

## 1. Test strategy

Tests are added with the implementing Issues. Server tests prove validation, authorization, transactionality, data integrity and authoritative calculations. Client tests prove controls, states and accessibility affordances. Browser tests prove complete role-based journeys. A migration regression starts from representative Lab 3 data and verifies it after migration. Each row has an explicit final status; all start as Planned and must be updated only from actual run results.

Run named tests and the existing Lab 1–3 regression suites before release. Record exact command, date, revision, result and evidence location in the eventual release record. Do not infer a pass from code review or a successful build.

## 2. Acceptance-criterion traceability

| Test ID | Acceptance criterion | Planned test and intended file | Final status |
|---|---|---|---|
| T-01 | AC-01 | Server creates action; session actor immutable; active assignee validation; required fields; version 1; one creation event. `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| T-02 | AC-01, AC-03 | Action field validation, trimming/length boundaries, offset timestamp normalization, follow-up conditional note and attachment note limits. `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| T-03 | AC-02 | Requester sees ordered actions for owned Ticket; empty list; cross-owner and nonexistent Ticket both safe 404; Requester cannot POST/PATCH/transition. `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| T-04 | AC-03 | PLANNED/IN_PROGRESS lifecycle matrix, terminal COMPLETED/CANCELLED, no hard delete, exactly one event and version increment per accepted write. `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| T-05 | AC-03 | Concurrent stale edit/transition yields 409 and no partial event/data update; same idempotency key/payload returns original; different payload conflicts. `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| T-06 | AC-04 | Every allowed and disallowed Ticket transition; only IT Staff can write status; administrator/requester forbidden; version conflict returns 409. `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| T-07 | AC-05 | RESOLVED requires confirm, summary, completed action and no planned/in-progress actions; cancelled actions do not block. `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| T-08 | AC-05 | CLOSED gate, reopen reason, server-side resolvedAt/resolvedById, retained workflow history and confirmation requirements. `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| T-09 | AC-06 | Requester counts and drill-downs are owner scoped; active status definition; zero/empty values; not limited by list pagination. `server/tests/lab-04/requester-dashboard.api.test.ts` | Passed |
| T-10 | AC-06 | Requester 7-day and 30-day exact lower/upper boundaries, future exclusion, null resolvedAt exclusion, reopened Ticket exclusion, stable top-five order. `server/tests/lab-04/requester-dashboard.api.test.ts` | Passed |
| T-11 | AC-06 | Staff/Admin unassigned, assigned-to-me, per-status/priority and own-action metrics; zero values; full-count query and filter drill-down. `server/tests/lab-04/staff-dashboard.api.test.ts` | Passed |
| T-12 | AC-06 | Staff recent active 7-day boundaries, future exclusion and stable top-five order; Administrator receives Staff data without user-account counts. `server/tests/lab-04/staff-dashboard.api.test.ts` | Passed |
| T-13 | AC-07 | Apply additive migration to representative Lab 3 database; preserve all prior ids, relations and statuses; create no fabricated actions/resolution dates; recover from failed migration. `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| T-14 | AC-07 | Seed twice with stable keys; no duplicate Users, Tickets, actions or events. `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| T-15 | AC-08 | Requester read-only state, no mutation controls, ordered action history and empty state. `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| T-16 | AC-01, AC-03, AC-08 | Action form conditional fields, server validation, retained input, pending/double-submit, safe failure and conflict review state. `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| T-17 | AC-05, AC-08 | Resolution gate summary/blocker links, confirmation, advisory feedback and reopen reason UX. `client/tests/lab-04/TicketWorkflow.test.tsx` | Passed |
| T-18 | AC-06, AC-08 | Requester dashboard metrics, empty/loading/error/forbidden states, failed refresh retains metrics, retry and drill-down filter recovery. client/tests/lab-04/RequesterDashboard.test.tsx | Passed |
| T-19 | AC-06, AC-08 | Staff dashboard metrics, actor/assignee labels, loading/error/forbidden states, retained metrics and filter-preserving retry. client/tests/lab-04/StaffDashboard.test.tsx | Passed |
| T-20 | AC-08 | Dedicated keyboard/focus, named regions/forms and labels, alert/aria-invalid validation, reduced motion and 320px overflow checks. e2e/lab-04/zz-accessibility.spec.ts and e2e/lab-04/evidence.ts | Passed |
| T-21 | AC-01, AC-02, AC-03, AC-08 | Staff records multiple actions; Requester sees the same history read-only; responsive widths are checked and desktop/tablet/mobile evidence is captured. `e2e/lab-04/actions-taken-flow.spec.ts` | Passed |
| T-22 | AC-04, AC-05, AC-08 | Complete Ticket resolution, close and reopen journey; blocked resolution, retained public history, and Requester write denial. `e2e/lab-04/ticket-resolution.spec.ts` | Passed |
| T-23 | AC-06, AC-08 | Requester and Staff dashboard metrics render, and active/unassigned drill-downs include the expected Tickets. `e2e/lab-04/dashboards.spec.ts` | Passed |
| T-24 | AC-09 | Final candidate 3ddd3930b2c83d3193164257d3bf7dd3bcfb14e9: 306 server, 66 client, 22 browser tests, builds, Prisma and health; complete output in output/evidence/lab4-release-*.log. | Passed |
| T-25 | AC-10 | Release checklist, dated commands/revision, closed Issues and Done board, PR #57–#64 reviewer disposition, actual AI record and honest release limits. docs/lab-04/release-evidence.md | Passed |
| T-26 | AC-09 | Compiled server at candidate revision: node dist/src/index.js; GET /api/health HTTP 200 and status=ok. output/evidence/lab4-release-health.log | Passed |

## 3. Historical main verification before this follow-up

The release was promoted by [PR #63](https://github.com/book6349/toktickit/pull/63) to main at commit `6e66c2cf187c0a83e6ea36c4a6c6711f886c0866` on 2026-10-31. PR #62 was reviewed and merged into lab4-staging first. The local runs below used this exact main revision on 2026-10-31 (Bangkok time, UTC+07:00).

| Check | Exact command and environment | Observed result | Complete output |
|---|---|---|---|
| Server and PostgreSQL suite | In server/: `npm test -- --reporter=dot`; LAB4_DB_TEST=1; local PostgreSQL test service | 23 files and 306 tests passed, including 37 PostgreSQL checks; started 22:31:48 | [Server log](../../output/evidence/lab4-main-server-tests.log) |
| Client suite | In client/: `npm test -- --reporter=dot` | 18 files and 58 tests passed; started 22:32:12 | [Client log](../../output/evidence/lab4-main-client-tests.log) |
| Browser regression | From repository root: `npm run test:e2e`; fresh database toktickit_lab3_e2e_main_20261031222922; one worker | 21 Lab 2–4 Playwright tests passed; exit code 0 | [Browser log](../../output/evidence/lab4-main-e2e-final.log) |
| Server build | In server/: `npm run build` | Passed; exit code 0 | [Server build log](../../output/evidence/lab4-main-server-build.log) |
| Prisma schema | In server/: `npx prisma validate` | Schema valid; exit code 0 | [Prisma log](../../output/evidence/lab4-main-prisma-validate.log) |
| Client build | In client/: `npm run build` | TypeScript and Vite production build passed; exit code 0 | [Client build log](../../output/evidence/lab4-main-client-build.log) |
| Production health | In server/: `npm start`, then GET http://localhost:3000/api/health | HTTP 200; `{"status":"ok","service":"TokTickIT API"}`; exit code 0 | [Health log](../../output/evidence/lab4-main-health.log) |

At that earlier main run, T-20 and board verification were still pending. The release-evidence.md record supersedes that historical limitation: T-20 now passes and the six Lab 4 Issues are verified in Done. GitHub CI still has no reported checks.
## 4. Coverage notes

- AC-01 through AC-10 each map to one or more test rows above.
- For every role-protected route, include unauthenticated, unauthorized and valid-role cases.
- For every mutation, assert both response and persisted state, including absence of partial writes on failure.
- For every dashboard metric, compare returned counts to fixture rows and verify that detail filters use the same predicates.
- For timestamp tests, freeze `asOfUtc` and cover the exact inclusive boundary, one instant before, one instant after and future dates.
- Migration tests must begin with realistic prior-schema data, including resolved/closed Tickets with no real resolution timestamp.
- Browser tests use deterministic synthetic fixtures in a new local database. Preparation refuses an existing database and leaves the created database available for evidence review; it never resets a shared database.
- The report retains 24 real Lab 4 screenshots across eight states and three viewports. They were captured on code candidate a988031; client, server, and E2E sources have no differences through main. See [the screenshot index](screenshots.md).

## 5. Status vocabulary

`Planned` = not yet run. `Passed` or `Failed` requires an observed run and recorded revision. `Blocked` requires the blocker and evidence to be documented. Do not mark this plan complete while required rows are Planned, Failed or Blocked.

## 6. Completed release evidence

Final implementation 3ddd3930b2c83d3193164257d3bf7dd3bcfb14e9: [release checklist](release-evidence.md), [validation output](../../output/evidence/lab4-release-validation.log), [22-test browser output](../../output/evidence/lab4-release-e2e.log). The follow-up awaits human review and merge; these are candidate results, not a claim that the unmerged code is on main.
