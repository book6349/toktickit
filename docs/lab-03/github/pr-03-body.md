# PR-03 body — IT Staff Queue, Ticket Detail, and ticket operations

Suggested title:
    feat: add Lab 3 IT Staff queue and ticket operations

Target branch: `lab3-staging`

Source branch: `feature/lab3-staff-workflow`

Linked Issue: `ISSUE-03`; link it through the pull request Development section.

## Summary

This PR implements the IT Staff workflow from Queue through Ticket Detail and
records the staff-side ticket operations needed by Lab 3.

## Included

- Queue search, filter, sort, pagination, and explicit empty/loading/error states.
- Responsive Queue and Ticket Detail views.
- Claim, assign, and reassign operations with the active owner shown.
- IT Priority and backend-enforced status transitions.
- Public Comments and Internal Notes with separate visibility and controls.
- Attachment behavior required by the approved contract.
- Explicit Administrator read-only Ticket Detail, Internal Note, and IT Priority access without Queue access.

## Not included

Authentication foundation, Administrator User Management, and final integrated
E2E/release evidence remain in their own workflow units.

## Validation to attach before approval

- Direct server Queue, detail, assignment, transition, comment, note, and attachment tests.
- Client Queue, Ticket Detail, responsive, and focus-state tests.
- Staff E2E flow and required screenshots.

Evidence must be marked with its actual result; do not mark an item Passed
until it has been run or visibly captured.

## Review focus

- Deterministic Queue query behavior and active-owner consistency.
- IT Priority and backend status enforcement.
- Internal Note privacy and safe error behavior.
- Clear visual distinction between Public Comments and Internal Notes.

## Workflow checklist

- [ ] Approved Issue exists and is linked in Development.
- [ ] Dependencies are merged into the documented target branch.
- [ ] Required checks and evidence are attached.
- [ ] Friend reviewer comment is posted.
- [ ] Author reply addresses the review question.
- [ ] Friend approval is recorded.
- [ ] Only then does the approved reviewer merge to the documented target branch.
