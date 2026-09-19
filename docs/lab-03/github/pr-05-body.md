# PR-05 body — Integrated E2E/visual evidence and Lab 3 release integration

Suggested title (add the real PR number after GitHub creates it):
    Lab 3 PR 5 — Integrated E2E, Visual Evidence and Lab 3 Release Integration

Target branch for the evidence PR: `lab3-staging`

Source branch: `feature/lab3-integration-evidence`

Linked Issue: Lab 3 Issue 5 (`#40`); link it through the pull request
Development section.

The later release PR from `lab3-staging` to `main` is a separate documented
release action, not an unplanned feature PR.

This is a local copy-ready draft only. Do not replace the PR-number placeholder
or treat this file as proof of a GitHub event. The local integrated checks below
were run on commit `4d4f114`; staging review, approval, merge, and release are
still pending.

## Summary

This PR adds the integrated verification record and submission evidence after
the product workflow units have been implemented on the documented staging
branch.

## Included

- Integrated authentication, IT Staff, and Administrator E2E flows.
- Desktop, tablet, and mobile screenshots for required states.
- Keyboard/focus, overflow, role-navigation, and visual checklist evidence.
- Exact test/build/database command records and results.
- Reviewer and AI-use documentation.
- Final Lab 3 PDF and its screenshot/figure/link index.

## Not included

New unplanned product behavior, unsupported claims, or an unreviewed direct
merge to `main` are outside this PR.

## Local validation already completed

- Server: 7 Lab 3 files and 22 tests passed.
- Client: 5 Lab 3 files and 11 tests passed.
- Server and client production builds passed.
- Prisma validation, migration deploy/status, and two idempotent seed runs passed.
- `npx playwright test e2e/lab-03`: 9 tests passed using 1 worker.
- Twelve responsive PNGs were generated and visually inspected.
- The final report PDF was rendered and visually inspected; figure numbering
  and real GitHub links were checked.

## Required before approval

- Re-run the checks on the final staging state if the branch changes.
- Preserve the exact evidence labels and limitations in the report.
- Complete the real Development-panel link, friend review, author replies,
  approval, and reviewer merge.

Each evidence item must retain its actual label: Planned, Passed, Failed,
Deferred, Unavailable, or Partially evidenced.

## Review focus

- Evidence comes from the integrated staging/final-main source tree.
- Screenshots are readable, captioned, and tied to acceptance criteria.
- Figure numbering and links are correct.
- Limitations are stated honestly.
- The eventual release PR has the documented target and required review.

## Workflow checklist

- [ ] Approved Issue exists and is linked in Development.
- [ ] Feature PR dependencies are merged into `lab3-staging`.
- [ ] Required checks and evidence are attached.
- [ ] Friend reviewer comment is posted.
- [ ] Author reply addresses the review question.
- [ ] Friend approval is recorded.
- [ ] Only then does the approved reviewer merge to `lab3-staging`.
- [ ] A separate reviewed release PR to `main` is prepared only after release checks pass.
