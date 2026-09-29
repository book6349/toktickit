# Lab 3 Required Submission Evidence Audit

This checklist maps the Required Submission Evidence table on pages 16-18 of
the Lab 3 sheet to report pages, repository paths, captured evidence, and
exact verification commands. It distinguishes historical final-main summaries
from current dirty-working-tree results.

## Current Audit Status

The prior statement that a Project-board screenshot was unavailable was stale:
the editable report contains a board screenshot on page 2 showing Issues
#36-#40 in Done at the original release. On 2026-09-30, the live board was
rechecked after the post-audit follow-up: Issue #40 is now open in `PR Review`.
The existing screenshot therefore records the historical state and must be
replaced for the final report. This audit rechecked the previously deferred Docker-backed work
on uniquely named disposable databases. The Lab 3 migration preserved seeded
pre-Lab-3 Requester, Ticket, and Attachment rows; two seed runs produced stable
counts and relationship checks; and the corrected integrated Playwright run
passed 15 tests. These results and fresh browser captures are from the dirty
local tree on branch `main` at `493758be65850504de7b970e50f7a61b846584f0`, not
from that committed SHA or final-main.

Remaining limits prevent claiming full final compliance:

1. PR #47 publishes the post-audit corrections to `lab3-staging` but is still
   awaiting Punge089's review. A follow-up release PR and final post-review run
   against committed `main` are still required.
2. The historical main run's full raw output is absent. Current passing output
   is local dirty-tree evidence and is labelled accordingly.
3. The original mobile full-page screenshots on report pages 12, 17, and 22
   were too small. Figures 20-33 now split them into readable lossless sections;
   their placement and captions must be checked in the regenerated final PDF.
4. Figures 34-39 show actual-client Login and mandatory Change Password
   layouts at all target sizes using mocked auth responses. They prove layout,
   not authentication behavior.
5. Current local E2E includes real-data Queue pagination, three keyboard-only
   journeys, and overflow checks on Requester, Queue, Detail, and Admin
   viewports. Administrator safety guards are identifiable in passing API
   tests, but no dedicated safety-state screenshot was captured.
6. Reviewer Punge089's historical review events are confirmed, and a review
   request for PR #47 is visibly pending. The current collaborator-permission
   endpoint returned 403, so current collaborator permission level remains
   unknown. The live board shows Issue #40 in `PR Review`.
7. The corrected workflow/evidence records are committed on the PR #47 head
   branch, not yet integrated into `main`. The editable report's board view and
   workflow appendix still need synchronization with the follow-up events.

No placeholder or planned evidence is treated as a real event. Full compliance
is not claimed while these material gaps remain.

## Page 16 - Submission format and Part 1

| Required evidence | Evidence location | Verification | Status |
|---|---|---|---|
| One concise PDF to submit | `output/docs/Lab3_Final_Report.pdf` | Regenerated from the editable DOCX; final page count, hash, links, and every rendered page are checked after export | Local submission copy; not final-main |
| Headings `Answer Part 1` through `Answer Part 9` in exact order | Final report body pages 1-32 | Extracted heading check; Part 1-9 headings occur in order | Verified |
| Working links | Final report annotations and GitHub links | Issues/PRs #36-#47 and historical review/comment/reply/approval anchors were checked; PR #47 is linked to Issue #40 through Development; permission endpoint returned 403 | Links checked; PR #47 review pending; collaborator permission is not established |
| Readable screenshots | Final report Figures 1-42 and `artifacts/lab-03/screenshots/` | Lossless mobile crops, fresh E2E captures, and all page placements inspected; auth gate images use mocked API for layout only | Local dirty-tree evidence; not final-main |
| Final repository and `main` as source of truth | Part 1, local `reviewer.md`, final commit `493758b` | Corrections and workflow updates are on PR #47 to staging; they are not yet on `main` | Follow-up integration pending; report requires final synchronization |
| Feature branches merged into `lab3-staging`, then `main` | Part 1 table and local `reviewer.md` section 2 | Issues #36-#40 and PRs #41-#46 confirmed through read-only GitHub fetches; all merged/closed | GitHub events verified |
| Final Kanban board with all Issues in Done | `reviewer.md`, Part 1, screenshot embedded on report page 2 | Existing image shows the historical #36-#40 Done state; the live board now shows reopened Issue #40 in PR Review | Refresh board screenshot after follow-up release and closure |
| Rendered `reviewer.md` with reviewer identity, PR links, comments, replies, approvals | Final report workflow appendix and `reviewer.md` | Six review/reply/approval/merge rows are rendered | Verified |
| README and `.gitignore` evidence | Final report workflow appendix and repository links | Files inspected on final `main` | Verified |
| Repository directory structure | Final report repository appendix | Generated from `git ls-tree -r --name-only HEAD` at `493758b`; 152 committed paths, excluding dirty, ignored, generated, and backup files | Content and rendered placement verified |

