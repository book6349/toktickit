# Lab 4 release evidence checklist

Checked on 31 October 2026 in Asia/Bangkok. T-20 and T-25 are Passed for the recorded checks. The implementation tested is 3ddd3930b2c83d3193164257d3bf7dd3bcfb14e9, based on merged main 43ed5984962ee8f8b4f29c72931b7fbe64037d3e. Later evidence/report commits do not change application or test behavior. This follow-up requires human peer review and merge before it becomes final-main evidence. Local runs are not GitHub CI; the main combined-status response contains no checks.

## T-20 accessibility and 320px evidence

- [x] Keyboard Tab/Enter reaches both role dashboards and their drill-down/back controls, with a visible outline of at least 2px.
- [x] Staff can open and cancel Actions Taken using the keyboard. The form has an accessible name, each checked field has its associated label, validation is announced through role=alert, and focus moves to an aria-invalid field.
- [x] Reduced-motion emulation removes dashboard-card transition and hover transform.
- [x] All eight Lab 4 screen states have no horizontal page overflow at 320x800, in addition to the three existing widths.
- [x] Four dedicated 320px keyboard/validation captures are retained and embedded in the editable report. Source: e2e/lab-04/zz-accessibility.spec.ts; viewport helper: e2e/lab-04/evidence.ts.
- [x] The new journey found a missing navigation focus outline caused by the Bootstrap selector. The specific focus-visible rule now overrides it with a solid green outline.

Scope: these are focused browser assertions, not a full WCAG audit or a manual screen-reader evaluation. No standalone axe scan or performance benchmark is claimed.

## T-25 release checklist

| Check | Observed evidence | Result |
|---|---|---|
| Source identity | Tested implementation 3ddd3930b2c83d3193164257d3bf7dd3bcfb14e9; base main 43ed5984962ee8f8b4f29c72931b7fbe64037d3e; date and commands retained in logs | Passed |
| Server/API/authorization/workflow/migration regression | 306 tests in 23 files, including 37 PostgreSQL-backed Actions Taken checks | Passed |
| Client regression and dashboard failure recovery | 66 tests in 18 files; initial loading, safe network/forbidden errors, retry, retained metrics after failed refresh, drill-down loading and filter-preserving retry | Passed |
| Browser regression | 22 Lab 2–4 tests in a new disposable PostgreSQL database; includes T-20 | Passed |
| Build and schema | Server and client production builds; npx prisma validate | Passed |
| Production health | Built entrypoint node dist/src/index.js; GET /api/health returned HTTP 200 and status=ok | Passed |
| Specification before implementation | Contract fd390c3 was reviewed in PR #57 before feature PRs; rendered specification and test matrix remain in report | Passed |
| Reviewer disposition | PRs #57–#64 have recorded peer review; Punge089 commented and approved, book6349 replied; #64 merged to main at 43ed5984962ee8f8b4f29c72931b7fbe64037d3e | Passed |
| Project board and Issues | Read-only board inspection at https://github.com/users/book6349/projects/4/views/1: Issues #51–#56 all in Done; other working columns have zero items; six Issues are closed | Passed |
| AI-use record | Six actual prompt excerpts, model, and reflection retained in ai-use.md; this record does not fabricate prompts or reviews | Passed |
| Honest release boundary | No GitHub CI pass claimed; current follow-up peer review/merge remains pending; source revision and initial failures are retained | Passed |

## Exact local commands and output

All final commands below ran at 3ddd3930b2c83d3193164257d3bf7dd3bcfb14e9 on 31 October 2026 (+07:00).

- In server/: npm test -- --reporter=dot with LAB4_DB_TEST=1 and local PostgreSQL test service.
- In client/: npm test -- --reporter=dot.
- npm --prefix server run build; npm --prefix client run build; in server/: npx prisma validate.
- Repository root: npm run test:e2e. Fresh database: toktickit_lab3_e2e_release_complete_20261031231014. Preparation preserves its migration baseline, seeds twice, refuses existing databases, and retains the synthetic database for audit.
- In server/: node dist/src/index.js, followed by GET http://localhost:3000/api/health.

Complete passing output: [validation](../../output/evidence/lab4-release-validation.log), [browser](../../output/evidence/lab4-release-e2e.log), [health](../../output/evidence/lab4-release-health.log). The initial focus failure and the earlier style-pattern/typecheck failures remain in lab4-release-e2e-initial.log, lab4-release-validation-initial.log and lab4-release-validation-typecheck-initial.log as historical diagnostics, not current results.

## Review source for PR 64

- [Punge089 comment](https://github.com/book6349/toktickit/pull/64#pullrequestreview-5723674774): Please confirm the report matches the tested main revision and clearly lists the remaining gaps.
- [book6349 reply](https://github.com/book6349/toktickit/pull/64#issuecomment-6545762705): linked commit 993af6a and the main verification logs and remaining evidence gaps.
- [Punge089 approval](https://github.com/book6349/toktickit/pull/64#pullrequestreview-5723677707): The report matches the recorded results and states its limits clearly. Approved.
