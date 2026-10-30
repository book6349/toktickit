import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { within } from "@testing-library/dom";
import App from "../../src/App.js";
import * as api from "../../src/api.js";
import { StaffTicketDetail } from "../../src/staff.js";

const staffUser: api.User = {
  id: 7, name: "Niran Staff", email: "niran.staff@example.com", role: "IT_STAFF", isActive: true,
  mustChangePassword: false, createdAt: "2026-10-30T00:00:00.000Z", updatedAt: "2026-10-30T00:00:00.000Z",
};
const requester: api.User = {
  id: 1, name: "Ariya Requester", email: "ariya@example.com", role: "REQUESTER", isActive: true,
  mustChangePassword: false, createdAt: "2026-10-30T00:00:00.000Z", updatedAt: "2026-10-30T00:00:00.000Z",
};
const ticket: api.StaffTicket = {
  id: 10, ticketNumber: "TT-20261030-000010", ticketDate: "2026-10-30T10:00:00.000Z", requesterId: 1,
  categoryId: 2, relatedSystemId: 3, requestedPriority: "HIGH", itPriority: "MEDIUM", status: "OPEN", ownerId: 7,
  summary: "VPN access request", description: "Please restore access to the corporate VPN.",
  createdAt: "2026-10-30T10:00:00.000Z", updatedAt: "2026-10-30T11:00:00.000Z",
  requester: { id: 1, name: "Ariya Requester", email: "ariya@example.com", role: "REQUESTER" },
  owner: { id: 7, name: "Niran Staff", email: "niran.staff@example.com", role: "IT_STAFF" },
  category: { id: 2, name: "Hardware" }, relatedSystem: { id: 3, name: "VPN" }, attachments: [], comments: [], notes: [],
};
const workflow: api.TicketWorkflow = {
  ticketId: 10, status: "OPEN", workflowVersion: 9,
  resolution: { summary: null, resolvedAt: null, resolvedBy: null },
  permittedNextStatuses: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  resolutionGate: { completedActionCount: 1, blockingActionCount: 0 }, events: [],
};

function mockStaffDetail(nextWorkflow: api.TicketWorkflow = workflow) {
  vi.spyOn(api, "getStaffTicket").mockResolvedValue(ticket);
  vi.spyOn(api, "getStaffNotes").mockResolvedValue([]);
  vi.spyOn(api, "getTicketWorkflow").mockResolvedValue(nextWorkflow);
  vi.spyOn(api, "getActionsTaken").mockResolvedValue({ items: [], ticketId: 10, readOnly: false });
  vi.spyOn(api, "getActionAssignees").mockResolvedValue([]);
}

