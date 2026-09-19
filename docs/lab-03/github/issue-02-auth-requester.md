# Issue 02 — Authentication, migration, authorization, and Requester regression

## Context

Lab 2 uses a Development Requester selector and the X-Requester-Id header.
Lab 3 must replace that simulation with real authentication while preserving
existing Ticket and Attachment data and ownership behavior.

## Scope

- Evolve the existing RequesterUser data into the canonical User model.
- Add one role per user, password hash, activation state, and first-login
  password-change state.
- Add secure session creation, current-user retrieval, logout, CSRF handling,
  expiry/revocation, and safe authentication errors.
- Add login and mandatory Change Password screens.
- Enforce authentication, role, and ownership checks on the backend.
- Remove the Development Requester selector, Change Requester action, and
  client ownership override.
- Preserve Requester Ticket, Attachment, Public Comment, and resolution
  indication behavior.
- Add required role fixtures and idempotent seed behavior.

## Acceptance criteria

- [ ] Active users can log in with email and password.
- [ ] Invalid and inactive accounts receive safe failures.
- [ ] Initial-password users cannot enter normal application screens before a
      valid password change.
- [ ] Logout revokes access and direct access after logout is blocked.
- [ ] The authenticated shell shows the safe user identity and role.
- [ ] Requester ownership is derived from the session, not a client ID.
- [ ] Cross-requester Ticket and Attachment access returns a safe not-found
      response.
- [ ] Existing Lab 2 Ticket and Attachment data survives migration.
- [ ] Requester comments and Problem Appears Resolved work with authenticated
      ownership.
- [ ] Requesters cannot use Internal Notes or formal staff status changes.
- [ ] Seed counts and repeated seed behavior meet the Lab 3 contract.

## Planned tests and evidence

- server/tests/lab-03/auth.api.test.ts
- server/tests/lab-03/authorization.api.test.ts
- server/tests/lab-03/migration-regression.test.ts
- client/tests/lab-03/Login.test.tsx
- client/tests/lab-03/ChangePassword.test.tsx
- authentication E2E coverage
- migration and seed output from disposable PostgreSQL

## Dependencies

ISSUE-01 must be merged into lab3-staging first.

## Out of scope

IT Staff Queue/Detail implementation and Administrator User Management UI.

## Workflow

Use one branch named feature/lab3-auth-requester, one PR targeting
lab3-staging, one linked Issue, one friend review, same-branch review fixes,
reviewer-led merge, and board/Issue updates only when permitted.
