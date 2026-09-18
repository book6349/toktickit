# Issue 01 — Lab 3 engineering contract and Test DD

## Context

Lab 3 replaces the Lab 2 Development Requester selector with authenticated
users, role authorization, IT Staff operations, and Administrator user
management. Before implementation, the team needs one internally consistent
engineering contract and a traceable test plan.

## Scope

Create and review the six required planning records:

- docs/lab-03/specification.md
- docs/lab-03/api-spec.md
- docs/lab-03/ui-spec.md
- docs/lab-03/tests.md
- docs/lab-03/reviewer.md
- docs/lab-03/ai-use.md

The contract must define authentication/session behavior, role and ownership
authorization, migration decisions, status transitions, comments/notes,
Administrator safety rules, API shapes, UI behavior, responsive rules,
acceptance criteria, tests, evidence, and the Product Definition of Done.

## Acceptance criteria

- [ ] All required Lab 3 planning files exist under docs/lab-03.
- [ ] Functional requirements and business rules are numbered.
- [ ] The authorization matrix explicitly distinguishes Requester, IT Staff,
      and Administrator behavior.
- [ ] The Ticket status transition matrix identifies permitted roles and
      confirmation requirements.
- [ ] The migration preserves Lab 2 Ticket and Attachment ownership.
- [ ] The API contract defines paths, methods, request/response shapes,
      cookies, CSRF, validation, safe errors, and status codes.
- [ ] The UI contract defines screens, modes, feedback, responsive behavior,
      accessibility, and visual evidence.
- [ ] Every acceptance criterion maps to at least one planned test.
- [ ] No test, screenshot, review, or GitHub event is marked Passed without
      actual evidence.
- [ ] The documents are internally consistent and ready to guide coding.

## Planned evidence

- Local document review.
- git diff --check.
- A reviewed documentation PR targeting lab3-staging.
- No application test is claimed for this documentation-only unit.

## Dependencies

None. This Issue must be completed before implementation Issues 02–04 begin.

## Out of scope

Application code, database migrations, GitHub release integration, and final
E2E screenshots.

## Workflow

Create the Issue in Backlog, move it to Specified after review, use branch
feature/lab3-specification, open one PR to lab3-staging, obtain the required
friend review and reply to every comment, then let the reviewer merge it.