describe("Lab 4 Ticket workflow UI", () => {
  beforeEach(() => window.sessionStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("uses only the permitted transitions returned by the server", async () => {
    const serverWorkflow = { ...workflow, permittedNextStatuses: ["WAITING_FOR_REQUESTER"] as api.TicketStatus[] };
    mockStaffDetail(serverWorkflow);
    render(<StaffTicketDetail ticketId={10} user={staffUser} canOperate onBack={vi.fn()} />);

    await screen.findByText("No Actions Taken yet");
    const nextStatus = await screen.findByLabelText("Next status");
    expect(nextStatus).toHaveTextContent("WAITING FOR REQUESTER");
    expect(nextStatus).not.toHaveTextContent("IN PROGRESS");
  });

  it("shows resolution blockers and links to Actions Taken", async () => {
    mockStaffDetail({ ...workflow, permittedNextStatuses: ["RESOLVED"], resolutionGate: { completedActionCount: 0, blockingActionCount: 1 } });
    render(<StaffTicketDetail ticketId={10} user={staffUser} canOperate onBack={vi.fn()} />);

    await screen.findByText("No Actions Taken yet");
    fireEvent.change(await screen.findByLabelText("Next status"), { target: { value: "RESOLVED" } });
    expect(screen.getByLabelText("Resolution summary")).toBeRequired();
    expect(screen.getByText(/Completed actions: 0\. Pending actions: 1\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review Actions Taken" })).toHaveAttribute("href", "#actions-taken-heading-10");
    expect(screen.getByRole("button", { name: "Update status" })).toBeDisabled();
  });

  it("sends the current version, confirmation, and resolution summary", async () => {
    mockStaffDetail({ ...workflow, permittedNextStatuses: ["RESOLVED"] });
    const update = vi.spyOn(api, "updateStaffStatus").mockResolvedValue({ ...ticket, status: "RESOLVED", resolutionSummary: "VPN access restored." });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<StaffTicketDetail ticketId={10} user={staffUser} canOperate onBack={vi.fn()} />);

    await screen.findByText("No Actions Taken yet");
    fireEvent.change(await screen.findByLabelText("Next status"), { target: { value: "RESOLVED" } });
    fireEvent.change(screen.getByLabelText("Resolution summary"), { target: { value: "  VPN access restored.  " } });
    fireEvent.click(screen.getByRole("button", { name: "Update status" }));

    await waitFor(() => expect(update).toHaveBeenCalledWith(10, "RESOLVED", {
      expectedVersion: 9, confirm: true, resolutionSummary: "VPN access restored.",
    }));
  });

  it("requires a reopening reason before enabling the status change", async () => {
    mockStaffDetail({ ...workflow, status: "CLOSED", permittedNextStatuses: ["REOPENED"] });
    render(<StaffTicketDetail ticketId={10} user={staffUser} canOperate onBack={vi.fn()} />);

    await screen.findByText("No Actions Taken yet");
    fireEvent.change(await screen.findByLabelText("Next status"), { target: { value: "REOPENED" } });
    expect(screen.getByLabelText("Reason for reopening")).toBeRequired();
    expect(screen.getByRole("button", { name: "Update status" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Reason for reopening"), { target: { value: "The issue returned." } });
    expect(screen.getByRole("button", { name: "Update status" })).toBeEnabled();
  });

  it("refreshes Ticket details and the resolution gate after an Actions Taken change without clearing the form", async () => {
    const plannedAction: api.ActionTaken = {
      id: 30, ticketId: 10, actionDateTime: "2026-10-30T10:00:00.000Z", description: "Restore wireless profile",
      result: "Profile is ready to validate.", performedBy: { id: 7, name: "Niran Staff" }, assignee: { id: 7, name: "Niran Staff" },
      status: "PLANNED", followUpRequired: false, followUpNote: null, attachmentNotes: null, version: 1,
      createdAt: "2026-10-30T10:00:00.000Z", updatedAt: "2026-10-30T10:00:00.000Z",
    };
    const completedAction = { ...plannedAction, status: "COMPLETED" as const, version: 2 };
    const initialWorkflow = { ...workflow, permittedNextStatuses: ["RESOLVED"] as api.TicketStatus[], resolutionGate: { completedActionCount: 0, blockingActionCount: 1 } };
    const refreshedWorkflow = { ...initialWorkflow, workflowVersion: 10, resolutionGate: { completedActionCount: 1, blockingActionCount: 0 } };
    mockStaffDetail(initialWorkflow);
    vi.mocked(api.getTicketWorkflow).mockResolvedValueOnce(initialWorkflow).mockResolvedValue(refreshedWorkflow);
    vi.mocked(api.getActionsTaken).mockResolvedValue({ items: [plannedAction], ticketId: 10, readOnly: false });
    vi.mocked(api.getActionAssignees).mockResolvedValue([{ id: 7, name: "Niran Staff" }]);
    vi.mocked(api.getStaffTicket).mockResolvedValueOnce(ticket).mockResolvedValue({ ...ticket, updatedAt: "2026-10-30T12:00:00.000Z" });
    const changeAction = vi.spyOn(api, "changeActionTakenStatus").mockResolvedValue(completedAction);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<StaffTicketDetail ticketId={10} user={staffUser} canOperate onBack={vi.fn()} />);

    await screen.findByText("Restore wireless profile");
    fireEvent.change(document.querySelector("#staff-next-status") as HTMLSelectElement, { target: { value: "RESOLVED" } });
    await screen.findByText("Completed actions: 0. Pending actions: 1.");
    fireEvent.change(screen.getByLabelText("Resolution summary"), { target: { value: "Wireless profile restored." } });
    const actionCard = screen.getByRole("article", { name: "Action 30: PLANNED" });
    fireEvent.change(within(actionCard).getByLabelText("Next status for action 30"), { target: { value: "COMPLETED" } });
    fireEvent.click(within(actionCard).getByRole("button", { name: "Update status" }));

    await waitFor(() => expect(changeAction).toHaveBeenCalledWith(10, 30, 1, "COMPLETED"));
    expect(await screen.findByText("Completed actions: 1. Pending actions: 0.")).toBeInTheDocument();
    expect(screen.getByLabelText("Resolution summary")).toHaveValue("Wireless profile restored.");
    expect(screen.getByRole("button", { name: "Update status" })).toBeEnabled();
    expect(api.getStaffTicket).toHaveBeenCalledTimes(2);
  });

  it("keeps resolution text after a version conflict and refreshes workflow before retry", async () => {
    mockStaffDetail({ ...workflow, permittedNextStatuses: ["RESOLVED"] });
    const conflict = Object.assign(new Error("The Ticket changed. Refresh it and review your entries before retrying."), { code: "VERSION_CONFLICT", status: 409 });
    const update = vi.spyOn(api, "updateStaffStatus").mockRejectedValue(conflict);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<StaffTicketDetail ticketId={10} user={staffUser} canOperate onBack={vi.fn()} />);

    await screen.findByText("No Actions Taken yet");
    fireEvent.change(await screen.findByLabelText("Next status"), { target: { value: "RESOLVED" } });
    const summary = screen.getByLabelText("Resolution summary");
    fireEvent.change(summary, { target: { value: "VPN access restored after adapter replacement." } });
    fireEvent.click(screen.getByRole("button", { name: "Update status" }));
    await screen.findByRole("alert");
    expect(summary).toHaveValue("VPN access restored after adapter replacement.");

    fireEvent.click(screen.getByRole("button", { name: "Refresh Ticket and keep my entries" }));
    await screen.findByText("Ticket refreshed. Review the current status; your resolution entries are still here.");
    expect(screen.getByLabelText("Resolution summary")).toHaveValue("VPN access restored after adapter replacement.");
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("shows Requesters read-only formal resolution history separately from their advisory indication", async () => {
    const resolvedTicket: api.Ticket = { ...ticket, status: "REOPENED", requesterResolutionIndicatedAt: "2026-10-30T12:00:00.000Z" };
    const history: api.TicketWorkflow = {
      ...workflow,
      status: "REOPENED",
      resolution: { summary: null, resolvedAt: null, resolvedBy: null },
      permittedNextStatuses: [],
      events: [{
        id: 20, fromStatus: "RESOLVED", toStatus: "REOPENED", version: 10, createdAt: "2026-10-30T12:30:00.000Z",
        actor: { id: 7, name: "Niran Staff" }, resolutionSummary: "VPN access restored.", resolvedAt: "2026-10-30T12:00:00.000Z",
        resolvedBy: { id: 7, name: "Niran Staff" },
      }],
    };
    vi.spyOn(api, "getCurrentUser").mockResolvedValue({ user: requester, mustChangePassword: false });
    vi.spyOn(api, "getReferenceData").mockResolvedValue({ categories: [], relatedSystems: [] });
    vi.spyOn(api, "listTickets").mockResolvedValue({ items: [resolvedTicket], pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasPrevious: false, hasNext: false } });
    vi.spyOn(api, "getTicket").mockResolvedValue(resolvedTicket);
    vi.spyOn(api, "getComments").mockResolvedValue([]);
    vi.spyOn(api, "getTicketWorkflow").mockResolvedValue(history);
    vi.spyOn(api, "getActionsTaken").mockResolvedValue({ items: [], ticketId: 10, readOnly: true });
    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /TT-20261030-000010 VPN access request/ }));
    expect(await screen.findByRole("heading", { name: "Formal resolution" })).toBeInTheDocument();
    expect(screen.getByText("VPN access restored.")).toBeInTheDocument();
    expect(screen.getByText(/RESOLVED → REOPENED/)).toBeInTheDocument();
    expect(screen.getByText(/This does not change the formal ticket status/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Next status")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Update status" })).not.toBeInTheDocument();
  });
});
