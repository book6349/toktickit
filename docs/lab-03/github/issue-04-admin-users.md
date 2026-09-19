# Issue 04 — Administrator User Management

## Context

Administrators need a minimal screen for the account operations required by
Lab 3. The screen must not grow into a general identity-management system.

## Scope

- Administrator-only user list showing Name, Email, Role, Status, and Edit.
- Search by name or email.
- Optional single-role filter.
- Create a user with one permitted role and initial password.
- Edit name, email, role, and activation state.
- Set a new initial password and require a change at next login.
- Duplicate-email and invalid-role validation.
- Self-deactivation and last-active-Administrator protection.
- Responsive Zen Green UI and safe API failure feedback.

## Acceptance criteria

- [ ] Only Administrators can use User Management endpoints and navigation.
- [ ] The list contains the required fields and Edit action.
- [ ] Search and the optional role filter produce correct results.
- [ ] User creation stores a password hash and sets mustChangePassword.
- [ ] Duplicate email and invalid input are rejected safely.
- [ ] Basic editing updates only permitted fields.
- [ ] Activation/deactivation affects future authentication.
- [ ] Setting a new initial password forces a change at next login.
- [ ] An Administrator cannot deactivate their own account.
- [ ] The system cannot remove or deactivate the last active Administrator.
- [ ] No deletion, bulk operation, import/export, multiple roles, or advanced
      account-management feature is introduced.
- [ ] Desktop, tablet, and mobile User Management layouts are usable.

## Planned tests and evidence

- server/tests/lab-03/users-admin.api.test.ts
- client/tests/lab-03/UserManagement.test.tsx
- e2e/lab-03/user-administration.spec.ts
- User Management screenshots under artifacts/lab-03/screenshots/

## Dependencies

ISSUE-01 and ISSUE-02 must be merged into lab3-staging first.

## Out of scope

IT Staff Queue/Detail changes, email delivery, self-registration, user
deletion, bulk actions, and final release integration.

## Workflow

Use one branch named feature/lab3-admin-users, one PR targeting lab3-staging,
one linked Issue, one friend review, same-branch review fixes, reviewer-led
merge, and board/Issue updates only when permitted.
