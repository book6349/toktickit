# Authorized steps 1–2: preservation and local test repairs

## Source and preservation

Date: 2026-10-01 (Asia/Bangkok). Branch: `feature/lab3-submission-corrections`. Parent/source HEAD: `1fb8df040eb12ac443bb4246a314babfde1564e9`. The working tree was already dirty. Results below include local uncommitted repairs and must not be labeled final-main evidence. Cached `origin/main`: `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`; no external GitHub changes were performed in these steps.

Backups are under `backup/` in this evidence directory: current report PDF, editable DOCX, alternate PDF copy, Lab 3 documentation, server/client tests, E2E tests/configuration, package scripts, ignore rules, Vite configuration, and the changed Staff workflow source. Existing edits and untracked work were preserved. The original Lab 2 checkout/report were not modified.

Current report was compared with the older candidate, not replaced: 19 changed paragraph regions were identified; both retain 22 tables and 58 embedded images. The older candidate contains stale Docker-unavailable statements. Report editing/export is deferred to the later report step.

Original and final step-2 report hashes are identical:

- PDF SHA256: `C1A7D0560D01914D00B72A1C45A91942699DD0E530AA74B0CBDD52CBDB3985EC`
- DOCX SHA256: `8F9D3F9327ED6DBC3C8CFBD3938B69507010086D7FCFF2D457C3F8EC37F5A73C`

## Exact commands, working directories, and results

Working directories are relative to this Lab 3 worktree root. All output filenames below are in this evidence directory. Each process exit code was inspected. Complete test/build tool output is retained; counts are not inferred from source.

| Directory | Command | Output | Result |
|---|---|---|---|
| server | `npm test -- --reporter=verbose` | server-baseline.txt | exit 1; 35 passed, 10 failed |
| client | `npm test -- --reporter=verbose` | client-baseline.txt | exit 1; 16 passed, 15 failed |
| server | `npm test -- tests/lab-02 --reporter=verbose` | server-regression-rerun.txt | exit 1; 16 passed, 1 failed; obsolete error-code expectation subsequently corrected |
| client | `npm test -- tests/lab-01 tests/lab-02 --reporter=verbose` | client-regression-rerun.txt | exit 0; 15 passed |
| server | `npm test -- tests/lab-03/auth.api.test.ts tests/lab-03/comments-notes.api.test.ts tests/lab-03/staff-queue.api.test.ts tests/lab-03/staff-ticket-detail.api.test.ts tests/lab-03/users-admin.api.test.ts --reporter=verbose` | contract-tests-before-query-fix.txt | exit 1; 149 passed, 2 failed; combined owner filters exposed an implementation defect |
| server | `npm test -- --reporter=verbose` | server-full-rerun.txt | exit 0; 190 tests, 19 files passed; start 01:11:32 |
| client | `npm test -- --reporter=verbose` | client-full-rerun.txt | exit 0; 32 tests, 14 files passed; start 01:11:34 |
| server | `npm run build` | server-build.txt | exit 0 |
| client | `npm run build` | client-build.txt | exit 0 |
| root | `npx --no-install playwright test e2e/lab-03 --list` | e2e-discovery.txt | exit 0; 15 scenarios discovered, not browser execution |
| root | `git diff --check` | inspected console output | exit 0; line-ending warnings only |

## Changes and remaining verification

Legacy regression tests now use real authenticated-session middleware instead of the retired development selector/header. Assertions were updated to actual authenticated APIs, not skipped. Added tests cover session expiry/revocation/inactivity/logout, comment/note boundaries and append-only APIs, safe client rendering, all 64 status pairs plus confirmation checks, Queue sorting/filter combinations, Administrator role denial and last-active-admin demotion, and disposable fixture safety.

One application correction preserves exact owner filtering when ownership filters are also supplied. Test additions include a reproducible disposable-database preparer with migration snapshots, seed-twice assertions, preserved attachment bytes, email-resolved IDs, and populated Queue pagination fixtures. Browser scenarios now verify reset-password next-login gating and direct API blocking, with real fixture IDs.

The preparer compiled and its safeguards passed unit tests. It has **not yet been executed against PostgreSQL in this repair run**. Updated E2E scenarios are discovered but **not yet browser-verified**. Docker/database checks, complete E2E, final screenshots, report synchronization, external reviewed integration, and clean committed-main reruns remain later steps. Do not replace the current report or claim submission completion from this local test run.
