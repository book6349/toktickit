# Lab 3 Screenshot and Visual Evidence Index

## Current local verification 2026-10-01

The approved local repairs now pass 190 server tests, 36 client tests, both
builds, Prisma validation, and 16 integrated E2E scenarios. Migration
preservation and seed-twice assertions passed on a fresh disposable Docker
PostgreSQL database. The missing Staff Requester-resolution indicator was
fixed and verified without changing formal status. Complete output and new
Staff captures are retained in `output/docs/evidence-20261001-step5/`.

These are dirty local working-tree results based on
`1fb8df040eb12ac443bb4246a314babfde1564e9`, not committed-main evidence.
Recorded main remains `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`.
No new GitHub events are claimed. Reviewed staging/release integration and
clean-main reruns remain required. The older dated records below are retained
as history; earlier Docker-unavailable and missing-indicator statements do
not describe this new local run.

## Current local capture audit — 2026-10-01

Post-fix step 5 adds real Staff resolution-indicator screenshots at all three
viewports, native browser regions and refreshed desktop/tablet viewports in
`artifacts/lab-03/screenshots/staff-ticket-detail/audit-20261001-step5/`.
Figures 43–45 display the indication without changing formal status.
The passing post-fix suite contains 16 E2E scenarios. These captures and the
report remain local evidence pending reviewed integration and a main rerun.

This section supersedes the older capture-status statements below for the new
local audit only; historical records are preserved. Step 3 passed all 15 E2E
scenarios against a new disposable PostgreSQL database. Step 4 retained 81
additional inspected browser PNGs, including native mobile section captures.
Login and mandatory Change Password now have real database-backed captures at
1280x900, 900x900, and 390x844; the older mock-only authentication figures are
not the current functional evidence.

See the [current captured-image index](../../output/docs/evidence-20261001-step4/captured-image-index.md)
and [visual verification and limitations](../../output/docs/evidence-20261001-step4/visual-verification.md).
Copies of the originals are under each required screenshot group in new
`audit-20261001-step4/<run>/` subfolders. No older capture was overwritten by
these copies. Inventory IDs V001–V081 are not final report figure numbers.

All new captures are from the dirty local worktree based on
`1fb8df040eb12ac443bb4246a314babfde1564e9`, not committed-main evidence.
Controlled mocked empty/failure responses and delayed loading states are
explicitly labelled in the index. Native browser section captures overlap by
100px where applicable and do not generate or alter application content.

**UNRESOLVED IMPLEMENTATION GAP:** Staff Detail does not render the populated
`requesterResolutionIndicatedAt` API field. Requester-side indication works,
but Staff-side display is not Passed. The diagnostic output and screenshot
are retained in the current evidence folder. Code repair, regression checks,
and replacement Staff captures are required before claiming full compliance.

The final PDF/DOCX are unchanged. Report figure replacement, final numbering,
and every-page PDF inspection remain later steps.

Status: The corrected local Playwright suite passed 15 tests on 2026-09-29
against a task-created disposable Docker database. It captured the required
Requester, Queue, Ticket Detail, and User Management views at desktop, tablet,
and mobile sizes, asserted no horizontal overflow in those views, and passed
three keyboard-only journeys. These captures are from the pre-release local
tree at base SHA `493758be65850504de7b970e50f7a61b846584f0`; they were not
recaptured on merged main `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`.
The original full-page mobile images were too small to read; lossless sections
now cover the Queue in Figures 20-24, Detail in 25-28, and User Management in
29-33. Figures 34-39 show actual React Login and mandatory Change Password
screens at all required viewports with mocked API responses for layout only.

Historical capture branch recorded by the previous report: `main`

Historical capture commit recorded by the previous report: `493758be65850504de7b970e50f7a61b846584f0`

Final release commit: `493758be65850504de7b970e50f7a61b846584f0` (historical)

Historical capture command: `npx --no-install playwright test e2e/lab-03` against the clean disposable database `toktickit_lab3_final_20260921` on 2026-09-21.

Current local run: `npm run test:e2e` from the repository root on 2026-09-29;
15 passed in 24.6s against `toktickit_lab3_e2e_recheck2_20260929`. This run
includes real queue pagination, migrated Attachment continuity, staff
reassignment/priority/status operations, requester resolution indication,
responsive viewport checks, and keyboard-only journeys. It is not final-main.
An earlier fresh clone passed 13 tests and failed two because its Queue and
migration display fixtures were incomplete; the failure was retained and the
fixture-ready fresh clone passed all 15 tests. The final screenshot files below
were regenerated by that passing run. Those integrated browser checks and
screenshots remain pre-merge evidence; they are not final-main test results.

