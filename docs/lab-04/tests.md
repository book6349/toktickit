# Lab 4 Test Plan

Status: On 2026-10-31, the final regression passed on the PR6 branch. The server suite passed 306 tests across 23 files, including all 37 PostgreSQL-backed Actions Taken checks; the client suite passed 58 tests; both production builds and Prisma validation passed; and all 21 Lab 2–4 Playwright tests passed against a fresh disposable PostgreSQL database. The built server start command returned a successful health response. GitHub CI and verification on `main` remain pending until review and merge.

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
| T-18 | AC-06, AC-08 | Requester dashboard labels/definitions, zero and empty states, accessible drill-down links and UTC/as-of context. `client/tests/lab-04/RequesterDashboard.test.tsx` | Passed |
| T-19 | AC-06, AC-08 | Staff/Admin metric cards, active status/priority breakdown, own actions, empty states and drill-downs. `client/tests/lab-04/StaffDashboard.test.tsx` | Passed |
| T-20 | AC-08 | Keyboard access, accessible labels/live regions/focus, status text not color-only, reduced motion and narrow layout style rules. `client/tests/lab-04/ui-style.test.tsx` | Passed |
| T-21 | AC-01, AC-02, AC-03, AC-08 | Staff records multiple actions; Requester sees the same history read-only; responsive widths are checked and desktop/tablet/mobile evidence is captured. `e2e/lab-04/actions-taken-flow.spec.ts` | Passed |
| T-22 | AC-04, AC-05, AC-08 | Complete Ticket resolution, close and reopen journey; blocked resolution, retained public history, and Requester write denial. `e2e/lab-04/ticket-resolution.spec.ts` | Passed |
| T-23 | AC-06, AC-08 | Requester and Staff dashboard metrics render, and active/unassigned drill-downs include the expected Tickets. `e2e/lab-04/dashboards.spec.ts` | Passed |
| T-24 | AC-09 | Lab 1–3 server/client suites, both builds, and ordered Lab 2–4 browser regression pass after integration. Exact output is retained in `output/evidence/lab4-pr6-validation-final.log` and `output/evidence/lab4-pr6-e2e-final.log`; browser database: `toktickit_lab3_e2e_pr6_20261031_195735`. | Passed |
| T-25 | AC-10 | Release checklist checks dated run evidence, reviewer disposition, actual AI-use record and no unsupported pass claims. `docs/lab-04/reviewer.md` and `docs/lab-04/ai-use.md` | Planned |
| T-26 | AC-09 | `npm start` launches the compiled server entrypoint and `GET /api/health` returns `{"status":"ok","service":"TokTickIT API"}` using a fresh local database initialized by the documented setup. | Passed |

## 3. Coverage notes

- AC-01 through AC-10 each map to one or more test rows above.
- For every role-protected route, include unauthenticated, unauthorized and valid-role cases.
- For every mutation, assert both response and persisted state, including absence of partial writes on failure.
- For every dashboard metric, compare returned counts to fixture rows and verify that detail filters use the same predicates.
- For timestamp tests, freeze `asOfUtc` and cover the exact inclusive boundary, one instant before, one instant after and future dates.
- Migration tests must begin with realistic prior-schema data, including resolved/closed Tickets with no real resolution timestamp.
- Browser tests use deterministic synthetic fixtures in a new local database. Preparation refuses an existing database and leaves the created database available for evidence review; it never resets a shared database.
- The PR6 regression captured 24 real Lab 4 screenshots: eight screen states at desktop, tablet and mobile sizes. See [the screenshot index](screenshots.md).

## 4. Status vocabulary

`Planned` = not yet run. `Passed` or `Failed` requires an observed run and recorded revision. `Blocked` requires the blocker and evidence to be documented. Do not mark this plan complete while required rows are Planned, Failed or Blocked.
