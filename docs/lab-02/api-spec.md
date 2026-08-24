# Lab 2 API Specification

## 1. Conventions

- Base path: `/api`
- Content type: JSON unless an endpoint explicitly requires `multipart/form-data`.
- IDs are positive integers.
- Dates use ISO 8601 UTC strings.
- Requester-scoped endpoints require the `X-Requester-Id` header.
- The header represents the Lab 2 Development Requester selection only. It is not authentication or authorization.
- API errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "fields": {
      "summary": "Summary is required."
    }
  }
}
```

Unexpected errors return a safe message without stack traces or filesystem paths.

## 2. Simulated Requester Context

For requester-scoped operations:

```http
X-Requester-Id: 101
```

The API must reject a missing, malformed, inactive, or nonexistent requester context.

The database query must always scope the Ticket or Attachment through the selected Requester. The client-provided header is only a testing mechanism and must not be described as secure authentication.

## 3. Resource Shapes

### Development Requester

```json
{
  "id": 101,
  "name": "Ariya Somchai",
  "email": "ariya.somchai@example.com"
}
```

### Reference Data

```json
{
  "id": 1,
  "name": "Hardware"
}
```

### Attachment Metadata

```json
{
  "id": 7001,
  "originalFilename": "screen.png",
  "mimeType": "image/png",
  "sizeBytes": 24576,
  "uploadedAt": "2026-08-24T10:00:00.000Z",
  "isRemoved": false,
  "removedAt": null,
  "removalReason": null
}
```

Removed files remain visible as metadata but have `isRemoved: true`, derived from `removedAt != null`, and cannot be downloaded or previewed.

### Ticket

```json
{
  "id": 5001,
  "ticketNumber": "TT-20260824-123456",
  "ticketDate": "2026-08-24T10:00:00.000Z",
  "requester": {
    "id": 101,
    "name": "Ariya Somchai",
    "email": "ariya.somchai@example.com"
  },
  "category": {
    "id": 2,
    "name": "Hardware"
  },
  "relatedSystem": {
    "id": 6,
    "name": "Corporate Laptop"
  },
  "requestedPriority": "MEDIUM",
  "status": "NEW",
  "summary": "Laptop battery drains quickly",
  "description": "The laptop battery drops below 20 percent after a short period.",
  "createdAt": "2026-08-24T10:00:00.000Z",
  "updatedAt": "2026-08-24T10:00:00.000Z",
  "attachments": []
}
```

## 4. Reference Data Endpoints

### GET `/api/requesters/active`

Returns active Development Requesters for the selector.

Success:

- `200 OK`
- Body: `{ "requesters": [DevelopmentRequester] }`

An empty active-requester set returns `200` with an empty array.

Failure:

- `500 INTERNAL_ERROR`

### GET `/api/categories`

Returns active Categories ordered by name.

Success:

- `200 OK`
- Body: `{ "categories": [ReferenceData] }`

Failure:

- `500 INTERNAL_ERROR`

The API must not return fabricated successful data when the database is unavailable.

### GET `/api/related-systems`

Returns active Related Systems ordered by name.

Success:

- `200 OK`
- Body: `{ "relatedSystems": [ReferenceData] }`

Failure:

- `500 INTERNAL_ERROR`

## 5. Ticket Creation

### POST `/api/tickets`

Creates one Ticket for the selected Requester.

Headers:

```http
X-Requester-Id: 101
Content-Type: multipart/form-data
```

Multipart fields:

- `categoryId`: required positive integer
- `relatedSystemId`: required positive integer
- `requestedPriority`: required `LOW`, `MEDIUM`, or `HIGH`
- `summary`: required, trimmed length 5–150
- `description`: required, trimmed length 10–5,000
- `attachments`: optional files

Attachment validation:

- Allowed MIME/type families: JPG/JPEG, PNG, WEBP, PDF
- Maximum size: 5 MB per file
- Maximum active files on the Ticket: five

The server validates all fields and all initial files before creating the Ticket. If any validation fails, no Ticket or Attachment metadata is persisted and temporary files are removed.

The server generates:

- `id`
- `ticketNumber`
- `ticketDate`
- `status: "NEW"`
- timestamps

Success:

- `201 CREATED`
- Body: `{ "ticket": Ticket }`

Validation failures:

- `400 VALIDATION_ERROR`

Missing or inactive Category/Related System:

- `400 INVALID_REFERENCE`

Unsupported file type:

- `415 UNSUPPORTED_MEDIA_TYPE`

File exceeds 5 MB or the ticket would exceed five active files:

- `413 PAYLOAD_TOO_LARGE`

Missing or invalid requester context:

- `400 INVALID_REQUESTER_CONTEXT`

Unexpected database or storage failure:

- `500 INTERNAL_ERROR`

## 6. My Tickets

### GET `/api/tickets`

Returns only Tickets owned by the selected Requester.

Headers:

```http
X-Requester-Id: 101
```

Query parameters:

- `search`: optional text searched case-insensitively in Summary and Description
- `categoryId`: optional positive integer
- `requestedPriority`: optional `LOW`, `MEDIUM`, or `HIGH`
- `status`: optional `NEW`
- `sortBy`: optional `updatedAt`, `createdAt`, `ticketNumber`, or `requestedPriority`
- `sortDirection`: optional `asc` or `desc`
- `page`: optional one-based page number; default `1`
- `pageSize`: optional `10`, `20`, or `50`; default `10`

Default ordering is `updatedAt desc`, followed by `id desc` as a stable secondary order.

Success:

- `200 OK`

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 0,
    "totalPages": 0,
    "hasPrevious": false,
    "hasNext": false
  }
}
```