Final-main check on 2026-09-30: the focused Lab 3 tests and builds passed at
`0353a40`, but Docker was unreachable and the integrated E2E/visual/keyboard
suite was not rerun. Existing figures remain supporting historical evidence;
no new final-main screenshot is claimed.

Additional state command used a temporary evidence-only Playwright harness:
`npx --no-install playwright test e2e/lab-03/evidence-capture.spec.ts` against
isolated disposable databases. The temporary harness was removed after the
captures were generated; the current 15-test suite is the integration test
source of truth for this local run.

Required viewport sizes:

- Desktop: 1280 x 900
- Tablet: 900 x 900
- Mobile: 390 x 844

## Required captures

| Figure | File | Viewport | Scenario/caption | Status / boundary |
|---|---|---:|---|---|
| 1 | [desktop requester capture](../../artifacts/lab-03/screenshots/authentication/requester-regression/desktop-1280x900-my-tickets.png) | 1280 x 900 | Requester My Tickets shell after authentication | Fresh local E2E capture; dirty tree, not final-main |
| 2 | [tablet requester capture](../../artifacts/lab-03/screenshots/authentication/requester-regression/tablet-900x900-my-tickets.png) | 900 x 900 | Requester My Tickets shell at tablet width | Fresh local E2E capture; viewport assertion passed |
| 3 | [mobile requester capture](../../artifacts/lab-03/screenshots/authentication/requester-regression/mobile-390x844-my-tickets.png) | 390 x 844 | Requester My Tickets shell at mobile width | Fresh full-page E2E capture; readable sections follow |
| 4 | [desktop queue capture](../../artifacts/lab-03/screenshots/staff-queue/desktop-1280x900-queue.png) | 1280 x 900 | IT Staff Queue with filters and results | Fresh local E2E capture; dirty tree, not final-main |
| 5 | [tablet queue capture](../../artifacts/lab-03/screenshots/staff-queue/tablet-900x900-queue.png) | 900 x 900 | IT Staff Queue at tablet width | Fresh local E2E capture; viewport assertion passed |
| 6 | [mobile queue capture](../../artifacts/lab-03/screenshots/staff-queue/mobile-390x844-queue.png) | 390 x 844 | IT Staff Queue at mobile width | Fresh full-page E2E capture; page-2 proof is separate |
| 7 | [desktop detail capture](../../artifacts/lab-03/screenshots/staff-ticket-detail/desktop-1280x900-detail.png) | 1280 x 900 | IT Staff Ticket Detail with ownership, comments, and notes | Fresh local E2E capture; dirty tree, not final-main |
| 8 | [tablet detail capture](../../artifacts/lab-03/screenshots/staff-ticket-detail/tablet-900x900-detail.png) | 900 x 900 | IT Staff Ticket Detail at tablet width | Fresh local E2E capture; viewport assertion passed |
| 9 | [mobile detail capture](../../artifacts/lab-03/screenshots/staff-ticket-detail/mobile-390x844-detail.png) | 390 x 844 | IT Staff Ticket Detail at mobile width | Fresh full-page E2E capture; readable sections follow |
| 10 | [desktop user-management capture](../../artifacts/lab-03/screenshots/user-management/desktop-1280x900-list.png) | 1280 x 900 | Administrator User Management list and actions | Fresh local E2E capture; dirty tree, not final-main |
| 11 | [tablet user-management capture](../../artifacts/lab-03/screenshots/user-management/tablet-900x900-list.png) | 900 x 900 | Administrator User Management at tablet width | Fresh local E2E capture; viewport assertion passed |
| 12 | [mobile user-management capture](../../artifacts/lab-03/screenshots/user-management/mobile-390x844-list.png) | 390 x 844 | Administrator User Management at mobile width | Fresh full-page E2E capture; readable sections follow |

## Authentication gate responsive captures (Figures 34-39)

Captured on 2026-09-29 from the running React/Vite client. A Playwright
visual-only harness mocked `/api/auth/me`, `/api/auth/csrf`, and `/api/auth/login`
with synthetic values; it did not contact the server or a database. These
screenshots establish layout and screenshot readability only, not login,
password-change, authorization, or session behavior.

