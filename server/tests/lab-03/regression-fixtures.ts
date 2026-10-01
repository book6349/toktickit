import { vi } from "vitest";

export const regressionCsrf = "regression-csrf";
export const regressionCookie = `toktickit_session=regression-token; toktickit_csrf=${regressionCsrf}`;

// Exercise the real authentication middleware with a mocked database session.
// No development requester header or production authentication bypass is used.
export function requesterSession(id: number, isActive = true) {
  return {
    session: {
      findUnique: vi.fn().mockResolvedValue({
        id: 101,
        userId: id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: {
          id,
          name: "Authenticated regression requester",
          email: `requester-${id}@example.com`,
          role: "REQUESTER",
          isActive,
          mustChangePassword: false,
          createdAt: new Date("2026-09-19T00:00:00Z"),
          updatedAt: new Date("2026-09-19T00:00:00Z"),
        },
      }),
    },
  };
}
