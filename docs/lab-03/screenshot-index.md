# Lab 3 Screenshot and Visual Evidence Index

Status: Captured and visually inspected locally. These files are evidence for
the Unit 5 branch; they are not proof of the pending GitHub review and release
events.

Implementation branch: `feature/lab3-integration-evidence`

Implementation commit: `4d4f114ab4224844584f59296e368de58d073fb9`

Capture command: `npx playwright test e2e/lab-03`

Required viewport sizes:

- Desktop: 1280 x 900
- Tablet: 900 x 900
- Mobile: 390 x 844

## Required captures

| Figure | File | Viewport | Scenario/caption | Status |
|---|---|---:|---|---|
| 1 | [desktop requester capture](../../artifacts/lab-03/screenshots/authentication/requester-regression/desktop-1280x900-my-tickets.png) | 1280 x 900 | Requester My Tickets shell after authentication | Passed |
| 2 | [tablet requester capture](../../artifacts/lab-03/screenshots/authentication/requester-regression/tablet-900x900-my-tickets.png) | 900 x 900 | Requester My Tickets shell at tablet width | Passed |
| 3 | [mobile requester capture](../../artifacts/lab-03/screenshots/authentication/requester-regression/mobile-390x844-my-tickets.png) | 390 x 844 | Requester My Tickets shell at mobile width | Passed |
| 4 | [desktop queue capture](../../artifacts/lab-03/screenshots/staff-queue/desktop-1280x900-queue.png) | 1280 x 900 | IT Staff Queue with filters and results | Passed |
| 5 | [tablet queue capture](../../artifacts/lab-03/screenshots/staff-queue/tablet-900x900-queue.png) | 900 x 900 | IT Staff Queue at tablet width | Passed |
| 6 | [mobile queue capture](../../artifacts/lab-03/screenshots/staff-queue/mobile-390x844-queue.png) | 390 x 844 | IT Staff Queue at mobile width | Passed |
| 7 | [desktop detail capture](../../artifacts/lab-03/screenshots/staff-ticket-detail/desktop-1280x900-detail.png) | 1280 x 900 | IT Staff Ticket Detail with ownership, comments, and notes | Passed |
| 8 | [tablet detail capture](../../artifacts/lab-03/screenshots/staff-ticket-detail/tablet-900x900-detail.png) | 900 x 900 | IT Staff Ticket Detail at tablet width | Passed |
| 9 | [mobile detail capture](../../artifacts/lab-03/screenshots/staff-ticket-detail/mobile-390x844-detail.png) | 390 x 844 | IT Staff Ticket Detail at mobile width | Passed |
| 10 | [desktop user-management capture](../../artifacts/lab-03/screenshots/user-management/desktop-1280x900-list.png) | 1280 x 900 | Administrator User Management list and actions | Passed |
| 11 | [tablet user-management capture](../../artifacts/lab-03/screenshots/user-management/tablet-900x900-list.png) | 900 x 900 | Administrator User Management at tablet width | Passed |
| 12 | [mobile user-management capture](../../artifacts/lab-03/screenshots/user-management/mobile-390x844-list.png) | 390 x 844 | Administrator User Management at mobile width | Passed |

## Visual checklist

| Check | Evidence source | Status |
|---|---|---|
| Desktop, tablet, and mobile layout | Required PNG set above | Passed - all 12 captures were inspected. |
| No apparent horizontal overflow or clipped controls | Visual inspection of all required PNGs | Partially evidenced - no visible clipping was found, but no dedicated automated overflow assertion exists. |
| Keyboard completion and visible focus | Client tests and browser workflow | Partially evidenced - labels and actions are covered, but no separate keyboard-only audit was captured. |
| Labels and role navigation | Client tests and Playwright role-based locators | Partially evidenced - functional coverage passed; this index does not claim a full accessibility audit. |
| Validation, loading, empty, and failure states | Server/client tests and browser workflow | Partially evidenced - relevant tests passed, but not every state has a screenshot. |
| Screenshot readability and caption accuracy | Direct inspection of all 12 files | Passed. |

The final PDF uses the same figure numbers and filenames. Local visual evidence
does not replace the required reviewed PR and release workflow.
