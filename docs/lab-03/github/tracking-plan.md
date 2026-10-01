# Lab 3 GitHub Tracking Plan

## Authorized final audit follow-up 2026-10-01

The user authorized publication of the local audit repairs after step 5.
Reuse `feature/lab3-submission-corrections` for one follow-up PR into
`lab3-staging`, request Punge089 review, and link existing Issue #40 through
Development metadata. Do not create another Issue or open the release early.
The reviewer, not the author, approves and merges. Only then prepare the
reviewed `lab3-staging` to `main` release and run clean-main verification.
The original five-unit history and closed Issue states remain historical;
this follow-up does not claim that new reviews, merges or final-main passes
have occurred. PR numbers will be recorded only after actual creation.

Status: The approved five-unit Lab 3 workflow, post-audit PR #47, and release
PR #48 are complete. Issues #36-#40 are closed; Issue #40 is `Done` on the
project board. PR #47 merged to `lab3-staging` as `7d8ee7a`; PR #48 promoted
`lab3-staging` to `main` as `0353a40`. See `../reviewer.md` for observed
GitHub review, reply, approval, merge, and board records. The files in this
folder remain copy-ready templates; placeholders are not evidence of GitHub
events. No additional Issue is planned; the authorized follow-up above is
separate from this completed historical record.

## Five approved units

| Unit | Issue | Branch | Feature PR | Target | Actual status |
|---|---|---|---|---|---|
| 1. Engineering contract and Test DD | #36 | `feature/lab3-specification` | #41 | `lab3-staging` | Merged |
| 2. Authentication and Requester regression | #37 | `feature/lab3-auth-requester` | #42 | `lab3-staging` | Merged |
| 3. IT Staff workflow | #38 | `feature/lab3-staff-workflow` | #43 | `lab3-staging` | Merged |
| 4. Administrator user management | #39 | `feature/lab3-admin-users` | #44 | `lab3-staging` | Merged |
| 5. E2E, visual evidence, and integration | #40 | `feature/lab3-integration-evidence` | #45 | `lab3-staging` | PR #45, follow-up #47, and release PR #48 merged; Issue #40 Done / closed |

At planning time, the first PR was documentation-only and the remaining PRs
were held until dependencies were ready. All five units have since completed;
the actual review and merge events are recorded in `../reviewer.md`.

## Completed post-audit follow-up (existing Issue #40)

- [PR #47](https://github.com/book6349/toktickit/pull/47) used
  `feature/lab3-submission-corrections`, targeted `lab3-staging`, and linked to
  [Issue #40](https://github.com/book6349/toktickit/issues/40) through GitHub's
  Development panel. Punge089 reviewed, received the author's reply, approved,
  and merged it as `7d8ee7acb09c76e06ca1bec5b1f5410452b8f2d7`.
- [PR #48](https://github.com/book6349/toktickit/pull/48) promoted
  `lab3-staging` to `main`, linked to Issue #40, and was reviewed, replied to,
  approved, and merged by Punge089 as
  `0353a4052c4a6d7ead9ddfb9b7c682d3e7958d02`.
- Issue #40 is closed and its board status is `Done`. No extra Issue was
  created. No additional GitHub action is implied by this historical plan.

## Approved posting order (historical)

The approved sequence below was followed. `ISSUE-01` through `ISSUE-05` were
GitHub Issues #36 through #40 respectively.

1. Create exactly these five Issues and add each to the existing Kanban board
   in Backlog. Do not create extra Issues.
2. Move ISSUE-01 to Specified after its requirements are understood.
3. Use the existing local feature/lab3-specification branch for ISSUE-01,
   push it only after the Issue exists, and open exactly one PR targeting
   lab3-staging.
4. Link the PR to ISSUE-01 through the GitHub Development panel. A PR
   description mention alone is not sufficient.
5. Request the friend review. Use the prepared comment, reply, and approval
   text only after replacing placeholders with real links and observations.
6. The reviewer approves and merges; the PR author does not merge.
7. Move ISSUE-01 to Done and close it only after the documented workflow
   permits it.
8. Repeat the same controlled sequence for ISSUE-02 through ISSUE-05 after
   their dependencies and contents are ready.

## Review and merge guardrails

- Every PR targets lab3-staging except the final release PR from
  lab3-staging to main.
- Every PR has exactly one matching planned unit and Issue.
- Review comments receive an author reply on the same PR.
- Requested changes stay on the same branch and PR.
- No merge occurs before the required friend approval.
- No Issue is closed merely because a branch or PR exists.

## Local materials

- ISSUE-01 through ISSUE-05: copy-ready Issue bodies.
- pr-01-body.md through pr-05-body.md: copy-ready PR bodies.
- pr-01-review-comment.txt through pr-04-review-comment.txt: copy-ready substantive review comments.
- The PR-05 review comment is kept in the consolidated `Lab3_PR_Review_Comments.txt` packet at the LAB3 root.
- pr-01-author-reply.txt through pr-05-author-reply.txt: copy-ready replies after each comment is addressed.
- pr-01-approval.txt through pr-05-approval.txt: copy-ready approval text for the reviewer.

The templates intentionally retain `ISSUE-01`-style placeholders. Do not use
those placeholders as live links or evidence; use `../reviewer.md` for actual
GitHub numbers and observed review events.
