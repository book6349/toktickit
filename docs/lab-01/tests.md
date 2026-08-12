# Lab 1 — Test Plan and Evidence

All test files live under server/tests/lab-01/ and client/tests/lab-01/.

| # | Tool | Test | Result |
|---|------|------|--------|
| 1 | Supertest | GET /api/health returns 200, status=ok, service="TokTickIT API" | ✅ PASS |
| 2 | Supertest | GET /api/categories returns 4 seeded categories in id order | ✅ PASS |
| 3 | Vitest | Heading renders "TokTickIT" | ✅ PASS |
| 4 | Vitest | Success state shows Online + category list | ✅ PASS |
| 5 | Vitest | Error state shows Offline + error message | ✅ PASS |

## Terminal Output

### Server Tests (2/2 passed)
```
 RUN  v2.1.9 toktickit/server

 ✓ tests/lab-01/health.test.ts (1 test) 16ms
 ✓ tests/lab-01/categories.test.ts (1 test) 16ms

 Test Files  2 passed (2)
      Tests  2 passed (2)
   Duration  737ms
```

### Client Tests (3/3 passed)
```
 RUN  v2.1.9 toktickit/client

 ✓ tests/lab-01/App.test.tsx (3 tests) 76ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  1.34s
```
