# Actions Taken foundation

This implementation follows the reviewed Lab 4 contract and completes Issue #52.
PR #57 was approved and merged to `lab4-staging` on 2026-10-30 as merge commit
`41a3ad567355457be7d4838dadd6f810dfa35aea`. This branch was rebased onto that staging tip.

## Implementation

The API persists Actions Taken and immutable actor attribution, validates active Staff/Admin assignees,
normalizes effective timestamps to UTC, and exposes only display-safe identity data.
Requester lists are owner-scoped; Requesters cannot mutate actions.
Actions and append-only events commit together. Terminal actions are read-only.
Every accepted write uses the Ticket workflowVersion compare-and-set plus the action version.
The later Ticket workflow PR must use the same Ticket compare-and-set when enforcing resolution.

Create requests require an Idempotency-Key (1–128 ASCII letters/digits or . _ : -).
Keys are scoped to authenticated actor and Ticket and stored as SHA-256 hashes.
Matching normalized payloads replay the original saved response, including after later edits.
A different payload with the same key returns 409. Unknown/client attribution fields are ignored.
GET /api/tickets/:ticketId/action-assignees supplies id/name choices for active Staff/Admin only,
and requires Staff/Admin access to the Ticket. This endpoint supports the Actions Taken UI in Issue #53.

The additive migration creates ActionTaken, ActionTakenEvent and ActionCreateRequest, plus
Ticket.workflowVersion. Resolution fields and formal Ticket workflow remain in the later workflow unit.
No legacy actions or resolution dates are fabricated. A database trigger rejects event updates/deletes.
Stable-key synthetic seeds cover zero/one/multiple actions and all four lifecycle states.
Existing action fixtures and their audit events are preserved on subsequent seed runs.

## Verification

PowerShell from the repository root:
    $env:LAB4_DB_TEST = '1'
    npm --prefix server test
    npm --prefix server run build

Observed: 227 tests in 20 files passed, including 37 real PostgreSQL API checks; server build passed.
Prisma format, generate and validate passed.
After adding real backup/restore assertions, the focused 37 checks passed again:
    npm --prefix server test -- tests/lab-04/actions-taken.api.test.ts

The integration suite is opt-in; without LAB4_DB_TEST=1 its 37 database cases are skipped.
It uses the local toktickit-postgres Docker container and creates a fresh
toktickit_lab4_prep_<timestamp> database. It reads credentials internally without printing them.
It retains databases for inspection and does not reset or alter an existing application database.

Checks include: preservation of Users/Tickets/Attachments/Comments/Notes; no fabricated actions;
failed-migration transaction rollback; pg_dump backup restored into a second new database with
identical legacy records; twice-run seeds; roles/ownership/CSRF; validation; all 16 lifecycle edges;
stale/cross-Ticket writes; simultaneous edits and duplicate creates; append-only events;
atomic rollback of Ticket version, action and event after a controlled persistence failure.

Latest focused database: toktickit_lab4_prep_1793360631129
Restored prior-schema copy: toktickit_lab4_prep_1793360631129_recovery
Raw local logs: output/lab4-prep/server-tests.txt, server-build.txt, final-focused-tests.txt.
These are local source checks with real PostgreSQL and in-process Supertest, not GitHub CI or browser E2E.
Client/browser suites have not been run for this backend-only preparation.

## Recovery procedure

Before deployment, stop writes and take a pg_dump backup of the intended database; record the
application revision and migration state. Keep that backup separate from subsequent rollout data.
If this migration fails before COMMIT, verify rollback and preserve the failure log.
For recovery beyond a transactional failure, restore the pre-migration backup into a new database,
verify row/relationship snapshots, and run the prior application revision against the restored copy.
Preserve the failed rollout database and reconcile any writes made after the backup before switching.
Do not drop new tables or pretend a reverse migration preserves post-deployment actions.

## PR handoff

Base: `lab4-staging` at `41a3ad5`.
This PR targets `lab4-staging` and should list Issue #52 under Development. Verify that relationship
after opening the PR; closing keywords alone may not create it for a non-default target branch.
Review replies and fixes stay on this branch and PR; an independent peer approves and merges.
