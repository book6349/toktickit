# Lab 3 Test Plan, Traceability, and Results

Status: Test DD created before Lab 3 implementation. Every row is Planned
until the exact test command runs and its output is recorded.

## 1. Test Principles

- Tests are written from the approved specification and acceptance criteria,
  not reconstructed after implementation.
- Server tests verify authentication, authorization, ownership, validation,
  safe errors, migration behavior, and data visibility directly at the API.
- Client tests verify role navigation, form behavior, feedback, accessibility
  semantics, and Zen Green presentation.
- E2E tests verify integrated browser behavior against the real application and
  disposable PostgreSQL data.
- Responsive evidence uses the required desktop, tablet, and mobile sizes.
- A planned test is not evidence. Results are labeled Planned, Passed,
  Failed, Deferred, or Unavailable only after observation.

## 2. Planned Automated Test Files

### Server/API

Required server files:

- server/tests/lab-03/auth.api.test.ts
- server/tests/lab-03/authorization.api.test.ts
- server/tests/lab-03/staff-queue.api.test.ts
- server/tests/lab-03/staff-ticket-detail.api.test.ts
- server/tests/lab-03/comments-notes.api.test.ts
- server/tests/lab-03/users-admin.api.test.ts

Additional focused migration coverage:

- server/tests/lab-03/migration-regression.test.ts

### Client/UI

Required client files:

- client/tests/lab-03/Login.test.tsx
- client/tests/lab-03/ChangePassword.test.tsx
- client/tests/lab-03/StaffTicketQueue.test.tsx
- client/tests/lab-03/StaffTicketDetail.test.tsx
- client/tests/lab-03/UserManagement.test.tsx

Additional shared visual assertions:

- client/tests/lab-03/ui-style.test.tsx

### End to end

- e2e/lab-03/authentication.spec.ts
- e2e/lab-03/staff-ticket-flow.spec.ts
- e2e/lab-03/user-administration.spec.ts

## 3. Test Matrix

| ID | Type | Requirement / AC | What it tests | Automated file | Result |
|---|---|---|---|---|---|
| UNIT-01 | Unit | BR-03, BR-07, AC-01–AC-03 | Email normalization and password boundaries | auth.api.test.ts | Planned |
| UNIT-02 | Unit | BR-03 | scrypt hash/verify and no plaintext serialization | auth.api.test.ts | Planned |
| UNIT-03 | Unit | BR-23–BR-24, AC-16 | Status transition matrix and confirmation rules | authorization.api.test.ts | Planned |
| UNIT-04 | Unit | FR-16, AC-11 | Queue query parsing, defaults, and invalid values | staff-queue.api.test.ts | Planned |
| UNIT-05 | Unit | BR-17, AC-17 | Comment/note trimming, length, and safe text rules | comments-notes.api.test.ts | Planned |
| API-01 | API | FR-01, AC-01 | Active user login and safe User response | auth.api.test.ts | Planned |
| API-02 | API | FR-02, AC-02 | Invalid and inactive login behavior | auth.api.test.ts | Planned |
| API-03 | API | FR-04, AC-05 | Current-user response and role data | auth.api.test.ts | Planned |
| API-04 | API | FR-05, AC-03 | Initial-password gate and valid password change | auth.api.test.ts | Planned |
| API-05 | API | FR-06, AC-04 | Logout revocation and cookie clearing | auth.api.test.ts | Planned |
| API-06 | API | FR-29, AC-01–AC-05 | Expired/revoked sessions and CSRF enforcement | auth.api.test.ts | Planned |
| API-07 | API | FR-09–FR-14, AC-06–AC-08 | Authenticated Requester ownership and no requesterId override | authorization.api.test.ts | Planned |
| API-08 | Security | FR-29, AC-08, AC-25 | Direct role/ownership bypass attempts | authorization.api.test.ts | Planned |
| API-09 | API | FR-15–FR-16, AC-11–AC-12 | Queue search, filters, sort, pagination, and empty results | staff-queue.api.test.ts | Planned |
| API-10 | Security | FR-15, AC-12, AC-25 | Queue forbidden response for Requester/Admin | staff-queue.api.test.ts | Planned |
| API-11 | API | FR-17–FR-20, AC-13–AC-16 | Staff detail, owner, IT Priority, and status operations | staff-ticket-detail.api.test.ts | Planned |
| API-12 | Security | FR-17–FR-21, AC-13–AC-17 | Direct staff endpoint role restrictions | staff-ticket-detail.api.test.ts | Planned |
| API-13 | API | FR-12, FR-21, AC-09, AC-10 | Public Comments and requester resolution indication | comments-notes.api.test.ts | Planned |
| API-14 | Security | FR-21, AC-09, AC-17 | Internal Note visibility and append-only behavior | comments-notes.api.test.ts | Planned |
| API-15 | API | FR-22–FR-23, AC-18–AC-19 | Administrator list, search, and role filter | users-admin.api.test.ts | Planned |
| API-16 | API | FR-24, AC-20 | Administrator user creation and initial password state | users-admin.api.test.ts | Planned |
| API-17 | API | FR-25, FR-27, AC-21–AC-22 | Basic edit, duplicate email, and invalid role | users-admin.api.test.ts | Planned |
| API-18 | API | FR-26, AC-23 | Initial password reset and next-login gate | users-admin.api.test.ts | Planned |
| API-19 | Security | FR-28, AC-24–AC-25 | Self-deactivation, last Admin, and non-Admin rejection | users-admin.api.test.ts | Planned |
| MIG-01 | Migration | FR-33, AC-26 | Existing Lab 2 rows survive schema migration | migration-regression.test.ts | Planned |
| MIG-02 | Regression | FR-09–FR-14, AC-06–AC-07 | Existing Ticket and Attachment behavior with session identity | migration-regression.test.ts | Planned |
| MIG-03 | Seed | FR-33, AC-26 | Idempotent role counts, ticket distribution, comments, notes | migration-regression.test.ts | Planned |
| UI-01 | UI | FR-01–FR-08, AC-01–AC-05 | Login, safe failures, role display, logout, navigation | Login.test.tsx | Planned |
| UI-02 | UI | FR-05, AC-03 | Mandatory password change and continuation | ChangePassword.test.tsx | Planned |
| UI-03 | UI | FR-09–FR-14, AC-06–AC-10 | Requester regression, comments, resolution indication | Login.test.tsx | Planned |
| UI-04 | UI | FR-15–FR-16, AC-11–AC-12 | Queue controls and loading/empty/no-results/failure states | StaffTicketQueue.test.tsx | Planned |
| UI-05 | UI | FR-17–FR-21, AC-13–AC-17 | Staff detail controls, comments, notes, and confirmations | StaffTicketDetail.test.tsx | Planned |
| UI-06 | UI | FR-22–FR-28, AC-18–AC-25 | User list, search, create, edit, activation, safety feedback | UserManagement.test.tsx | Planned |
| STYLE-01 | UI style | FR-31–FR-32, AC-27 | Tokens, badges, read-only fields, focus, role shell | ui-style.test.tsx | Planned |
| STYLE-02 | Responsive | FR-32, AC-27 | Mobile/tablet layout and no overflow assertions | UI test files and E2E | Planned |
| E2E-01 | E2E | AC-01–AC-05 | Login, first-login change, shell role, logout, direct blocking | authentication.spec.ts | Planned |
| E2E-02 | E2E | AC-06–AC-10 | Authenticated Requester create/list/detail/comment/resolution flow | authentication.spec.ts | Planned |
| E2E-03 | E2E | AC-11–AC-17 | IT Staff Queue, detail, owner, priority, status, comments, notes | staff-ticket-flow.spec.ts | Planned |
| E2E-04 | E2E | AC-18–AC-25 | Administrator list, search, create/edit, reset, safety rules | user-administration.spec.ts | Planned |
| E2E-05 | Responsive | AC-27 | Required desktop/tablet/mobile screenshots and overflow checks | all E2E files | Planned |
| A11Y-01 | Accessibility | FR-31–FR-32, AC-27 | Labels, focus order, announcements, keyboard completion | all UI/E2E files | Planned |

