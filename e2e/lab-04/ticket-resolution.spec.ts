import { expect, test } from "@playwright/test";
import { apiBaseURL, changedPassword, requesterEmail, signInAndUnlock, staffEmail } from "../lab-03/fixtures";

test.describe("Lab 4 Ticket resolution workflow", () => {
  test("resolves, closes, and reopens a Ticket with a Requester-readable history", async ({ page }) => {
    const summary = `Lab 4 workflow ${Date.now()}`;

    await signInAndUnlock(page, requesterEmail, changedPassword);
    await page.getByRole("button", { name: "Create Ticket" }).click();
    await page.getByLabel("Category").selectOption({ label: "Hardware" });
    await page.getByLabel("Related system").selectOption({ label: "Corporate Laptop" });
    await page.getByLabel("Summary").fill(summary);
    await page.getByLabel("Description").fill("Ticket created for the isolated Lab 4 resolution workflow journey.");
    const createResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/tickets") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Submit ticket" }).click();
    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBe(true);
    const created = (await createResponse.json()).ticket as { id: number };
    expect(created.id).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Log out" }).click();

    await signInAndUnlock(page, staffEmail, changedPassword);
    await page.getByLabel("Search tickets").fill(summary);
    await page.getByRole("button", { name: "Apply filters" }).click();
    const ticketRow = page.locator(".staff-ticket-row").filter({ hasText: summary });
    await expect(ticketRow).toBeVisible();
    await ticketRow.getByRole("button", { name: "Open Detail" }).click();

    await page.getByLabel("Next status").selectOption("OPEN");
    await page.getByRole("button", { name: "Update status" }).click();
    await expect(page.getByText("Status updated.", { exact: true })).toBeVisible();

    await page.getByLabel("Next status").selectOption("RESOLVED");
    await expect(page.getByText(/Completed actions: 0\. Pending actions: 0\./)).toBeVisible();
    await expect(page.getByRole("button", { name: "Update status" })).toBeDisabled();
    await expect(page.getByRole("link", { name: "Review Actions Taken" })).toBeVisible();

    await page.getByRole("button", { name: "Add Action" }).click();
    await page.getByLabel("Description").fill("Restore the wireless adapter configuration");
    await page.getByLabel("Result").fill("The correct adapter profile was restored and verified.");
    await page.getByLabel("Assignee").selectOption({ label: "Somchai Staff" });
    await page.getByLabel("Action status").selectOption("COMPLETED");
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Save action" }).click();
    await expect(page.locator(".actions-taken-panel [role='status']")).toContainText("Action added to the Ticket.");
    await expect(page.getByText(/Completed actions: 1\. Pending actions: 0\./)).toBeVisible();

    await page.getByLabel("Resolution summary").fill("Wireless access restored and verified with the Requester.");
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Update status" }).click();
    await expect(page.getByText("Status updated.", { exact: true })).toBeVisible();
    await expect(page.getByText("Wireless access restored and verified with the Requester.", { exact: true })).toBeVisible();

    await page.getByLabel("Next status").selectOption("CLOSED");
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Update status" }).click();
    await expect(page.locator('section[aria-labelledby="staff-detail-heading"] .status-pill').first()).toHaveText("CLOSED");

    await page.getByLabel("Next status").selectOption("REOPENED");
    await page.getByLabel("Reason for reopening").fill("The wireless connection dropped again during follow-up.");
    await page.getByRole("button", { name: "Update status" }).click();
    await expect(page.locator('section[aria-labelledby="staff-detail-heading"] .status-pill').first()).toHaveText("REOPENED");
    await page.getByRole("button", { name: "Log out" }).click();

    await signInAndUnlock(page, requesterEmail, changedPassword);
    await page.getByLabel("Search tickets").fill(summary);
    await page.getByRole("button", { name: "Apply filters" }).click();
    await page.getByRole("button", { name: new RegExp(summary) }).click();
    await expect(page.getByRole("heading", { name: "Formal resolution" })).toBeVisible();
    await expect(page.locator(".workflow-event-list")).toContainText("RESOLVED → CLOSED");
    await expect(page.locator(".workflow-event-list")).toContainText("CLOSED → REOPENED");
    await expect(page.locator(".workflow-event-list")).toContainText("Wireless access restored and verified with the Requester.");
    await expect(page.getByText("The wireless connection dropped again during follow-up.")).toHaveCount(0);
    await expect(page.getByLabel("Next status")).toHaveCount(0);

    const forbiddenWrite = await page.evaluate(async ({ apiBaseURL, ticketId }) => {
      const csrfResponse = await fetch(`${apiBaseURL}/api/auth/csrf`, { credentials: "include" });
      const { csrfToken } = await csrfResponse.json();
      const response = await fetch(`${apiBaseURL}/api/staff/tickets/${ticketId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ status: "CLOSED", expectedVersion: 6, confirm: true }),
      });
      return response.status;
    }, { apiBaseURL, ticketId: created.id });
    expect(forbiddenWrite).toBe(403);
  });
});
