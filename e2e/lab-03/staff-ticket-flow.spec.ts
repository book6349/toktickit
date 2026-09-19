import { expect, test } from "@playwright/test";
import { captureRequiredViewports, changedPassword, signInAndUnlock, staffEmail } from "./fixtures";

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
});