| Figure | File | Viewport | Scenario/caption | Status / boundary |
|---|---|---:|---|---|
| 34 | `authentication/responsive-auth-gates/login-desktop-1280x900.png` | 1280 x 900 | Login form, desktop | Captured from actual app; mocked API; layout only |
| 35 | `authentication/responsive-auth-gates/login-tablet-900x900.png` | 900 x 900 | Login form, tablet | Captured from actual app; mocked API; layout only |
| 36 | `authentication/responsive-auth-gates/login-mobile-390x844.png` | 390 x 844 | Login form, mobile | Captured from actual app; mocked API; layout only |
| 37 | `authentication/responsive-auth-gates/change-password-desktop-1280x900.png` | 1280 x 900 | Mandatory Change Password gate, desktop | Captured from actual app; mocked API; layout only |
| 38 | `authentication/responsive-auth-gates/change-password-tablet-900x900.png` | 900 x 900 | Mandatory Change Password gate, tablet | Captured from actual app; mocked API; layout only |
| 39 | `authentication/responsive-auth-gates/change-password-mobile-390x844.png` | 390 x 844 | Mandatory Change Password gate, mobile | Captured from actual app; mocked API; layout only |

## Readable mobile report sections

These are lossless crops from the existing browser-captured full-page PNGs.
No application content was generated, painted, or upscaled. The source PNGs
remain unchanged. The `390 x 844` value is the browser viewport; full-page
source heights are larger, which made a single-page report image unreadable.
The report shows the first section beside Figures 6, 9, and 12, then all
sections below as sequential Figures 20-33. The current source screenshots were
captured by the corrected local E2E run; they remain dirty-tree, not final-main,
evidence.

| Figure | Crop file | Source image and vertical pixel range | Caption |
|---|---|---|---|
| 20 | `staff-queue-mobile-section-01-of-05.png` | `staff-queue/mobile-390x844-queue.png`, y=0–747 of 3735 | Queue mobile, section 1/5: role header and search/filter controls |
| 21 | `staff-queue-mobile-section-02-of-05.png` | same source, y=747–1494 | Queue mobile, section 2/5: first visible queue results |
| 22 | `staff-queue-mobile-section-03-of-05.png` | same source, y=1494–2241 | Queue mobile, section 3/5: populated ticket cards |
| 23 | `staff-queue-mobile-section-04-of-05.png` | same source, y=2241–2988 | Queue mobile, section 4/5: populated ticket cards |
| 24 | `staff-queue-mobile-section-05-of-05.png` | same source, y=2988–3735 | Queue mobile, section 5/5: final results and page controls |
| 25 | `staff-ticket-detail-mobile-section-01-of-04.png` | `staff-ticket-detail/mobile-390x844-detail.png`, y=0–754 of 3016 | Ticket Detail mobile, section 1/4: ticket identity and requester/category |
| 26 | `staff-ticket-detail-mobile-section-02-of-04.png` | same source, y=754–1508 | Ticket Detail mobile, section 2/4: priority, description, ownership controls |
| 27 | `staff-ticket-detail-mobile-section-03-of-04.png` | same source, y=1508–2262 | Ticket Detail mobile, section 3/4: IT Priority/status, Attachments, public comments |
| 28 | `staff-ticket-detail-mobile-section-04-of-04.png` | same source, y=2262–3016 | Ticket Detail mobile, section 4/4: public-comment form and Internal Notes boundary |
| 29 | `admin-users-mobile-section-01-of-05.png` | `user-management/mobile-390x844-list.png`, y=0–775 of 3878 | Administrator mobile, section 1/5: role shell and search controls |
| 30 | `admin-users-mobile-section-02-of-05.png` | same source, y=775–1551 | Administrator mobile, section 2/5: initial account rows |
| 31 | `admin-users-mobile-section-03-of-05.png` | same source, y=1551–2326 | Administrator mobile, section 3/5: Requester and Staff rows |
| 32 | `admin-users-mobile-section-04-of-05.png` | same source, y=2326–3102 | Administrator mobile, section 4/5: account rows and status labels |
| 33 | `admin-users-mobile-section-05-of-05.png` | same source, y=3102–3878 | Administrator mobile, section 5/5: remaining accounts |

## Additional state captures

The status column identifies current local E2E captures separately from
controlled API-state images. The latter use mocked responses and are not
database-backed behavior proof. All current captures remain dirty-tree evidence,
not historical or final-main captures.

