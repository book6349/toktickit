# Lab 3 Release and Verification Evidence

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

Status: PR #47 merged to `lab3-staging`; reviewed release PR #48 merged to
`main` at `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`. On 2026-09-30, the Lab 3
server/client suites, production builds, and Prisma schema validation passed
at that commit. Full unfiltered server/client test commands failed in legacy
Lab 1/2 suites. Docker was not reachable for this run, so final-main migration,
seed-twice, and integrated E2E checks are not verified. Section 2 is the
historical 2026-09-21 summary; Section 6 preserves the distinct 2026-09-29
dirty-tree Docker run; Section 8 records this current main verification.

## 1. Release snapshot

- Audit date: 2026-09-21 (Asia/Bangkok)
- Final branch: `main`
- Final commit: `493758be65850504de7b970e50f7a61b846584f0`
- Release source: `lab3-staging`
- Release PR: [#46](https://github.com/book6349/toktickit/pull/46)
- Release merge: `493758b`
- Follow-up correction: [PR #47](https://github.com/book6349/toktickit/pull/47),
  merged to `lab3-staging` as `7d8ee7acb09c76e06ca1bec5b1f5410452b8f2d7`
- Follow-up release: [PR #48](https://github.com/book6349/toktickit/pull/48),
  merged to `main` as `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`
- Issue #40: closed; board status `Done`
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
in [`reviewer.md`](reviewer.md). PR #47 used existing Issue #40, was reviewed,
replied to, approved, and merged into `lab3-staging`. PR #48 was then reviewed,
replied to, approved, and merged into `main`. Issue #40 is closed and the board
shows `Done`; no extra Issue was created.

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

Read-only GitHub checks from the 2026-09-29 audit confirmed the then-current
Issues #36-#40 and PRs #41-#46. The collaborator-permission endpoint returned
403, so current collaborator permission is not established. The later PR #47
and PR #48 events, including the final Issue #40 Done/closed state, are
recorded in Sections 7 and 8 and linked in `reviewer.md`.

## 7. Completed post-audit GitHub workflow (2026-09-30)

- Existing Issue [#40](https://github.com/book6349/toktickit/issues/40) was
  used for the follow-up; no new Issue was created.
- [PR #47](https://github.com/book6349/toktickit/pull/47) targeted
  `lab3-staging`, was linked to Issue #40 through Development, received
  Punge089's review, an author reply, and approval, then merged as
  `7d8ee7acb09c76e06ca1bec5b1f5410452b8f2d7`.
- [PR #48](https://github.com/book6349/toktickit/pull/48) promoted
  `lab3-staging` to `main`, was reviewed and approved by Punge089 after the
  author's reply, then merged as
  `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`.
- Issue #40 is closed; the board status is `Done`.

## 8. Final-main verification (2026-09-30)

Source: clean isolated checkout of `origin/main` at
`0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`, detached HEAD. Git status was
clean before and after verification. The original Lab 3 worktree and its
untracked files were left unchanged. Commands ran in this isolated checkout;
the package-lock hashes matched the original checkout. Node `v24.14.0`, npm
`11.9.0`. Vitest's raw output records its start time in Asia/Bangkok (UTC+7).

| Working directory | Exact command | Exit / observed result |
|---|---|---|
| `server` | `npm test -- --run tests/lab-03 --reporter=verbose` | 0; 8 files, 26 tests passed; Vitest start 22:59:47 |
| `client` | `npm test -- --run tests/lab-03 --reporter=verbose` | 0; 7 files, 16 tests passed; Vitest start 22:59:50 |
| `server` | `npm run build` | 0; TypeScript build passed |
| `client` | `npm run build` | 0; TypeScript and Vite build passed, 31 modules |
| `server` | `npm exec prisma validate` (no `DATABASE_URL`) | 1; P1012, required variable missing; schema was not evaluated |
| `server` | Set process-local `DATABASE_URL=postgresql://lab3:lab3@127.0.0.1:5432/toktickit_verify`, then `npm exec prisma validate` | 0; schema valid; validation only, no connection |
| `server` | `npm test` | 1; 18 files, 35/45 tests passed; 10 Lab 2 API tests failed with 401 where unauthenticated legacy tests expected 200/400/404; Vitest start 22:52:02 |
| `client` | `npm test` | 1; 14 files, 16/31 tests passed; 15 Lab 1/2 UI tests failed while new session/auth startup was not satisfied by their old test setup; Vitest start 22:52:02 |
| repository root | `docker info` | 1; Docker API pipe `//./pipe/docker_engine` not found; no Docker server connection |
| repository root | `git diff --check` | 0; no whitespace errors |
| repository root | `git status --short --branch` | 0; `## HEAD (no branch)`, clean |

The passing focused Lab 3 output is recorded verbatim in `tests.md`. The
unfiltered failures are reported, not hidden or converted to passes. Their
observed responses indicate the older Lab 1/2 test fixtures are not aligned
with the Lab 3 session flow; no Lab 1/2 source or test file was changed during
this verification.

Docker-backed `prisma migrate deploy`, `prisma migrate status`, seed twice,
legacy-row preservation assertions, and `npm run test:e2e` were not run on
this final-main checkout because the Docker API pipe was unavailable. The
successful 2026-09-29 disposable-database results in Section 6 remain valid
historical dirty-tree evidence only; they do not certify commit `0353a40`.
Existing screenshots were not recaptured on final main. Full labsheet
compliance is therefore not claimed.

The first focused Requester UI run had one failed test-query assertion because
the comment is rendered together with author and timestamp in a list item. The
assertion was corrected; the focused Requester/style rerun passed 4/4 tests,
then the complete client suite passed 16/16. The initial Prisma validation
failure was an unset environment variable, not a schema error. Raw final-main
focused test output is recorded in `tests.md`; the editable report/PDF appendix
has not yet been regenerated. The older 2026-09-21 main run's raw output remains
unavailable.
