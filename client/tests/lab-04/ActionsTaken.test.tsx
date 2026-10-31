import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ActionsTakenPanel } from "../../src/ActionsTaken.js";
import * as api from "../../src/api.js";

const requesterRole = "REQUESTER" as const;
const staffRole = "IT_STAFF" as const;
const adminRole = "ADMINISTRATOR" as const;

function makeAction(id: number, overrides: Partial<api.ActionTaken> = {}): api.ActionTaken {
  return {
    id,
    ticketId: 10,
    actionDateTime: `2026-10-0${id}T10:00:00.000Z`,
    description: `Action ${id}`,
    result: `Result ${id}`,
    performedBy: { id: 7, name: "Niran Staff" },
    assignee: { id: 8, name: "Admin User" },
    status: "PLANNED",
    followUpRequired: false,
    followUpNote: null,
    attachmentNotes: null,
    version: 1,
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-01T10:00:00.000Z",
    ...overrides,
  };
}

const assignees = [
  { id: 7, name: "Niran Staff" },
  { id: 8, name: "Admin User" },
];

describe("Lab 4 Actions Taken UI", () => {
  beforeEach(() => {
    vi.spyOn(api, "getActionsTaken").mockResolvedValue({ items: [], ticketId: 10, readOnly: false });
    vi.spyOn(api, "getActionAssignees").mockResolvedValue(assignees);
  });

  afterEach(() => vi.restoreAllMocks());

  it("shows multiple actions in order with performer and assignee clearly separated for a Requester", async () => {
    vi.mocked(api.getActionsTaken).mockResolvedValue({
      items: [
        makeAction(1, { actionDateTime: "2026-10-01T10:00:00.000Z", followUpRequired: true, followUpNote: "Call tomorrow", attachmentNotes: "Photo of serial label" }),
        makeAction(2, { actionDateTime: "2026-10-02T10:00:00.000Z", status: "COMPLETED" }),
      ],
      ticketId: 10,
      readOnly: true,
    });
    render(<ActionsTakenPanel ticketId={10} role={requesterRole} />);

    expect(await screen.findByText("Action 1")).toBeInTheDocument();
    expect(screen.getByText("Action 2")).toBeInTheDocument();
    const firstAction = screen.getByRole("article", { name: "Action 1: PLANNED" });
    expect(within(firstAction).getByText("Performed by").parentElement).toHaveTextContent("Niran Staff");
    expect(within(firstAction).getByText("Assigned to").parentElement).toHaveTextContent("Admin User");
    expect(screen.getByText("Call tomorrow")).toBeInTheDocument();
    expect(screen.getByText("Photo of serial label")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Action" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit action" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Update status" })).not.toBeInTheDocument();
    const rows = screen.getByRole("list").querySelectorAll(".action-card");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Action 1");
    expect(rows[1]).toHaveTextContent("Action 2");
  });

  it("announces loading and shows the empty state after the list request completes", async () => {
    let resolveList!: (value: Awaited<ReturnType<typeof api.getActionsTaken>>) => void;
    vi.mocked(api.getActionsTaken).mockImplementation(() => new Promise((resolve) => { resolveList = resolve; }));
    render(<ActionsTakenPanel ticketId={10} role={requesterRole} />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading Actions Taken");
    await act(async () => resolveList({ items: [], ticketId: 10, readOnly: true }));
    expect(await screen.findByText("No Actions Taken yet")).toBeInTheDocument();
  });

  it("announces assignee loading and keeps Save disabled until valid choices arrive", async () => {
    let resolveAssignees!: (value: api.ActionAssignee[]) => void;
    vi.mocked(api.getActionAssignees).mockImplementation(() => new Promise((resolve) => { resolveAssignees = resolve; }));
    render(<ActionsTakenPanel ticketId={10} role={staffRole} />);

    await screen.findByText("No Actions Taken yet");
    fireEvent.click(screen.getByRole("button", { name: "Add Action" }));
    expect(screen.getByRole("status")).toHaveTextContent("Loading eligible assignees");
    expect(screen.getByRole("button", { name: "Save action" })).toBeDisabled();
    await act(async () => resolveAssignees(assignees));
    expect(screen.getByRole("button", { name: "Save action" })).toBeEnabled();
  });

  it("handles a not-found read safely and offers a working retry", async () => {
    const getActions = vi.mocked(api.getActionsTaken)
      .mockRejectedValueOnce(Object.assign(new Error("Ticket not found."), { status: 404 }))
      .mockResolvedValue({ items: [], ticketId: 10, readOnly: true });
    render(<ActionsTakenPanel ticketId={10} role={requesterRole} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Ticket not found.");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("No Actions Taken yet")).toBeInTheDocument();
    expect(getActions).toHaveBeenCalledTimes(2);
  });

  it.each([staffRole, adminRole])("lets %s create distinct actions with an offset, conditional follow-up and idempotency key", async (role) => {
    const created = makeAction(3, { description: "Replace power adapter", result: "Replacement scheduled", followUpRequired: true, followUpNote: "Confirm delivery" });
    const create = vi.spyOn(api, "createActionTaken").mockResolvedValue(created);
    render(<ActionsTakenPanel ticketId={10} role={role} />);

    await screen.findByText("No Actions Taken yet");
    fireEvent.click(screen.getByRole("button", { name: "Add Action" }));
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Replace power adapter" } });
    fireEvent.change(screen.getByLabelText("Result"), { target: { value: "Replacement scheduled" } });
    fireEvent.change(screen.getByLabelText("Assignee"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("Follow-up required?"), { target: { value: "yes" } });
    fireEvent.change(screen.getByLabelText("Follow-up note"), { target: { value: "Confirm delivery" } });
    fireEvent.change(screen.getByLabelText(/Attachment notes/), { target: { value: "Quote is attached to the Ticket" } });
    fireEvent.click(screen.getByRole("button", { name: "Save action" }));

    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    const [ticketId, payload, key] = create.mock.calls[0];
    expect(ticketId).toBe(10);
    expect(payload).toMatchObject({
      description: "Replace power adapter",
      result: "Replacement scheduled",
      assigneeId: 8,
      status: "PLANNED",
      followUpRequired: true,
      followUpNote: "Confirm delivery",
      attachmentNotes: "Quote is attached to the Ticket",
    });
    expect(payload.actionDateTime).toMatch(/[+-]\d{2}:\d{2}$/);
    expect(key).toBeTruthy();
    expect(await screen.findByRole("status")).toHaveTextContent("Action added to the Ticket.");
    expect(screen.getByText("Replace power adapter")).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "Record an action" })).not.toBeInTheDocument();
  });

  it("keeps form values and focuses invalid input after a server validation error", async () => {
    const error = Object.assign(new Error("Check the action fields."), {
      status: 422,
      code: "VALIDATION_ERROR",
      fields: { description: "Enter 1–2000 characters." },
    });
    vi.spyOn(api, "createActionTaken").mockRejectedValue(error);
    render(<ActionsTakenPanel ticketId={10} role={staffRole} />);

    await screen.findByText("No Actions Taken yet");
    fireEvent.click(screen.getByRole("button", { name: "Add Action" }));
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Keep this draft" } });
    fireEvent.change(screen.getByLabelText("Result"), { target: { value: "Still waiting" } });
    fireEvent.change(screen.getByLabelText("Assignee"), { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: "Save action" }));

    expect(await screen.findAllByText("Enter 1–2000 characters.")).toHaveLength(2);
    expect(screen.getByLabelText("Description")).toHaveValue("Keep this draft");
    expect(screen.getByLabelText("Result")).toHaveValue("Still waiting");
    await waitFor(() => expect(screen.getByLabelText("Description")).toHaveFocus());
  });

  it("explains forbidden writes and keeps the Staff form available for correction or retry", async () => {
    vi.spyOn(api, "createActionTaken").mockRejectedValue(Object.assign(new Error("Forbidden"), { status: 403 }));
    render(<ActionsTakenPanel ticketId={10} role={staffRole} />);

    await screen.findByText("No Actions Taken yet");
    fireEvent.click(screen.getByRole("button", { name: "Add Action" }));
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Keep this after forbidden" } });
    fireEvent.change(screen.getByLabelText("Result"), { target: { value: "No write occurred" } });
    fireEvent.change(screen.getByLabelText("Assignee"), { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: "Save action" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("You don’t have permission to change Actions Taken on this Ticket.");
    expect(screen.getByLabelText("Description")).toHaveValue("Keep this after forbidden");
    expect(screen.getByLabelText("Result")).toHaveValue("No write occurred");
  });

  it("shows a safe API failure and retains the unsaved action details", async () => {
    vi.spyOn(api, "createActionTaken").mockRejectedValue(Object.assign(new Error("Unable to complete the action request."), { status: 500 }));
    render(<ActionsTakenPanel ticketId={10} role={staffRole} />);

    await screen.findByText("No Actions Taken yet");
    fireEvent.click(screen.getByRole("button", { name: "Add Action" }));
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Keep this after server failure" } });
    fireEvent.change(screen.getByLabelText("Result"), { target: { value: "Retry after recovery" } });
    fireEvent.change(screen.getByLabelText("Assignee"), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Save action" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to complete the action request.");
    expect(screen.getByLabelText("Description")).toHaveValue("Keep this after server failure");
    expect(screen.getByLabelText("Result")).toHaveValue("Retry after recovery");
  });

  it("edits an in-progress action with its version and never offers edit for terminal actions", async () => {
    vi.mocked(api.getActionsTaken).mockResolvedValue({
      items: [
        makeAction(4, { status: "IN_PROGRESS", version: 3 }),
        makeAction(5, { status: "COMPLETED" }),
      ],
      ticketId: 10,
      readOnly: false,
    });
    const update = vi.spyOn(api, "updateActionTaken").mockResolvedValue(makeAction(4, { description: "Updated action", status: "IN_PROGRESS", version: 4 }));
    render(<ActionsTakenPanel ticketId={10} role={adminRole} />);

    await screen.findByText("Action 4");
    const actionCard = screen.getByRole("article", { name: "Action 4: IN_PROGRESS" });
    fireEvent.click(within(actionCard).getByRole("button", { name: "Edit action" }));
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Updated action" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(update).toHaveBeenCalledOnce());
    expect(update.mock.calls[0][0]).toBe(10);
    expect(update.mock.calls[0][1]).toBe(4);
    expect(update.mock.calls[0][2]).toBe(3);
    expect(update.mock.calls[0][3]).toMatchObject({ description: "Updated action" });
    expect(update.mock.calls[0][3]).not.toHaveProperty("status");
    expect(screen.getByRole("article", { name: "Action 5: COMPLETED" })).not.toHaveTextContent("Edit action");
  });

  it("confirms terminal transitions and refreshes instead of silently overwriting a conflict", async () => {
    vi.mocked(api.getActionsTaken).mockResolvedValue({ items: [makeAction(6)], ticketId: 10, readOnly: false });
    const updateStatus = vi.spyOn(api, "changeActionTakenStatus").mockRejectedValue(Object.assign(new Error("The action changed."), { status: 409 }));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<ActionsTakenPanel ticketId={10} role={staffRole} />);

    const card = await screen.findByRole("article", { name: "Action 6: PLANNED" });
    fireEvent.change(within(card).getByLabelText("Next status for action 6"), { target: { value: "COMPLETED" } });
    fireEvent.click(within(card).getByRole("button", { name: "Update status" }));
    await waitFor(() => expect(updateStatus).toHaveBeenCalledWith(10, 6, 1, "COMPLETED"));
    expect(confirm).toHaveBeenCalled();
    fireEvent.click(await screen.findByRole("button", { name: "Refresh current actions" }));
    await waitFor(() => expect(api.getActionsTaken).toHaveBeenCalledTimes(2));
  });
});
