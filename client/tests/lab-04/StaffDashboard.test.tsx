import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as api from "../../src/api.js";
import { StaffDashboard } from "../../src/Dashboard.js";

const staff: api.User = {
  id: 7, name: "Somchai Staff", email: "staff@example.com", role: "IT_STAFF", isActive: true,
  mustChangePassword: false, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
};
const asOfUtc = "2026-10-30T12:00:00.000Z";
const summary: api.DashboardTicketSummary = {
  id: 10, ticketNumber: "TT-10", status: "OPEN", summary: "VPN access", updatedAt: asOfUtc,
  resolvedAt: null, requestedPriority: "HIGH", itPriority: "MEDIUM", ownerId: 7, owner: { id: 7, name: staff.name },
};
const dashboard: api.StaffDashboardData = {
  asOfUtc,
  metrics: {
    unassignedActive: { count: 3 }, myActiveTickets: { count: 5 },
    activeByStatus: ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "REOPENED"].map((value) => ({ value: value as api.TicketStatus, count: value === "OPEN" ? 5 : 0 })),
    activeByItPriority: [{ value: "LOW", count: 0 }, { value: "MEDIUM", count: 4 }, { value: "HIGH", count: 1 }],
    recentlyUpdatedActive: { count: 1, items: [summary] },
    myActiveActionsTaken: { count: 1, items: [{
      id: 20, ticketId: 10, actionDateTime: "2026-10-30T13:00:00.000Z", description: "Restore access", result: "Pending",
      status: "PLANNED", performedBy: { id: 8, name: "Different actor" }, assignee: { id: 7, name: staff.name },
      ticket: { id: 10, ticketNumber: "TT-10", summary: "VPN access", status: "OPEN" },
    }] },
  },
};
const pagination: api.Pagination = { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasPrevious: false, hasNext: false };

describe("Lab 4 Staff dashboard UI", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows all status and IT-priority values and drills down through the dashboard filter API", async () => {
    vi.spyOn(api, "getStaffDashboard").mockResolvedValue(dashboard);
    vi.spyOn(api, "listStaffDashboardTickets").mockResolvedValue({ items: [summary], pagination });
    render(<StaffDashboard user={staff} onOpenTicket={vi.fn()} />);
    expect(await screen.findByRole("heading", { name: "Work Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Active by IT priority" })).toBeInTheDocument();
    expect(screen.getByText("LOW")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "OPEN 5" }));
    expect(await screen.findByRole("heading", { name: "OPEN Tickets" })).toBeInTheDocument();
    expect(api.listStaffDashboardTickets).toHaveBeenCalledWith({ status: "OPEN", page: 1, pageSize: 10 });
    expect(await screen.findByRole("button", { name: /Open Ticket TT-10/ })).toBeInTheDocument();
  });

  it("keeps performer and assignee distinct and opens the linked Ticket detail", async () => {
    vi.spyOn(api, "getStaffDashboard").mockResolvedValue(dashboard);
    const openTicket = vi.fn();
    render(<StaffDashboard user={{ ...staff, role: "ADMINISTRATOR" }} onOpenTicket={openTicket} />);
    const action = await screen.findByRole("button", { name: /Open Ticket TT-10 for action 20/ });
    expect(action).toHaveTextContent("Performed by Different actor · Assigned to Somchai Staff");
    fireEvent.click(action);
    await waitFor(() => expect(openTicket).toHaveBeenCalledWith(10));
  });
  it.each(["Network request failed.", "Forbidden."])("announces initial failure %s and recovers through Retry", async (message) => {
    const request = vi.spyOn(api, "getStaffDashboard").mockRejectedValueOnce(new Error(message)).mockResolvedValue(dashboard);
    render(<StaffDashboard user={staff} onOpenTicket={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.queryByRole("button", { name: /Unassigned active: 3/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("button", { name: /Unassigned active: 3/ })).toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("announces initial loading and keeps the last metrics after a failed refresh", async () => {
    let resolve!: (value: typeof dashboard) => void;
    const pending = new Promise<typeof dashboard>((done) => { resolve = done; });
    vi.spyOn(api, "getStaffDashboard").mockReturnValueOnce(pending).mockRejectedValueOnce(new Error("Refresh failed."));
    render(<StaffDashboard user={staff} onOpenTicket={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading dashboard");
    await act(async () => resolve(dashboard));
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Refresh failed.");
    expect(screen.getByRole("button", { name: /Unassigned active: 3/ })).toBeInTheDocument();
  });

  it("announces drill-down loading and retries the same filter after failure", async () => {
    vi.spyOn(api, "getStaffDashboard").mockResolvedValue(dashboard);
    let reject!: (reason: Error) => void;
    const pending = new Promise<any>((_, fail) => { reject = fail; });
    const request = vi.spyOn(api, "listStaffDashboardTickets").mockReturnValueOnce(pending).mockResolvedValue({ items: [summary], pagination });
    render(<StaffDashboard user={staff} onOpenTicket={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: /Unassigned active: 3/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Loading matching Tickets");
    await act(async () => reject(new Error("Unable to load matching Tickets.")));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load matching Tickets.");
    expect(screen.queryByRole("button", { name: /Open Ticket TT-10/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("button", { name: /Open Ticket TT-10/ })).toBeInTheDocument();
    expect(request).toHaveBeenNthCalledWith(1, { ownership: "unassigned", page: 1, pageSize: 10 });
    expect(request).toHaveBeenNthCalledWith(2, { ownership: "unassigned", page: 1, pageSize: 10 });
  });

});
