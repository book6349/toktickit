# Lab 2 Zen Green UI Specification

## 1. Purpose

Define the reusable visual, interaction, responsive, and accessibility rules for the Lab 2 Requester-facing TokTickIT MVP.

## 2. Design Tokens

| Token | Value | Usage |
|---|---|---|
| Primary green | `#006B3C` | Header, primary actions, strong emphasis |
| Secondary green | `#0B7A46` | Links, focus accents, active navigation, hover |
| Pale green | `#EAF6EF` | Selected areas, success panels, subtle emphasis |
| Page background | `#F5F7F6` | Application background |
| Surface | `#FFFFFF` | Cards, panels, forms |
| Text | Dark charcoal-green | Main readable text |
| Read-only surface | Soft gray-green | System-generated fields |
| Error | Dark red | Invalid borders and messages |
| Warning | Amber | Warning callouts and badges |
| Success | Green | Confirmation and success messages |

## 3. Typography and Spacing

- Use the existing Bootstrap 5 typography foundation and system sans-serif fonts.
- Page titles use a clear heading hierarchy.
- Labels are visually distinct from input text.
- Use a consistent 4px/8px spacing scale.
- Cards use a subtle border and restrained shadow.
- Controls have consistent height and border radius.
- Body text must remain readable without relying on color alone.

## 4. Application Shell

The shell contains:

- TokTickIT identity and IT Service Desk label
- My Tickets navigation
- Create Ticket navigation
- Current Development Requester name
- Change Requester action
- Clear active-page indication
- Responsive mobile navigation

The selected Requester is always visibly labeled as a simulated Lab 2 testing context, not authentication.

## 5. Development Requester Selection

The selection screen contains:

- TokTickIT title
- Explanation that selection is for Lab 2 testing only
- Active Development Requester dropdown
- Continue button
- Loading state
- Empty state when no active Requesters exist
- Safe API-failure state
- Keyboard-accessible controls

Behavior:

- Only active Requesters are displayed.
- Continue is disabled until a Requester is selected.
- The selected ID is stored for the current browser session.
- After selection, the shell displays the Requester.
- Change Requester returns to the selector and reloads requester-scoped data.
- A failed load keeps the screen usable and provides a retry action.

## 6. Shared Form Rules

- Labels appear above controls.
- Required fields show a red asterisk and an accessible required indication.
- Validation messages appear directly below the related field.
- Inputs use consistent heights.
- Description uses a larger multiline control.
- Read-only controls use the read-only surface token.
- Disabled controls are visibly disabled and cannot be activated.
- Focus indicators remain visible for keyboard users.
- Buttons use visible text; icon-only controls require an accessible label and tooltip.
- Destructive actions use a distinct destructive style and require confirmation.
- Error and success states include text or icons in addition to color.

## 7. Create Ticket Screen

### 7.1 Layout

Desktop layout groups:

1. System-generated and requester context
2. Classification fields
3. Summary and Description
4. Attachments
5. Actions and feedback

System-generated fields:

- Ticket Number
- Ticket Date
- Requester

Editable fields:

- Category
- Related System
- Requested Priority
- Summary
- Description
- Attachments

Ticket Number and Ticket Date remain empty or unavailable until the backend creates the Ticket. Requester is read-only and comes from the selected context.

Validation constraints mirror the API contract: Category and Related System must be active references; Requested Priority is `LOW`, `MEDIUM`, or `HIGH`; Summary is required with 5–150 trimmed characters; Description is required with 10–5,000 trimmed characters; and each Attachment is an allowed JPG/JPEG, PNG, WEBP, or PDF file no larger than 5 MB, with no more than five active files.

### 7.2 Form States

- Initial: empty editable form with reference data loaded
- Loading references: controls show a clear loading indicator
- Reference-data failure: safe error panel with retry
- Validation failure: field-level messages and preserved values
- Submitting: busy Submit button, disabled duplicate submission
- Success: clear confirmation with official Ticket Number and next action
- API failure: safe error message with all entered values preserved

### 7.3 Attachments

The attachment control must:

- Show selected filenames and sizes
- Reject unsupported types with a specific reason
- Reject files larger than 5 MB
- Reject selections exceeding five active files
- Allow removal from the pending selection before submission
- Prevent unreadable filename overflow
- Show upload or validation status without relying only on color

