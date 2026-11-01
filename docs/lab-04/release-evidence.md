# Lab 4 release evidence

## Final-main status

T-20 accessibility and 320px checks and T-25 release checklist are complete on main. PR #65 merged on 2026-11-01 (Asia/Bangkok, UTC+07:00) at commit 58b0a7a5556a689ca75c47f9797ebfe84c9cdb3a. The tested tree 65731368fb2ad8c27e86da34248906a1a5881ee6 matches PR #65 head 20b4e0a7698d3eb5527cd9eb85d36e2ce8c9daeb.

All 306 server tests in 23 files passed, including 37 PostgreSQL-backed checks. All 66 client tests in 18 files passed. All 22 Playwright tests passed on one worker: 16 Lab 3, 2 Lab 2, and 4 Lab 4. Server and client production builds, Prisma schema validation, migration/seed assertions, and compiled-server health passed. Exact full output is in the linked logs below.

GitHub returned no status checks for the merged revision; no CI pass is claimed. This record does not claim a full WCAG audit, manual screen-reader evaluation, standalone axe scan, or performance benchmark.

## T-20 accessibility and 320px evidence

- [x] Keyboard Tab/Enter reaches both role dashboards and their drill-down/back controls, with a visible focus outline.
- [x] Staff can open and cancel Actions Taken using the keyboard. The form has an accessible name, checked fields have labels, validation is announced through role=alert, and focus moves to an aria-invalid field.
- [x] Reduced-motion emulation removes dashboard-card transition and hover transform.
- [x] All eight Lab 4 screen states have no horizontal page overflow at 320×800, in addition to the three existing widths.
- [x] Four dedicated 320px keyboard/validation captures are retained and embedded in the report. Source: e2e/lab-04/zz-accessibility.spec.ts; viewport helper: e2e/lab-04/evidence.ts.
- [x] The focus-visible rule overrides the Bootstrap selector with a solid green outline.

Scope: these are focused browser assertions, not a full WCAG audit or a manual screen-reader evaluation. No standalone axe scan or performance benchmark is claimed.

## T-25 release checklist

| Check | Observed evidence | Result |
|---|---|---|
| Source identity | Main merge 58b0a7a5556a689ca75c47f9797ebfe84c9cdb3a; tree 65731368fb2ad8c27e86da34248906a1a5881ee6 equals tested PR #65 head 20b4e0a7698d3eb5527cd9eb85d36e2ce8c9daeb; run date 2026-11-01 (+07:00) | Passed |
| Server/API/authorization/workflow/migration regression | 306 tests in 23 files, including 37 PostgreSQL-backed checks | Passed |
| Client regression and dashboard recovery | 66 tests in 18 files; loading, safe network/forbidden errors, retry, retained metrics, and filter-preserving drill-down retry | Passed |
| Browser regression | 22 Playwright tests on one worker in a fresh isolated PostgreSQL database; includes T-20 | Passed |
| Build and schema | Server and client production builds; npx prisma validate | Passed |
| Production health | node dist/src/index.js; GET /api/health returned HTTP 200 and status=ok | Passed |
| Specification before implementation | Contract fd390c3 reviewed in PR #57 before feature PRs; rendered specification and test matrix remain in report | Passed |
| Reviewer disposition | PRs #57–#65 have recorded peer review; PR #65 comment, author reply, approval, and merge links below | Passed |
| Project board and Issues | Read-only board inspection: Issues #51–#56 all in Done; all six Issues are closed | Passed |
| AI-use record | Six actual prompt excerpts, model, and reflection retained in ai-use.md | Passed |
| Honest release boundary | GitHub reported no status checks; no CI pass is claimed | Passed |

## Exact commands and output

Run date: 2026-11-01 (Asia/Bangkok, UTC+07:00). Tested main commit: 58b0a7a5556a689ca75c47f9797ebfe84c9cdb3a; tree: 65731368fb2ad8c27e86da34248906a1a5881ee6.

- Server: LAB4_DB_TEST=1 npm test -- --reporter=dot from server/; 306 tests passed, including 37 PostgreSQL-backed checks.
- Client: npm test -- --reporter=dot from client/; 66 tests passed.
- E2E: npm run test:e2e from repository root; 22 Playwright tests passed on one worker using fresh isolated database toktickit_lab3_e2e_mainlog_20261101133650179_e47151.
- Builds: npm --prefix server run build; npm --prefix client run build.
- Schema: npx prisma validate from server/, with a temporary nonconnecting DATABASE_URL because this checkout has no .env.
- Health: node dist/src/index.js; GET /api/health returned HTTP 200 and status=ok.

Complete output: [validation and build log](../../output/evidence/lab4-main-verification-validation-20261101.log), [browser log](../../output/evidence/lab4-main-verification-e2e-20261101.log), [health log](../../output/evidence/lab4-main-verification-health-20261101.log).

The older lab4-release-*.log files document the 31 October candidate run and remain historical. The logs above supersede them for final-main status.

## PR #65 review record

- [PR #65](https://github.com/book6349/toktickit/pull/65) merged to main at [commit 58b0a7a5556a689ca75c47f9797ebfe84c9cdb3a](https://github.com/book6349/toktickit/commit/58b0a7a5556a689ca75c47f9797ebfe84c9cdb3a).
- [Punge089 reviewer comment](https://github.com/book6349/toktickit/pull/65#pullrequestreview-5726724450): “Please check the keyboard and 320px evidence, recovery cases, and release checklist against the recorded revision.”
- [book6349 author reply](https://github.com/book6349/toktickit/pull/65#issuecomment-6554388896): “The evidence and verification limits are documented on this branch in the release notes.”
- [Punge089 approval](https://github.com/book6349/toktickit/pull/65#pullrequestreview-5726780191): “The accessibility evidence and release checks are clear. Approved.”

The prior PR #64 review record remains available in GitHub and reviewer.md. Issues #51–#56 are closed; the project board view was checked read-only and shows all six in Done.