## Page 17 - Parts 2 through 8

| Part | Required evidence | Evidence location and check | Status |
|---|---|---|---|
| 2 | Rendered `docs/lab-03/specification.md` | Full source rendered in the specification appendix; numbered requirements, business rules, authorization rules, ACs, migrations, and DoD are visible | Verified |
| 2 | Specification existed before implementation PRs | Part 2 chronology: contract/Test DD in PR #41 before PRs #42-#45 | Verified |
| 3 | Rendered `docs/lab-03/tests.md` | Full Test DD rendered in the test appendix; traceability and file paths are visible | Verified |
| 3 | Planned tests, AC traceability, actual paths, final status | Test DD appendix plus `docs/lab-03/tests.md` | Verified |
| 3 | Complete passing unit, API/integration, UI, authorization, regression, and E2E output from committed `main` | Current full server/client logs and 15-test E2E run are from the dirty tree; historical main log is summarized only | Not met for committed `main`; current local runs passed, and final-main rerun remains pending |
| 4 | Rendered `docs/lab-03/ai-use.md`, LLM name, 6-10 prompts, reflection | Seven prompts/reflection present; Codex assistant recorded, exact earlier model identifier unavailable | Partially evidenced; no model guessed |
| 5 | Valid/invalid login and inactive-account handling | Authentication tests, fresh 15-test E2E run, and browser captures | Passed locally; dirty-tree result, not final-main |
| 5 | Busy and safe failure feedback | Client tests and fresh delayed-login browser capture | Passed locally; screenshot is actual browser evidence |
| 5 | Login and mandatory Change Password at desktop/tablet/mobile | Figures 34-39; actual React client with synthetic API responses | Captured and visually inspected; layout only, not auth behavior evidence |
| 5 | First-password change, user/role display, logout, direct access blocked | Authentication client/API tests and E2E | Passed locally; token expiry is not exercised; not final-main |
| 6 | Realistic queue data, search, filters, sorting, pagination, ownership, badges, open detail | Queue tests, 21 real E2E fixture records, Page 2 of 3 assertion, and screenshot | Page-2 navigation passed locally; exhaustive sort/filter matrix remains incomplete |
| 6 | Empty, no-results, and failure feedback | `empty-1280x900.png`, `no-results-1280x900.png`, and `failure-1280x900.png` are controlled UI-state captures | Present as mocked API-state evidence; not database-backed behavior proof |
| 6 | Responsive behavior | Required desktop/tablet/mobile queue figures and Figures 20-24 | E2E viewport/overflow checks passed locally; auth layout images are mocked; not final-main |
| 7 | Claim/reassign, IT Priority, permitted status changes | Staff API/client tests and migration/operations E2E capture | Reassignment, LOW priority, NEW-to-OPEN, and migrated Attachment display passed locally and are visibly captured |
| 7 | Public Comments, Internal Notes, attachment continuity, requester resolution | Detail tests, migration/operations capture, and Requester resolution screenshot | Representative paths passed locally; append-only behavior and all transition combinations remain bounded |
| 7 | Role restrictions, validation, safe failure, direct API authorization | Current API/client tests and E2E | Representative checks passed locally; not final-main |
| 8 | List with Name, Email, Role, Status, Edit | Responsive user-management figures | Verified |
| 8 | Search and optional role filter | Admin E2E and no-results capture | Verified |
| 8 | Create user with permitted role and initial password | Create-form capture and admin E2E | Verified |
| 8 | Duplicate-email and invalid-input validation | Duplicate-validation capture and API tests | Verified for duplicate and API invalid-input; separate invalid-field screenshot is not captured |
| 8 | Edit name, email, role, activation | Edit-form capture and API/client tests | Verified by tests; visual edit form is captured |
| 8 | Reset initial password and required next-login change | Persistent `reset-success-1280x900.png` plus `reset-first-login-1280x900.png` | Verified |
| 8 | Self-deactivation and last-active-Administrator protection | Named test cases in `users-admin.api.test.ts` and complete server test output | Passed in current local API suite; no safety-state screenshot |
| 8 | Forbidden non-Administrator access | Named denial cases in `users-admin.api.test.ts` and `staff-queue.api.test.ts` | Passed in current local API suite and local E2E; no dedicated denial screenshot |
| 8 | Responsive Zen Green and safe failure feedback | Responsive figures, API/client tests, and report checklist | Verified for responsive presentation; not every failure state has a screenshot |

