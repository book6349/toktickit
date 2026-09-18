# Lab 3 Sprint Engineering Specification

Status: Draft planning contract. No requirement in this document is marked
complete until the corresponding implementation, test, and evidence exist on
the final integrated branch.

## 1. Sprint Goal

Deliver the next TokTickIT increment with secure, real user authentication and
backend-enforced role authorization. Requesters continue their Lab 2 ticket
work through their authenticated identity, IT Staff receive an operational
queue and ticket workflow, and Administrators receive a deliberately small
user-management screen.

## 2. Stakeholder Request

Replace the temporary Development Requester selector with login using an email
address and password. Enforce a mandatory password change for accounts using
an initial password. Preserve the Lab 2 requester ticket and attachment
capabilities, add public communication and requester resolution indication,
give IT Staff a queue and ticket operations, and give Administrators only the
user-account operations needed for the lab.

## 3. Scope

### Included

- Email/password login, logout, current-user retrieval, and first-login
  password change.
- Active/inactive accounts and safe authentication errors.
- Exactly one role per user: REQUESTER, IT_STAFF, or ADMINISTRATOR.
- Server-side authentication, role checks, and ownership checks.
- Migration of existing Lab 2 RequesterUser records into the canonical User
  model without losing Tickets or Attachments.
- Requester regression using authenticated identity rather than a client
  supplied requesterId.
- Requester Public Comments and a Problem Appears Resolved indication.
- IT Staff Ticket Queue with search, filters, sorting, pagination, and
  meaningful processing states.
- IT Staff Ticket Detail with ownership, IT Priority, permitted status
  transitions, Public Comments, Internal Notes, and existing Attachments.
- Minimal Administrator User Management: list, search, optional role filter,
  create, basic edit, activation/deactivation, and new initial password.
- Zen Green responsive and accessible UI extensions.
- Unit, API/integration, UI component/style, authorization, migration,
  regression, responsive, and end-to-end tests.

### Explicitly excluded

- Email invitations, password-reset email, MFA, social login, and SSO.
- Self-registration or Requester-created accounts.
- Actions Taken, formal SLA calculation, escalation, notifications, and KPI
  dashboards.
- Multi-tenant organizations, departments, profile photos, and account-history
  screens.
- Multiple roles per user, user deletion, bulk operations, import/export, and
  advanced identity-management workflows.
- Production deployment or cloud-infrastructure changes.

## 4. Engineering Decisions

### 4.1 Authentication and sessions

- Passwords are hashed with Node's built-in asynchronous scrypt implementation
  using a per-password random salt. Plaintext passwords never enter the
  database.
- Authentication uses a server-side opaque session. The browser receives only
  a random session token in an HttpOnly, SameSite=Lax cookie named
  toktickit_session. The database stores only a hash of that token.
- Sessions expire after eight hours and are revoked on logout. A revoked or
  expired session cannot authenticate any protected request.
- Unsafe cross-origin requests require the approved local origin and a
  double-submit CSRF token. The CSRF token is not a credential and is never
  used as authorization.
- Client code uses fetch credentials and never stores session tokens in
  localStorage, sessionStorage, URLs, or rendered page data.
- Login returns safe user identity and role data only. It never returns a
  password, password hash, session token, or secret.

### 4.2 Password policy

- A new password must contain 12–128 characters, at least one letter and one
  number, and must not be whitespace-only.
- The new password must differ from the current initial password.
- Initial passwords are local-development test credentials only and are
  documented as such. No real personal password or secret may be committed.

### 4.3 User model migration

- The Prisma model becomes User, with the existing SQL table retained through
  an explicit mapping to RequesterUser during this increment. This preserves
  existing IDs, Ticket requesterId values, and Attachment relationships.
- Existing RequesterUser rows become role REQUESTER, receive a seeded or
  migration-generated initial password hash, and are marked
  mustChangePassword=true.
- The Development Requester selector, Change Requester action, and
  X-Requester-Id ownership mechanism are removed from the normal application
  flow. The backend derives requester ownership from the authenticated User.
- Existing Tickets, Attachments, Categories, and Related Systems remain valid.
  Existing Tickets retain status NEW and receive IT Priority equal to their
  Requested Priority.

### 4.4 Role separation

Requester owns and manages only their own requester-facing Ticket resources.
IT Staff operate the shared Ticket workflow. Administrators manage accounts and
have only the explicit read/priority/note permissions listed in the
authorization matrix below; Administrator does not automatically receive the
IT Staff queue.

## 5. Functional Requirements

### Authentication and shell

- FR-01: The system shall authenticate an active user by email and password.
- FR-02: The system shall reject inactive users without revealing unnecessary
  account state.
