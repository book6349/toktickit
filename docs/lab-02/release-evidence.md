# Lab 2 release evidence and final-report preparation

This is the release evidence register for Lab 2. It separates completed
workflow events from checks that still need final-branch evidence. Do not mark
a row complete without the exact command output, screenshot, or GitHub event.

## Delivery map

| Planned PR | Issue | Scope | Staging status | Final-main status |
|---:|---:|---|---|---|
| [#25](https://github.com/book6349/toktickit/pull/25) | [#16](https://github.com/book6349/toktickit/issues/16) | Sprint contract and test plan | Merged | Pending final verification |
| [#26](https://github.com/book6349/toktickit/pull/26) | [#17](https://github.com/book6349/toktickit/issues/17) | Data models, migration, and seed | Merged | Pending final verification |
| [#27](https://github.com/book6349/toktickit/pull/27) | [#18](https://github.com/book6349/toktickit/issues/18) | Requester context and application shell | Merged | Pending final verification |
| [#28](https://github.com/book6349/toktickit/pull/28) | [#19](https://github.com/book6349/toktickit/issues/19) | Ticket API, validation, and attachments | Merged | Pending final verification |
| [#29](https://github.com/book6349/toktickit/pull/29) | [#20](https://github.com/book6349/toktickit/issues/20) | My Tickets list controls and coverage | Merged | Pending final verification |
| [#30](https://github.com/book6349/toktickit/pull/30) | [#21](https://github.com/book6349/toktickit/issues/21) | Owned read-only Ticket Detail | Merged | Pending final verification |
| [#31](https://github.com/book6349/toktickit/pull/31) | [#22](https://github.com/book6349/toktickit/issues/22) | Attachment lifecycle | Merged | Pending final verification |
| [#32](https://github.com/book6349/toktickit/pull/32) | [#23](https://github.com/book6349/toktickit/issues/23) | E2E and visual-audit plan | Merged | Pending final verification |
| #33 (this PR) | [#24](https://github.com/book6349/toktickit/issues/24) | Evidence register and final-report preparation | In review | Pending |

The issue links above are the repository issue numbers; the PR numbers are a
separate sequence.

## Verification record

Record the date, commit SHA, branch, exit status, and a short terminal-output
excerpt for every command. The rows below intentionally remain pending until
the final integration branch is selected.

| Level | Exact command | Branch/SHA | Result | Evidence location |
|---|---|---|---|---|
| Unit/API | `cd server; npm test` | Pending | Pending | Terminal capture |
| UI/style | `cd client; npm test` | Pending | Pending | Terminal capture |
| Server build | `cd server; npm run build` | Pending | Pending | Terminal capture |
| Client build | `cd client; npm run build` | Pending | Pending | Terminal capture |
| E2E | `npx playwright test e2e/lab-02/requester-ticket-flow.spec.ts` | Pending | Pending | Playwright report |
| Responsive | Playwright screenshots at required viewports | Pending | Pending | `artifacts/lab-02/screenshots/` |

## Acceptance-criterion evidence

Use the traceability table in `docs/lab-02/tests.md` as the index. For each
AC-01 through AC-22, add the implementation path, test name or E2E scenario,
and a link to real output. A criterion is `Deferred` or `Failed` when the
corresponding evidence is unavailable; never convert it to `Passed` by
inference from a similar test.

## E2E and visual artifacts

The required scenario and viewport matrix is defined in
`docs/lab-02/e2e-visual-plan.md`. Store screenshots in:

```text
artifacts/lab-02/screenshots/create-ticket/
artifacts/lab-02/screenshots/my-tickets/
artifacts/lab-02/screenshots/ticket-detail/
```

For each screenshot, record viewport, date, branch/SHA, scenario, and the
state shown. Include desktop (1280×900), tablet (900×900), and mobile
(390×844) captures. If Playwright setup is not available, leave E2E and
responsive rows pending and record the setup blocker.

## Peer-review and merge evidence

For each feature PR, retain these GitHub events in the PR timeline:

1. Friend’s review comment from the matching review packet.
2. Friend’s approval from a different account.
3. Author reply (`Thanks for reviewing!`).
4. Merge event into `lab2-staging`.
5. Linked issue status updated after the merge.

The final report should link each event to its PR rather than describing an
event without a URL.

## Final report outline

1. Scope, assumptions, and simulated requester-context boundary.
2. Architecture and data model summary.
3. API contract and ownership/validation behavior.
4. UI flow, responsive behavior, and accessibility notes.
5. Acceptance-criterion traceability (AC-01–AC-22).
6. Executed test/build/E2E results with commands and dates.
7. Screenshot index and visual-audit findings.
8. Peer-review, approval, merge, and issue links.
9. Known limitations, deferred checks, and follow-up work.

## Release gate

Before the release PR to `main`, confirm that the final branch is clean, all
required commands have fresh output, screenshots are present, every AC has a
traceable result, and all required feature PRs are merged. This document is a
preparation artifact until those gates are evidenced.