## Page 18 - Part 9 and PDF format

| Required evidence | Evidence location | Verification | Status |
|---|---|---|---|
| Rendered `ui-spec.md` | UI-spec appendix and repository link | Full UI specification rendered | Verified |
| Desktop, tablet, and mobile screenshots for all major Lab 3 screens | Figures 1-12, 20-33, responsive auth Figures 34-39, and interaction Figures 40-42 | Fresh local E2E captures and final PDF placements visually inspected; auth gates use mocked API | Local dirty-tree evidence; final-main recapture/integration outstanding |
| Design consistency and Zen Green tokens | UI specification and visual checklist | Token and responsive rules rendered | Verified |
| Role navigation | Authentication/staff/admin tests and captures | Functional role navigation passed | Verified functionally; not a complete accessibility audit |
| Badges | Queue, detail, and user-management captures | Status, priority, role, and active-state badges visible | Verified |
| Editable/read-only fields | Staff detail and Administrator direct-detail evidence | API/client tests and detail captures | Verified by tests; not every role variant has a separate figure |
| Validation placement | First-login, queue/detail, and administrator validation captures | Field and alert placement visually inspected | Verified for captured states |
| Keyboard focus | `z-accessibility-evidence.spec.ts` and fresh browser captures | Three keyboard-only flows and one delayed-login busy-state flow passed in the local E2E run | Passed locally; not final-main |
| Clipping and overlap | Fresh viewport screenshots, responsive assertions, and mobile crops | E2E viewport bounds passed for four main screens; final PDF pages are visually inspected after export | Passed locally within those tested views; not a universal accessibility audit |
| Horizontal overflow | E2E `scrollWidth <= clientWidth` assertions | Passed for Requester, Queue, Ticket Detail, and Admin at required viewports | Passed locally; Login/Change Password are separately mocked layout evidence |
| One PDF with exact Answer Part format | `output/docs/Lab3_Final_Report.pdf` | Re-exported from editable DOCX; exact section order, figure numbering, links, and all page renders checked | Local artifact; final-main integration and verification remain incomplete |

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

The board screenshot is present on report page 2, so the former “unavailable”
claim is removed. GitHub Issue/PR/review event links were checked; Punge089's
historical review activity is confirmed and the PR #47 review request is
visible. The permission endpoint returned 403. The live board was checked and
shows Issue #40 in `PR Review`. Docker-backed migration, seed, data
preservation, and integrated E2E checks passed on disposable databases in the
dirty local tree. Final acceptance remains open for Punge089's PR #47 review,
the reviewed follow-up release to `main`, post-review checks against committed
`main`, final report and board screenshot synchronization, and current reviewer
permission-level confirmation.