- FR-03: The system shall establish a server-side session after valid login.
- FR-04: The system shall provide current authenticated user identity and role.
- FR-05: The system shall require a valid password change before a user with
  mustChangePassword=true can enter normal application screens.
- FR-06: The system shall revoke the session and clear authenticated access on
  logout.
- FR-07: The shell shall display the authenticated user's name and role and
  expose only permitted navigation.
- FR-08: Direct access after logout or without a valid session shall be blocked.

### Requester regression

- FR-09: A Requester shall create Tickets using the authenticated identity.
- FR-10: A Requester shall list and open only owned Tickets.
- FR-11: A Requester shall use only permitted owned Attachment operations.
- FR-12: A Requester shall post append-only Public Comments on owned Tickets.
- FR-13: A Requester shall set or clear a Problem Appears Resolved indication
  on an owned Ticket.
- FR-14: A Requester shall not set formal Resolved or Closed status.

### IT Staff operations

- FR-15: IT Staff shall retrieve a shared Ticket Queue.
- FR-16: The Queue shall support documented search, filters, sorting, and
  pagination.
- FR-17: IT Staff shall open Ticket Detail and see ownership, requested
  priority, IT Priority, status, comments, notes, and Attachments.
- FR-18: IT Staff shall claim, assign, or reassign Ticket ownership.
- FR-19: IT Staff shall update IT Priority.
- FR-20: IT Staff shall perform only the documented status transitions.
- FR-21: IT Staff shall post Public Comments and Internal Notes.

### Administrator user management

- FR-22: Administrators shall view a user list containing name, email, role,
  status, and an Edit action.
- FR-23: Administrators shall search users by name or email and may filter by
  one role.
- FR-24: Administrators shall create a user with one permitted role, active
  state, and an initial password.
- FR-25: Administrators shall edit name, email, role, and activation state.
- FR-26: Administrators shall set a new initial password that is required at
  the user's next login.
- FR-27: The system shall reject duplicate email addresses and invalid roles.
- FR-28: The system shall prevent self-deactivation and deactivation of the
  last active Administrator.

### Cross-cutting behavior

- FR-29: Every protected API operation shall enforce authentication and
  authorization on the server.
- FR-30: Public Comments and Internal Notes shall be separate in the API and
  visually distinct in the UI.
- FR-31: The UI shall show loading, saving, success, validation, empty,
  no-results, forbidden, not-found, conflict, and safe failure feedback where
  meaningful.
- FR-32: Lab 3 screens shall preserve the Lab 2 Zen Green tokens, component
  conventions, keyboard access, and responsive behavior.
- FR-33: Seed behavior shall be idempotent and shall provide the required
  active and inactive role fixtures without real secrets.

## 6. Business Rules

### Authentication and identity

- BR-01: Only an active user with valid credentials may authenticate.
- BR-02: A user requiring a password change cannot enter normal application
  screens until a valid new password is saved.
- BR-03: Login, password change, and logout use safe error messages and never
  expose password hashes, session tokens, or stack traces.
- BR-04: Session identity comes from the validated server-side session.
- BR-05: Inactive users cannot authenticate or use an existing session.
- BR-06: A client-supplied requesterId, userId, role, or ownerId cannot replace
  the authenticated identity or bypass authorization.
- BR-07: Email addresses are unique case-insensitively after trimming.
- BR-08: A password change revokes or rotates the pre-change session before
  granting normal application access.

### Requester ownership and regression

- BR-09: A Ticket requester is the authenticated Requester who created it.
- BR-10: Requester list, detail, Attachment, comment, and resolution queries
  are scoped to the authenticated Requester in the database query.
- BR-11: Cross-requester resources use a safe not-found response and do not
  disclose whether another user's resource exists.
- BR-12: Requesters may post Public Comments only on owned Tickets.
- BR-13: Requesters may indicate that a problem appears resolved but cannot
  formally set Resolved or Closed.

### Comments, notes, ownership, priority, and status

- BR-14: Public Comments are visible to the owning Requester, IT Staff, and
  Administrator.
- BR-15: Internal Notes are visible only to IT Staff and Administrator.
- BR-16: Comments and Notes are append-only in Lab 3.
- BR-17: Content is trimmed, rejects empty or whitespace-only input, has a
  maximum of 4,000 characters, and is rendered as text rather than unsafe HTML.
- BR-18: Each Comment or Note records its backend author and creation time.
- BR-19: A Ticket has zero or one primary owner. An assigned owner must be an
  active IT Staff or Administrator account.
- BR-20: New Ticket IT Priority copies Requested Priority.
- BR-21: Only IT Staff or Administrator may change IT Priority; the Requester
  cannot submit or override it.
- BR-22: Status values are New, Open, In Progress, Waiting for Requester,
  Resolved, Closed, Reopened, and Cancelled.
