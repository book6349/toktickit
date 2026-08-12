# Lab 1 — AI Use and Reflection

**LLM/agent used:** Google Antigravity (Gemini / Claude Sonnet)

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | "Read the md file and finish stuffs in pdf" | Reviewed rule.md and labsheet structure; began sequential Issue execution |
| 2 | "Initialise git, create main, lab1-staging and feature/1-project-foundation branches" | Used the branch structure to follow the lab's PR-based workflow |
| 3 | "Implement the health check endpoint and make the test pass" | Replaced the 501 stub with 200 JSON response; verified via Supertest |
| 4 | "Create the Category model and idempotent seed script" | Added model to schema.prisma; used upsert to ensure idempotency |
| 5 | "Implement GET /api/categories and write the Supertest test without a live DB" | Mocked getPrisma() with vi.spyOn so tests run without PostgreSQL |
| 6 | "Write the Vitest UI tests for success and error states" | Used vi.spyOn on checkSystem; fired button click and awaited DOM assertions |
| 7 | "Connect GitHub via API token" | Used GitHub REST API to create repo; configured remote URL with PAT |

## Reflection
Prompts improved when I gave explicit acceptance criteria ("the test must return HTTP 200 with JSON…") rather than vague instructions, which reduced the number of correction cycles. The agent initially wrote `(prisma as any).category.upsert` which I had to correct to use the properly typed Prisma client after `prisma generate` ran. I also had to redirect it from using `&&` command chaining in PowerShell to separate sequential commands.
