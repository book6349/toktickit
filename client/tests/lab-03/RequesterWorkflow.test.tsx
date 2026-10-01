import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

const requester = {
  id: 1,
  name: "Ariya Somchai",
  email: "ariya.somchai@example.com",
  role: "REQUESTER" as const,
  isActive: true,
  mustChangePassword: false,
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

const ticket = {
  id: 10,
  ticketNumber: "TT-20260919-000010",
  ticketDate: "2026-09-19T10:00:00.000Z",
  requesterId: requester.id,
  categoryId: 2,
  relatedSystemId: 3,
  requestedPriority: "HIGH" as const,
  status: "OPEN" as const,
  summary: "VPN access request",
  description: "Please restore access to the corporate VPN.",
  createdAt: "2026-09-19T10:00:00.000Z",
  updatedAt: "2026-09-19T11:00:00.000Z",
  requester: { id: requester.id, name: requester.name, email: requester.email },
  category: { id: 2, name: "Hardware" },
  relatedSystem: { id: 3, name: "VPN" },
  attachments: [],
};

const pagination = { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasPrevious: false, hasNext: false };

describe("Lab 3 Requester ticket regression", () => {
  beforeEach(() => {
    vi.spyOn(api, "getCurrentUser").mockResolvedValue({ user: requester, mustChangePassword: false });
    vi.spyOn(api, "getReferenceData").mockResolvedValue({ categories: [], relatedSystems: [] });
    vi.spyOn(api, "listTickets").mockResolvedValue({ items: [ticket], pagination });
    vi.spyOn(api, "getTicket").mockResolvedValue(ticket);
    vi.spyOn(api, "getComments").mockResolvedValue([]);
  });

  afterEach(() => vi.restoreAllMocks());

  async function openTicketDetail() {
    render(<App />);
    await waitFor(() => expect(screen.getByText(ticket.ticketNumber)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: new RegExp(ticket.ticketNumber) }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Public comments" })).toBeInTheDocument());
  }

  it("adds a public comment to the owned ticket and never renders Internal Notes", async () => {
    const comment = {
      id: 3,
      ticketId: ticket.id,
      content: "I can connect now.",
      author: { id: requester.id, name: requester.name, role: "REQUESTER" as const },
      createdAt: "2026-09-19T12:00:00.000Z",
    };
    const addComment = vi.spyOn(api, "addComment").mockResolvedValue(comment);
    await openTicketDetail();

    fireEvent.change(screen.getByLabelText("Add a public comment"), { target: { value: "  I can connect now.  " } });
    fireEvent.click(screen.getByRole("button", { name: "Add comment" }));

    await waitFor(() => expect(addComment).toHaveBeenCalledWith(ticket.id, "I can connect now."));
    await waitFor(() => expect(screen.getByRole("listitem")).toHaveTextContent("I can connect now."));
    expect(screen.queryByRole("heading", { name: "Internal Notes" })).not.toBeInTheDocument();
  });

  it("shows the Requester resolution indication after the API confirms it", async () => {
    const setResolution = vi.spyOn(api, "setResolution").mockResolvedValue({
      appearsResolved: true,
      indicatedAt: "2026-09-19T12:05:00.000Z",
    });
    await openTicketDetail();

    fireEvent.click(screen.getByRole("button", { name: "Mark as appears resolved" }));

    await waitFor(() => expect(setResolution).toHaveBeenCalledWith(ticket.id, true));
    expect(await screen.findByRole("status")).toHaveTextContent("Marked as appears resolved.");
    expect(screen.getByRole("button", { name: "Clear resolved indication" })).toBeInTheDocument();
  });

  it("renders comment markup as text without creating executable HTML", async () => {
    const content = '<img src=x onerror="window.commentExecuted=true"><script>alert(1)</script>';
    vi.spyOn(api, "getComments").mockResolvedValue([{
      id: 3, ticketId: ticket.id, content,
      author: { id: requester.id, name: requester.name, role: "REQUESTER" },
      createdAt: "2026-10-01T00:00:00Z",
    }]);
    await openTicketDetail();
    expect(screen.getByRole("listitem")).toHaveTextContent(content);
    expect(document.querySelector(".comments-block img")).toBeNull();
    expect(document.querySelector(".comments-block script")).toBeNull();
  });
});
