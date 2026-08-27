import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

const ticket = {
  id: 10,
  ticketNumber: "TT-20260824-000010",
  ticketDate: "2026-08-24T10:00:00.000Z",
  requesterId: 1,
  categoryId: 2,
  relatedSystemId: 3,
  requestedPriority: "HIGH" as const,
  status: "NEW" as const,
  summary: "VPN access request",
  description: "Please restore access to the corporate VPN.",
  createdAt: "2026-08-24T10:00:00.000Z",
  updatedAt: "2026-08-24T11:00:00.000Z",
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 3, name: "VPN" },
  attachments: [],
};

const listResult = {
  items: [ticket],
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false,
  },
};

async function selectTicket() {
  render(<App />);
  await waitFor(() => expect(screen.getByRole("option", { name: /Ariya Somchai/i })).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText("Requester"), { target: { value: "1" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  await waitFor(() => expect(screen.getByRole("button", { name: /TT-20260824-000010 VPN access request/i })).toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: /TT-20260824-000010 VPN access request/i }));
}

async function openTicket() {
  await selectTicket();
  await waitFor(() => expect(screen.getByRole("heading", { name: "VPN access request" })).toBeInTheDocument());
}

describe("Lab 2 owned Ticket Detail", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.spyOn(api, "getActiveRequesters").mockResolvedValue([
      { id: 1, name: "Ariya Somchai", email: "ariya@example.com" },
    ]);
    vi.spyOn(api, "getReferenceData").mockResolvedValue({
      categories: [{ id: 2, name: "Hardware" }],
      relatedSystems: [{ id: 3, name: "VPN" }],
    });
    vi.spyOn(api, "listTickets").mockResolvedValue(listResult);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders an owned detail as read-only and navigates back to My Tickets", async () => {
    const getTicket = vi.spyOn(api, "getTicket").mockResolvedValue(ticket);
    await openTicket();

    expect(getTicket).toHaveBeenCalledWith(1, 10);
    expect(screen.getByText(ticket.description)).toBeInTheDocument();
    expect(screen.getByText("Hardware")).toBeInTheDocument();
    expect(screen.getByText("VPN")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Summary" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit ticket" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Back to My Tickets/i }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "My tickets" })).toBeInTheDocument());
  });

  it("shows a safe error when the detail is not owned or no longer exists", async () => {
    vi.spyOn(api, "getTicket").mockRejectedValue(new Error("Ticket not found."));
    await selectTicket();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Ticket not found."));
  });
});
