# Lab 4 Browser Screenshot Evidence

These 24 screenshots are real Playwright captures from the final regression run on 2026-10-31. They use synthetic records in the fresh disposable database `toktickit_lab3_e2e_pr6_20261031_195735`. Each view was checked at 1280x900 desktop, 900x900 tablet, and 390x844 mobile widths; the capture helper also asserts there is no horizontal page overflow.

| Screen and state | Desktop | Tablet | Mobile |
|---|---|---|---|
| Requester dashboard metrics and recent Tickets | [1280x900](../../artifacts/lab-04/screenshots/dashboards/requester-dashboard-desktop-1280x900.png) | [900x900](../../artifacts/lab-04/screenshots/dashboards/requester-dashboard-tablet-900x900.png) | [390x844](../../artifacts/lab-04/screenshots/dashboards/requester-dashboard-mobile-390x844.png) |
| Staff dashboard metrics and active Ticket counts | [1280x900](../../artifacts/lab-04/screenshots/dashboards/staff-dashboard-desktop-1280x900.png) | [900x900](../../artifacts/lab-04/screenshots/dashboards/staff-dashboard-tablet-900x900.png) | [390x844](../../artifacts/lab-04/screenshots/dashboards/staff-dashboard-mobile-390x844.png) |
| Staff action entry form | [1280x900](../../artifacts/lab-04/screenshots/actions-taken/staff-add-action-desktop-1280x900.png) | [900x900](../../artifacts/lab-04/screenshots/actions-taken/staff-add-action-tablet-900x900.png) | [390x844](../../artifacts/lab-04/screenshots/actions-taken/staff-add-action-mobile-390x844.png) |
| Staff view of multiple recorded actions | [1280x900](../../artifacts/lab-04/screenshots/actions-taken/staff-history-desktop-1280x900.png) | [900x900](../../artifacts/lab-04/screenshots/actions-taken/staff-history-tablet-900x900.png) | [390x844](../../artifacts/lab-04/screenshots/actions-taken/staff-history-mobile-390x844.png) |
| Requester read-only Actions Taken history | [1280x900](../../artifacts/lab-04/screenshots/actions-taken/requester-read-only-history-desktop-1280x900.png) | [900x900](../../artifacts/lab-04/screenshots/actions-taken/requester-read-only-history-tablet-900x900.png) | [390x844](../../artifacts/lab-04/screenshots/actions-taken/requester-read-only-history-mobile-390x844.png) |
| Resolution blocked before an action is completed | [1280x900](../../artifacts/lab-04/screenshots/ticket-workflow/resolution-blocked-no-completed-actions-desktop-1280x900.png) | [900x900](../../artifacts/lab-04/screenshots/ticket-workflow/resolution-blocked-no-completed-actions-tablet-900x900.png) | [390x844](../../artifacts/lab-04/screenshots/ticket-workflow/resolution-blocked-no-completed-actions-mobile-390x844.png) |
| Staff view after reopening a Ticket | [1280x900](../../artifacts/lab-04/screenshots/ticket-workflow/staff-reopened-ticket-desktop-1280x900.png) | [900x900](../../artifacts/lab-04/screenshots/ticket-workflow/staff-reopened-ticket-tablet-900x900.png) | [390x844](../../artifacts/lab-04/screenshots/ticket-workflow/staff-reopened-ticket-mobile-390x844.png) |
| Requester view of formal resolution and Ticket history | [1280x900](../../artifacts/lab-04/screenshots/ticket-workflow/requester-resolution-history-desktop-1280x900.png) | [900x900](../../artifacts/lab-04/screenshots/ticket-workflow/requester-resolution-history-tablet-900x900.png) | [390x844](../../artifacts/lab-04/screenshots/ticket-workflow/requester-resolution-history-mobile-390x844.png) |

The browser assertions cover readable labels and role boundaries, history order, resolution blockers, successful close/reopen flow, and narrow layouts. UI unit tests cover zero/empty states, validation, retry/conflict feedback, keyboard focus styles, reduced motion and live regions. The screenshot set complements these checks; it does not claim a separate automated accessibility audit.

## T-20 320px evidence

Captured on 31 October 2026 at 3ddd3930b2c83d3193164257d3bf7dd3bcfb14e9. The eight existing screen states are also checked at 320x800; four dedicated keyboard/validation captures make 12 new captures and 36 source images overall. The report retains its 24 existing captures and embeds the four dedicated captures.

- [action-validation-focus-320x800](../../artifacts/lab-04/screenshots/accessibility/action-validation-focus-320x800.png)
- [requester-dashboard-keyboard-320x800](../../artifacts/lab-04/screenshots/accessibility/requester-dashboard-keyboard-320x800.png)
- [staff-dashboard-keyboard-320x800](../../artifacts/lab-04/screenshots/accessibility/staff-dashboard-keyboard-320x800.png)
- [staff-workflow-320x800](../../artifacts/lab-04/screenshots/accessibility/staff-workflow-320x800.png)
- [requester-read-only-history-narrow-320x800](../../artifacts/lab-04/screenshots/actions-taken/requester-read-only-history-narrow-320x800.png)
- [staff-add-action-narrow-320x800](../../artifacts/lab-04/screenshots/actions-taken/staff-add-action-narrow-320x800.png)
- [staff-history-narrow-320x800](../../artifacts/lab-04/screenshots/actions-taken/staff-history-narrow-320x800.png)
- [requester-dashboard-narrow-320x800](../../artifacts/lab-04/screenshots/dashboards/requester-dashboard-narrow-320x800.png)
- [staff-dashboard-narrow-320x800](../../artifacts/lab-04/screenshots/dashboards/staff-dashboard-narrow-320x800.png)
- [requester-resolution-history-narrow-320x800](../../artifacts/lab-04/screenshots/ticket-workflow/requester-resolution-history-narrow-320x800.png)
- [resolution-blocked-no-completed-actions-narrow-320x800](../../artifacts/lab-04/screenshots/ticket-workflow/resolution-blocked-no-completed-actions-narrow-320x800.png)
- [staff-reopened-ticket-narrow-320x800](../../artifacts/lab-04/screenshots/ticket-workflow/staff-reopened-ticket-narrow-320x800.png)
