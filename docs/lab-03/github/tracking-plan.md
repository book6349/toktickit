# Lab 3 GitHub Tracking Plan

Status: Copy-ready planning material. No GitHub Issue or Pull Request has
been created from these files.

## Five approved units

| ID | Issue title | Branch | First target | PR now |
|---|---|---|---|---|
| ISSUE-01 | Lab 3 engineering contract and Test DD | feature/lab3-specification | lab3-staging | Yes, one PR |
| ISSUE-02 | Authentication, migration, authorization, and Requester regression | feature/lab3-auth-requester | lab3-staging | Later |
| ISSUE-03 | IT Staff Queue, Ticket Detail, and ticket operations | feature/lab3-staff-workflow | lab3-staging | Later |
| ISSUE-04 | Administrator User Management | feature/lab3-admin-users | lab3-staging | Later |
| ISSUE-05 | Integrated E2E/visual evidence and Lab 3 release integration | feature/lab3-integration-evidence | lab3-staging, then reviewed release PR to main | Later |

The first PR is documentation-only and contains the Lab 3 specification and
Test DD. The other four PRs must not be opened now.

## Controlled posting order

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

Replace ISSUE-01-style placeholders with actual GitHub numbers and links only
after the Issues are created. Do not invent numbers or review events.
