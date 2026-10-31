import { expect, test } from "@playwright/test";
import { requesterEmail, signInAndUnlock, staffEmail } from "../lab-03/fixtures";

test.describe("Lab 4 role dashboards", () => {
  test("shows Requester and Staff metrics and opens the matching paginated Ticket lists", async ({ page }) => {
    const summary = `Dashboard drill-down ${Date.now()}`;

    await signInAndUnlock(page, requesterEmail);
    await page.getByRole("button", { name: "Create Ticket" }).click();
    await page.getByLabel("Category").selectOption({ label: "Hardware" });
    await page.getByLabel("Related system").selectOption({ label: "Corporate Laptop" });
    await page.getByLabel("Summary").fill(summary);
    await page.getByLabel("Description").fill("Ticket created to verify role dashboard values and matching drill-down results.");
    const createResponsePromise = page.waitForResponse((response) => response.url().endsWith("/api/tickets") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Submit ticket" }).click();
    const createdResponse = await createResponsePromise;
    expect(createdResponse.ok()).toBe(true);
    const ticketId = Number((await createdResponse.json()).ticket.id);
    expect(ticketId).toBeGreaterThan(0);

    const requesterDashboardResponsePromise = page.waitForResponse((response) => response.url().includes("/api/requester/dashboard"));
    await page.getByRole("button", { name: "Dashboard" }).click();
    const requesterDashboardResponse = await requesterDashboardResponsePromise;
    expect(requesterDashboardResponse.ok()).toBe(true);
    const requesterMetrics = (await requesterDashboardResponse.json()).metrics;
    expect(requesterMetrics.openTickets.count).toBeGreaterThan(0);
    const requesterDrilldownPromise = page.waitForResponse((response) => response.url().includes("/api/tickets?") && response.url().includes("statusGroup=active"));
    await page.getByRole("button", { name: /^Open Tickets:/ }).click();
    const requesterDrilldown = await requesterDrilldownPromise;
    const requesterRows = await requesterDrilldown.json();
    expect(requesterRows.pagination.totalItems).toBeGreaterThan(0);
    expect(requesterRows.items.some((ticket: { id: number }) => ticket.id === ticketId)).toBe(true);
    await expect(page.getByRole("button", { name: new RegExp(`Open Ticket .*${summary}`) })).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await signInAndUnlock(page, staffEmail);
    const staffDashboardResponsePromise = page.waitForResponse((response) => response.url().includes("/api/staff/dashboard") && !response.url().includes("/tickets"));
    await page.getByRole("button", { name: "Dashboard" }).click();
    const staffDashboardResponse = await staffDashboardResponsePromise;
    expect(staffDashboardResponse.ok()).toBe(true);
    const staffMetrics = (await staffDashboardResponse.json()).metrics;
    expect(staffMetrics.unassignedActive.count).toBeGreaterThan(0);
    const staffDrilldownPromise = page.waitForResponse((response) => response.url().includes("/api/staff/dashboard/tickets?") && response.url().includes("ownership=unassigned"));
    await page.getByRole("button", { name: /^Unassigned active:/ }).click();
    const staffDrilldown = await staffDrilldownPromise;
    const staffRows = await staffDrilldown.json();
    expect(staffRows.items.some((ticket: { id: number }) => ticket.id === ticketId)).toBe(true);
    await expect(page.getByRole("button", { name: new RegExp(`Open Ticket .*${summary}`) })).toBeVisible();
  });
});
