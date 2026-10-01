import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../../src/App.js";
import * as api from "../../src/api.js";

describe("App", () => {
  // WORKED EXAMPLE — provided for you.
  it("renders the TokTickIT sign-in heading after checking the session", async () => {
    vi.spyOn(api, "getCurrentUser").mockRejectedValue({ status: 401 });
    render(<App />);
    expect(await screen.findByRole("heading", { name: /TokTickIT.*Sign in/i })).toBeInTheDocument();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retains the system-health API and seeded categories after the shell migration", async () => {
    const categories = [
        { id: 1, name: "Account and Access" },
        { id: 2, name: "Hardware" },
        { id: 3, name: "Software" },
        { id: 4, name: "Network" },
    ];
    const fetch = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: "ok" })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ categories })));
    expect(await api.checkSystem()).toEqual({ online: true, categories });
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      "http://localhost:3000/api/health", "http://localhost:3000/api/categories",
    ]);
  });

  it("retains a safe system-health error when the API is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("Unavailable", { status: 503 }));
    await expect(api.checkSystem()).rejects.toThrow("Unable to connect to TokTickIT API");
  });
});
