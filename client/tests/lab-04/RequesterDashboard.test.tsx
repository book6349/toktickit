import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as api from "../../src/api.js";
import { RequesterDashboard } from "../../src/Dashboard.js";

const requester: api.User = {
  id: 4, name: "Niran Requester", email: "niran@example.com", role: "REQUESTER", isActive: true,
  mustChangePassword: false, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
};
const asOfUtc = "2026-10-30T12:00:00.000Z";
const summary: api.DashboardTicketSummary = {
  id: 10, ticketNumber: "TT-10", status: "OPEN", summary: "VPN access", updatedAt: asOfUtc,
  resolvedAt: null, requestedPriority: "HIGH", itPriority: "MEDIUM", ownerId: 7, owner: { id: 7, name: "Staff" },
};
const dashboard: api.RequesterDashboardData = {
  asOfUtc,
  metrics: {
    openTickets: { count: 12 }, waitingForRequester: { count: 2 },
    recentlyUpdated: { count: 7, items: [summary] }, recentlyResolved: { count: 1, items: [{ ...summary, id: 11, ticketNumber: "TT-11", status: "RESOLVED", resolvedAt: "2026-10-20T10:00:00.000Z" }] },
  },
};
const pagination: api.Pagination = { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasPrevious: false, hasNext: false };

describe("Lab 4 Requester dashboard UI", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows UTC context, full counts, accessible definitions and matching owned-Ticket drill-downs", async () => {
    vi.spyOn(api, "getRequesterDashboard").mockResolvedValue(dashboard);
    vi.spyOn(api, "listTickets").mockResolvedValue({ items: [], pagination });
    render(<RequesterDashboard user={requester} onOpenTicket={vi.fn()} />);

    expect(await screen.findByRole("heading", { name: "My Dashboard" })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`UTC source: ${asOfUtc}`))).toBeInTheDocument();
    expect(screen.getByText("12", { selector: ".dashboard-count" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Recently resolved: 1/ }));
    expect(await screen.findByRole("heading", { name: "Recently resolved" })).toBeInTheDocument();
    expect(api.listTickets).toHaveBeenCalledWith(expect.objectContaining({
      statusGroup: "resolved", resolvedFrom: "2026-09-30T12:00:00.000Z", resolvedTo: asOfUtc, sortBy: "resolvedAt", page: 1, pageSize: 10,
    }));
    expect(screen.getByText("No matching Tickets.")).toBeInTheDocument();
  });

  it("retains visible zero metrics and lets the user return from an empty drill-down", async () => {
    vi.spyOn(api, "getRequesterDashboard").mockResolvedValue({
      ...dashboard,
      metrics: {
        openTickets: { count: 0 }, waitingForRequester: { count: 0 },
        recentlyUpdated: { count: 0, items: [] }, recentlyResolved: { count: 0, items: [] },
      },
    });
    vi.spyOn(api, "listTickets").mockResolvedValue({ items: [], pagination: { ...pagination, totalItems: 0, totalPages: 0 } });
    render(<RequesterDashboard user={requester} onOpenTicket={vi.fn()} />);
    expect(await screen.findByRole("button", { name: /Open Tickets: 0/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Open Tickets: 0/ }));
    expect(await screen.findByText("No matching Tickets.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to dashboard" }));
    expect(await screen.findByRole("heading", { name: "My Dashboard" })).toBeInTheDocument();
  });
});
