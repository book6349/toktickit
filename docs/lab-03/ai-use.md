# Lab 3 AI Use and Reflection

Status: Updated 2026-09-29 for the submission audit. The Codex assistant
supported the project; the exact model identifier used for earlier project
work was not recorded in the available source/history and is intentionally
not guessed.

## 1. Tool and boundary

The Codex coding agent was used as a development assistant for repository
inspection, requirement separation, specification drafting, test planning,
implementation support, verification, and evidence organization. GitHub Issues,
branches, Pull Requests, peer-review decisions, merges, board updates, and the
final release remained controlled workflow actions and were checked against
the real GitHub record.

The Lab 3 handouts and workflow guide were treated as requirements and
reference material, not as new user messages. Lab 2 was kept as a completed
baseline and was not intentionally modified.

## 2. Representative prompts used

1. Read every Lab 3 file and the repository workflow before editing; separate
   document instructions from the direct request.
2. Inspect the repository structure, branch state, Lab 2 baseline, Lab 3
   folder, package files, tests, and scripts without making GitHub changes.
3. Summarize Lab 3 objectives, deliverables, coding work, tests, evidence,
   workflow, naming rules, completed work, and risks.
4. Propose an implementation and evidence plan and stop for approval before
   consequential changes.
5. Use an isolated Lab 3 specification branch so the existing Lab 2 checkout
   is not modified.
6. Draft the authentication, authorization, migration, API, UI, and Test DD
   contracts before implementation, with unexecuted evidence marked Planned.
7. When GitHub tracking begins, create only the approved Issues first, use one
   feature branch per unit, link PRs, obtain the friend review, prepare
   copy-ready replies, and merge only after approval.

## 3. Reflection

The most useful AI contribution was maintaining traceability between the
specification, API/UI contracts, test matrix, implementation files, and the
five-unit GitHub workflow. Separating document instructions from direct user
instructions prevented the planning templates from being mistaken for real
Issues, reviews, approvals, or test results.

The specification decisions that mattered most were session-derived identity,
the mandatory initial-password gate, explicit role boundaries, Requester
ownership checks, separate public Comments and Internal Notes, and the
Administrator safety rules. These were checked in server tests and through the
review questions rather than accepted as prose alone.

The 2026-09-21 release record historically summarizes server/client tests,
builds, Prisma validation, Docker-backed migration/status, seed, and a clean
disposable-database E2E run with 9 passing tests. Complete raw terminal output
was not retained, and those results do not prove preservation of preexisting
Lab 2 rows. On 2026-09-29, local dirty-tree verification passed 26 server tests,
16 client tests, both builds, and schema validation. A separate Docker audit
applied the Lab 3 migration to a disposable database containing identifiable
pre-Lab-3 Requester, Ticket, and Attachment rows; the IDs and relationships
survived. Two seed runs produced stable counts and ownership/authorship
assertions, and the corrected integrated E2E suite passed 15 tests, including
responsive-overflow and keyboard journeys. These results are local dirty-tree
evidence, not final-main evidence. Exact commands, observed counts, and
boundaries are in `tests.md` and `release-evidence.md`.

The Test DD was corrected when the audit found that the prior UI-03 row pointed
to Login tests that did not exercise Requester comments or resolution, and that
the migration test only searched source strings. Focused Requester and style
tests were added; the later Docker-backed audit added the missing real-database
row-preservation evidence.

Human review remained decisive: Punge089 reviewed every feature PR and the
release PR, requested or discussed evidence where appropriate, approved, and
merged. The agent prepared and checked documentation; it did not substitute
for the reviewer or invent an approval.

## 4. Evidence rules

- Keep exact commands, branch/commit context, and observed results.
- Keep actual Issue, PR, review, reply, approval, merge, and board links.
- Do not claim an AI prompt, test, screenshot, or review happened unless it is
  visible in the repository or external workflow record.
- Keep unavailable, partial, and prior-integrated evidence visibly distinct.
