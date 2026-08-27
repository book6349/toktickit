import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

const activeAttachment = {
  id: 55,
  originalFilename: "vpn-error.png",
  mimeType: "image/png",
  sizeBytes: 2048,
  uploadedAt: "2026-08-24T10:00:00.000Z",
  removedAt: null,
  removalReason: null,
  isRemoved: false,
};

const removedAttachment = {
  id: 56,
  originalFilename: "old-log.pdf",
  mimeType: "application/pdf",
  sizeBytes: 4096,
  uploadedAt: "2026-08-24T09:00:00.000Z",
  removedAt: "2026-08-24T11:00:00.000Z",
  removalReason: "No longer needed",
  isRemoved: true,
};

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
  attachments: [activeAttachment, removedAttachment],
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

async function openDetail() {
  render(<App />);
  await waitFor(() => expect(screen.getByRole("option", { name: /Ariya Somchai/i })).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText("Requester"), { target: { value: "1" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  await waitFor(() => expect(screen.getByRole("button", { name: /TT-20260824-000010 VPN access request/i })).toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: /TT-20260824-000010 VPN access request/i }));
  await waitFor(() => expect(screen.getByRole("heading", { name: "VPN access request" })).toBeInTheDocument());
}

describe("Lab 2 AttachmentSection", () => {
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
    vi.spyOn(api, "getTicket").mockResolvedValue(ticket);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows upload and removal for active files while hiding actions for removed files", async () => {
    const uploadAttachments = vi.spyOn(api, "uploadAttachments").mockResolvedValue([
      { ...activeAttachment, id: 57, originalFilename: "new-log.pdf", mimeType: "application/pdf" },
    ]);
    const removeAttachment = vi.spyOn(api, "removeAttachment").mockResolvedValue({
      ...activeAttachment,
      removedAt: "2026-08-24T12:00:00.000Z",
      removalReason: "No longer needed",
      isRemoved: true,
    });
    await openDetail();

    expect(screen.getByText("vpn-error.png")).toBeInTheDocument();
    expect(screen.getByText("old-log.pdf")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Download" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    fireEvent.change(screen.getByLabelText("Removal reason"), { target: { value: "No longer needed" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm removal" }));
    await waitFor(() => expect(removeAttachment).toHaveBeenCalledWith(1, 55, "No longer needed"));
    await waitFor(() => expect(screen.getAllByText(/Removed/).length).toBeGreaterThan(0));
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();

    const file = new File(["log"], "new-log.pdf", { type: "application/pdf" });
    fireEvent.change(screen.getByLabelText("Add files"), { target: { files: [file] } });
    await waitFor(() => expect(uploadAttachments).toHaveBeenCalledWith(1, 10, [file]));
    expect(screen.getByText("new-log.pdf")).toBeInTheDocument();
  });
});
