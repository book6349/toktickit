## Summary

Follow-up to existing Lab 3 Issue 5 (#40), continuing the approved audit repair
workflow. No new Issue or replacement feature unit is created.

- Fix combined owner/ownership Queue filtering and show Requester resolution
  indication in Staff/Admin Detail without changing formal status.
- Align legacy regression tests with Lab 3 session authentication; expand
  actual authorization, content, status, administration and UI assertions.
- Add a guarded disposable PostgreSQL E2E preparer: refuse existing/shared
  databases, preserve synthetic pre-migration rows and attachment bytes, seed
  twice, verify counts/ownership/authorship, and populate Queue pagination.
- Retain real responsive/keyboard captures, failed runs and complete passing
  output; keep controlled empty/failure UI states explicitly labelled.
- Preserve user report edits in editable DOCX; synchronize test traceability,
  evidence boundaries, readable screenshots and the 121-page inspected PDF.

## Executed verification

2026-10-01 dirty local working-tree results, **not final-main evidence**:

- Server: `npm test -- --reporter=verbose` — 190 tests / 19 files, exit 0.
- Client: `npm test -- --reporter=verbose` — 36 tests / 14 files, exit 0.
- Server/client: `npm run build` — both exit 0.
- Server: `npx --no-install prisma validate` — exit 0.
- Root: `npm run test:e2e:prepare` — actual Docker-backed migration preservation,
  seed-twice and database assertions, exit 0; isolated new run2 database only.
- Root: `npx --no-install playwright test e2e/lab-03 --output output/docs/evidence-20261001-step5/browser-run2`
  — 16 Chromium scenarios, exit 0.

Exact commands, source boundary and full output:
`output/docs/evidence-20261001-step5/verification.md` and companion text files.
Steps 1–4 retain preceding failures, fixes, live API/attachment checks and
capture provenance. All 121 PDF pages were inspected; Parts 1–9 and Figures
1–51 are ordered. DOCX text and tables remain editable.

## Review and release guardrails

- Head: `feature/lab3-submission-corrections`; base: `lab3-staging`.
- Required reviewer: Punge089; author replies to actual review comments.
- Reviewer approves and merges; requested fixes stay in this PR.
- Link this PR to existing Issue #40 through the Development panel. A body
  reference alone is not asserted as a Development link.
- No automatic Issue-closing keyword, board transition or premature release.
- After reviewed staging integration, prepare the reviewed staging-to-main
  release. Only checks on actual committed main may be final-main evidence.

## Remaining limitations

This is not a claim of final submission compliance. Clean-main reruns,
corresponding final screenshots/report synchronization, final acceptance audit
and reviewer-access verification remain required. The permission endpoint
returns 403 for this integration; it does not prove the reviewer lacks access.
The last-active-Administrator delegate branch is covered by executed mocked
API tests; live self-removal reaches the earlier self-protection guard.
