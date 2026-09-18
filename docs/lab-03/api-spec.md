# Lab 3 REST API Specification

Status: Draft planning contract. Endpoint behavior is Planned until the
implementation and automated tests verify it.

## 1. Conventions

- Base path: /api.
- JSON is used unless an endpoint explicitly requires multipart/form-data.
- IDs are positive integers.
- Dates are ISO 8601 UTC strings.
- Authentication uses the HttpOnly toktickit_session cookie.
- Unsafe requests require a matching X-CSRF-Token header and CSRF cookie.
- The client never sends X-Requester-Id for ownership.
- The authenticated user is resolved from the server-side session.
- Error responses never include stack traces, filesystem paths, password
  hashes, session tokens, or unrelated protected-resource data.

## 2. Error Envelope

All JSON errors use this shape:

    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Request validation failed.",
        "fields": {
          "email": "Enter a valid email address."
        }
      }
    }

The fields property is included only when field-level feedback is useful.

| Status | Error codes | Meaning |
|---|---|---|
| 400 | VALIDATION_ERROR, INVALID_QUERY, INVALID_TRANSITION, INVALID_CSRF | Input or transition is invalid |
| 401 | UNAUTHENTICATED, INVALID_CREDENTIALS | No valid session or credentials |
| 403 | FORBIDDEN, PASSWORD_CHANGE_REQUIRED, INACTIVE_ACCOUNT | Authenticated but not permitted |
| 404 | RESOURCE_NOT_FOUND | Missing or unauthorized protected resource |
| 409 | CONFLICT, DUPLICATE_EMAIL, LAST_ADMINISTRATOR | State or uniqueness conflict |
| 413 | PAYLOAD_TOO_LARGE | File or configured payload limit exceeded |
| 415 | UNSUPPORTED_MEDIA_TYPE | Unsupported upload type |
| 500 | INTERNAL_ERROR | Safe unexpected server failure |

Cross-owner Ticket, Attachment, Comment, and Note lookups return the same
404 RESOURCE_NOT_FOUND shape as an actually missing resource.

## 3. User and Session Shapes

### Safe User

    {
      "id": 101,
      "name": "Ariya Somchai",
      "email": "ariya.somchai@example.com",
      "role": "REQUESTER",
      "isActive": true,
      "mustChangePassword": false,
      "createdAt": "2026-09-18T10:00:00.000Z",
      "updatedAt": "2026-09-18T10:00:00.000Z"
    }

The API never returns passwordHash, raw session tokens, CSRF secrets, or
initial passwords in a User shape.

### Session behavior

- Login sets toktickit_session with HttpOnly, SameSite=Lax, a bounded
  expiration, and Secure when the environment uses HTTPS.
- Logout clears the cookie and revokes the database session.
- Expired or revoked sessions return 401.
- A session in password-change-only mode can call current-user,
  change-password, CSRF, and logout endpoints only.

## 4. CSRF

### GET /api/auth/csrf

Returns a fresh CSRF token and sets the matching non-HttpOnly CSRF cookie.
The token is not an authentication credential.

Success:

- 200 OK
- Body: { "csrfToken": "..." }

The client sends the returned value in X-CSRF-Token for login, logout,
password changes, Ticket mutations, comments, notes, staff operations, and
Administrator mutations.

## 5. Authentication

### POST /api/auth/login

Request:

    {
      "email": "ariya.somchai@example.com",
      "password": "local-development-password"
    }

Success:

- 200 OK
- Sets the session cookie.
- Body: { "user": SafeUser, "mustChangePassword": true|false }

Invalid credentials, nonexistent accounts, and inactive accounts use the same
safe 401 INVALID_CREDENTIALS response. Validation of malformed input uses 400.

### GET /api/auth/me

Requires a valid session. Returns:

- 200 OK
- Body: { "user": SafeUser, "mustChangePassword": true|false }

A password-change-only session returns the user and the flag but normal
application endpoints remain blocked.

### POST /api/auth/change-password

Requires a valid session, including a password-change-only session.

