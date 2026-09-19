import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

const references = {
  categories: [{ id: 1, name: "Account and Access" }],
  relatedSystems: [{ id: 1, name: "Corporate Laptop" }],
};

const createdTicket = {
  id: 42,
  ticketNumber: "TT-20260905-424242",
  ticketDate: "2026-09-05T08:00:00.000Z",
  requesterId: 1,
  categoryId: 1,
  relatedSystemId: 1,
  requestedPriority: "HIGH" as const,
  status: "NEW" as const,
  summary: "Laptop cannot connect",
  description: "The corporate laptop cannot connect to the office network.",
  createdAt: "2026-09-05T08:00:00.000Z",
  updatedAt: "2026-09-05T08:00:00.000Z",
  attachments: [],
};

async function openCreateTicket() {
  render(<App />);
  await waitFor(() => expect(screen.getByRole("option", { name: /Ariya Somchai/i })).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText("Requester"), { target: { value: "1" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  await waitFor(() => expect(screen.getByRole("heading", { name: "My tickets" })).toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: "Create Ticket" }));
  await waitFor(() => expect(screen.getByRole("heading", { name: "Create a ticket" })).toBeInTheDocument());
}

function fillValidTicket() {
  fireEvent.change(screen.getByLabelText("Category"), { target: { value: "1" } });
  fireEvent.change(screen.getByLabelText("Related system"), { target: { value: "1" } });
  fireEvent.change(screen.getByLabelText("Requested priority"), { target: { value: "HIGH" } });
  fireEvent.change(screen.getByLabelText("Summary"), { target: { value: "Laptop cannot connect" } });
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: "The corporate laptop cannot connect to the office network." } });
}

describe("Lab 2 Create Ticket", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.spyOn(api, "getActiveRequesters").mockResolvedValue([
      { id: 1, name: "Ariya Somchai", email: "ariya@example.com" },
    ]);
    vi.spyOn(api, "getReferenceData").mockResolvedValue(references);
    vi.spyOn(api, "listTickets").mockResolvedValue({
      items: [],
      pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0, hasPrevious: false, hasNext: false },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows field-level validation without calling the API", async () => {
    const createTicket = vi.spyOn(api, "createTicket");
    await openCreateTicket();

    fireEvent.click(screen.getByRole("button", { name: "Submit ticket" }));

    expect(await screen.findByText("Choose a category.")).toBeInTheDocument();
    expect(screen.getByText("Choose a related system.")).toBeInTheDocument();
    expect(screen.getByText("Use 5–150 characters.")).toBeInTheDocument();
    expect(screen.getByText("Use 10–5000 characters.")).toBeInTheDocument();
    expect(createTicket).not.toHaveBeenCalled();
  });

  it("rejects an invalid attachment in the browser", async () => {
    await openCreateTicket();
    const file = new File(["bad"], "malware.exe", { type: "application/x-msdownload" });

    fireEvent.change(screen.getByLabelText("Attachments"), { target: { files: [file] } });

    expect(await screen.findByText("Use JPEG, PNG, WEBP, or PDF files.")).toBeInTheDocument();
  });

  it("disables duplicate submission and shows the backend ticket number on success", async () => {
    let resolveCreate: ((ticket: typeof createdTicket) => void) | undefined;
    const createTicket = vi.spyOn(api, "createTicket").mockImplementation(
      () => new Promise((resolve) => { resolveCreate = resolve; }),
    );
    await openCreateTicket();
    fillValidTicket();

    const submit = screen.getByRole("button", { name: "Submit ticket" });
    fireEvent.click(submit);
    expect(await screen.findByRole("button", { name: "Creating…" })).toBeDisabled();
    fireEvent.click(submit);
    expect(createTicket).toHaveBeenCalledTimes(1);

    resolveCreate?.(createdTicket);
    expect(await screen.findByRole("status")).toHaveTextContent(createdTicket.ticketNumber);
    expect(screen.getByRole("button", { name: "View ticket" })).toBeInTheDocument();
  });

  it("keeps entered values after an API failure", async () => {
    vi.spyOn(api, "createTicket").mockRejectedValue(new Error("Service unavailable."));
    await openCreateTicket();
    fillValidTicket();
    fireEvent.click(screen.getByRole("button", { name: "Submit ticket" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Service unavailable.");
    expect(screen.getByLabelText("Summary")).toHaveValue("Laptop cannot connect");
    expect(screen.getByLabelText("Description")).toHaveValue("The corporate laptop cannot connect to the office network.");
    expect(screen.getByLabelText("Category")).toHaveValue("1");
  });
});