| File | State shown | Evidence type | Status |
|---|---|---|---|
| `authentication/requester-regression/invalid-login-1280x900.png` | Safe invalid-login failure | UI plus E2E flow | Passed |
| `authentication/requester-regression/inactive-account-1280x900.png` | Safe inactive-account failure | UI plus E2E flow | Passed |
| `authentication/requester-regression/first-login-change-password-1280x900.png` | Mandatory first-password change gate | UI plus E2E flow | Passed |
| `authentication/requester-regression/logout-gate-1280x900.png` | Login gate after logout | UI plus E2E flow | Passed |
| `authentication/signing-in-busy-1280x900.png` | Disabled `Signing in...` feedback during a delayed authentication request | Live browser flow | Passed |
| `authentication/sign-in-success-1280x900.png` | Successful Requester destination after authentication | Live browser flow | Passed |
| `accessibility/login-keyboard-focus-1280x900.png` | Sign-in submit control reached through keyboard navigation | Keyboard-only browser flow | Passed |
| `accessibility/requester-navigation-keyboard-focus-1280x900.png` | Requester Create Ticket navigation reached by Tab | Keyboard-only browser flow | Passed |
| `accessibility/staff-detail-keyboard-focus-1280x900.png` | Staff opened Ticket Detail and focused Back to Ticket Queue | Keyboard-only browser flow | Passed |
| `accessibility/admin-create-keyboard-focus-1280x900.png` | Administrator opened Create User and focused Name | Keyboard-only browser flow | Passed |
| `staff-queue/no-results-1280x900.png` | Filtered queue with no matches | Controlled UI state | Passed |
| `staff-queue/empty-1280x900.png` | Empty queue state | Controlled UI state | Passed |
| `staff-queue/failure-1280x900.png` | Queue API failure with retry | Controlled UI state | Passed |
| `staff-ticket-detail/operations-1280x900.png` | Claim, priority, public comment, and internal note | UI plus E2E flow | Passed |
| `staff-ticket-detail/validation-1280x900.png` | Safe owner-validation failure | UI plus E2E flow | Passed |
| `user-management/create-form-1280x900.png` | Create-user form | UI plus E2E flow | Passed |
| `user-management/duplicate-validation-1280x900.png` | Duplicate-email validation | UI plus E2E flow | Passed |
| `user-management/no-results-1280x900.png` | User search with no matches | UI plus E2E flow | Passed |
| `user-management/edit-form-1280x900.png` | Edit-user form and activation controls | UI plus E2E flow | Passed |
| `user-management/reset-list-1280x900.png` | User list after reset action | UI plus E2E flow | Passed |
| `user-management/reset-first-login-1280x900.png` | Reset user reaches mandatory password change | UI plus E2E flow | Passed |
| `user-management/reset-success-1280x900.png` | Persistent reset confirmation before returning to the user list | Live browser flow | Passed |
| Figure 40: `staff-queue/pagination-page-2-1280x900.png` | Staff queue page 2 with ten real ticket fixtures; page indicator says Page 2 of 3 | Live database-backed E2E flow | Passed locally; dirty tree |
| Figure 41: `staff-ticket-detail/migration-preservation-operations-1280x900.png` | Migrated Attachment visible after reassignment, LOW priority, and NEW-to-OPEN update | Live database-backed E2E flow | Passed locally; dirty tree |
| Figure 42: `authentication/requester-resolution-indicated-1280x900.png` | Requester sees the separate resolved indication and can clear it | Live database-backed E2E flow | Passed locally; dirty tree |

## Visual checklist

| Check | Evidence source | Current audit status |
|---|---|---|
| Desktop, tablet, and mobile layout | Required PNG set and Figures 20-33 crops | Captured in current E2E; overflow assertions passed for four main role screens; dirty tree, not final-main. |
| Login and mandatory Change Password responsive layout | Figures 34-39; `output/docs/evidence-20260929/capture-auth-responsive.mjs` | Captured and visually inspected at all three sizes; mocked API, layout evidence only. |
| No apparent horizontal overflow or clipped controls | Current E2E `scrollWidth <= clientWidth` assertions | Passed locally for Requester, Queue, Ticket Detail, and Admin at required viewports. |
| Keyboard completion and visible focus | `z-accessibility-evidence.spec.ts` plus listed images | Passed locally: three keyboard-only journeys and one delayed-login busy-state case; not final-main. |
| Labels and role navigation | Client tests and Playwright role-based locators | Passed in tested flows; this is not a complete accessibility audit. |
| Validation, loading, empty, and failure states | API/UI tests, controlled-state images, and integrated E2E | Representative checks passed; mocked empty/failure images remain controlled API-state evidence. |
| Screenshot readability and caption accuracy | Figures 20-39 and report pages 12, 17, and 22 | Final PDF pages inspected after export; captures and report remain local dirty-tree evidence. |

Local visual evidence does not replace the reviewed PR and release workflow,
which is recorded in [`reviewer.md`](reviewer.md). Figures 34-39 use mocked API
responses and must not be described as functional authentication evidence.
