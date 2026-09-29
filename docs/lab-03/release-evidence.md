# Lab 3 Release and Verification Evidence

Status: The original GitHub release is historically complete. A post-audit
correction is now open as PR #47 to `lab3-staging`, linked to reopened Issue
#40, and awaits Punge089's review. The next release PR to `main` is not open.
Section 2 preserves the 2026-09-21 final-main audit summary; it is not a raw log
and does not certify the dirty local audit tree inspected on 2026-09-29.
Section 6 records later dirty-tree Docker migration/data-preservation,
seed-twice, and 15-test E2E passes.

## 1. Release snapshot

- Audit date: 2026-09-21 (Asia/Bangkok)
- Final branch: `main`
- Final commit: `493758be65850504de7b970e50f7a61b846584f0`
- Release source: `lab3-staging`
- Release PR: [#46](https://github.com/book6349/toktickit/pull/46)
- Release merge: `493758b`
- Feature PRs: [#41](https://github.com/book6349/toktickit/pull/41),
  [#42](https://github.com/book6349/toktickit/pull/42),
  [#43](https://github.com/book6349/toktickit/pull/43),
  [#44](https://github.com/book6349/toktickit/pull/44), and
  [#45](https://github.com/book6349/toktickit/pull/45)
- Lab 2 worktree and completed Lab 2 report: unchanged.

## 2. Historical final-main command summary (2026-09-21)

The table below is retained as a prior audit summary. The raw terminal output
is not available in this repository, so the entries are not independently
reproducible from this report and are not evidence for the dirty 2026-09-29
working tree. In particular, the summary does not record before/after Lab 2
Ticket or Attachment IDs/counts and therefore is not data-preservation proof.

| Area | Exact command | Result | Evidence boundary |
|---|---|---|---|
| Server Lab 3 tests | `npm test -- --run tests/lab-03` from `server` | Passed | 7 files, 22 tests passed. |
| Server build | `npm run build` from `server` | Passed | TypeScript build exited 0. |
| Prisma schema | `npx prisma validate` from `server` with the documented local URL | Passed | Schema valid. No URL or password is stored in this report. |
| Client Lab 3 tests | `npm test -- --run tests/lab-03` from `client` | Passed | 5 files, 11 tests passed. |
| Client build | `npm run build` from `client` | Passed | Vite build exited 0; 31 modules transformed. |
| Repository whitespace | `git diff --check` | Passed | Exit code 0. |
| Docker availability | `docker ps --filter name=toktickit-postgres` and `docker exec toktickit-postgres pg_isready -U toktickit` | Passed before publish and again after final PDF QA at 2026-09-29 22:39 +07 | `toktickit-postgres` was running on port 5432; PostgreSQL reported “accepting connections.” Read-only checks. |
| Prisma migration deploy | `npx prisma migrate deploy` from `server` with the documented local URL | Passed | Lab 3 migration applied on the clean disposable database. |
| Prisma migration status | `npx prisma migrate status` from `server` with the documented local URL | Passed | Database schema was up to date. |
| Seed twice | `npm run prisma:seed` from `server`, twice, with the documented local URL | Passed | Both runs completed with 10 users and 3 tickets. |
| Fresh final-main E2E | `npx --no-install playwright test e2e/lab-03` from repository root | Passed | 9 tests passed in 15.6s against clean disposable `toktickit_lab3_final_20260921`. |

The historical record says the final-main E2E run required a clean disposable database because an initial
attempt against the persistent database failed 8 tests after prior runs had
changed the seeded requester's `mustChangePassword` state. The clean setup used
`npx prisma db push --accept-data-loss` only on `toktickit_lab3_final_20260921`, then
seeded it before the E2E run. A read-only post-run count found 11 users, 4
tickets, 4 public comments, and 3 internal notes. The earlier integrated
verification on capture commit `4d4f114` is retained as supporting history.
Complete raw output and pre-migration Lab 2 row identities/counts are not
retained, so these counts do not establish that preexisting rows survived.

## 3. Visual evidence

The current local E2E run captured the required 12 screens at 1280 x 900,
900 x 900, and 390 x 844 and passed viewport-overflow assertions for Requester,
Queue, Ticket Detail, and Admin. The source captures remain dirty-tree evidence
and cannot inherit `main` provenance. Report pages 12, 17, and 22 contained
full-page mobile captures too small to read; the editable report replaces them
with readable section crops. Figures 20-33 are those lossless crops. Figures
34-39 show responsive Login and mandatory Change Password layouts from the
actual client with mocked API responses; they prove layout only. Figures 40-42
show the real-data page-2 queue, migrated Attachment after staff operations, and
Requester resolution indication. The corrected E2E run also passed three
keyboard-only role journeys and a busy-state test.

## 4. GitHub workflow evidence

The original Issue, board, review, reply, approval, merge, and release record is
in [`reviewer.md`](reviewer.md). Issues #36-#40 and PRs #41-#46 completed that
workflow, and Issue #38 was corrected from `No status` to `Done` after closure.
For the approved post-audit follow-up, existing Issue #40 was reopened and its
board status is `PR Review`; PR #47 targets `lab3-staging`, links to Issue #40
through Development, and has a review request pending with Punge089. No review,
approval, or merge is claimed for PR #47, and the follow-up release PR to `main`
has not been opened. Issue #40 remains open.

## 5. Evidence labels

- Passed: the exact command or visible inspection was completed.
- Partially evidenced: supporting implementation or earlier integrated evidence
  exists, but the exact final-main check or dedicated audit is incomplete.
- Unavailable: the check could not run because the required local service was
  not available.
- No unavailable check is silently converted to Passed.

## 6. Current local audit (2026-09-29)

Execution context: branch `main`, HEAD
`493758be65850504de7b970e50f7a61b846584f0`, dirty worktree. The results below
are for the local files as they existed during this run, not for that commit.

| Working directory | Exact command | Result |
|---|---|---|
| `server` | `npm test -- --run tests/lab-03 --reporter=verbose` | Exit 0; 8 files, 26 tests passed at 17:20:10 Asia/Bangkok |
| `client` | `npm test -- --run tests/lab-03 --reporter=verbose` | Exit 0; 7 files, 16 tests passed at 17:20:10 Asia/Bangkok |
| `server` | `npm run build` | Exit 0; TypeScript build passed |
| `client` | `npm run build` | Exit 0; TypeScript and Vite build passed, 31 modules |
| `server` | `npx prisma validate` with process-local throwaway `DATABASE_URL=postgresql://lab3:lab3@127.0.0.1:5432/toktickit_audit?schema=public` | Exit 0; schema valid; no database connection made |
| `server` | `npx prisma validate` without `DATABASE_URL` | Exit 1, P1012 because the variable was unset; the throwaway-URL rerun passed |
| repository root | `docker ps --filter name=toktickit-postgres --format '{{.Names}} {{.Status}}'` | Passed during database/E2E run; final availability recheck will be recorded separately |
| `server` | `npx prisma migrate resolve --applied 20260824000000_lab2_foundation`; `npx prisma migrate deploy`; `npx prisma migrate status` | Passed on new `toktickit_lab3_migration_recheck_20260929`; Lab 3 schema up to date |
| `server` | `npm run prisma:seed` twice | Final two runs passed on the disposable migration DB; 10 seeded users/3 tickets each and stable SQL assertions |
| repository root | `npm run test:e2e` | Passed: 15 tests in 24.6s on `toktickit_lab3_e2e_recheck2_20260929` |
| `client` | `npm run dev -- --host 127.0.0.1` | Vite 6.4.3 served the actual client at `http://127.0.0.1:5173/`; no API or database used |
| repository root | `node output/docs/evidence-20260929/capture-auth-responsive.mjs` | Exit 0; six Login/mandatory Change Password screenshots at 1280x900, 900x900, and 390x844; auth endpoints mocked; layout only |

The responsive auth capture output is retained in
`output/docs/evidence-20260929/auth-responsive-capture.txt` and rendered in the
report appendix. Its mocked viewport evidence applies only to the two auth
gates; the integrated E2E overflow assertions cover Requester, Queue, Detail,
and Admin. Current E2E/migration/seed results remain local dirty-tree evidence.

The fresh migration replay first recorded a Prisma P3005 baseline setup error;
after `migrate resolve --applied` the Lab 3 deploy and migration status passed.
The first seed attempt exposed unadvanced explicit-ID sequences (P2002); after
correcting only those sequences in the new disposable database, two seed runs
and the row/count assertions passed. The first fresh E2E clone had 13 passes and
2 setup-related failures because the 21 Queue fixtures and named Attachment
ticket fixture were missing. That failure was retained; a separately prepared
clone then passed all 15 E2E tests. Exact available output is in
`output/docs/evidence-20260929/docker-verification.txt`,
`e2e-lab3-fixture-failure.txt`, and `e2e-lab3-final.txt`.

Read-only GitHub checks confirmed Issues #36-#40, PRs #41-#46, reviewer
Punge089's review comments/approvals, author replies, and merged states. The
collaborator-permission endpoint returned 403, so current collaborator
permission is not known; the historical review submissions themselves are
confirmed. The current correction and workflow records are published on the
head branch of PR #47, not yet on `main`. The live board was queried on
2026-09-30: Issue #40 is open with status `PR Review`; the PDF's older board
screenshot still shows the historical completed state and must be refreshed
for final delivery.

## 7. Post-audit follow-up status (2026-09-30)

- Existing Issue [#40](https://github.com/book6349/toktickit/issues/40) was
  reopened; no new Issue was created.
- [PR #47](https://github.com/book6349/toktickit/pull/47) is open from
  `feature/lab3-submission-corrections` to `lab3-staging`, at commit
  `6efc07b83b6ac36657fd5397fb2d6b2e1fd6257d`.
- PR #47 is linked to Issue #40 through the GitHub Development panel, and the
  existing project board shows `PR Review`.
- Punge089's review was requested. As of this record, no review comment, reply,
  approval, or merge has occurred for PR #47.
- Do not open the follow-up release PR to `main` until PR #47 is reviewed and
  merged. Final clean-main checks and final report synchronization remain
  pending that reviewed integration.

The first focused Requester UI run had one failed test-query assertion because
the comment is rendered together with author and timestamp in a list item. The
assertion was corrected; the focused Requester/style rerun passed 4/4 tests,
then the complete client suite passed 16/16. The initial Prisma validation
failure was an unset environment variable, not a schema error. Current raw
successful test output is included in the report appendix; the historical
final-main output remains unavailable.
