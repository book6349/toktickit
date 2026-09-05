# Lab 2 release evidence and final-report preparation

This is the release evidence register for Lab 2. It separates completed
workflow events from checks that still need final-branch evidence. Do not mark
a row complete without the exact command output, screenshot, or GitHub event.
The release is now merged to `main`; the Docker-backed E2E run is complete.
The remaining follow-up is the full keyboard audit, and the migration-history
baseline workaround is recorded in the UI evidence.

## Delivery map

| Planned PR | Issue | Scope | Staging status | Final-main status |
|---:|---:|---|---|---|
| [#25](https://github.com/book6349/toktickit/pull/25) | [#16](https://github.com/book6349/toktickit/issues/16) | Sprint contract and test plan | Merged | Released in #34 |
| [#26](https://github.com/book6349/toktickit/pull/26) | [#17](https://github.com/book6349/toktickit/issues/17) | Data models, migration, and seed | Merged | Released in #34 |
| [#27](https://github.com/book6349/toktickit/pull/27) | [#18](https://github.com/book6349/toktickit/issues/18) | Requester context and application shell | Merged | Released in #34 |
| [#28](https://github.com/book6349/toktickit/pull/28) | [#19](https://github.com/book6349/toktickit/issues/19) | Ticket API, validation, and attachments | Merged | Released in #34 |
| [#29](https://github.com/book6349/toktickit/pull/29) | [#20](https://github.com/book6349/toktickit/issues/20) | My Tickets list controls and coverage | Merged | Released in #34 |
| [#30](https://github.com/book6349/toktickit/pull/30) | [#21](https://github.com/book6349/toktickit/issues/21) | Owned read-only Ticket Detail | Merged | Released in #34 |
| [#31](https://github.com/book6349/toktickit/pull/31) | [#22](https://github.com/book6349/toktickit/issues/22) | Attachment lifecycle | Merged | Released in #34 |
| [#32](https://github.com/book6349/toktickit/pull/32) | [#23](https://github.com/book6349/toktickit/issues/23) | E2E and visual-audit plan | Merged | Released in #34 |
| [#33](https://github.com/book6349/toktickit/pull/33) | [#24](https://github.com/book6349/toktickit/issues/24) | Evidence register and final-report preparation | Merged | Released in #34 |
| [#34](https://github.com/book6349/toktickit/pull/34) | — | Final Lab 2 release to `main` | Merged | `8e897963c715c76eebbd0cb75568393e5ec55cc7` |

The issue links above are the repository issue numbers; the PR numbers are a
separate sequence.

## Verification record

Record the date, commit SHA, branch, exit status, and a short terminal-output
excerpt for every command. The rows below use the released source tree (the
`main` and `lab2-staging` trees were identical).

| Level | Exact command | Branch/SHA | Result | Evidence location |
|---|---|---|---|---|
| Unit/API | `cd server; npm test -- --run` | `8e897963c715c76eebbd0cb75568393e5ec55cc7` | Passed: 10 files, 19 tests | Terminal output from 2026-08-27 |
| UI/style | `cd client; npm test -- --run` | `8e897963c715c76eebbd0cb75568393e5ec55cc7` | Passed: 5 files, 9 tests (React act warnings) | Terminal output from 2026-08-27 |
| Server build | `cd server; npm run build` | `8e897963c715c76eebbd0cb75568393e5ec55cc7` | Passed | Terminal output from 2026-08-27 |
| Client build | `cd client; npm run build` | `8e897963c715c76eebbd0cb75568393e5ec55cc7` | Passed | Terminal output from 2026-08-27 |
| Prisma schema | `cd server; npx prisma validate` | `8e897963c715c76eebbd0cb75568393e5ec55cc7` | Passed | Terminal output from 2026-08-27 |
| E2E | `cd LAB2; node .lab2-real-e2e.mjs` (temporary harness) | `docs/lab2-ui-smoke-evidence` at `6f2a682` (application tree matches `main` `8e897963c715c76eebbd0cb75568393e5ec55cc7`) | Passed against Docker PostgreSQL 18: create/list/detail, requester isolation, attachment upload/download/soft-remove | [`ui-smoke-evidence.md`](ui-smoke-evidence.md) and [`run-notes.json`](../../artifacts/lab-02/screenshots-real/run-notes.json) |
| Responsive | Playwright screenshots at required viewports | `6f2a682` | 9 real screenshots captured; no horizontal overflow (fixture captures retained separately) | `artifacts/lab-02/screenshots-real/` |

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
(390×844) captures. The nine fixture-backed captures and their measurements
are indexed in [`ui-smoke-evidence.md`](ui-smoke-evidence.md). The nine
Docker-backed captures and their measurements are indexed in
`artifacts/lab-02/screenshots-real/run-notes.json`.

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

## Release status

PR #34 is merged to `main` at `8e897963c715c76eebbd0cb75568393e5ec55cc7`, and
all feature PRs and Issues #16–#24 are closed. Unit/API/UI tests, Prisma
validation, both builds, and the Docker-backed requester/attachment E2E flow
passed. A complete keyboard audit is still a follow-up; neither the fixture nor
the smoke run should be presented as full AC-01–AC-22 integration proof.
