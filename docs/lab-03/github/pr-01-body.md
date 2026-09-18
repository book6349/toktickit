# PR-01 body — Lab 3 engineering contract and Test DD

Suggested title:

    docs: add Lab 3 engineering contract and Test DD

Target branch: lab3-staging

Source branch: feature/lab3-specification

Linked Issue: ISSUE-01. Link it through the Pull Request Development panel
after the real Issue number exists. Do not rely on a description keyword alone.

## Summary

This documentation-only PR prepares the Lab 3 engineering contract and
traceable Test DD before application implementation.

## Included

- Numbered Lab 3 functional requirements and business rules.
- Authentication/session and password decisions.
- Role and ownership authorization matrix.
- Ticket status transition matrix.
- Lab 2 data migration and seed strategy.
- REST API contract and safe error behavior.
- Zen Green UI, responsive, accessibility, and visual evidence rules.
- Acceptance criteria and test traceability.
- Reviewer workflow and AI-use evidence scaffolds.

## Not included

- Application code.
- Database migrations.
- GitHub Issues, board changes, or external review events.
- Final test, E2E, screenshot, or PDF completion claims.

## Validation

- Local git diff --check completed without findings.
- This PR is documentation-only; application test suites are not claimed as
  executed for this PR.

## Review focus

1. Confirm that the User migration preserves Lab 2 Ticket and Attachment
   ownership.
2. Confirm that the role matrix and status-transition matrix are internally
   consistent.
3. Confirm that every acceptance criterion maps to a planned test.
4. Confirm that the contract excludes the explicitly out-of-scope features.

## Workflow checklist

- [ ] ISSUE-01 exists and is linked through Development.
- [ ] Issue card is in PR Review.
- [ ] Friend review comment is present.
- [ ] Author replied to every review comment.
- [ ] Friend approval is present.
- [ ] Reviewer, not the PR author, merges into lab3-staging.
- [ ] Issue and board are updated only after the permitted merge.
