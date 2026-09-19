import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

const signedInUser = {
  id: 1,
  name: "Ariya Somchai",
  email: "ariya.somchai@example.com",
  role: "REQUESTER" as const,
  isActive: true,
  mustChangePassword: false,
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

describe("Lab 3 Login", () => {
  beforeEach(() => {
    vi.spyOn(api, "getReferenceData").mockResolvedValue({ categories: [], relatedSystems: [] });
    vi.spyOn(api, "listTickets").mockResolvedValue({ items: [], pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0, hasPrevious: false, hasNext: false } });
  });
  afterEach(() => vi.restoreAllMocks());

  it("shows the login form and enters the authenticated Requester shell without a selector", async () => {
    vi.spyOn(api, "getCurrentUser").mockRejectedValue({ status: 401 });
    const login = vi.spyOn(api, "login").mockResolvedValue({ user: signedInUser, mustChangePassword: false });
    render(<App />);
    await waitFor(() => expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: signedInUser.email } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Local-development-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "My tickets" })).toBeInTheDocument());
    expect(login).toHaveBeenCalledWith(signedInUser.email, "Local-development-password");
    expect(screen.queryByLabelText("Requester")).not.toBeInTheDocument();
    expect(screen.getByText(/Ariya Somchai · REQUESTER/)).toBeInTheDocument();
  });

  it("shows a safe login failure", async () => {
    vi.spyOn(api, "getCurrentUser").mockRejectedValue({ status: 401 });
    vi.spyOn(api, "login").mockRejectedValue(new Error("Email or password is incorrect."));
    render(<App />);
    await waitFor(() => expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "wrong@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Email or password is incorrect."));
  });
});
