# PR-04 body — Administrator User Management

Suggested title:
    feat: add Lab 3 Administrator user management

Target branch: `lab3-staging`

Source branch: `feature/lab3-admin-users`

Linked Issue: `ISSUE-04`; link it through the pull request Development section.

## Summary

This PR implements the minimal Administrator User Management workflow required
by Lab 3.

## Included

- User list with Name, Email, Role, Status, and Edit affordances.
- Search and filtering.
- Create and edit operations.
- Activation/deactivation and reset-initial-password behavior.
- Safety rules for duplicate email, invalid role, self-deactivation, and the last active Administrator.
- Responsive presentation and clear API feedback.

## Not included

Deletion, bulk import, multi-role accounts, email delivery, IT Staff Queue, and
final integrated evidence remain outside this workflow unit.

## Validation to attach before approval

- Direct Administrator API tests, including forbidden non-Administrator access and safety conflicts.
- Client User Management and responsive tests.
- Administrator E2E flow and required screenshots.

Evidence must be marked with its actual result; do not mark an item Passed
until it has been run or visibly captured.

## Review focus

- Case-insensitive duplicate-email handling.
- Password hashing and forced-change behavior for reset passwords.
- Backend protection against self-deactivation and deactivating the last active Administrator.
- Non-Administrator rejection and minimal responsive UI.

## Workflow checklist

- [ ] Approved Issue exists and is linked in Development.
- [ ] Dependencies are merged into the documented target branch.
- [ ] Required checks and evidence are attached.
- [ ] Friend reviewer comment is posted.
- [ ] Author reply addresses the review question.
- [ ] Friend approval is recorded.
- [ ] Only then does the approved reviewer merge to the documented target branch.
