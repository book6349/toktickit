# Lab 3 Reviewer and Workflow Evidence

Status: Observed GitHub workflow record. The five approved feature units and
the reviewed release have completed the documented workflow. No extra Issue or
Pull Request was created.

## 1. Workflow rules applied

- Five approved Issues were created and added to the existing Kanban board.
- One feature branch was used for each approved unit.
- Each feature PR targeted `lab3-staging` and was linked to its Issue through
  GitHub Development metadata.
- The designated reviewer was Punge089 on every required PR.
- The PR author replied to review comments; requested fixes stayed on the same
  branch and PR.
- Punge089 approved and merged the feature PRs. The release PR was reviewed and
  merged by Punge089 into `main`.
- Issues were closed only after the matching reviewed PR was merged.
- Issue #38 briefly showed `No status` after closure because of a project-board
  automation transition. It was corrected to `Done` and verified on 2026-09-20.

## 2. Approved Issue and PR map

| Unit | Issue | Feature branch | Feature PR | Target | Merge commit | Board / Issue state |
|---|---|---|---|---|---|---|
| Lab 3 contract and Test DD | [#36](https://github.com/book6349/toktickit/issues/36) | `feature/lab3-specification` | [#41](https://github.com/book6349/toktickit/pull/41) | `lab3-staging` | `95cbdfe` | Done / closed |
| Authentication, migration, authorization, and Requester regression | [#37](https://github.com/book6349/toktickit/issues/37) | `feature/lab3-auth-requester` | [#42](https://github.com/book6349/toktickit/pull/42) | `lab3-staging` | `dbc2511` | Done / closed |
| IT Staff Queue, Ticket Detail, and ticket operations | [#38](https://github.com/book6349/toktickit/issues/38) | `feature/lab3-staff-workflow` | [#43](https://github.com/book6349/toktickit/pull/43) | `lab3-staging` | `3b55635` | Done / closed |
| Administrator User Management | [#39](https://github.com/book6349/toktickit/issues/39) | `feature/lab3-admin-users` | [#44](https://github.com/book6349/toktickit/pull/44) | `lab3-staging` | `160343f` | Done / closed |
| Integrated E2E, visual evidence, and Lab 3 release integration | [#40](https://github.com/book6349/toktickit/issues/40) | `feature/lab3-integration-evidence` | [#45](https://github.com/book6349/toktickit/pull/45) | `lab3-staging` | `71139cc` | Done / closed |

The separate release PR was [#46](https://github.com/book6349/toktickit/pull/46),
from `lab3-staging` to `main`, merged by Punge089 as `493758b`. All five Issues
are closed and the board shows `Done`.

## 3. Review, reply, approval, and merge evidence

| PR | Review comment | Author reply | Approval | Merge event |
|---|---|---|---|---|
| #41 | [review](https://github.com/book6349/toktickit/pull/41#pullrequestreview-5255126909) | [reply](https://github.com/book6349/toktickit/pull/41#issuecomment-5740540405) | [approval](https://github.com/book6349/toktickit/pull/41#pullrequestreview-5255132969) | [merge](https://github.com/book6349/toktickit/pull/41#event-31438804235) |
| #42 | [review](https://github.com/book6349/toktickit/pull/42#pullrequestreview-5255270367) | [reply](https://github.com/book6349/toktickit/pull/42#issuecomment-5740877811) | [approval](https://github.com/book6349/toktickit/pull/42#pullrequestreview-5255271960) | [merge](https://github.com/book6349/toktickit/pull/42#event-31440367588) |
| #43 | [review](https://github.com/book6349/toktickit/pull/43#pullrequestreview-5255366757) | [reply](https://github.com/book6349/toktickit/pull/43#issuecomment-5741064874) | [approval](https://github.com/book6349/toktickit/pull/43#pullrequestreview-5255369288) | [merge](https://github.com/book6349/toktickit/pull/43#event-31441319578) |
| #44 | [review](https://github.com/book6349/toktickit/pull/44#pullrequestreview-5255671320) | [reply](https://github.com/book6349/toktickit/pull/44#issuecomment-5741727724) | [approval](https://github.com/book6349/toktickit/pull/44#pullrequestreview-5255676942) | [merge](https://github.com/book6349/toktickit/pull/44#event-31443781271) |
| #45 | [review](https://github.com/book6349/toktickit/pull/45#pullrequestreview-5255979494) | [reply](https://github.com/book6349/toktickit/pull/45#issuecomment-5742558454) | [approval](https://github.com/book6349/toktickit/pull/45#pullrequestreview-5255984540) | [merge](https://github.com/book6349/toktickit/pull/45#event-31447113555) |
| #46 release | [review](https://github.com/book6349/toktickit/pull/46#pullrequestreview-5256029152) | [reply](https://github.com/book6349/toktickit/pull/46#issuecomment-5742711093) | [approval](https://github.com/book6349/toktickit/pull/46#pullrequestreview-5256029917) | [merge](https://github.com/book6349/toktickit/pull/46#event-31452435418) |

## 4. Release review result

The release reviewer confirmed that the five feature PRs were in
`lab3-staging`, the release PR targeted `main`, the Issue #40 link existed,
and the conflicts were resolved before approval. The release PR was then
merged. The repository is now at `main` commit `493758b`, with the same tree as
`lab3-staging` at the audit.

The document and code evidence below deliberately separates checks run on
final `main` from earlier integrated-branch evidence. After Docker became
available, the clean disposable-database final-main E2E run passed all 9 tests.
An earlier attempt against the persistent database failed 8 tests because the
seeded requester had already passed the first-login password gate; that setup
observation is recorded rather than hidden.
