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
  attachments: [],
};

const ticketPage = (page: number, totalPages: number, items = [ticket]) => ({
  items,
  pagination: {
    page,
    pageSize: 10,
    totalItems: totalPages > 0 ? totalPages * 10 : 0,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  },
});

async function enterDesk() {
  render(<App />);
  await waitFor(() => expect(screen.getByRole("option", { name: /Ariya Somchai/i })).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText("Requester"), { target: { value: "1" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  await waitFor(() => expect(screen.getByRole("heading", { name: "My tickets" })).toBeInTheDocument());
}

describe("Lab 2 My Tickets", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.spyOn(api, "getActiveRequesters").mockResolvedValue([
      { id: 1, name: "Ariya Somchai", email: "ariya@example.com" },
    ]);
    vi.spyOn(api, "getReferenceData").mockResolvedValue({
      categories: [{ id: 2, name: "Hardware" }],
      relatedSystems: [{ id: 3, name: "VPN" }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends the selected filters and sort controls to the requester-scoped API", async () => {
    const listTickets = vi.spyOn(api, "listTickets").mockResolvedValue(ticketPage(1, 1));
    await enterDesk();

    await waitFor(() => expect(listTickets).toHaveBeenCalledWith(1, expect.objectContaining({
      search: "",
      status: "",
      sortBy: "updatedAt",
      sortDirection: "desc",
      page: 1,
      pageSize: 10,
    })));

    fireEvent.change(screen.getByLabelText("Search tickets"), { target: { value: "VPN" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Priority"), { target: { value: "HIGH" } });
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "NEW" } });
    fireEvent.change(screen.getByLabelText("Sort by"), { target: { value: "createdAt" } });
    fireEvent.change(screen.getByLabelText("Sort direction"), { target: { value: "asc" } });
    fireEvent.change(screen.getByLabelText("Tickets per page"), { target: { value: "20" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

    await waitFor(() => expect(listTickets).toHaveBeenLastCalledWith(1, {
      search: "VPN",
      categoryId: 2,
      requestedPriority: "HIGH",
      status: "NEW",
      sortBy: "createdAt",
      sortDirection: "asc",
      page: 1,
      pageSize: 20,
    }));
    expect(screen.getByText(ticket.ticketNumber)).toBeInTheDocument();
  });

  it("supports pagination and distinguishes a filtered no-results state", async () => {
    const secondTicket = { ...ticket, id: 11, ticketNumber: "TT-20260824-000011" };
    const listTickets = vi.spyOn(api, "listTickets").mockImplementation(async (_requesterId, params = {}) => {
      if (params.page === 2) return ticketPage(2, 2, [secondTicket]);
      if (params.search) return ticketPage(1, 0, []);
      return ticketPage(1, 2);
    });
    await enterDesk();

    await waitFor(() => expect(screen.getByRole("button", { name: "Next" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(listTickets).toHaveBeenLastCalledWith(1, expect.objectContaining({ page: 2 })));
    expect(screen.getByText(secondTicket.ticketNumber)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search tickets"), { target: { value: "does-not-exist" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(screen.getByText("No matching tickets")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(screen.getByText(ticket.ticketNumber)).toBeInTheDocument());
    expect(listTickets).toHaveBeenLastCalledWith(1, expect.objectContaining({ search: "", page: 1 }));
  });
});