Invalid query parameters:

- `400 INVALID_QUERY`

A valid query with no matching records returns `200` with an empty `items` array. The UI distinguishes an unfiltered empty list from a filtered no-results state.

## 7. Ticket Detail

### GET `/api/tickets/:ticketId`

Returns one owned Ticket with read-only ticket data and Attachment metadata.

Headers:

```http
X-Requester-Id: 101
```

Success:

- `200 OK`
- Body: `{ "ticket": Ticket }`

Missing Ticket, malformed ID, or Ticket owned by another Requester:

- `404 TICKET_NOT_FOUND`

The response must not reveal whether a cross-requester Ticket exists.

## 8. Attachment Metadata

### GET `/api/tickets/:ticketId/attachments`

Returns all Attachment metadata for an owned Ticket, including soft-removed records.

Success:

- `200 OK`
- Body: `{ "attachments": [AttachmentMetadata] }`

Missing or unauthorized Ticket:

- `404 TICKET_NOT_FOUND`

### POST `/api/tickets/:ticketId/attachments`

Adds one or more Attachments to an owned Ticket.

Headers:

```http
X-Requester-Id: 101
Content-Type: multipart/form-data
```

All files in the batch are validated before any new Attachment metadata is persisted. If one file fails validation or storage, the whole batch fails and temporary files are cleaned up.

Success:

- `201 CREATED`
- Body: `{ "attachments": [AttachmentMetadata] }`

Validation failures:

- `400 VALIDATION_ERROR`
- `413 PAYLOAD_TOO_LARGE`
- `415 UNSUPPORTED_MEDIA_TYPE`

Missing or unauthorized Ticket:

- `404 TICKET_NOT_FOUND`

Unexpected storage failure:

- `500 INTERNAL_ERROR`

## 9. Attachment Download

### GET `/api/attachments/:attachmentId/download`

Downloads an active Attachment belonging to a Ticket owned by the selected Requester.

Headers:

```http
X-Requester-Id: 101
```

Success:

- `200 OK`
- Original MIME type is returned in `Content-Type`.
- A safe download filename is returned in `Content-Disposition`.

The server must never serve the storage directory as a public static directory.

Missing, unauthorized, or removed Attachment:

- `404 ATTACHMENT_NOT_FOUND`

## 10. Attachment Soft Removal

### DELETE `/api/attachments/:attachmentId`

Soft-removes an Attachment belonging to an owned Ticket.

Headers:

```http
X-Requester-Id: 101
Content-Type: application/json
```

Request:

```json
{
  "reason": "The uploaded screenshot contains outdated information."
}
```

The reason is required and must contain 5–250 characters after trimming.

Success:

- `200 OK`
- Body: `{ "attachment": AttachmentMetadata }`

Validation failure:

- `400 INVALID_REMOVAL_REASON`

Missing, unauthorized, or already removed Attachment:

- `404 ATTACHMENT_NOT_FOUND`

The database record and metadata remain. The storage object is no longer downloadable or previewable.

## 11. Status Code Summary

| Status | Meaning |
|---|---|
| 200 | Successful retrieval, download, or soft removal |
| 201 | Ticket or Attachment created |
| 400 | Invalid input, requester context, or query |
| 404 | Missing or unauthorized Ticket/Attachment |
| 413 | File or active-attachment limit exceeded |
| 415 | Unsupported file type |
| 500 | Safe unexpected server failure |

## 12. Ownership and Storage Rules

- Every requester-scoped database query must include the selected Requester ownership condition.
- Client-side filtering is never sufficient for ownership protection.
- Uploads are stored outside the public web root.
- Storage filenames are generated by the server.
- Original filenames are metadata only.
- Removed Attachments remain in the database for audit visibility.
- No endpoint exposes filesystem paths, stack traces, or another Requester’s data.

## 13. Traceability

- Ticket creation: FR-08–FR-15, BR-01–BR-20, AC-05–AC-10
- My Tickets: FR-16–FR-18, BR-24–BR-27, AC-11–AC-13
- Ticket Detail: FR-19–FR-20, BR-07–BR-08, AC-14–AC-15
- Attachment lifecycle: FR-21–FR-24, BR-16–BR-23, AC-16–AC-19
- Requester context: FR-01–FR-07, BR-04–BR-06, AC-01–AC-04