Request:

    {
      "currentPassword": "local-development-password",
      "newPassword": "New-local-password-2026"
    }

The server validates the password policy, hashes the new password, clears
mustChangePassword, rotates or revokes the old session, and establishes normal
authenticated access.

Success:

- 200 OK
- Body: { "user": SafeUser, "mustChangePassword": false }

Failures:

- 400 VALIDATION_ERROR for password boundaries or missing fields.
- 401 UNAUTHENTICATED for no session.
- 403 INVALID_CREDENTIALS when currentPassword is wrong.

### POST /api/auth/logout

Requires the current session when one exists. The operation is idempotent.

Success:

- 204 NO CONTENT
- Revokes the session and clears the cookie.

## 6. Authenticated Requester API

The existing Lab 2 Ticket and Attachment routes continue under authenticated
ownership. Their request and response shapes remain compatible except that
the X-Requester-Id header is removed and Lab 3 fields are added.

### GET /api/tickets

Permitted: authenticated Requester, for owned Tickets only.

Query parameters:

- search: case-insensitive search in summary and description.
- categoryId: positive integer.
- requestedPriority: LOW, MEDIUM, or HIGH.
- status: one permitted status value.
- sortBy: updatedAt, createdAt, ticketNumber, requestedPriority, or status.
- sortDirection: asc or desc.
- page: one-based page number, default 1.
- pageSize: 10, 20, or 50, default 10.

Success:

- 200 OK
- Body: { "items": [Ticket], "pagination": Pagination }

The requesterId is always taken from the authenticated User. Invalid query
parameters return 400 INVALID_QUERY.

### POST /api/tickets

Permitted: authenticated Requester.

Content type: multipart/form-data. Fields remain the Lab 2 fields:
categoryId, relatedSystemId, requestedPriority, summary, description, and
optional attachments.

The server derives requesterId, creates status NEW, and initializes itPriority
from requestedPriority.

Success:

- 201 CREATED
- Body: { "ticket": Ticket }

Ownership or authentication failures are returned before persistence. Existing
Lab 2 file limits remain: permitted JPEG, PNG, WEBP, and PDF types; 5 MB per
file; five active files per Ticket; all-or-nothing validation.

### GET /api/tickets/:ticketId

Permitted: authenticated Requester who owns the Ticket.

- 200 OK with { "ticket": Ticket }
- 404 RESOURCE_NOT_FOUND for missing or cross-owner Ticket.

### GET /api/tickets/:ticketId/attachments

Permitted: authenticated Requester who owns the Ticket.

- 200 OK with { "attachments": [Attachment] }
- 404 RESOURCE_NOT_FOUND for missing or cross-owner Ticket.

### POST /api/tickets/:ticketId/attachments

Permitted: authenticated Requester who owns the Ticket.

Content type: multipart/form-data with one or more attachments.

- 201 CREATED with { "attachments": [Attachment] }
- 400 VALIDATION_ERROR for malformed input.
- 413 PAYLOAD_TOO_LARGE for size/count limits.
- 415 UNSUPPORTED_MEDIA_TYPE for unsupported types.
- 404 RESOURCE_NOT_FOUND for missing or cross-owner Ticket.

### GET /api/attachments/:attachmentId/download

Permitted: authenticated Requester who owns the parent Ticket.

- 200 OK with the stored file stream and safe Content-Disposition.
- 404 RESOURCE_NOT_FOUND for missing, removed, or unauthorized Attachment.

The storage directory is never served as a public static directory.

### DELETE /api/attachments/:attachmentId

Permitted: authenticated Requester who owns the parent Ticket.

Request:

    { "reason": "The screenshot is no longer needed." }

The reason must contain 5–250 trimmed characters.

- 200 OK with { "attachment": Attachment }
- 400 VALIDATION_ERROR for an invalid reason.
- 404 RESOURCE_NOT_FOUND for missing, removed, or unauthorized Attachment.

The database metadata remains and the file is no longer downloadable.

## 7. Requester Comments and Resolution Indication

