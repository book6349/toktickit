# Lab 4 Peer Review Record

Status: PRs #57–#64 were reviewed and merged. Main is 43ed5984962ee8f8b4f29c72931b7fbe64037d3e; this follow-up candidate 3ddd3930b2c83d3193164257d3bf7dd3bcfb14e9 completes the T-20 and T-25 evidence. Punge089 is the reviewer and book6349 the author. The new follow-up awaits its own peer review and merge; no approval is fabricated. See release-evidence.md.

## Completed reviews

| PR | Reviewer comment | Author reply | Reviewer disposition |
|---|---|---|---|
| [#57 — Contract, test DD and documentation](https://github.com/book6349/toktickit/pull/57) | Confirm every acceptance criterion maps to a named test and the AI-use entries are actual prompts. | Added the test mapping and actual prompt excerpts, linked to their commits. | Punge089 approved after confirming the mapping and comments were addressed (2026-10-30). |
| [#58 — Actions Taken model and API](https://github.com/book6349/toktickit/pull/58) | Check actor attribution, access control, idempotency, lifecycle rules and migration recovery. | Confirmed those paths and linked the implementation and handoff commits; reported 227 server tests including 37 PostgreSQL checks. | Punge089 approved after the comments were resolved (2026-10-30). |
| [#59 — Actions Taken UI](https://github.com/book6349/toktickit/pull/59) | Confirm Requesters are read-only and failed saves retain their input. | Linked the component tests and browser flow covering both behaviors. | Punge089 approved after confirming the behavior (2026-10-30). |
| [#60 — Ticket workflow and resolution](https://github.com/book6349/toktickit/pull/60) | Try invalid status changes and blocked resolutions; neither should alter the Ticket. | Confirmed both rejected paths preserve Ticket state and pointed to the transition and conflict API coverage. | Punge089 approved (2026-10-30). |
| [#61 — Requester and Staff dashboards](https://github.com/book6349/toktickit/pull/61) | Compare dashboard totals with their Ticket lists, including date boundaries. | Reported shared metric/drill-down filters, inclusive UTC bounds, the dashboard browser journey, and the verified test counts; disclosed remaining browser coverage. | Punge089 approved after reviewing the tested windows (2026-10-31). |
| [#62 — Final regression, hardening and evidence](https://github.com/book6349/toktickit/pull/62) · 31 Oct | [Punge089 comment](https://github.com/book6349/toktickit/pull/62#pullrequestreview-5723417017): “Please check the full-regression results and confirm the responsive captures match the tested build.” | [Author reply](https://github.com/book6349/toktickit/pull/62#issuecomment-6545023471): linked the 21-test run, 24 captures, report, and commit [4f4a847](https://github.com/book6349/toktickit/commit/4f4a8479ddf4040f5b788bc577555e1e3bca3148). | [Punge089 approval](https://github.com/book6349/toktickit/pull/62#pullrequestreview-5723422325): “The results and captures match this revision. Approved to merge.” |
| [#63 — Promote reviewed staging release to main](https://github.com/book6349/toktickit/pull/63) · 31 Oct | [Punge089 comment](https://github.com/book6349/toktickit/pull/63#pullrequestreview-5723481791): “Please confirm the staged scope and note how the pending CI and main-branch checks will be verified.” | [Author reply](https://github.com/book6349/toktickit/pull/63#issuecomment-6545205437): recorded that CI and main verification were pending at the time and fixes would stay on that PR. | [Punge089 approval](https://github.com/book6349/toktickit/pull/63#pullrequestreview-5723485773): “Reviewed the scope and verification notes. Approved.” |

The source of each review, reply and approval is the linked GitHub PR. The review packet stores only concise handoff text; it does not substitute for GitHub review activity.

## Final regression and promotion

- [PR #62 — Final Regression, Hardening and Evidence](https://github.com/book6349/toktickit/pull/62) merged to lab4-staging at merge commit [6ac3cb9](https://github.com/book6349/toktickit/commit/6ac3cb98d737f764de7858e14c53d7a95ef9192b) on 2026-10-31.
- [PR #63 — Promote reviewed staging release to main](https://github.com/book6349/toktickit/pull/63) merged lab4-staging into main at merge commit [6e66c2c](https://github.com/book6349/toktickit/commit/6e66c2cf187c0a83e6ea36c4a6c6711f886c0866) on 2026-10-31.
- The post-merge server, client, browser, build, Prisma, and health results are recorded in [tests.md](tests.md) and output/evidence/lab4-main-*.log. GitHub returned no status checks for the main commit; no CI pass is claimed.
- Issues #51–#56 are closed. The six Lab 4 Issues are now verified in Done; T-20 passes in the recorded follow-up candidate.

## Review checklist

- [x] Confirm the regression record names the tested revision, commands, environment and results.
- [x] Confirm the Lab 4 flows and 24 desktop/tablet/mobile captures are present, readable, and linked to named tests.
- [x] Confirm setup instructions match the tested disposable-database workflow.
- [x] Confirm screenshot captions and links point to committed, real browser captures.
- [x] Confirm the AI-use record contains actual prompt excerpts and does not claim this peer review occurred in the file.
- [x] Resolve the PR #62 and #63 review comments on their respective PRs; both approvals and merges are recorded above.
- [x] Verify the merged main revision and update the post-merge report evidence.
- [x] Read-only board inspection: all Issues #51–#56 are in Done.
- [x] T-20 keyboard, focus, labels/ARIA validation, reduced-motion and 320px checks passed; candidate follow-up still requires peer review and merge.

## PR 64 completed review


- [Punge089 comment](https://github.com/book6349/toktickit/pull/64#pullrequestreview-5723674774): Please confirm the report matches the tested main revision and clearly lists the remaining gaps.
- [book6349 reply](https://github.com/book6349/toktickit/pull/64#issuecomment-6545762705): linked commit 993af6a and the main verification logs and remaining evidence gaps.
- [Punge089 approval](https://github.com/book6349/toktickit/pull/64#pullrequestreview-5723677707): The report matches the recorded results and states its limits clearly. Approved.

PR #64 merged to main at 43ed5984962ee8f8b4f29c72931b7fbe64037d3e. T-25 is Passed for the release checklist in [release-evidence.md](release-evidence.md).