Allowed types are JPG/JPEG, PNG, WEBP, and PDF.

## 8. My Tickets Screen

The screen contains:

- Page title and current Requester
- Create Ticket action
- Search input
- Category filter
- Requested Priority filter
- Status filter
- Sort control
- Clear filters action
- Pagination
- Ticket results

Desktop table fields:

- Ticket Number
- Summary
- Category
- Requested Priority
- Current Status (`New` is the UI label for API value `NEW`)
- Last Updated
- Open action

Mobile representation uses cards or a responsive table. Each ticket remains identifiable and openable without horizontal scrolling.

States:

- Loading: visible progress indication
- Empty: no tickets exist for the selected Requester
- No results: filters/search match no tickets, with clear-filters action
- Failure: safe error message and retry action

## 9. Ticket Detail Screen

Ticket information is read-only and grouped into:

- Ticket identity and dates
- Requester
- Classification
- Summary and Description
- Current Status (`New` is the UI label for API value `NEW`)
- Attachments

The screen contains a clear navigation path back to My Tickets.

It must not include:

- Public Comments
- Internal Notes
- Actions Taken
- Status transition controls
- IT Staff controls

## 10. Attachment Section

Attachment states:

- Active: metadata plus Download action
- Uploading: busy indicator and disabled duplicate upload
- Invalid: specific validation reason
- Removed: retained metadata, removal reason, and unavailable status
- Unavailable: no Download or Preview action

Removal flow:

1. User selects Remove.
2. Confirmation explains that removal is soft.
3. User supplies a reason.
4. API success updates the metadata in place.
5. Removed files cannot be downloaded or previewed.

## 11. Responsive Rules

### Desktop: 992px and above

- Center content with a sensible maximum width.
- Use multi-column layouts where helpful.
- Keep forms and tables readable without excessive width.

### Tablet: 768–991px

- Use two columns where practical.
- Give Summary and Description sufficient width.
- Keep actions visible without clipping.

### Mobile: below 768px

- Stack fields vertically.
- Use touch-friendly button sizes.
- Convert ticket rows to cards or a responsive table.
- Keep filters usable without horizontal scrolling.
- Break or truncate long filenames safely.
- Keep primary actions visible.

All viewport sizes must avoid:

- Clipped labels
- Overlapping validation messages
- Hidden buttons
- Unreadable attachment names
- Unintended horizontal page scrolling

## 12. Accessibility

- Every form control has an associated label.
- Required fields expose required status to assistive technology.
- Validation text is associated with its control using accessible descriptions.
- Focus moves to or is announced for important error and success feedback.
- Busy states are announced without trapping focus.
- Keyboard users can complete selection, ticket creation, filtering, pagination, detail navigation, upload, download, and removal.
- Color is never the only indicator of state.
- Icon-only controls have accessible names and tooltips.
- Contrast remains readable for text, borders, focus indicators, and status badges.

## 13. Reusable Components

The implementation should provide reusable conventions or components for:

- Application shell
- Page header
- Form field and validation message
- Read-only field
- Loading indicator
- Error panel
- Empty state
- No-results state
- Status and priority badge
- Search/filter toolbar
- Pagination
- Attachment list
- Confirmation dialog

## 14. Visual Inspection Checklist

For each screen and viewport, verify:

- Zen Green colors match the tokens.
- Editable and read-only fields are distinguishable.
- Required markers and messages are present and correctly placed.
- Primary, secondary, disabled, busy, and destructive buttons are visually distinct.
- Focus indicators are visible.
- Tables/cards do not clip or overlap.
- Long text and filenames remain readable.
- No horizontal overflow exists.
- Loading, empty, no-results, validation, success, and failure states are visible.
- Requester identity and active navigation are clear.
- Attachment states and actions are understandable without color alone.

## 15. Screenshot Paths

Screenshots are stored under:

- `artifacts/lab-02/screenshots/create-ticket/`
- `artifacts/lab-02/screenshots/my-tickets/`
- `artifacts/lab-02/screenshots/ticket-detail/`

Required viewport evidence:

- Desktop: at least 992px wide
- Tablet: between 768px and 991px wide
- Mobile: below 768px wide

The final report must include readable screenshots and the completed visual checklist.
