import { vi } from "vitest";
import * as api from "../../src/api.js";

export const regressionRequester: api.User = {
  id: 1,
  name: "Ariya Somchai",
  email: "ariya@example.com",
  role: "REQUESTER",
  isActive: true,
  mustChangePassword: false,
  createdAt: "2026-09-19T00:00:00Z",
  updatedAt: "2026-09-19T00:00:00Z",
};

export function mockRequesterSession() {
  vi.spyOn(api, "getCurrentUser").mockResolvedValue({ user: regressionRequester, mustChangePassword: false });
  vi.spyOn(api, "getComments").mockResolvedValue([]);
  vi.spyOn(api, "getTicketWorkflow").mockResolvedValue({
    ticketId: 0,
    status: "NEW",
    workflowVersion: 1,
    resolution: { summary: null, resolvedAt: null, resolvedBy: null },
    permittedNextStatuses: [],
    resolutionGate: { completedActionCount: 0, blockingActionCount: 0 },
    events: [],
  });
}