### GET /api/tickets/:ticketId/comments

Permitted: an authenticated owner, IT Staff, or Administrator with the
corresponding ticket-detail permission.

- Requesters receive Public Comments for owned Tickets.
- IT Staff and Administrators receive Public Comments for permitted details.
- 200 OK with { "comments": [PublicComment] }.
- 404 RESOURCE_NOT_FOUND for inaccessible Tickets.

### POST /api/tickets/:ticketId/comments

Request:

    { "content": "The replacement laptop is available." }

This endpoint always creates a Public Comment. It rejects empty or
whitespace-only content and content longer than 4,000 characters.

- 201 CREATED with { "comment": PublicComment }
- 400 VALIDATION_ERROR for invalid content.
- 403 FORBIDDEN for a role without access.
- 404 RESOURCE_NOT_FOUND for an inaccessible Ticket.

### POST /api/tickets/:ticketId/resolution-indication

Permitted: authenticated Requester who owns the Ticket.

Request:

    { "appearsResolved": true }

Success:

- 200 OK with { "appearsResolved": true, "indicatedAt": "..." }

This operation never changes the formal status.

## 8. IT Staff Queue and Ticket Operations

### GET /api/staff/tickets

Permitted: IT Staff only.

Query parameters:

- search: ticket number, summary, description, requester name, or requester
  email; case-insensitive.
- status: one TicketStatus value.
- requestedPriority: LOW, MEDIUM, or HIGH.
- itPriority: LOW, MEDIUM, or HIGH.
- ownerId: positive User ID.
- ownership: assigned or unassigned.
- sortBy: updatedAt, createdAt, ticketNumber, status, requestedPriority,
  itPriority, or owner.
- sortDirection: asc or desc.
- page: one-based page number, default 1.
- pageSize: 10, 20, or 50, default 10.

The default ordering is updatedAt descending followed by id descending.

Success:

- 200 OK
- Body: { "items": [QueueTicket], "pagination": Pagination }

Invalid parameters return 400 INVALID_QUERY. A valid query with no matches
returns an empty items array with pagination metadata.

### GET /api/staff/tickets/:ticketId

Permitted: IT Staff and Administrator.

- 200 OK with { "ticket": StaffTicketDetail }
- 403 FORBIDDEN only when the role lacks this explicit detail permission.
- 404 RESOURCE_NOT_FOUND for a missing Ticket.

Administrators receive read-only detail access and do not receive the Queue.

### PATCH /api/staff/tickets/:ticketId/owner

Permitted: IT Staff.

Request:

    { "ownerId": 203 }

ownerId may be null to unassign or an active IT Staff/Administrator User ID.
The server validates role and activation state.

- 200 OK with { "ticket": StaffTicketDetail }
- 400 VALIDATION_ERROR for malformed IDs.
- 404 RESOURCE_NOT_FOUND for missing Ticket or target User.
- 409 CONFLICT for an inactive or disallowed target.

### PATCH /api/staff/tickets/:ticketId/priority

Permitted: IT Staff or Administrator with detail permission.

Request:

    { "itPriority": "HIGH" }

- 200 OK with { "ticket": StaffTicketDetail }
- 400 VALIDATION_ERROR for an invalid priority.
- 404 RESOURCE_NOT_FOUND for a missing Ticket.

### PATCH /api/staff/tickets/:ticketId/status

Permitted: IT Staff.

Request:

    { "status": "RESOLVED", "confirm": true }

The server evaluates the current status, requested target, role, and
confirmation requirement atomically.

- 200 OK with { "ticket": StaffTicketDetail }
- 400 INVALID_TRANSITION or VALIDATION_ERROR.
- 404 RESOURCE_NOT_FOUND for a missing Ticket.
- 409 CONFLICT when the Ticket changed before the update.

### GET /api/staff/tickets/:ticketId/notes

Permitted: IT Staff and Administrator.

- 200 OK with { "notes": [InternalNote] }
- 404 RESOURCE_NOT_FOUND for a missing Ticket.

