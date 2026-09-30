import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";
import "../../src/styles.css";

const stylesheet = readFileSync(join(process.cwd(), "src", "styles.css"), "utf8");

describe("Lab 3 Zen Green styling and responsive rules", () => {
  beforeEach(() => {
    vi.spyOn(api, "getCurrentUser").mockRejectedValue({ status: 401 });
  });

  afterEach(() => vi.restoreAllMocks());

  it("defines the documented palette, visible focus treatment, and mobile layout", () => {
    expect(stylesheet).toContain("--zen-green-800: #006b3c");
    expect(stylesheet).toContain("--zen-green-600: #0b7a46");
    expect(stylesheet).toContain("--zen-green-100: #eaf6ef");
    expect(stylesheet).toContain("--canvas: #f5f7f6");
    expect(stylesheet).toMatch(/button:focus-visible\s*\{[^}]*outline:\s*3px solid/s);
    expect(stylesheet).toMatch(/@media\s*\(max-width:\s*700px\)/);
    expect(stylesheet).toContain(".form-grid, .filter-bar, .detail-grid, .staff-control-grid, .user-filter-bar { grid-template-columns: 1fr;");
  });

  it("renders accessible sign-in controls with the primary action hierarchy", async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument());

    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(screen.getByLabelText("Password")).toBeVisible();
    expect(screen.getByRole("button", { name: "Sign in" })).toHaveClass("primary-button");
  });
});
