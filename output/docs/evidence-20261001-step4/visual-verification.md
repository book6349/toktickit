# Step 4 visual evidence audit

## Historical gap found during step 4 — repaired in step 5

The missing indicator described below was subsequently repaired and verified
by four client assertions, a real Staff E2E scenario and three-width captures.
See `../evidence-20261001-step5/verification.md` for the passing post-fix run.
The failure record below is retained; it does not describe the current UI.

The Requester view displays the indication, and the live Staff API returns a
non-null `requesterResolutionIndicatedAt`. The Staff Detail component does not
render that field. See `staff-resolution-gap.txt`, `staff-resolution-gap-1280x900.png`,
and the retained run3 assertion failure. This is an implementation gap, not a
missing screenshot. Do not label Staff-side resolution display Passed or claim
all labsheet requirements are met. A small UI change plus a meaningful test
and real recapture is proposed before report synchronization.

## Provenance and preservation

Capture date: 2026-10-01, Asia/Bangkok; approximately 01:29–01:37 +07:00.
Branch: `feature/lab3-submission-corrections`; base SHA:
`1fb8df040eb12ac443bb4246a314babfde1564e9`. Dirty local tree, not final-main.
Server/client ports 3103/5183 used this worktree. The only database used was
the retained synthetic `toktickit_lab3_e2e_20261001_run1`; no pre-existing
application database was changed. Baseline Ticket status and comments/notes,
plus one previously created E2E user's account fields/password, were changed
only in that disposable database for real scenario captures.

No application source was edited during this step. Your report PDF/DOCX,
existing modified/untracked work, and original Lab 2 checkout were preserved.
No GitHub events, commits, pushes, branches, reviews, or merges were created.

The PDF skill guided the recheck of labsheet pages 16–18: real authentication
captures now replace mock-only layout evidence, and tall mobile views have
readable sections instead of being shrunk to one report image. No AI image
generation was used. All PNGs came from the actual browser/application.

## Capture commands, exact outcomes, and retained failures

Working directory: the Lab 3 worktree root. API was launched in `server` with
`DATABASE_URL` pointing to the disposable database, `PORT=3103`,
`CLIENT_ORIGIN=http://localhost:5183`, command `npm run dev`. Client was launched
in `client` with `VITE_API_URL=http://localhost:3103`, command
`npm run dev -- --host localhost --port 5183 --strictPort`.

- `node output/docs/evidence-20261001-step4/capture-evidence.mjs`,
  initial run at 01:29:54: exit 1, retained `capture-run1.txt`. Native section
  capture lacked `fullPage: true` for a clip beyond the viewport. Corrected
  the harness; no application defect or application change.
- Same command, `CAPTURE_RUN=run2`, at 01:30:29: exit 1, retained
  `capture-run2.txt`. The Requester Ticket row is itself a button, not a
  container with an Open button. Corrected this capture locator.
- Same command, `CAPTURE_RUN=run3`, at 01:31:43: exit 1, retained
  `capture-run3.txt`. Forty-nine individual captures completed, but the final
  Staff-resolution display assertion failed. Those individual captures are
  valid captured states; the full harness is not claimed to have passed.
- Same command, `CAPTURE_RUN=run4-admin`, `CAPTURE_ADMIN_ONLY=1`, at 01:32:37:
  exit 0, retained `capture-run4-admin.txt`; 25 individual PNGs captured with
  assertion-verified states. Administrator work continued independently.
- `node output/docs/evidence-20261001-step4/capture-supplement.mjs`,
  at 01:35:01: exit 0, retained `capture-run5-supplement.txt`; 7 PNGs captured.
  Executed real changes to Name, Email, Role, and activation on the synthetic
  E2E account, restored active Requester role, reset its initial password, and
  captured the mandatory next-login gate. Direct API access during that gate
  was 403 `PASSWORD_CHANGE_REQUIRED`. Also captured Administrator read-only
  Detail and a labelled controlled Detail service failure.
- `node output/docs/evidence-20261001-step4/confirm-staff-resolution-gap.mjs`,
  at 01:36:32: diagnostic exit 0, retained `staff-resolution-gap.txt`.
  This confirms the gap; it is not a passing feature test.
