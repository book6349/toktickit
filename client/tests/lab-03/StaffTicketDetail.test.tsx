import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

const staffUser = {
  id: 7,
  name: "Niran Staff",
  email: "niran.staff@example.com",
  role: "IT_STAFF" as const,
  isActive: true,
  mustChangePassword: false,
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

const adminUser = { ...staffUser, id: 8, name: "Admin User", email: "admin@example.com", role: "ADMINISTRATOR" as const };

const ticket = {
  id: 10,
  ticketNumber: "TT-20260919-000010",
  ticketDate: "2026-09-19T10:00:00.000Z",
  requesterId: 1,
  categoryId: 2,
  relatedSystemId: 3,
  requestedPriority: "HIGH" as const,
  itPriority: "MEDIUM" as const,
  status: "OPEN" as const,
  ownerId: null,
  summary: "VPN access request",
  description: "Please restore access to the corporate VPN.",
  createdAt: "2026-09-19T10:00:00.000Z",
  updatedAt: "2026-09-19T11:00:00.000Z",
  requester: { id: 1, name: "Ariya Somchai", email: "ariya@example.com", role: "REQUESTER" as const },
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 3, name: "VPN" },
  attachments: [],
  comments: [{ id: 1, ticketId: 10, content: "Please help.", author: { id: 1, name: "Ariya Somchai", role: "REQUESTER" as const }, createdAt: "2026-09-19T11:00:00.000Z" }],
  notes: [{ id: 2, ticketId: 10, content: "Checked VPN group.", author: { id: 7, name: "Niran Staff", email: "niran.staff@example.com", role: "IT_STAFF" as const }, createdAt: "2026-09-19T11:05:00.000Z" }],
};

const queueResult = { items: [ticket], pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasPrevious: false, hasNext: false } };

describe("Lab 3 Staff Ticket Detail", () => {
  beforeEach(() => {
    vi.spyOn(api, "listStaffTickets").mockResolvedValue(queueResult);
    vi.spyOn(api, "getStaffTicket").mockResolvedValue(ticket);
    vi.spyOn(api, "getStaffNotes").mockResolvedValue(ticket.notes);
  });

  afterEach(() => vi.restoreAllMocks());

  it("keeps public comments and Internal Notes separate and supports staff operations", async () => {
    vi.spyOn(api, "getCurrentUser").mockResolvedValue({ user: staffUser, mustChangePassword: false });
    const owner = vi.spyOn(api, "updateStaffOwner").mockResolvedValue({ ...ticket, ownerId: staffUser.id, owner: { id: staffUser.id, name: staffUser.name, email: staffUser.email, role: staffUser.role } });
    const updateStatus = vi.spyOn(api, "updateStaffStatus").mockResolvedValue({ ...ticket, status: "IN_PROGRESS" });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Open Detail" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Open Detail" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "VPN access request" })).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Public Comments" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Internal Notes" })).toBeInTheDocument();
    expect(screen.getByText("Checked VPN group.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Claim as me" }));
    await waitFor(() => expect(owner).toHaveBeenCalledWith(10, 7));
    fireEvent.change(screen.getByLabelText("Next status"), { target: { value: "IN_PROGRESS" } });
    fireEvent.click(screen.getByRole("button", { name: "Update status" }));
    await waitFor(() => expect(updateStatus).toHaveBeenCalledWith(10, "IN_PROGRESS", false));
  });

  it("keeps Administrators out of the Queue and exposes only direct read-only detail", async () => {
    vi.spyOn(api, "getCurrentUser").mockResolvedValue({ user: adminUser, mustChangePassword: false });
    render(<App />);

    await waitFor(() => expect(screen.getByRole("heading", { name: "Administrator workspace" })).toBeInTheDocument());
    expect(screen.queryByRole("heading", { name: "Ticket Queue" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Ticket ID"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Open Ticket Detail" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Public Comments" })).toBeInTheDocument());
    expect(screen.getByLabelText("IT Priority")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Add Internal Note" })).not.toBeInTheDocument();
  });
});
