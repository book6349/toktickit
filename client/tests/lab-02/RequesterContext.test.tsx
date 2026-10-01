import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";
import { mockRequesterSession } from "../lab-03/regression-fixtures.js";

describe("Lab 2 requester context", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockRequesterSession();
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
    window.sessionStorage.clear();
  });

  it("restores the authenticated Requester and ignores stale development-selector state", async () => {
    window.sessionStorage.setItem("toktickit.requesterId", "999");
    render(<App />);
    expect(await screen.findByRole("heading", { name: "My tickets" })).toBeInTheDocument();
    expect(screen.getByText("Ariya Somchai · REQUESTER")).toBeInTheDocument();
    expect(screen.queryByLabelText("Requester")).not.toBeInTheDocument();
    expect(api.getActiveRequesters).not.toHaveBeenCalled();
    expect(api.listTickets).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });
});
