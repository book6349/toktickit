# Lab 3 GitHub Tracking Plan

Status: Historical plan for the approved five-unit Lab 3 workflow. Issues
#36-#40, feature PRs #41-#45, and release PR #46 were created and completed.
See `../reviewer.md` for the observed GitHub record. The files in this folder
remain copy-ready templates; their placeholders are not evidence of Issues,
PRs, reviews, approvals, merges, or board changes. A post-audit correction now
uses existing Issue #40; PR #47 is open to `lab3-staging` and pending Punge089's
review. No additional Issue was created, and the follow-up release PR is not
open.

## Five approved units

| Unit | Issue | Branch | Feature PR | Target | Actual status |
|---|---|---|---|---|---|
| 1. Engineering contract and Test DD | #36 | `feature/lab3-specification` | #41 | `lab3-staging` | Merged |
| 2. Authentication and Requester regression | #37 | `feature/lab3-auth-requester` | #42 | `lab3-staging` | Merged |
| 3. IT Staff workflow | #38 | `feature/lab3-staff-workflow` | #43 | `lab3-staging` | Merged |
| 4. Administrator user management | #39 | `feature/lab3-admin-users` | #44 | `lab3-staging` | Merged |
| 5. E2E, visual evidence, and integration | #40 | `feature/lab3-integration-evidence` | #45 | `lab3-staging` | PR #45 and release PR #46 to `main` merged |

At planning time, the first PR was documentation-only and the remaining PRs
were held until dependencies were ready. All five units have since completed;
the actual review and merge events are recorded in `../reviewer.md`.

## Post-audit follow-up (existing Issue #40)

- [PR #47](https://github.com/book6349/toktickit/pull/47) uses
  `feature/lab3-submission-corrections` and targets `lab3-staging`.
- GitHub's Development panel links PR #47 to [Issue #40](https://github.com/book6349/toktickit/issues/40).
- Issue #40 is open and its board status is `PR Review`; Punge089's review is
  requested and pending.
- Do not merge PR #47 as the author. The reviewer must review, receive replies
  to any comments, approve, and merge it. Only afterward prepare and review the
  follow-up release PR from `lab3-staging` to `main`.
- Keep Issue #40 open until the follow-up release is reviewed and merged and
  the documented workflow permits closure.

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
