# Lab 1 — Test Plan and Evidence

All test files live under server/tests/lab-01/ and client/tests/lab-01/.

| Test File (tests/lab-01/) | Tool | Test Description | Result |
|---------------------------|------|-----------------|--------|
| API-01 | Supertest | Health endpoint returns 200 and expected JSON | ✅ PASS |
| API-02 | Supertest | Categories endpoint returns the four seeded categories | ✅ PASS |
| UI-01 | Vitest | TokTickIT heading renders | ✅ PASS |
| UI-02 | Vitest | Loading state changes to category list | ✅ PASS |
| UI-03 | Vitest | API failure displays a useful error message | ✅ PASS |

## Terminal Test Output

### Server Tests (cd server && npm test)
```
 RUN  v2.1.9 toktickit/server

 ✓ tests/lab-01/health.test.ts (1 test) 16ms
 ✓ tests/lab-01/categories.test.ts (1 test) 16ms

 Test Files  2 passed (2)
      Tests  2 passed (2)
   Start at  21:03:42
   Duration  737ms
```

### Client Tests (cd client && npm test)
```
 RUN  v2.1.9 toktickit/client

 ✓ tests/lab-01/App.test.tsx (3 tests) 76ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  21:03:47
   Duration  1.34s
```
