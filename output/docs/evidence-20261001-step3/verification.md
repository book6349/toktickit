# Step 3 — executed local verification

Date/timezone: 2026-10-01, Asia/Bangkok. Run window: approximately 01:18–01:24 +07:00 (2026-09-30 UTC). Worktree root: `C:/Users/Jitvoottikrai/OneDrive/เดสก์ท็อป/SoftwareEn/LAB1/Lab1_Starter_Scaffold/toktickit-lab3-specification`.

Branch: `feature/lab3-submission-corrections`. Source HEAD: `1fb8df040eb12ac443bb4246a314babfde1564e9`. **Dirty local working-tree evidence, not final-main evidence.** The retained `working-tree.patch`, `git-status.txt`, and `untracked-source/` record the source state. No GitHub changes, commits, pushes, or merges were performed.

## Isolation and environment

Docker container `toktickit-postgres`, image `postgres:18`, was running and PostgreSQL accepted connections. The first sandboxed Docker inspection was denied access to the Docker pipe; the authorized elevated inspection succeeded. This was an access restriction, not Docker unavailability. A conventional root `docker-compose.yml` did not exist; the running container was inspected directly instead.

Created only the new database `toktickit_lab3_e2e_20261001_run1`. Existing application databases were not reset, seeded, or used. Connection settings were supplied in process environment using local-development credentials; no `.env` file was changed. The preparer requires a specifically named new local database and refuses existing targets.

Existing processes on ports 3000/5173 were left untouched. The actual current-worktree API was started on 3103 and Vite on 5183, both bound to the isolated database/API configuration. The test-owned API/client sessions were stopped after verification. The disposable database and baseline attachment file remain retained for audit; no deletion was performed.

## Exact commands and observed results

Directory names below are relative to the worktree root. Complete stdout/stderr from each verification command is retained in the listed file. The process exit code was inspected separately and recorded here.

| Directory | Command | Local time | Output file | Exit / result |
|---|---|---|---|---|
| root | `docker ps --filter name=toktickit-postgres --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}'` | 01:22:55 | docker-readiness.txt | 0; container running |
| root | `docker exec toktickit-postgres pg_isready -U toktickit -d postgres` | 01:22:55 | postgres-readiness.txt | 0; accepting connections |
| root | `npm run test:e2e:prepare` | 01:18:42–01:18:52 | database-run1.txt | 0; migration, preservation, seed twice, fixture preparation passed |
| root | `npx --no-install playwright test e2e/lab-03 --output output/docs/evidence-20261001-step3/browser-run1` | 01:19:44–01:20:03 | e2e-run1.txt | 0; 15/15 passed |
| server | `npm test -- --reporter=verbose` | start 01:20:10 | server-tests.txt | 0; 190 tests / 19 files passed |
| client | `npm test -- --reporter=verbose` | start 01:20:12 | client-tests.txt | 0; 32 tests / 14 files passed |
| server | `npx --no-install prisma validate` | 01:20:23 | prisma-validation.txt | 0; schema valid |
| server | `npm run build` | 01:20:54 | server-build.txt | 0 |
| client | `npm run build` | 01:20:57–01:21:00 | client-build.txt | 0 |
| server | `npx --no-install prisma migrate status` | 01:21:09 | prisma-status-post-e2e.txt | 0; schema up to date |
| root | `node output/docs/evidence-20261001-step3/live-api-checks.mjs` | 01:22:22 | live-api-checks.txt | 0; all live assertions passed |
| root | `npm run test:e2e:prepare` (same already-exercised database) | after live checks | existing-database-refusal.txt | **1 expected**; existing database refused before writes; wrapper guard check exited 0 |

Environment for preparation/Prisma/API: `DATABASE_URL` selects the disposable database above, local PostgreSQL port 5432, public schema. API launch in `server`: `PORT=3103`, `CLIENT_ORIGIN=http://localhost:5183`, then `npm run dev`. Client launch in `client`: `VITE_API_URL=http://localhost:3103`, then `npm run dev -- --host localhost --port 5183 --strictPort`. E2E execution uses `E2E_BASE_URL=http://localhost:5183` and `E2E_API_BASE_URL=http://localhost:3103`. These separately launched servers use this exact worktree, not the occupied default ports. Setting `E2E_BASE_URL` disables Playwright server startup by design.

