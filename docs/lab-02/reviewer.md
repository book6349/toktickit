# Lab 2 — Peer Review and Merge Record

## Author and reviewer

| Role | Name | Student ID | GitHub | Repository |
|---|---|---|---|---|
| Author | Papangkorn Jitvoottikrai | 67070503421 | [@book6349](https://github.com/book6349) | [book6349/toktickit](https://github.com/book6349/toktickit) |
| Peer reviewer | Bannasorn | 67070503420 | [@Punge089](https://github.com/Punge089) | [Punge089/toktickit](https://github.com/Punge089/toktickit) |

This record distinguishes the repository issue number from the PR number. The
feature PRs targeted `lab2-staging`; PR #34 was the single release PR from
`lab2-staging` to `main`. Review events were checked against the GitHub PR
timelines on 2026-09-05. A verdict is recorded only where the timeline returned
the review event.

## Pull requests I authored — reviewed by @Punge089

| PR | Issue | Title | Head → base | Review evidence | Merge |
|---:|---:|---|---|---|---|
| [#25](https://github.com/book6349/toktickit/pull/25) | [#16](https://github.com/book6349/toktickit/issues/16) | Issue 5: Sprint engineering contract and test plan | `feature/lab2-spec-and-test-plan` → `lab2-staging` | Commented + approved | Merged |
| [#26](https://github.com/book6349/toktickit/pull/26) | [#17](https://github.com/book6349/toktickit/issues/17) | Issue 6: Database models, migrations, reference APIs, and idempotent seed | `feature/lab2-data-foundation` → `lab2-staging` | Commented + approved | Merged |
| [#27](https://github.com/book6349/toktickit/pull/27) | [#18](https://github.com/book6349/toktickit/issues/18) | Issue 7: Requester selector, session context, application shell, and navigation | `feature/lab2-requester-context` → `lab2-staging` | Commented + approved | Merged |
| [#28](https://github.com/book6349/toktickit/pull/28) | [#19](https://github.com/book6349/toktickit/issues/19) | Issue 8: Create Ticket API, UI, validation, and initial attachments | `feature/lab2-ticket-creation` → `lab2-staging` | Commented + approved | Merged |
| [#29](https://github.com/book6349/toktickit/pull/29) | [#20](https://github.com/book6349/toktickit/issues/20) | Issue 9: My Tickets API and responsive list UI | `feature/lab2-my-tickets` → `lab2-staging` | Commented + approved | Merged |
| [#30](https://github.com/book6349/toktickit/pull/30) | [#21](https://github.com/book6349/toktickit/issues/21) | Issue 10: Owned read-only Ticket Detail | `feature/lab2-ticket-detail` → `lab2-staging` | Commented + approved | Merged |
| [#31](https://github.com/book6349/toktickit/pull/31) | [#22](https://github.com/book6349/toktickit/issues/22) | Issue 11: Attachment upload, download, and soft removal | `feature/lab2-attachments` → `lab2-staging` | Commented + approved | Merged |
| [#32](https://github.com/book6349/toktickit/pull/32) | [#23](https://github.com/book6349/toktickit/issues/23) | Issue 12: E2E flow, responsive screenshots, and visual audit | `feature/lab2-e2e-visual` → `lab2-staging` | Commented + approved | Merged |
| [#33](https://github.com/book6349/toktickit/pull/33) | [#24](https://github.com/book6349/toktickit/issues/24) | Issue 13: Evidence documents and final report preparation | `docs/lab2-release-evidence` → `lab2-staging` | Commented + approved | Merged |
| [#34](https://github.com/book6349/toktickit/pull/34) | — | Lab 2 release | `lab2-staging` → `main` | Commented + approved | Merged at `8e897963c715c76eebbd0cb75568393e5ec55cc7` |

## Copy-ready review conversations recorded on the PRs

The following is a compact transcript index. The links point to the actual
review events; the text is the reviewer question, the author answer, and the
approval recorded for that PR.

### PR #25 — Issue #16 — Sprint engineering contract and test plan

- Reviewer comment: “The four documents line up well. One thing I checked: how do you keep the simulated Requester header from being mistaken for real authentication, and how do you know every acceptance criterion is covered?” ([review](https://github.com/book6349/toktickit/pull/25#pullrequestreview-5036969142))
- Author answer: “The specification labels X-Requester-Id as a testing-only context mechanism and defers real authentication to Lab 3. The traceability table maps AC-01 through AC-22 to planned tests, and the final-results table stays Planned until a command actually runs.”
- Approval: “That separation and traceability are clear. Approved.” ([approval](https://github.com/book6349/toktickit/pull/25#pullrequestreview-5036976428))
- Author follow-up: “Thanks for reviewing!”

### PR #26 — Issue #17 — Data foundation

- Reviewer comment: “The schema and seed cover several pieces at once. How did you make the migration and seed safe to rerun, and how do the reference endpoints keep inactive categories, systems, and requesters out of their responses?” ([review](https://github.com/book6349/toktickit/pull/26#pullrequestreview-5037054011))
- Author answer: “The migration adds the relationships, constraints, and ownership indexes, while the seed uses unique names and emails with upserts so repeated runs do not create duplicates. Each reference endpoint filters isActive and returns the documented wrapper shape, with a safe error when the database is unavailable.”
- Approval: “The persistence and reference-data rules are consistent and repeatable. Approved.” ([approval](https://github.com/book6349/toktickit/pull/26#pullrequestreview-5037057871))
- Author follow-up: “Thanks for reviewing!”

### PR #27 — Issue #18 — Requester context and shell

- Reviewer comment: “The requester selector and shell are clear. How do you stop an inactive requester from being reused if an old session value is still present?” ([review](https://github.com/book6349/toktickit/pull/27#pullrequestreview-5037100064))
- Author answer: “The client rechecks the saved session value against the active requester list, clears it when it is no longer active, and the server verifies the same active context on every requester-scoped request. The header is only the Lab 2 simulation, not authentication.”
- Approval: “The client and server checks agree, and the context boundary is documented. Approved.” ([approval](https://github.com/book6349/toktickit/pull/27#pullrequestreview-5037105275))
- Author follow-up: “Thanks for reviewing!”

### PR #28 — Issue #19 — Ticket creation and initial attachments

- Reviewer comment: “The create flow looks good. What happens if one initial file fails validation or storage after the other files have been accepted?” ([review](https://github.com/book6349/toktickit/pull/28#pullrequestreview-5037125286))
- Author answer: “The server validates every field and file before creating anything. If storage or metadata creation fails, it removes any temporary files, stored objects, attachment rows, and the ticket, so the initial batch is all-or-nothing. The ticket number and NEW status are server-generated.”
- Approval: “The validation and rollback behavior cover the failure case. Approved.” ([approval](https://github.com/book6349/toktickit/pull/28#pullrequestreview-5037130663))
- Author follow-up: “Thanks for reviewing!”

### PR #29 — Issue #20 — My Tickets list

- Reviewer comment: “Search, filters, and pagination are all here. What guarantees that a requester cannot see another requester’s ticket by changing a query parameter?” ([review](https://github.com/book6349/toktickit/pull/29#pullrequestreview-5037189936))
- Author answer: “Every list query includes requesterId in the database where clause; search and filters are applied on that owner-scoped query, not only in the browser. Invalid page, sort, filter, and status values return INVALID_QUERY.”
- Approval: “Ownership is enforced at the query boundary and the list contract is complete. Approved.” ([approval](https://github.com/book6349/toktickit/pull/29#pullrequestreview-5037193056))
- Author follow-up: “Thanks for reviewing!”

### PR #30 — Issue #21 — Owned Ticket Detail

- Reviewer comment: “How does the detail endpoint handle a valid ticket ID that belongs to another requester?” ([review](https://github.com/book6349/toktickit/pull/30#pullrequestreview-5037224916))
- Author answer: “The lookup requires both the ticket ID and the selected requesterId. If either the ticket is missing or the owner does not match, the API returns the same TICKET_NOT_FOUND response, so it does not reveal another requester’s record. The UI renders the returned fields read-only.”
- Approval: “The ownership and safe-not-found behavior are correct. Approved.” ([approval](https://github.com/book6349/toktickit/pull/30#pullrequestreview-5037227878))
- Author follow-up: “Thanks for reviewing!”

### PR #31 — Issue #22 — Attachment lifecycle

- Reviewer comment: “Why soft-remove an attachment instead of deleting its row and file immediately?” ([review](https://github.com/book6349/toktickit/pull/31#pullrequestreview-5037257666))
- Author answer: “Soft removal retains the original filename, type, size, upload time, removal reason, and removal timestamp for audit visibility. Removed records cannot be downloaded or previewed, and every upload, download, and removal query is scoped to the ticket owner.”
- Approval: “The audit trail and download protection make sense. Approved.” ([approval](https://github.com/book6349/toktickit/pull/31#pullrequestreview-5037261431))
- Author follow-up: “Thanks for reviewing!”

### PR #32 — Issue #23 — E2E and visual audit plan

- Reviewer comment: “The responsive and E2E coverage is planned. How will you avoid calling a screenshot or flow passing before it actually runs?” ([review](https://github.com/book6349/toktickit/pull/32#pullrequestreview-5037281999))
- Author answer: “The evidence section records the exact command, branch, date, and terminal output. Desktop, tablet, and mobile screenshots are captured only after the corresponding checks run, and deferred or failing checks remain explicitly labeled.”
- Approval: “The evidence rules are clear and prevent unsupported claims. Approved.” ([approval](https://github.com/book6349/toktickit/pull/32#pullrequestreview-5037283965))
- Author follow-up: “Thanks for reviewing!”

### PR #33 — Issue #24 — Evidence register

- Reviewer comment: “What makes the final report auditable instead of just a list of green checks?” ([review](https://github.com/book6349/toktickit/pull/33#pullrequestreview-5037304687))
- Author answer: “Each acceptance criterion links to implementation and test evidence, while executed, failing, deferred, and unexecuted work are separated. The report also includes API examples, screenshot filenames, review/approval references, merge events, and the final branch.”
- Approval: “That gives the submission a complete evidence trail. Approved.” ([approval](https://github.com/book6349/toktickit/pull/33#pullrequestreview-5037308121))
- Author follow-up: “Thanks for reviewing!”

### PR #34 — Release to `main`

- Reviewer comment: “Before calling the release complete, how will the pending E2E and responsive evidence be verified?” ([review](https://github.com/book6349/toktickit/pull/34#pullrequestreview-5037352011))
- Author answer: “I will run the real requester flow against the Docker-backed PostgreSQL database, capture the required nine viewport screenshots, and record the exact command and output. Any remaining keyboard-audit limitation will stay explicitly marked instead of being inferred as complete.”
- Approval: “The integration and evidence are complete. Well done.” ([approval](https://github.com/book6349/toktickit/pull/34#pullrequestreview-5037355192))
- Author follow-up: “Thanks for reviewing!”

## Pull requests I reviewed for @Punge089

These are the partner repository PRs for which my GitHub account supplied the
peer-review comment and approval. The links are the auditable source; titles
are intentionally not repeated here when the partner later renamed a PR.

| Partner PR | Review record | Verdict |
|---:|---|---|
| [#34](https://github.com/Punge089/toktickit/pull/34) | Partner Lab 2 workflow PR | Commented + approved |
| [#35](https://github.com/Punge089/toktickit/pull/35) | Partner Lab 2 workflow PR | Commented + approved |
| [#36](https://github.com/Punge089/toktickit/pull/36) | Partner Lab 2 workflow PR | Commented + approved |
| [#37](https://github.com/Punge089/toktickit/pull/37) | Partner Lab 2 workflow PR | Commented + approved |
| [#38](https://github.com/Punge089/toktickit/pull/38) | Partner Lab 2 workflow PR | Commented + approved |
| [#39](https://github.com/Punge089/toktickit/pull/39) | Partner Lab 2 workflow PR | Commented + approved |
| [#40](https://github.com/Punge089/toktickit/pull/40) | Partner Lab 2 workflow PR | Commented + approved |
| [#41](https://github.com/Punge089/toktickit/pull/41) | Partner Lab 2 workflow PR | Commented + approved |
| [#42](https://github.com/Punge089/toktickit/pull/42) | Partner Lab 2 workflow PR | Commented + approved |
| [#43](https://github.com/Punge089/toktickit/pull/43) | Partner Lab 2 workflow PR | Commented + approved |
| [#44](https://github.com/Punge089/toktickit/pull/44) | Partner Lab 2 workflow PR | Commented + approved |
| [#45](https://github.com/Punge089/toktickit/pull/45) | Partner Lab 2 workflow PR | Commented + approved |
| [#46](https://github.com/Punge089/toktickit/pull/46) | Partner Lab 2 workflow PR | Commented + approved |
| [#47](https://github.com/Punge089/toktickit/pull/47) | Partner Lab 2 workflow PR | Commented + approved |
| [#48](https://github.com/Punge089/toktickit/pull/48) | Partner Lab 2 workflow PR | Commented + approved |
| [#49](https://github.com/Punge089/toktickit/pull/49) | Partner Lab 2 workflow PR | Commented + approved |

The partner repository remains the source of truth for the full text of those
review threads. This table records only events visible to my account; it does
not assert a merge or a branch state not shown on the linked PR.

## Review protocol used

The reviewer inspected the changed files, posted one substantive question,
received an author response, and approved from the separate `@Punge089`
account. Review fixes, when needed, stayed on the same branch and PR. No PR
was self-approved, and no direct commit was made to `main` or
`lab2-staging`.
