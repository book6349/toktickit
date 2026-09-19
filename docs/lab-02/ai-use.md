# Lab 2 — AI Use and Reflection

## Tool and boundary

I used the Codex coding agent as a development assistant for repository
inspection, specification drafting, test scaffolding, local verification, and
evidence organization. GitHub peer-review decisions remained with the human
reviewer. The simulated `X-Requester-Id` header was kept as a documented Lab 2
testing context; no real authentication was generated or implied.

## Representative prompts

The prompts below are representative of the work performed in this lab. They
are summarized faithfully rather than presented as fabricated terminal output.

1. “Understand the situation, re-read the Lab 2 files, and analyze a plan
   before changing anything.”
2. “Draft and align the four Spec-DD documents before feature code: product
   specification, API specification, UI specification, and tests/traceability.”
3. “Plan the issue, branch, staging, peer-review, and release-PR sequence using
   the TA workflow guide.”
4. “Prepare copy-ready review comments, author replies, and approvals for each
   PR, using the matching Issue and PR numbers.”
5. “Verify that PR titles, issue links, project-board states, merge targets,
   and the final release PR match the workflow rather than assuming they do.”
6. “Recheck every evidence claim: distinguish fixture runs from Docker-backed
   runs, record exact commands and outputs, and never mark an unexecuted check
   as passed.”
7. “Diagnose the disposable PostgreSQL/Docker setup and explain the Prisma
   migration baseline problem without silently rewriting history.”
8. “Run the real requester ticket, attachment, ownership-isolation, and
   responsive flow, then commit a repeatable Playwright spec and screenshots.”
9. “Re-read the labsheet and workflow guide, finish the required reviewer,
   AI-use, test-results, README, and final-report records.”

## Reflection

AI accelerated repetitive inspection, test harness setup, traceability-table
maintenance, and screenshot/evidence indexing. I still reviewed and approved
the scope, the four specifications, the branch/PR order, and every decision
that changed repository state. The most useful correction was separating the
historical loopback fixture from the later Docker-backed run; this prevented a
green fixture result from being presented as database proof. The verification
also exposed that a fresh database cannot use `prisma migrate deploy` without a
pre-existing Lab 1 `Category` table, so the disposable test baseline is
documented explicitly instead of hidden. Browser download behavior similarly
showed the safe fallback filename `attachment.png` in Chromium, which is
recorded as observed behavior. The finished implementation intentionally leaves
real authentication, staff workflows, and post-`NEW` status transitions for
the later lab. Human peer review and approval by `@Punge089` remain required;
AI output is not a substitute for those GitHub events.