## 4. Acceptance-Criterion Traceability

| AC | Planned test coverage | Final status |
|---|---|---|
| AC-01 | API-01, API-06, UI-01, E2E-01 | Planned |
| AC-02 | API-02, UI-01, E2E-01 | Planned |
| AC-03 | API-04, UI-02, E2E-01 | Planned |
| AC-04 | API-05, UI-01, E2E-01 | Planned |
| AC-05 | API-03, UI-01, STYLE-01, E2E-01 | Planned |
| AC-06 | API-07, MIG-02, UI-03, E2E-02 | Planned |
| AC-07 | MIG-02, UI-03, E2E-02 | Planned |
| AC-08 | API-07, API-08, MIG-02, E2E-02 | Planned |
| AC-09 | API-13, API-14, UI-03, UI-05, E2E-02, E2E-03 | Planned |
| AC-10 | API-13, UI-03, E2E-02 | Planned |
| AC-11 | API-09, UI-04, E2E-03 | Planned |
| AC-12 | API-10, UI-04, STYLE-02, E2E-03 | Planned |
| AC-13 | API-11, API-12, UI-05, E2E-03 | Planned |
| AC-14 | API-11, UI-05, E2E-03 | Planned |
| AC-15 | API-11, UI-05, E2E-03 | Planned |
| AC-16 | UNIT-03, API-11, UI-05, E2E-03 | Planned |
| AC-17 | UNIT-05, API-14, UI-05, E2E-03 | Planned |
| AC-18 | API-15, UI-06, E2E-04 | Planned |
| AC-19 | API-15, UI-06, E2E-04 | Planned |
| AC-20 | API-16, UI-06, E2E-04 | Planned |
| AC-21 | API-17, UI-06, E2E-04 | Planned |
| AC-22 | API-17, UI-06, E2E-04 | Planned |
| AC-23 | API-18, UI-06, E2E-04 | Planned |
| AC-24 | API-19, UI-06, E2E-04 | Planned |
| AC-25 | API-08, API-10, API-12, API-19, UI-01, UI-06 | Planned |
| AC-26 | MIG-01, MIG-02, MIG-03 | Planned |
| AC-27 | STYLE-01, STYLE-02, A11Y-01, E2E-05 | Planned |

## 5. Commands to Record

Commands will be run after implementation on the integrated Lab 3 branch and
then repeated or confirmed from final main:

    cd server
    npm test -- --run tests/lab-03
    npm run build
    npx prisma validate

    cd ..\client
    npm test -- --run tests/lab-03
    npm run build

    cd ..
    npx playwright test e2e/lab-03

The disposable PostgreSQL migration/seed command sequence will be recorded
after the final migration strategy is implemented. It must include a
pre-migration Lab 2 data check, migration, idempotent seed, and post-migration
ownership/count check.

## 6. Evidence Rules

- Record date, branch, commit SHA, command, exit status, and relevant output.
- Store E2E screenshots under artifacts/lab-03/screenshots/ using stable
  screen and viewport names.
- Keep failed, deferred, unavailable, and partially evidenced checks visible.
- Do not turn a planned test into Passed because similar tests passed.
- A final result is accepted only when the exact test or visual capture exists
  on the documented final branch.
