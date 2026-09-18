# Lab 3 Reviewer and Workflow Evidence

Status: Workflow scaffold only. No Lab 3 Issue, Pull Request, review, merge,
or project-board event has been created yet.

This file must be updated with real links and observed events. Placeholders
must not remain in the final report.

## 1. Workflow Rules

- Create and name only the approved Lab 3 Issues before creating their feature
  branches.
- Use one feature branch per approved planned unit.
- Link each Pull Request to its matching Issue through the GitHub Development
  panel. A keyword in the PR description alone is not sufficient for the Lab
  workflow.
- Move the Issue through Backlog, Specified, Started, PR Review, Fixing, and
  Done according to actual work.
- Request the designated friend review on every required PR.
- The PR author replies to every review comment and keeps fixes on the same
  branch and PR.
- The reviewer, not the PR author, merges after the required approval.
- Merge feature PRs into lab3-staging, then use a reviewed release PR from
  lab3-staging to main.
- Update the project board and close the Issue only when the merge and board
  workflow allows it.
- Do not create extra Issues or PRs.

## 2. Approved Issue and PR Map

| Unit | Approved Issue | Feature branch | PR | Target | Board status |
|---|---|---|---|---|---|
| Lab 3 contract and Test DD | Pending | Pending | Pending | lab3-staging | Not created |
| Authentication and data migration | Pending | Pending | Pending | lab3-staging | Not created |
| Authorization and Requester regression | Pending | Pending | Pending | lab3-staging | Not created |
| IT Staff Ticket Queue | Pending | Pending | Pending | lab3-staging | Not created |
| IT Staff Ticket Detail and operations | Pending | Pending | Pending | lab3-staging | Not created |
| Administrator User Management | Pending | Pending | Pending | lab3-staging | Not created |
| E2E, responsive, and visual evidence | Pending | Pending | Pending | lab3-staging | Not created |
| Lab 3 release integration | Pending | Pending | Pending | main | Not created |

The final Issue names and count require explicit approval before GitHub
creation. Do not silently split or combine units.

## 3. Required Review Record Per Feature PR

For each real PR, record:

1. Issue link and matching PR link.
2. Source branch and target branch.
3. Reviewer identity and separate-account approval.
4. Review comment link and copy-ready text.
5. Author reply for every comment.
6. Any Fixing transition and the same-branch correction commit.
7. Approval event and merge event.
8. Project-board transition and Issue-close event.
9. Tests and evidence observed by the reviewer.

## 4. Copy-Ready Review Templates

### Reviewer comment

I checked the changed files against the linked Issue acceptance criteria,
including the documented authorization and failure cases. My main question is:
[state one specific behavior or evidence gap]. Please explain the decision and
add or link the test/evidence that supports it.

### Author reply

Thanks for reviewing. I [describe the exact change or explain the reason for
the existing behavior]. I verified it with [exact command/test/evidence] and
updated [file or evidence link]. The acceptance criterion is now supported by
[test/evidence].

### Reviewer approval

I reviewed the changed files, the linked acceptance criteria, the author
replies, and the recorded test/evidence output. The Issue scope is satisfied
and the required checks passed. Approved for merge into [target branch].

These templates are drafts. Replace bracketed text with the actual Issue,
PR, code, command, and evidence details.

## 5. Release Review

The release reviewer must confirm:

- All approved feature PRs were merged into lab3-staging.
- The staging branch contains the integrated tests and evidence.
- No Lab 2 regression is introduced.
- The final test/build/database/E2E commands were run.
- Screenshot paths and final PDF links resolve.
- Every acceptance criterion has an honest final status.
- The release PR is linked to the approved release Issue and targets main.

No release approval or merge may be recorded until these checks are observed.
