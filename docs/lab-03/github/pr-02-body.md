# PR-02 body — Authentication, migration, authorization, and Requester regression

Suggested title:

    feat: add Lab 3 authentication and Requester authorization

Target branch: lab3-staging

Source branch: feature/lab3-auth-requester

Linked Issue: ISSUE-02. Link it through the Pull Request Development panel
after the real Issue number exists.

## Summary

This PR replaces the Lab 2 Development Requester simulation with secure
authentication, server-side authorization, and authenticated Requester
regression behavior.

## Included

- Canonical User model and preserved Lab 2 data migration.
- Password hashing, active/inactive state, one-role assignment, and initial
  password state.
- Opaque server-side sessions, CSRF handling, expiry/revocation, login,
  current-user, logout, and password-change APIs.
- Login, Change Password, role shell, and logout UI.
- Backend authentication, role, and ownership middleware.
- Removal of the Development Requester selector and X-Requester-Id ownership
  path.
- Requester Ticket, Attachment, Public Comment, and resolution-indication
  regression.
- Required idempotent role seed data.

## Not included

- IT Staff Queue or Ticket Detail operations.
- Administrator User Management screen.
- Final integrated E2E screenshots or release integration.

## Validation to record

- Server authentication, authorization, migration, and regression tests.
- Client Login and ChangePassword tests.
- Prisma validation, migration, and idempotent seed checks.
- Authentication E2E flow.

Do not mark any check Passed until its exact command and output are recorded.

## Review focus

1. Existing Ticket and Attachment IDs and ownership survive migration.
2. Initial-password sessions cannot access normal application APIs.
3. Session, CSRF, logout, inactive-account, and expiry behavior are safe.
4. Requester ownership comes only from the authenticated session.
5. Direct cross-owner and cross-role API requests are rejected.

## Workflow checklist

- [ ] ISSUE-02 exists and is linked through Development.
- [ ] ISSUE-01 is merged into lab3-staging.
- [ ] Issue card is in PR Review.
- [ ] Friend review comment is present.
- [ ] Author replied to every review comment.
- [ ] Friend approval is present.
- [ ] Reviewer, not the PR author, merges into lab3-staging.
