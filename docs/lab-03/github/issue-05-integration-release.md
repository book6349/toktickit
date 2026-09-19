# Issue 05 — Integrated E2E/visual evidence and Lab 3 release integration

## Context

The final Lab 3 submission must prove the integrated result from the final
main branch. Evidence must distinguish executed, failed, deferred, unavailable,
and partially evidenced checks.

## Scope

- Integrated E2E authentication, Requester, IT Staff, and Administrator
  browser flows.
- Desktop, tablet, and mobile screenshots for all major Lab 3 screens.
- Overflow, keyboard, focus, validation, role-navigation, and visual checklist
  verification.
- Final test/build/database command records from the integrated branch.
- Completion of reviewer.md, ai-use.md, evidence captions, and final report.
- Reviewed release integration from lab3-staging to main.
- Final PDF with exactly Answer Part 1 through Answer Part 9 and working links.

## Acceptance criteria

- [ ] Authentication E2E covers valid/invalid login, inactive account,
      first-login password change, role display, logout, and direct blocking.
- [ ] Requester E2E covers authenticated Ticket and Attachment regression,
      Public Comments, and resolution indication.
- [ ] IT Staff E2E covers Queue queries, Detail, owner, IT Priority, status,
      Public Comments, Internal Notes, and role restrictions.
- [ ] Administrator E2E covers list, search/filter, create/edit, initial
      password, duplicate input, self-deactivation, last-Administrator safety,
      and forbidden access.
- [ ] Required desktop, tablet, and mobile screenshots are readable and
      indexed with branch/SHA and scenario.
- [ ] Final tests, builds, Prisma validation, migration/seed checks, and E2E
      commands have exact recorded results.
- [ ] Every acceptance criterion has an honest final status.
- [ ] All approved feature Issues are in the workflow-allowed final state.
- [ ] The release PR targets main and is merged only after the required review.
- [ ] The final PDF is rendered and visually inspected, with no broken links,
      clipped content, incorrect figure numbering, or unsupported claims.

## Planned tests and evidence

- e2e/lab-03/authentication.spec.ts
- e2e/lab-03/staff-ticket-flow.spec.ts
- e2e/lab-03/user-administration.spec.ts
- artifacts/lab-03/screenshots/
- docs/lab-03/reviewer.md
- docs/lab-03/ai-use.md
- final PDF and rendered page inspection

## Dependencies

ISSUE-01 through ISSUE-04 must be merged and integrated into lab3-staging.

## Out of scope

New product behavior not already covered by Issues 01–04. Any defect found
during integration must be fixed on the owning feature branch/PR or through a
previously approved workflow unit; do not create an unplanned Issue or PR.

## Workflow

Use the approved integration/evidence branch and link its PR to this Issue.
After the staging result is reviewed, the reviewer merges the documented
release PR from lab3-staging to main. Update the project board and close this
Issue only when the workflow permits.
