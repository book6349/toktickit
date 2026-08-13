# Lab 1 — AI Use and Reflection

I used the Antigravity coding agent through my Google Cloud Platform account. I mainly used Gemini 3.6 Flash and Claude Sonnet as the LLM with a thinking level of Medium.

## Selected Key Prompts

| Prompt Name | Actual Prompt Text | My Reflection |
|-------------|-------------------|---------------|
| Plan Lab 1 | "Read the md file and finish stuffs in pdf" | This worked to kick off the entire lab workflow. The agent read rule.md and the labsheet structure and began sequential Issue execution following the PR-based branching workflow. |
| Set Up Git Workflow | "Initialise git, create main, lab1-staging and feature/1-project-foundation branches" | Worked in one shot. The agent initialized the repo, created the correct branching structure and committed the initial scaffold to main. |
| Implement Health Check | "Implement the health check endpoint and make the test pass" | The agent replaced the 501 stub with the correct 200 JSON response. I verified against the Supertest test which passed cleanly on first attempt. |
| Create Category Model | "Create the Category model and idempotent seed script" | The agent added the model to schema.prisma and used upsert to ensure idempotency. Initially used (prisma as any) cast which I had to correct after prisma generate ran. |
| Implement Category List | "Implement GET /api/categories and write the Supertest test without a live DB" | The agent mocked getPrisma() with vi.spyOn so all tests run without requiring a live PostgreSQL instance, which was a good solution for unit testing. |
| Build and Test Check System UI | "Write the Vitest UI tests for success and error states" | Used vi.spyOn on checkSystem, fired the button click, and awaited DOM assertions for both Online and Offline states. All 3 client tests passed. |
| Connect GitHub | "Connect via api" | I provided a GitHub PAT token. The agent used the GitHub REST API to create the repo, configured the remote URL with the token, and pushed all branches. Also created all 4 PRs and the release PR sequentially via the API. |

## Reflection

Providing explicit acceptance criteria (e.g., "must return HTTP 200 with JSON { status: 'ok', service: 'TokTickIT API' }") made prompts significantly more effective than vague instructions, reducing correction cycles. One place I had to correct the agent was when it initially used (prisma as any).category.upsert — I fixed this to use the properly typed Prisma client after running prisma generate. I also had to redirect the agent from using && command chaining (Linux style) to separate sequential PowerShell commands on Windows.