- BR-23: Only status transitions in the approved transition matrix are valid.
- BR-24: Transitions to Resolved, Closed, or Cancelled require explicit UI
  confirmation and an API confirm value.
- BR-25: Actions Taken are not required in Lab 3 and do not block resolution.

### Administrator safety

- BR-26: Each User has exactly one permitted role.
- BR-27: Administrators cannot delete users.
- BR-28: Administrators cannot deactivate their own account.
- BR-29: The system must retain at least one active Administrator.
- BR-30: Setting an initial password stores only its hash and sets
  mustChangePassword=true.
- BR-31: Deactivation prevents future login and protected access but preserves
  the user's historical Ticket, Comment, and Note authorship.

### Data, validation, and failures

- BR-32: Seed operations are safe to run repeatedly.
- BR-33: Required foreign-key relationships and ownership indexes remain valid
  after migration.
- BR-34: Invalid input returns a field-aware safe response where appropriate.
- BR-35: Unauthenticated, forbidden, invalid, missing, conflict, and
  unexpected-error cases remain distinguishable by status and error code.
- BR-36: Server failures never return filesystem paths, stack traces, hashes, or
  unrelated user data.

## 7. Authorization Matrix

| Operation | Requester | IT Staff | Administrator |
|---|---|---|---|
| Login, logout, current user | Own session | Own session | Own session |
| Mandatory password change | Own account | Own account | Own account |
| Requester Ticket create/list/detail | Own identity and Tickets | No | No |
| Requester Attachments | Own Tickets only | No through requester API | No through requester API |
| Requester Public Comments | Own Tickets | No through requester API | No through requester API |
| Problem Appears Resolved | Own Tickets | Read indication | Read indication |
| IT Staff Queue | No | Yes | No |
| Staff Ticket Detail | No | Read and operate | Read-only direct detail |
| Claim/reassign ownership | No | Yes; active IT Staff/Admin targets | No |
| Update IT Priority | No | Yes | Yes on permitted detail API |
| Status transitions | No | Yes | No |
| Public Comments | Own Tickets | Yes | Yes on permitted detail API |
| Internal Notes | No | Yes | Yes |
| User Management | No | No | Yes |

The Administrator detail and IT Priority permissions are explicit exceptions
to the minimum Administrator role so that the owner, priority, and note
visibility rules remain testable without granting the Administrator the shared
IT Staff Queue.

## 8. Ticket Status Transition Matrix

| From | To | Permitted role | Confirmation |
|---|---|---|---|
| New | Open | IT Staff | No |
| New | Cancelled | IT Staff | Yes |
| Open | In Progress | IT Staff | No |
| Open | Waiting for Requester | IT Staff | No |
| Open | Resolved | IT Staff | Yes |
| Open | Cancelled | IT Staff | Yes |
| In Progress | Waiting for Requester | IT Staff | No |
| In Progress | Resolved | IT Staff | Yes |
| In Progress | Cancelled | IT Staff | Yes |
| Waiting for Requester | In Progress | IT Staff | No |
| Waiting for Requester | Resolved | IT Staff | Yes |
| Waiting for Requester | Cancelled | IT Staff | Yes |
| Resolved | Closed | IT Staff | Yes |
| Resolved | Reopened | IT Staff | No |
| Closed | Reopened | IT Staff | No |
| Reopened | In Progress | IT Staff | No |
| Reopened | Waiting for Requester | IT Staff | No |
| Reopened | Resolved | IT Staff | Yes |
| Reopened | Cancelled | IT Staff | Yes |
| Cancelled | Reopened | IT Staff | No |

No Requester operation changes the formal Ticket status.

## 9. Data Model and Migration

### User

The canonical Prisma model is User. During this increment it maps to the
existing RequesterUser table so existing IDs and foreign keys remain stable.
It adds name, email, passwordHash, role, isActive, mustChangePassword,
createdAt, and updatedAt.

### Session

Session stores id, tokenHash, userId, createdAt, expiresAt, and revokedAt.
Only tokenHash is persisted; the raw cookie value is never stored.

### Ticket additions

Ticket retains requesterId and all Lab 2 fields. Lab 3 adds nullable ownerId,
itPriority, expanded TicketStatus values, and
requesterResolutionIndicatedAt. Existing rows keep NEW status and copy
requestedPriority into itPriority.

### Comments and notes

PublicComment and InternalNote each store id, ticketId, authorId, content, and
createdAt. Separate models prevent an Internal Note from being accidentally
returned through the Public Comment query.

### Migration requirements

- Preserve all existing Category, RelatedSystem, Ticket, and Attachment rows.
- Convert all existing RequesterUser records to role REQUESTER.
- Assign safe local initial-password hashes and require a first-login change.
- Add nullable or defaulted fields before enforcing any new required behavior.
- Add foreign keys and indexes for requester ownership, ticket owner, session
  lookup, comments, notes, and queue queries.
