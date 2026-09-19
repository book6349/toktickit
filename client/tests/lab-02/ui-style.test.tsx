import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";
import "../../src/styles.css";

const stylesheet = readFileSync(join(process.cwd(), "src", "styles.css"), "utf8");

describe("Lab 2 Zen Green UI conventions", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.spyOn(api, "getActiveRequesters").mockResolvedValue([
      { id: 1, name: "Ariya Somchai", email: "ariya@example.com" },
    ]);
    vi.spyOn(api, "getReferenceData").mockResolvedValue({
      categories: [{ id: 1, name: "Hardware" }],
      relatedSystems: [{ id: 1, name: "Corporate Laptop" }],
    });
    vi.spyOn(api, "listTickets").mockResolvedValue({
      items: [],
      pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0, hasPrevious: false, hasNext: false },
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("exposes the required theme tokens and visible button hierarchy", async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByRole("option", { name: /Ariya Somchai/i })).toBeInTheDocument());
    expect(stylesheet).toContain("--zen-green-800: #006b3c");
    expect(stylesheet).toContain("--zen-green-600: #0b7a46");
    expect(stylesheet).toContain("--zen-green-100: #eaf6ef");
    expect(stylesheet).toContain("--canvas: #f5f7f6");
    expect(screen.getByRole("button", { name: "Continue" })).toHaveClass("primary-button");
    expect(screen.getByRole("button", { name: "Check System" })).toHaveClass("secondary-button");
    expect(screen.getByLabelText("Requester")).toBeRequired();
  });

  it("keeps active navigation and focusable labeled controls visible", async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByRole("option", { name: /Ariya Somchai/i })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Requester"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "My tickets" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "My Tickets" })).toHaveClass("nav-link", "active");
    fireEvent.click(screen.getByRole("button", { name: "Create Ticket" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Create a ticket" })).toBeInTheDocument());
    expect(screen.getByLabelText("Category")).toBeVisible();
    expect(screen.getByLabelText("Description")).toBeVisible();
    expect(screen.getByRole("button", { name: "Submit ticket" })).toHaveClass("primary-button");
  });
});
