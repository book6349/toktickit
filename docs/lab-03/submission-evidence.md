# Lab 3 Required Submission Evidence Audit

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

This checklist maps the Required Submission Evidence table on pages 16-18 of
the Lab 3 sheet to report pages, repository paths, captured evidence, and
exact verification commands. The detailed evidence rows retain their original
capture/test provenance; the current merged-main status is summarized below.

## Current Audit Status

The board screenshot on report page 2 shows Issues #36-#40 in `Done`. The live
board was rechecked after PR #48; Issue #40 is closed and remains `Done`. PR #47
merged to `lab3-staging`; reviewed release PR #48 merged to `main` at
`0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`.

Final-main verification on 2026-09-30 passed the focused Lab 3 server/client
suites (26 and 16 tests), both builds, and Prisma schema validation. The full
unfiltered server/client suites failed in legacy Lab 1/2 tests. Docker's API
pipe was not reachable, so migration/data-preservation, seed-twice, and
integrated E2E checks were not rerun on this commit. Existing screenshots are
from the earlier pre-merge run and were not recaptured on clean main. The
editable report/PDF update and full rendered-page recheck remain in progress.

Full compliance is not claimed while the full-suite failures, unavailable
Docker-backed evidence, missing dedicated Administrator safety-state capture,
and final DOCX/PDF render audit remain unresolved. No placeholder is treated as
a real GitHub event or test result.

## Page 16 - Submission format and Part 1

| Required evidence | Evidence location | Verification | Status |
|---|---|---|---|
| One concise PDF to submit | `output/docs/Lab3_Final_Report.pdf` | Existing PDF is 101 pages; this audit's DOCX/PDF content update and full render check remain pending | Not final-ready |
| Headings `Answer Part 1` through `Answer Part 9` in exact order | Final report body | The existing PDF had the nine headings in order; repeat extraction after final export | Recheck pending |
| Working links | Final report annotations and GitHub links | Issues #36-#40 and PRs #41-#48, including review/comment/reply/approval links, were checked; PR #47/#48 link to Issue #40 | GitHub events verified; final PDF link audit pending |
| Readable screenshots | Final report Figures 1-42 and `artifacts/lab-03/screenshots/` | Existing screenshots are captured on the earlier pre-merge run; auth-gate images use mocked API for layout only | Historical supporting evidence; not recaptured on clean main |
| Final repository and `main` as source of truth | Part 1, `reviewer.md`, final commit `0353a40` | PR #48 integrated the reviewed follow-up to main; final-main test and evidence limitations are recorded | Main state verified; local report update is not yet final |
| Feature branches merged into `lab3-staging`, then `main` | Part 1 table and `reviewer.md` section 2 | Issues #36-#40, PRs #41-#47, and release PR #48 were confirmed merged/closed as applicable | GitHub events verified |
| Final Kanban board with all Issues in Done | `reviewer.md`, Part 1, screenshot embedded on report page 2 | Live board and Issue #40 final state were rechecked after PR #48; all five Issues are Done/closed | Verified |
| Rendered `reviewer.md` with reviewer identity, PR links, comments, replies, approvals | Final report workflow appendix and `reviewer.md` | Eight review/reply/approval/merge rows are available in the updated source | Source updated; final PDF render pending |
| README and `.gitignore` evidence | Final report workflow appendix and repository links | Files inspected on final `main` | Verified |
| Repository directory structure | Final report repository appendix | `git ls-tree -r --name-only HEAD` at `0353a40` reports 218 committed paths; excludes ignored and untracked files | Main tree verified; final PDF render pending |

## Page 17 - Parts 2 through 8

