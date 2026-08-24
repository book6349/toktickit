import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("Lab 2 requester context", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.spyOn(api, "getActiveRequesters").mockResolvedValue([
      { id: 1, name: "Ariya Somchai", email: "ariya@example.com" },
    ]);
    vi.spyOn(api, "getReferenceData").mockResolvedValue({
      categories: [{ id: 2, name: "Hardware" }],
      relatedSystems: [{ id: 3, name: "VPN" }],
    });
    vi.spyOn(api, "listTickets").mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("selects an active requester and persists the session context", async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByRole("option", { name: /Ariya Somchai/i })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Requester"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "My tickets" })).toBeInTheDocument());
    expect(window.sessionStorage.getItem("toktickit.requesterId")).toBe("1");
  });
});
