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
  comments: [],
  notes: [],
};

const queueResult = {
  items: [ticket],
  pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasPrevious: false, hasNext: false },
};

describe("Lab 3 IT Staff Ticket Queue", () => {
  beforeEach(() => {
    vi.spyOn(api, "getCurrentUser").mockResolvedValue({ user: staffUser, mustChangePassword: false });
  });

  afterEach(() => vi.restoreAllMocks());

  it("loads the authenticated Staff Queue and sends the documented filters", async () => {
    const list = vi.spyOn(api, "listStaffTickets").mockResolvedValue(queueResult);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Ticket Queue" })).toBeInTheDocument();
      expect(screen.getByText(ticket.ticketNumber)).toBeInTheDocument();
    });
    expect(screen.getAllByText("Unassigned").length).toBeGreaterThanOrEqual(2);

    fireEvent.change(screen.getByLabelText("Search tickets"), { target: { value: "VPN" } });
    fireEvent.change(screen.getByLabelText("IT priority"), { target: { value: "MEDIUM" } });
    fireEvent.change(screen.getByLabelText("Owner"), { target: { value: "unassigned" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    await waitFor(() => expect(list).toHaveBeenLastCalledWith(expect.objectContaining({
      search: "VPN",
      itPriority: "MEDIUM",
      ownership: "unassigned",
      page: 1,
      pageSize: 10,
    })));
  });

  it("distinguishes an empty Queue from a filtered no-result state", async () => {
    const list = vi.spyOn(api, "listStaffTickets").mockResolvedValue({ ...queueResult, items: [], pagination: { ...queueResult.pagination, totalItems: 0, totalPages: 0 } });
    render(<App />);

    await waitFor(() => expect(screen.getByText("No tickets yet")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Search tickets"), { target: { value: "missing" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(screen.getByText("No matching tickets")).toBeInTheDocument());
    expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ search: "missing" }));
  });
});
