import { expect, test } from "@playwright/test";
import { captureRequiredViewports, changedPassword, getE2EFixtures, signInAndUnlock, staffEmail } from "./fixtures";

test.describe("Lab 3 IT Staff Queue and Ticket Detail", () => {
  test("IT Staff can search Queue, open Detail, and see separate comments and notes", async ({ page }) => {
    await signInAndUnlock(page, staffEmail);
    await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
    await expect(page.getByLabel("Search tickets")).toBeVisible();
    await page.getByLabel("Search tickets").fill("TT-");
    await page.getByRole("button", { name: "Apply filters" }).click();
    const firstTicket = page.locator(".staff-ticket-row").first();
    await expect(firstTicket).toBeVisible();
    await firstTicket.getByRole("button", { name: "Open Detail" }).click();
    await expect(page.locator('section[aria-labelledby="staff-detail-heading"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Public Comments" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Internal Notes" })).toBeVisible();
    await expect(page.getByLabel("Add a public comment")).toBeVisible();
    await expect(page.getByLabel("Add an Internal Note")).toBeVisible();
    await page.getByRole("button", { name: "Claim as me" }).click();
    await expect(page.getByRole("status")).toContainText("Ticket claimed");
  });

  test("IT Staff Queue and Detail are captured at required responsive sizes", async ({ page }) => {
    await signInAndUnlock(page, staffEmail, changedPassword);
    await captureRequiredViewports(page, "staff-queue", "queue");
    await page.locator(".staff-ticket-row").first().getByRole("button", { name: "Open Detail" }).click();
    await captureRequiredViewports(page, "staff-ticket-detail", "detail");
  });

  test("IT Staff can advance to a populated second Queue page", async ({ page }) => {
    await signInAndUnlock(page, staffEmail, changedPassword);
    await expect(page.getByRole("heading", { name: "Ticket Queue" })).toBeVisible();
    await expect(page.getByText(/^Page 1 of \d+$/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeEnabled();
    const firstPageTicket = await page.locator(".staff-ticket-row").first().innerText();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByText(/^Page 2 of \d+$/)).toBeVisible();
    await expect(page.locator(".staff-ticket-row").first()).not.toHaveText(firstPageTicket);
    await page.screenshot({
      path: "artifacts/lab-03/screenshots/staff-queue/pagination-page-2-1280x900.png",
      fullPage: true,
    });
  });

  test("preserves migrated Attachment and verifies reassignment, priority, and status operations", async ({ page }) => {
    await signInAndUnlock(page, staffEmail, changedPassword);
    await page.getByLabel("Search tickets").fill("TT-DOCKER-PRELAB3-001");
    await page.getByRole("button", { name: "Apply filters" }).click();
    const baselineTicket = page.locator(".staff-ticket-row").filter({ hasText: "TT-DOCKER-PRELAB3-001" });
    await expect(baselineTicket).toBeVisible();
    await baselineTicket.getByRole("button", { name: "Open Detail" }).click();
    await expect(page.locator('section[aria-labelledby="staff-detail-heading"]')).toBeVisible();
    await expect(page.getByText("baseline.txt", { exact: true })).toBeVisible();

    await page.getByLabel("Assign owner ID").fill(String(getE2EFixtures().reassignmentOwnerId));
    await page.getByRole("button", { name: "Assign owner" }).click();
    await expect(page.getByRole("status")).toContainText("Ownership updated.");
    await expect(page.locator(".detail-grid")).toContainText("Kanya Staff");

    await page.getByLabel("IT Priority", { exact: true }).selectOption("LOW");
    await page.getByRole("button", { name: "Save IT Priority" }).click();
    await expect(page.getByRole("status")).toContainText("IT Priority updated.");
    await expect(page.locator(".detail-grid").getByText("LOW", { exact: true })).toBeVisible();

    await page.getByLabel("Next status").selectOption("OPEN");
    await page.getByRole("button", { name: "Update status" }).click();
    await expect(page.getByRole("status")).toContainText("Status updated.");
    await expect(page.locator('section[aria-labelledby="staff-detail-heading"] .status-pill').first()).toHaveText("OPEN");
    await page.screenshot({
      path: "artifacts/lab-03/screenshots/staff-ticket-detail/migration-preservation-operations-1280x900.png",
      fullPage: true,
    });
  });
  test("Staff sees the Requester resolution indication without a formal status change", async ({ page }) => {
    await signInAndUnlock(page, staffEmail, changedPassword);
    await page.getByLabel("Search tickets").fill("E2E request");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page.locator(".staff-ticket-row")).toHaveCount(1);
    await page.getByRole("button", { name: "Open Detail" }).click();
    await expect(page.getByRole("region", { name: "Requester resolution indication" })).toContainText("Formal ticket status is still NEW");
    await expect(page.getByText("Requester indicates that the problem appears resolved.")).toBeVisible();
    await captureRequiredViewports(page, "staff-ticket-detail/requester-resolution", "indication");
  });
});
