# Step 5 local report and resolution-indicator repair

Date: 2026-10-01, Asia/Bangkok. Worktree: `C:/Users/Jitvoottikrai/OneDrive/เดสก์ท็อป/SoftwareEn/LAB1/Lab1_Starter_Scaffold/toktickit-lab3-specification`.
Branch: `feature/lab3-submission-corrections`. Base HEAD: `1fb8df040eb12ac443bb4246a314babfde1564e9`, dirty. Recorded remote main: `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`.
These are local results, not final-main evidence. No commits, pushes, Issues, PRs, reviews, comments, board updates or merges were made in this step.

## Repair and passing verification

Staff/Admin Detail now displays an existing Requester resolution indication and its timestamp without mutating formal status. It is absent for null indications. Four client assertions and one actual Staff browser case cover the repair.
The before-fix run failed 2 assertions and passed 4; output remains in `staff-indicator-before-fix.txt`. Earlier failures remain in preceding evidence folders.

The post-fix run used a new disposable PostgreSQL database `toktickit_lab3_e2e_20261001_run2`. No existing user database was reset. The 01:43–01:45 local run retained complete stdout/stderr:

| Working directory | Command | Result / exit | Complete output |
|---|---|---|---|
| server | `npm test -- --reporter=verbose` | 190 tests / 19 files passed; 0 | server-tests.txt |
| client | `npm test -- --reporter=verbose` | 36 tests / 14 files passed; 0 | client-tests.txt |
| server | `npm run build` | passed; 0 | server-build.txt |
| client | `npm run build` | passed; 0 | client-build.txt |
| server | `npx --no-install prisma validate` | valid; 0 | prisma-validation.txt |
| root | `npm run test:e2e:prepare` | migration baseline retained, seed twice, fixture checks; 0 | database-run2.txt |
| root | `npx --no-install playwright test e2e/lab-03 --output output/docs/evidence-20261001-step5/browser-run2` | 16 Chromium scenarios passed; 0 | e2e-run2.txt |

Configuration followed step 3: actual worktree API 3103, client 5183, E2E_BASE_URL and E2E_API_BASE_URL select those servers; DATABASE_URL selects only the new local disposable database. Exact preparer migration/seed subcommands are printed in database-run2.txt. This executes migration deployment/status and compares before/after synthetic rows, IDs and relationships; it is not merely a source-string check.
Seed twice confirmed 10 users (4 active/1 inactive Requester, 3 active/1 inactive Staff, 1 active Administrator), 3 seeded tickets plus the baseline, 3 public comments, 3 notes and 1 attachment, stable ownership/authorship counts. The preserved 17-byte attachment hash is `cc7098632c30d31ed81ff5936a75a027f3136024cb96efd35e8fe3f9b4d3cfaf`.
Real self-removal, Requester/Staff denial and attachment-download output from step 3 is preserved and rendered; the separate last-active-admin delegate branch remains explicitly mocked test coverage.

Docker was checked again after the user opened it: elevated `docker ps --format '{{.Names}} {{.Status}}'` exited 0 and showed `toktickit-postgres` running. Initial restricted-pipe access denial was a sandbox permission result, not Docker unavailability. This readiness check is not labelled a new database-test rerun. Earlier Docker-unavailable records remain historical; the new local Docker-backed checks above passed.

## Report preservation and visual verification

The builder edited the current user DOCX backup directly, not an older report-generation source. Original hashes were checked immediately before publication. Originals remain in `backup/`.
The updated DOCX contains 1552 editable paragraphs and 23 editable tables; report pages were not converted into images. Answer Parts 1–9 remain ordered and Figures 1–51 are sequential. Actual application PNGs, including readable native mobile sections and resolution-indicator regions, are used; no generated images were used.
Complete passing output is rendered in the appendix. Committed tree lists all 218 paths from the explicit recorded main SHA; ignored/untracked local files are excluded. Historical README/.gitignore renders are identified as historical pending integration. Unknown historical model name and pending reviewer access are not guessed.

Packaged DOCX renderer was attempted and failed because bundled LibreOffice was unavailable; logs remain in renderer-baseline. A dedicated hidden Word COM instance exported the candidate, with only its own document/application closed. Poppler rendered at 100 dpi.
All 121 v6 pages were opened and visually inspected. After the final semantic corrections, all v7 images were compared by SHA256 to v6: only pages 33–35 and 74–80 differed. Each of those ten pages was reopened and inspected; the other 111 pages were byte-identical to the reviewed images. No text overlap, clipped table cells, broken page numbers or caption numbering gaps were observed. Full-page originals remain alongside readable selected evidence.
New post-fix native PNGs are copied without image alteration to `artifacts/lab-03/screenshots/staff-ticket-detail/audit-20261001-step5/`; existing differing captures are not overwritten. The supplemental automated E2E captures remain in `staff-ticket-detail/requester-resolution/`.

## Remaining acceptance work

Final local files were reopened successfully after copying. Structural assertions
confirmed 121 pages with footers 1–121, Parts 1–9, Figures 1–51, 1552 paragraphs,
23 editable tables, 71 DOCX hyperlink relationships and 176 PDF URI annotations.
Annotation presence is not proof of reviewer access. Both delivered PDF copies
are byte-identical. Twelve post-fix native PNG copies were retained.
DOCX SHA256: `0279AEA985FE867BDDA51A5930AA0B4BB54007BF0769C85B177CECDAE5BE4CD4`.
PDF SHA256: `9669C89718C04E2F54C6065D49AB1CB5F367B2497B8011E7189ADFD4635C4BA7`.

Not ready to claim full submission compliance. Reviewed staging/release integration, a clean committed-main rerun and corresponding evidence refresh, final links/reviewer-access verification, synchronization of historical README/.gitignore appendices and the final labsheet acceptance audit remain required. External actions require explanation and user authorization; the designated reviewer approves and merges. No extra tracking items are invented.