- Test the migration and a fresh idempotent seed on the documented disposable
  PostgreSQL setup.

### Seed requirements

The idempotent seed shall provide at least:

- Four active Requesters and one inactive Requester.
- Three active IT Staff and one inactive IT Staff.
- One active Administrator.
- Tickets distributed across Requesters, statuses, requested/IT priorities,
  and assigned/unassigned ownership.
- Non-sensitive Public Comments and Internal Notes.

## 10. Acceptance Criteria

- AC-01: An active user with valid credentials receives authenticated access,
  safe identity data, and the permitted role.
- AC-02: Invalid credentials and inactive accounts receive safe failures.
- AC-03: An initial-password user cannot reach normal application screens before
  saving a valid replacement password.
- AC-04: Logout revokes access and direct protected access is blocked afterward.
- AC-05: The shell and navigation show only the authenticated role's permitted
  destinations.
- AC-06: A Requester creates and retrieves Tickets through authenticated
  ownership, with no client requesterId override.
- AC-07: Existing Requester Ticket and Attachment functions continue to work
  without the Development Requester selector.
- AC-08: Cross-requester Ticket and Attachment access is rejected safely.
- AC-09: Public Comments are visible to all required roles and Internal Notes
  are hidden from Requesters.
- AC-10: A Requester can set Problem Appears Resolved without formally resolving
  or closing the Ticket.
- AC-11: IT Staff Queue supports the documented search, filters, sorting, and
  pagination behavior.
- AC-12: Queue loading, empty, no-results, forbidden, and failure states are
  visible and safe.
- AC-13: IT Staff Ticket Detail shows operational fields, comments, notes, and
  Attachments without exposing private notes to Requesters.
- AC-14: IT Staff can claim/reassign ownership only to valid active targets.
- AC-15: IT Priority starts from Requested Priority and can be updated only by
  permitted roles.
- AC-16: The backend accepts only permitted status transitions and requires
  confirmations where specified.
- AC-17: Comments and notes reject empty content, record backend author/time,
  and cannot be edited or deleted.
- AC-18: Administrators can list users with the required fields.
- AC-19: Administrator name/email search and optional role filtering work.
- AC-20: Administrators can create a user with one permitted role and initial
  password.
- AC-21: Duplicate email, invalid role, and invalid input are rejected safely.
- AC-22: Administrators can edit basic account information and activation.
- AC-23: A reset initial password forces a change at the next login.
- AC-24: Self-deactivation and removal of the last active Administrator are
  prevented.
- AC-25: Non-Administrators cannot use User Management endpoints or screens.
- AC-26: Migration preserves Lab 2 data and seed behavior is idempotent.
- AC-27: All major Lab 3 screens satisfy Zen Green, responsive, keyboard,
  focus, validation, and overflow requirements.

Every AC must map to at least one planned test in docs/lab-03/tests.md and
must have final evidence before it is marked Passed.

## 11. Product Definition of Done

- The approved specification, API contract, UI specification, and test plan
  agree with the implementation.
- Authentication, password change, logout, session expiry/revocation, and
  role navigation are implemented and tested.
- Every protected API operation enforces backend authorization and ownership.
- Lab 2 data survives migration and the authenticated Requester regression
  passes.
- Queue, Ticket Detail, comments, notes, ownership, priority, and status
  behavior satisfy the approved matrix.
- Administrator User Management satisfies all required safety rules.
- Required unit/API/UI/style/security/migration/regression/E2E tests pass.
- Responsive screenshots and visual checklists cover all major Lab 3 screens.
- Reviewer and AI-use evidence is complete and traceable.
- Feature PRs are reviewed and merged into lab3-staging, then the release PR
  is reviewed and merged into main.
- The final PDF contains exactly one concise submission with Answer Part 1
  through Answer Part 9, readable screenshots, working links, and honest
  evidence labels.

## 12. Assumptions and Decisions to Reconfirm Before Implementation

- The User Prisma model maps the existing RequesterUser SQL table for this
  increment rather than copying or deleting historical records.
- The session cookie is the only browser credential; no token is exposed to
  React code.
- Administrator access to direct read-only Ticket Detail, Internal Notes, and
  IT Priority is intentionally explicit; Administrator does not receive the
  IT Staff Queue.
- Pagination defaults to page 1 with page sizes 10, 20, or 50. Queue search
  covers ticket number, summary, description, requester name, and requester
  email. Queue sorting covers updatedAt, createdAt, ticketNumber, status,
  requestedPriority, itPriority, and owner.
- Final issue numbers, PR numbers, reviewer identity, and approval evidence
  remain unknown until the controlled GitHub workflow is approved and used.
