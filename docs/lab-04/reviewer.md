# Lab 4 Peer Review Record

Status: PRs #57–#65 were reviewed and merged. Latest main is 58b0a7a5556a689ca75c47f9797ebfe84c9cdb3a from PR #65 on 1 November 2026. Its tree 65731368fb2ad8c27e86da34248906a1a5881ee6 matches tested PR #65 head 20b4e0a7698d3eb5527cd9eb85d36e2ce8c9daeb. Punge089 is the reviewer and book6349 the author. GitHub reported no status checks for the final-main revision; no CI pass is claimed.

## Completed reviews

| PR | Reviewer comment | Author reply | Reviewer disposition |
|---|---|---|---|
| [#57 — Contract, test DD and documentation](https://github.com/book6349/toktickit/pull/57) | Confirm every acceptance criterion maps to a named test and the AI-use entries are actual prompts. | Added the test mapping and actual prompt excerpts, linked to their commits. | Punge089 approved after confirming the mapping and comments were addressed (2026-10-30). |
| [#58 — Actions Taken model and API](https://github.com/book6349/toktickit/pull/58) | Check actor attribution, access control, idempotency, lifecycle rules and migration recovery. | Confirmed those paths and linked the implementation and handoff commits; reported 227 server tests including 37 PostgreSQL checks. | Punge089 approved after the comments were resolved (2026-10-30). |
| [#59 — Actions Taken UI](https://github.com/book6349/toktickit/pull/59) | Confirm Requesters are read-only and failed saves retain their input. | Linked the component tests and browser flow covering both behaviors. | Punge089 approved after confirming the behavior (2026-10-30). |
| [#60 — Ticket workflow and resolution](https://github.com/book6349/toktickit/pull/60) | Try invalid status changes and blocked resolutions; neither should alter the Ticket. | Confirmed both rejected paths preserve Ticket state and pointed to transition and conflict API coverage. | Punge089 approved (2026-10-30). |
| [#61 — Requester and Staff dashboards](https://github.com/book6349/toktickit/pull/61) | Compare dashboard totals with their Ticket lists, including date boundaries. | Reported shared metric/drill-down filters, inclusive UTC bounds, browser journey, test counts, and remaining browser coverage. | Punge089 approved (2026-10-31). |
| [#62 — Final regression, hardening and evidence](https://github.com/book6349/toktickit/pull/62) | [Punge089 comment](https://github.com/book6349/toktickit/pull/62#pullrequestreview-5723417017): check full-regression results and responsive captures against the tested build. | [book6349 reply](https://github.com/book6349/toktickit/pull/62#issuecomment-6545023471): linked the run, captures, report, and commit [4f4a847](https://github.com/book6349/toktickit/commit/4f4a8479ddf4040f5b788bc577555e1e3bca3148). | [Punge089 approval](https://github.com/book6349/toktickit/pull/62#pullrequestreview-5723422325): “The results and captures match this revision. Approved to merge.” |
| [#63 — Promote reviewed staging release to main](https://github.com/book6349/toktickit/pull/63) | [Punge089 comment](https://github.com/book6349/toktickit/pull/63#pullrequestreview-5723481791): confirm staged scope and how pending CI/main checks will be verified. | [book6349 reply](https://github.com/book6349/toktickit/pull/63#issuecomment-6545205437): recorded that CI and main verification were pending at the time. | [Punge089 approval](https://github.com/book6349/toktickit/pull/63#pullrequestreview-5723485773): “Reviewed the scope and verification notes. Approved.” |
| [#64 — Final report corrections](https://github.com/book6349/toktickit/pull/64) | [Punge089 comment](https://github.com/book6349/toktickit/pull/64#pullrequestreview-5723674774): confirm the report matches the tested main revision and lists remaining gaps. | [book6349 reply](https://github.com/book6349/toktickit/pull/64#issuecomment-6545762705): linked commit 993af6a, verification logs, and limits. | [Punge089 approval](https://github.com/book6349/toktickit/pull/64#pullrequestreview-5723677707): “The report matches the recorded results and states its limits clearly. Approved.” |
| [#65 — Accessibility and release evidence](https://github.com/book6349/toktickit/pull/65) | [Punge089 comment](https://github.com/book6349/toktickit/pull/65#pullrequestreview-5726724450): “Please check the keyboard and 320px evidence, recovery cases, and release checklist against the recorded revision.” | [book6349 reply](https://github.com/book6349/toktickit/pull/65#issuecomment-6554388896): “The evidence and verification limits are documented on this branch in the release notes.” | [Punge089 approval](https://github.com/book6349/toktickit/pull/65#pullrequestreview-5726780191): “The accessibility evidence and release checks are clear. Approved.” |

The source of each review, reply, and approval is the linked GitHub PR. The review packet records the actual participants and links; it does not substitute for GitHub activity.

## Final regression and promotion

- [PR #62 — Final Regression, Hardening and Evidence](https://github.com/book6349/toktickit/pull/62) merged to lab4-staging at merge commit [6ac3cb9](https://github.com/book6349/toktickit/commit/6ac3cb98d737f764de7858e14c53d7a95ef9192b) on 2026-10-31.
- [PR #63 — Promote reviewed staging release to main](https://github.com/book6349/toktickit/pull/63) merged lab4-staging into main at [6e66c2c](https://github.com/book6349/toktickit/commit/6e66c2cf187c0a83e6ea36c4a6c6711f886c0866) on 2026-10-31.
- [PR #64](https://github.com/book6349/toktickit/pull/64) merged the prior report corrections; main was subsequently updated to 43ed598.
- [PR #65 — Complete Accessibility and Release Evidence](https://github.com/book6349/toktickit/pull/65) merged to main at [58b0a7a](https://github.com/book6349/toktickit/commit/58b0a7a5556a689ca75c47f9797ebfe84c9cdb3a) on 2026-11-01. Final-main verification is documented in tests.md and release-evidence.md, with complete output in output/evidence/lab4-main-verification-*.log.
- GitHub returned no status checks for final main; no CI pass is claimed.
- Issues #51–#56 are closed and all six were verified in Done on the project board. T-20 and T-25 passed for the recorded scope.

## Review checklist

- [x] Confirm the regression record names the tested revision, commands, environment, and results.
- [x] Confirm the Lab 4 flows and 24 desktop/tablet/mobile captures are present and linked to named tests.
- [x] Confirm setup instructions match the tested disposable-database workflow.
- [x] Confirm screenshot captions and links point to committed browser captures.
- [x] Confirm the AI-use record contains actual prompt excerpts and does not claim this peer review occurred in that file.
- [x] Resolve and record the PR #62–#65 review comments and approvals on their respective PRs.
- [x] Verify the final-main revision and update the post-merge report evidence.
- [x] Read-only board inspection: Issues #51–#56 are all in Done.
- [x] T-20 keyboard, focus, labels/ARIA validation, reduced-motion and 320px checks passed; complete final-main E2E output is linked.
