import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminWorkspace } from "../../src/admin.js";
import * as api from "../../src/api.js";

const admin = {
  id: 1,
  name: "Admin User",
  email: "admin@example.com",
  role: "ADMINISTRATOR" as const,
  isActive: true,
  mustChangePassword: false,
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

const requester = {
  id: 2,
  name: "Ariya Somchai",
  email: "ariya@example.com",
  role: "REQUESTER" as const,
  isActive: true,
  mustChangePassword: true,
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

describe("Lab 3 Administrator User Management", () => {
  beforeEach(() => {
    vi.spyOn(api, "listAdminUsers").mockResolvedValue([admin, requester]);
  });

  afterEach(() => vi.restoreAllMocks());

  it("lists users, applies search and role filters, and keeps the direct detail entry point", async () => {
    const list = vi.mocked(api.listAdminUsers);
    render(<AdminWorkspace user={admin} onLogout={vi.fn()} />);

    await waitFor(() => expect(screen.getByRole("heading", { name: "User Management" })).toBeInTheDocument());
    expect(screen.getByText("Ariya Somchai")).toBeInTheDocument();
    expect(screen.getAllByText("Requester").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Administrator workspace" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search users"), { target: { value: "Ariya" } });
    fireEvent.change(screen.getByLabelText("Filter by role"), { target: { value: "REQUESTER" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(list).toHaveBeenLastCalledWith({ search: "Ariya", role: "REQUESTER" }));
  });

  it("creates a user with clear initial-password behavior", async () => {
    const created = { ...requester, id: 3, name: "New Staff", email: "new.staff@example.com", role: "IT_STAFF" as const };
    const create = vi.spyOn(api, "createAdminUser").mockResolvedValue(created);
    render(<AdminWorkspace user={admin} onLogout={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Create user" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Create user" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "New Staff" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new.staff@example.com" } });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "IT_STAFF" } });
    fireEvent.change(screen.getByLabelText("Initial password"), { target: { value: "Local-password-2026" } });
    fireEvent.click(screen.getByRole("button", { name: "Create user" }));
    await waitFor(() => expect(create).toHaveBeenCalledWith({ name: "New Staff", email: "new.staff@example.com", role: "IT_STAFF", isActive: true, initialPassword: "Local-password-2026" }));
  });

  it("edits an account and exposes reset initial password as a separate action", async () => {
    const updated = { ...requester, isActive: false };
    const update = vi.spyOn(api, "updateAdminUser").mockResolvedValue(updated);
    const reset = vi.spyOn(api, "resetAdminInitialPassword").mockResolvedValue({ ...requester, mustChangePassword: true });
    render(<AdminWorkspace user={admin} onLogout={vi.fn()} />);
    await waitFor(() => expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(2));
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[1]);
    expect(screen.getByRole("heading", { name: "Edit user" })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Active account"));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(update).toHaveBeenCalledWith(2, expect.objectContaining({ isActive: false })));

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[1]);
    await waitFor(() => expect(screen.getByLabelText("New initial password")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("New initial password"), { target: { value: "Reset-password-2026" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));
    await waitFor(() => expect(reset).toHaveBeenCalledWith(2, "Reset-password-2026"));
  });
});