### POST /api/staff/tickets/:ticketId/notes

Permitted: IT Staff and Administrator.

Request:

    { "content": "Checked device policy and requested a replacement." }

- 201 CREATED with { "note": InternalNote }
- 400 VALIDATION_ERROR for invalid content.
- 404 RESOURCE_NOT_FOUND for a missing Ticket.

Internal Notes are never included in Requester responses.

## 9. Administrator User Management

### GET /api/admin/users

Permitted: Administrator.

Query parameters:

- search: case-insensitive name or email search.
- role: optional single REQUESTER, IT_STAFF, or ADMINISTRATOR filter.

Success:

- 200 OK
- Body: { "users": [SafeUser] }

No mandatory pagination or multi-column sorting is required in Lab 3.

### POST /api/admin/users

Permitted: Administrator.

Request:

    {
      "name": "New Staff",
      "email": "new.staff@example.com",
      "role": "IT_STAFF",
      "isActive": true,
      "initialPassword": "Local-password-2026"
    }

The new user receives mustChangePassword=true.

- 201 CREATED with { "user": SafeUser }
- 400 VALIDATION_ERROR for invalid fields.
- 409 DUPLICATE_EMAIL for a case-insensitive duplicate.

### PATCH /api/admin/users/:userId

Permitted: Administrator.

Request may contain name, email, role, and isActive. It cannot contain a
password or silently assign multiple roles.

- 200 OK with { "user": SafeUser }
- 400 VALIDATION_ERROR for invalid fields.
- 403 FORBIDDEN for self-deactivation.
- 404 RESOURCE_NOT_FOUND for missing User.
- 409 DUPLICATE_EMAIL or LAST_ADMINISTRATOR for conflicts.

### POST /api/admin/users/:userId/initial-password

Permitted: Administrator.

Request:

    { "initialPassword": "New-local-password-2026" }

The hash is replaced and mustChangePassword=true.

- 200 OK with { "user": SafeUser }
- 400 VALIDATION_ERROR for password policy failure.
- 404 RESOURCE_NOT_FOUND for missing User.

## 10. Response Shapes

### Ticket

Ticket responses include the Lab 2 fields plus:

    {
      "owner": { "id": 203, "name": "Somchai Staff", "role": "IT_STAFF" },
      "itPriority": "HIGH",
      "status": "IN_PROGRESS",
      "appearsResolved": false,
      "requester": { "id": 101, "name": "Ariya Somchai", "email": "..." },
      "category": { "id": 1, "name": "Hardware" },
      "relatedSystem": { "id": 1, "name": "Corporate Laptop" },
      "attachments": [],
      "publicCommentCount": 0,
      "internalNoteCount": 0
    }

Requester responses omit Internal Notes and do not expose unowned data.

### PublicComment

    {
      "id": 9001,
      "ticketId": 5001,
      "content": "The replacement laptop is available.",
      "author": { "id": 203, "name": "Somchai Staff", "role": "IT_STAFF" },
      "createdAt": "2026-09-18T10:00:00.000Z"
    }

### InternalNote

The InternalNote shape matches PublicComment but is returned only by the
staff-note endpoints to IT Staff and Administrators.

### Pagination

    {
      "page": 1,
      "pageSize": 10,
      "totalItems": 0,
      "totalPages": 0,
      "hasPrevious": false,
      "hasNext": false
    }

## 11. Authorization Summary

Every protected endpoint uses session middleware followed by an explicit role
and ownership check. Frontend hiding is presentation feedback only. Direct
requests with altered IDs, roles, query parameters, or bodies must receive
the same backend decision as UI requests.

## 12. Traceability

- Authentication and first-login behavior: FR-01–FR-08, AC-01–AC-05.
- Requester regression and ownership: FR-09–FR-14, AC-06–AC-10.
- Queue and Ticket operations: FR-15–FR-21, AC-11–AC-17.
- User Management: FR-22–FR-28, AC-18–AC-25.
- Migration, failures, and UI evidence: FR-29–FR-33, AC-26–AC-27.