| Part | Required evidence | Evidence location and check | Status |
|---|---|---|---|
| 2 | Rendered `docs/lab-03/specification.md` | Full source rendered in the specification appendix; numbered requirements, business rules, authorization rules, ACs, migrations, and DoD are visible | Verified |
| 2 | Specification existed before implementation PRs | Part 2 chronology: contract/Test DD in PR #41 before PRs #42-#45 | Verified |
| 3 | Rendered `docs/lab-03/tests.md` | Full Test DD rendered in the test appendix; traceability and file paths are visible | Verified |
| 3 | Planned tests, AC traceability, actual paths, final status | Test DD appendix plus `docs/lab-03/tests.md` | Verified |
| 3 | Complete passing unit, API/integration, UI, authorization, regression, and E2E output from committed `main` | Focused Lab 3 output is 26 server + 16 client passes on `0353a40`; full unfiltered suites fail in legacy tests; Docker/E2E not rerun | Not met: aggregate suites are not green and final-main integrated E2E is unavailable |
| 4 | Rendered `docs/lab-03/ai-use.md`, LLM name, 6-10 prompts, reflection | Seven prompts/reflection present; Codex assistant recorded, exact earlier model identifier unavailable | Partially evidenced; no model guessed |
| 5 | Valid/invalid login and inactive-account handling | Final-main auth/client tests; earlier 15-test E2E and screenshots | Direct tests passed on main; integrated flow is historical, not rerun |
| 5 | Busy and safe failure feedback | Final-main client tests and earlier delayed-login browser capture | Test passed on main; screenshot is pre-merge supporting evidence |
| 5 | Login and mandatory Change Password at desktop/tablet/mobile | Figures 34-39; actual React client with synthetic API responses | Captured; mocked API proves layout only; not recaptured on main |
| 5 | First-password change, user/role display, logout, direct access blocked | Final-main auth/client tests; earlier E2E | Direct tests passed; integrated path not rerun; token expiry is not exercised |
| 6 | Realistic queue data, search, filters, sorting, pagination, ownership, badges, open detail | Main queue API/UI tests; earlier 21-fixture E2E, Page 2 of 3, and screenshot | Direct tests passed; real-data page-2 screenshot is pre-merge; exhaustive sort/filter matrix remains incomplete |
| 6 | Empty, no-results, and failure feedback | `empty-1280x900.png`, `no-results-1280x900.png`, and `failure-1280x900.png` are controlled UI-state captures | Present as mocked API-state evidence; not database-backed behavior proof |
| 6 | Responsive behavior | Required desktop/tablet/mobile queue figures and Figures 20-24 | Existing captures/overflow checks are pre-merge; not rerun on final main; auth layout images are mocked |
| 7 | Claim/reassign, IT Priority, permitted status changes | Main staff API/client tests and earlier migration/operations E2E capture | Representative direct tests passed on main; Attachment/operation screenshot is pre-merge |
| 7 | Public Comments, Internal Notes, attachment continuity, requester resolution | Main detail/Requester tests; earlier migration/operations capture | Direct paths passed on main; attachment continuity is historical; append-only behavior and all transitions remain bounded |
| 7 | Role restrictions, validation, safe failure, direct API authorization | Main API/client tests and earlier E2E | Direct checks passed on main; integrated E2E not rerun |
| 8 | List with Name, Email, Role, Status, Edit | Responsive user-management figures | Verified |
| 8 | Search and optional role filter | Admin E2E and no-results capture | Verified |
| 8 | Create user with permitted role and initial password | Create-form capture and admin E2E | Verified |
| 8 | Duplicate-email and invalid-input validation | Duplicate-validation capture and API tests | Verified for duplicate and API invalid-input; separate invalid-field screenshot is not captured |
| 8 | Edit name, email, role, activation | Edit-form capture and API/client tests | Verified by tests; visual edit form is captured |
| 8 | Reset initial password and required next-login change | Persistent `reset-success-1280x900.png` plus `reset-first-login-1280x900.png` | Verified |
| 8 | Self-deactivation and last-active-Administrator protection | Named tests in `users-admin.api.test.ts`; 26-test main output | Passed in the final-main API suite; no safety-state screenshot |
| 8 | Forbidden non-Administrator access | Named tests in `users-admin.api.test.ts` and `staff-queue.api.test.ts` | Passed in final-main API tests; no dedicated denial screenshot |
| 8 | Responsive Zen Green and safe failure feedback | Responsive figures, API/client tests, and report checklist | Verified for responsive presentation; not every failure state has a screenshot |

## Page 18 - Part 9 and PDF format

