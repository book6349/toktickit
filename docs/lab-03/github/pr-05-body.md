# PR-05 body — Integrated E2E/visual evidence and Lab 3 release integration

Suggested title:
    test: add Lab 3 integrated E2E and release evidence

Target branch for the evidence PR: `lab3-staging`

Source branch: `feature/lab3-integration-evidence`

Linked Issue: `ISSUE-05`; link it through the pull request Development section.

The later release PR from `lab3-staging` to `main` is a separate documented
release action, not an unplanned feature PR.

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

## Validation to attach before approval

- Server and client tests.
- Production builds.
- Prisma/migration/seed checks.
- All required E2E scenarios.
- Required screenshots and final PDF render/visual inspection.

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