The preparation script executed these actual subcommands in `server`, with their complete output included in `database-run1.txt`:

1. `npx --no-install prisma db execute --schema prisma/schema.prisma --stdin` — applies the actual Lab 2 migration to a synthetic disposable baseline.
2. `npx --no-install prisma migrate resolve --applied 20260824000000_lab2_foundation`.
3. `npx --no-install prisma migrate deploy` — applied `20260919000000_lab3_auth_requester`.
4. `npx --no-install prisma migrate status` — schema up to date.
5. `npm run prisma:seed` — first run passed.
6. `npm run prisma:seed` — second run passed.

## Database and attachment evidence

Identical before/after migration snapshots verified baseline Requester fields, Ticket fields and foreign keys, Attachment metadata/link/storage key, Category, and RelatedSystem. Additional assertions verified migrated REQUESTER role, password-change gate, valid initial-password hash, and IT Priority initialized from Requested Priority. This is real PostgreSQL migration execution on synthetic data, not production-data sampling or a source-string test.

Both seed runs had identical counts and relationship assertions: 10 users; 4 active plus 1 inactive Requester; 3 active plus 1 inactive IT Staff; 1 active Administrator; 3 seeded tickets plus 1 baseline ticket; 3 public comments; 3 Internal Notes; 1 baseline attachment. All 3 seeded tickets have Requester ownership, 2 have active Staff ownership, comments have Requester authors, and notes have permitted authors. Seed count/relationship idempotence was verified; this does not claim a byte-for-byte comparison of every seeded row between runs.

After these seed checks, 16 additional synthetic Queue tickets were prepared, yielding 20 tickets before browser execution. Runtime IDs were resolved rather than assumed: baseline Ticket 1 and reassignment owner 8. The captured manifest is `e2e-fixtures-run1.json`. The Requester browser test subsequently creates another ticket and the Administrator test creates another user; these later changes do not invalidate the pre-E2E seed counts.

The baseline attachment's preserved bytes and authenticated post-E2E HTTP download both yielded 17 bytes and SHA256 `cc7098632c30d31ed81ff5936a75a027f3136024cb96efd35e8fe3f9b4d3cfaf`. The download was checked for actual byte equality, not only a visible filename.

## Browser/API verification and limitations

All 15 Chromium scenarios passed: login and mandatory change, logout/direct unauthorized blocking, consistent invalid/inactive account errors, Requester creation/comment/resolution, role navigation, Queue search and populated second page, reassignment/priority/status operations, migrated attachment visibility, Administrator create/edit/reset with next-login password gate and direct API blocking, responsive overflow checks, and keyboard traversal.

Live API checks executed self-deactivation and self-demotion attempts (403), then verified the only Administrator remained active in PostgreSQL. Both Requester and IT Staff were denied User Management (403). The separate `LAST_ADMINISTRATOR` error branch is covered by executed mocked API tests; the real single-admin requests hit the earlier self-protection guard. Do not mislabel those live calls as execution of that separate branch.

`playwright-report-run1/` is the retained HTML report; `browser-run1/` contains test-run metadata. Twenty-one screenshot files updated during this run were copied into `screenshots-run1/`; older screenshot files were not included as this run's captures. These are actual application/browser captures. The busy-state scenario deliberately delays the real login request for 1200 ms; label that controlled timing when used in the report. It does not mock a successful login response.

This run did not fail application checks and needed no application/test fixes. The explicit preparer rejection is an expected safety result, not a failed E2E run. Earlier step-2 failures and subsequent repairs remain in `../evidence-20261001-step1-2/`.

Login/Change Password responsive screenshot refresh, additional targeted visual evidence and readable mobile sections, screenshot visual QA/captions, report synchronization, reviewed Git integration, and clean final-main verification remain subsequent steps. Passing automated overflow/keyboard assertions do not certify every visual/rubric requirement or reviewer access.

The final PDF/DOCX were not edited or exported. Their SHA256 values still match the step-1 baseline: PDF `C1A7D0560D01914D00B72A1C45A91942699DD0E530AA74B0CBDD52CBDB3985EC`; DOCX `8F9D3F9327ED6DBC3C8CFBD3938B69507010086D7FCFF2D457C3F8EC37F5A73C`.
