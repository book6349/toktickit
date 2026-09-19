import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

const initialUser = {
  id: 1,
  name: "Ariya Somchai",
  email: "ariya.somchai@example.com",
  role: "REQUESTER" as const,
  isActive: true,
  mustChangePassword: true,
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};
const updatedUser = { ...initialUser, mustChangePassword: false };

describe("Lab 3 mandatory Change Password", () => {
  beforeEach(() => {
    vi.spyOn(api, "getReferenceData").mockResolvedValue({ categories: [], relatedSystems: [] });
    vi.spyOn(api, "changePassword").mockResolvedValue({ user: updatedUser, mustChangePassword: false });
  });
  afterEach(() => vi.restoreAllMocks());

  it("blocks the normal shell until a valid replacement password is saved", async () => {
    vi.spyOn(api, "getCurrentUser").mockResolvedValue({ user: initialUser, mustChangePassword: true });
    const changePassword = vi.mocked(api.changePassword);
    render(<App />);
    await waitFor(() => expect(screen.getByRole("heading", { name: /change your password/i })).toBeInTheDocument());
    expect(screen.queryByRole("heading", { name: "My tickets" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Current password"), { target: { value: "Local-development-password" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "New-local-password-2026" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "New-local-password-2026" } });
    fireEvent.click(screen.getByRole("button", { name: "Save password" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "My tickets" })).toBeInTheDocument());
    expect(changePassword).toHaveBeenCalledWith("Local-development-password", "New-local-password-2026");
  });

  it("shows confirmation mismatch and keeps the save action disabled", async () => {
    vi.spyOn(api, "getCurrentUser").mockResolvedValue({ user: initialUser, mustChangePassword: true });
    render(<App />);
    await waitFor(() => expect(screen.getByRole("heading", { name: /change your password/i })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "New-local-password-2026" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "different-password-2026" } });
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save password" })).toBeDisabled();
  });
});