| Required evidence | Evidence location | Verification | Status |
|---|---|---|---|
| Rendered `ui-spec.md` | UI-spec appendix and repository link | Full UI specification rendered | Verified |
| Desktop, tablet, and mobile screenshots for all major Lab 3 screens | Figures 1-12, 20-33, responsive auth Figures 34-39, and interaction Figures 40-42 | Existing captures came from the pre-merge run; auth gates use mocked API | Historical supporting evidence; no final-main recapture |
| Design consistency and Zen Green tokens | UI specification and visual checklist | Token and responsive rules rendered | Verified |
| Role navigation | Authentication/staff/admin tests and captures | Functional role navigation passed | Verified functionally; not a complete accessibility audit |
| Badges | Queue, detail, and user-management captures | Status, priority, role, and active-state badges visible | Verified |
| Editable/read-only fields | Staff detail and Administrator direct-detail evidence | API/client tests and detail captures | Verified by tests; not every role variant has a separate figure |
| Validation placement | First-login, queue/detail, and administrator validation captures | Field and alert placement visually inspected | Verified for captured states |
| Keyboard focus | `z-accessibility-evidence.spec.ts` and existing browser captures | Three keyboard-only flows and one delayed-login busy-state flow passed in the earlier local E2E run | Historical; not rerun on final main |
| Clipping and overlap | Existing viewport screenshots, responsive assertions, and mobile crops | Earlier E2E bounds passed for four main screens; updated final PDF still requires page-by-page review | Historical tested views only; not a universal accessibility audit |
| Horizontal overflow | Earlier E2E `scrollWidth <= clientWidth` assertions | Passed for Requester, Queue, Ticket Detail, and Admin in the earlier run | Historical; Login/Change Password images are mocked layout evidence |
| One PDF with exact Answer Part format | `output/docs/Lab3_Final_Report.pdf` and editable DOCX | Existing 101-page PDF was inspected on 2026-09-29; final evidence updates have not yet been exported/rechecked | Not final-ready; export, link audit, and every-page visual inspection remain |

## Evidence classification

- `Verified`: the command, source, screenshot, or real GitHub event was observed.
- `Historical`: recorded in an earlier release audit; not rerun in this audit.
- `Present; not reverified`: an artifact exists in the dirty working tree, but
  its current capture/run provenance is not established.
- `Partially evidenced`: useful evidence exists, but one requested proof form is
  incomplete.
- `Not verified`: the evidence could not be obtained from the current
  environment and is not claimed as complete.
- `Unavailable`: the required external view or permission was not accessible.

The board screenshot is present on report page 2, and the live board now also
shows the final all-Done state. Read-only GitHub checks verified PRs #41-#48,
review comments, author replies, approvals, merges, and Issue #40's closure.
The 2026-09-30 final-main Lab 3 tests/builds/Prisma schema validation passed,
but the unfiltered test suites failed in legacy tests and Docker-backed
migration, seed, and E2E checks were unavailable. The DOCX/PDF evidence update,
link audit, and complete final render inspection remain pending.

## Final-main status by labsheet part (2026-09-30)

| Labsheet part | Current status at `0353a40` |
|---|---|
| Part 1 — Git workflow | Verified: PRs #41-#48 review/merge history confirmed; Issues #36-#40 Done/closed. |
| Part 2 — Spec DD | Verified: specification and contracts were merged before implementation; existing rendered source remains in the report. |
| Part 3 — Test DD | Partial/not met: 26 server and 16 client Lab 3 tests passed, but full suites have 10 server and 15 client failures; final-main database/E2E output is unavailable. |
| Part 4 — AI reflection | Partial: seven prompts/reflection recorded; exact earlier model identifier is not available and is not guessed. |
| Part 5 — Login/password UI | Partial: direct Lab 3 tests pass; existing responsive captures are mocked/pre-merge; final-main E2E not run. |
| Part 6 — Staff Queue | Partial: direct API/UI tests pass; real-data pagination and responsive E2E evidence is pre-merge. |
| Part 7 — Staff Ticket Detail | Partial: direct tests pass; attachment continuity and operation sequence are pre-merge; append-only note behavior and exhaustive transitions remain incomplete. |
| Part 8 — Administrator UI | Partial: main API safety tests pass; no dedicated safety-state screenshot; integrated flow is pre-merge. |
| Part 9 — Responsive evidence | Partial: existing screenshots and prior visual audit are historical; clean-main E2E/layout/keyboard rerun and final PDF recheck remain. |