- Bundled Python: `python -X utf8 output/docs/evidence-20261001-step4/make-qa-sheets.py`,
  exit 0. Verified the PNG files open, recorded dimensions, and created
  QA-only previews plus the combined index. No source PNG was edited.

Connection configuration is process-local; no `.env` was changed. The
capture scripts use the known test servers. Their database guard checks the
selected disposable database name. Do not run these scripts against normal
application servers or reuse the scenario assumptions after their test data
has changed without checking the state first.

## Current evidence inventory and visual review

Eighty-one PNGs from run3/run4-admin/run5-supplement are individually indexed
in `captured-image-index.md`; the API/UI gap proof image is additional and
not counted as a successful scenario. Inventory IDs are separate from final
report figure numbers. Copies are placed under the labsheet's required
`artifacts/lab-03/screenshots/<group>/audit-20261001-step4/<run>/` paths,
preserving old screenshots and the evidence-folder originals.

All 14 QA preview sheets were inspected. Selected original mobile images
were also inspected at native resolution, including Change Password and the
Attachment/Public Comment section. Previews are QA tools, not submission
evidence. The originals and native sections should be used in the report.

| Visual criterion | Observed evidence / status |
|---|---|
| Major screens at desktop/tablet/mobile | Captured and inspected: Login, mandatory Change Password, Requester My Tickets/Create/Detail, Staff Queue/Detail, Administrator list/create/edit. |
| Zen Green continuity | Consistent green/pale-green palette, white cards, headers, buttons, error/success panels visible in inspected captures. |
| Role navigation | Requester-only destinations, Staff Queue, Administrator User Management/direct Detail, with identity and role visible. Requester Detail has no Internal Notes. |
| Badges and ownership | Requested/IT Priority, status, assigned/unassigned Queue data, role and Active/Inactive account badges visible. |
| Editable/read-only fields | Staff operational controls; Administrator Detail lacks claim controls and disables IT Priority; own Administrator activation is disabled with explanatory text. |
| Validation placement | Real login error, password-confirmation mismatch, invalid owner, invalid initial password, and duplicate-email field/error feedback captured. |
| Public/private separation | Distinct Public Comments and Internal Notes headings, visibility explanations, containers, and composers in Staff Detail; actual submitted content shown. |
| Responsive wrapping/clipping | Inspected screenshots show wrapped emails/long data, stacked forms/cards, no apparent overlap. Adjacent Save/Create and Cancel actions are close together but remain distinct; spacing could be improved cosmetically. |
| Horizontal overflow | Each full capture asserts document scroll width <= client width. Passed for the captured states at their viewport sizes. |
| Keyboard/focus | Executed keyboard journeys and focus screenshots are retained in step 3; this step's section images do not independently prove keyboard traversal. Password mismatch capture shows focus. |
| Readable mobile evidence | Native browser sections retain original pixels with 100px overlap, covering full tall screens; do not shrink full-page mobile images into a single report figure. |
| Empty/failure/loading | Real no-results queries; controlled mocked Queue-empty and Queue/Detail-503 views explicitly labelled; Queue loading uses a delayed real request, not a mocked success. |
| Staff Requester-resolution display | **NOT MET**; populated API value is not rendered. |

No numeric contrast audit or assistive-technology certification is claimed.
Overflow assertions and screenshot review cover the captured states, not
every possible string, state, device, or browser.

## Evidence to retain from step 3

Real populated Queue page 2, reassignment/priority/NEW-to-OPEN operations,
Requester resolution, delayed sign-in busy state, reset confirmation, and
keyboard evidence remain in `../evidence-20261001-step3/screenshots-run1/`.
Direct authorization, own Administrator removal denial, preservation of one
active Administrator, and exact migrated attachment bytes remain in
`../evidence-20261001-step3/live-api-checks.txt`. The separate last-admin error
branch was tested with mocked API delegates; live self-removal hits the
earlier self-protection guard. Keep that distinction in the final report.

## Next action and limits

Capture/visual review work is retained, but full compliance is not achieved.
First repair and test the missing Staff resolution indicator, then replace
its Staff screenshot. Report synchronization, figure numbering, final PDF
layout/link audit, reviewed Git integration, and committed-main reruns remain
later steps. Old report figures and stale documentation are not silently
updated or certified by this capture audit.
