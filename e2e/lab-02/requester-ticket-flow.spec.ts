import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const screenshotRoot = path.resolve("artifacts/lab-02/screenshots");

async function chooseRequester(page: import("@playwright/test").Page, requesterId: string) {
  await page.goto("/");
  await page.locator("#requester").selectOption(requesterId);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "My tickets" })).toBeVisible();
}

async function capture(page: import("@playwright/test").Page, screenName: string, viewportName: string, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const target = path.join(screenshotRoot, screenName, `${viewportName}.png`);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await page.screenshot({ path: target, fullPage: false });
}

test.describe.configure({ mode: "serial" });

test.describe("Lab 2 requester ticket flow", () => {
  test("creates, lists, inspects, and manages an owned ticket", async ({ page }) => {
    await chooseRequester(page, "1");
    await page.getByRole("button", { name: "Create Ticket" }).click();
    await page.locator("#categoryId").selectOption("1");
    await page.locator("#relatedSystemId").selectOption("1");
    await page.locator("#requestedPriority").selectOption("HIGH");
    const summary = `Playwright DB smoke ${Date.now()}`;
    await page.locator("#summary").fill(summary);
    await page.locator("#description").fill("Verify the complete requester ticket flow against the Docker-backed PostgreSQL database.");
    await page.locator("#attachments").setInputFiles({ name: "initial.png", mimeType: "image/png", buffer: Buffer.from("initial attachment") });
    await page.getByRole("button", { name: "Submit ticket" }).click();

    const success = page.getByRole("status").filter({ hasText: "was created" });
    await expect(success).toBeVisible();
    const ticketNumber = (await success.innerText()).match(/Ticket\s+([^ ]+)\s+was created/)?.[1];
    expect(ticketNumber).toBeTruthy();
    await page.getByRole("button", { name: "View ticket" }).click();
    await expect(page.getByRole("heading", { name: summary })).toBeVisible();
    await expect(page.getByText("initial.png", { exact: true })).toBeVisible();

    await page.locator("#detail-upload").setInputFiles({ name: "follow-up.png", mimeType: "image/png", buffer: Buffer.from("follow-up attachment") });
    await expect(page.getByText("follow-up.png", { exact: true })).toBeVisible();

    const initialRow = page.locator(".attachment-list li", { hasText: "initial.png" });
    const downloadPromise = page.waitForEvent("download");
    await initialRow.getByRole("button", { name: "Download" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("attachment.png");

    await initialRow.getByRole("button", { name: "Remove" }).click();
    await page.locator("input[id^='remove-reason-']").first().fill("No longer needed");
    await page.getByRole("button", { name: "Confirm removal" }).click();
    await expect(initialRow).toContainText("Removed");
    await expect(initialRow.getByRole("button", { name: "Download" })).toHaveCount(0);

    await page.getByRole("button", { name: /Back to My Tickets/ }).click();
    await expect(page.getByText(ticketNumber!, { exact: true })).toBeVisible();
    await capture(page, "my-tickets", "desktop-1280x900", 1280, 900);
    await page.getByRole("button", { name: "Create Ticket" }).click();
    await capture(page, "create-ticket", "desktop-1280x900", 1280, 900);
    await capture(page, "create-ticket", "tablet-900x900", 900, 900);
    await capture(page, "create-ticket", "mobile-390x844", 390, 844);
    await page.getByRole("button", { name: "My Tickets" }).click();
    await capture(page, "my-tickets", "tablet-900x900", 900, 900);
    await capture(page, "my-tickets", "mobile-390x844", 390, 844);
    await page.getByText(ticketNumber!, { exact: true }).click();
    await capture(page, "ticket-detail", "desktop-1280x900", 1280, 900);
    await capture(page, "ticket-detail", "tablet-900x900", 900, 900);
    await capture(page, "ticket-detail", "mobile-390x844", 390, 844);

    await page.getByRole("button", { name: "Change requester" }).click();
    await page.locator("#requester").selectOption("2");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "My tickets" })).toBeVisible();
    await expect(page.getByText(ticketNumber!, { exact: true })).toHaveCount(0);
  });

  test("supports keyboard traversal across the requester gate, filters, detail, and attachment controls", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#requester")).toBeVisible();
    await page.locator("#requester").focus();
    await expect(page.locator("#requester")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Continue" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Check System" })).toBeFocused();

    await page.locator("#requester").selectOption("1");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "My tickets" })).toBeVisible();
    await page.getByRole("button", { name: "Create Ticket" }).click();
    const controls = ["#categoryId", "#relatedSystemId", "#requestedPriority", "#summary", "#description", "#attachments"];
    for (const selector of controls) {
      await page.locator(selector).focus();
      await expect(page.locator(selector)).toBeFocused();
    }
    await expect(page.getByRole("button", { name: "Submit ticket" })).toBeVisible();

    await page.getByRole("button", { name: "My Tickets" }).click();
    const filterControls = [
      "#ticket-search",
      "#ticket-category",
      "#ticket-priority",
      "#ticket-status",
      "#ticket-sort",
      "#ticket-sort-direction",
      "#ticket-page-size",
    ];
    for (const selector of filterControls) {
      await page.locator(selector).focus();
      await expect(page.locator(selector)).toBeFocused();
    }
    await page.getByRole("button", { name: "Apply filters" }).focus();
    await expect(page.getByRole("button", { name: "Apply filters" })).toBeFocused();
    await page.getByRole("button", { name: "Clear filters" }).focus();
    await expect(page.getByRole("button", { name: "Clear filters" })).toBeFocused();

    const firstTicket = page.locator(".ticket-row").first();
    await expect(firstTicket).toBeVisible();
    await firstTicket.focus();
    await expect(firstTicket).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#detail-heading")).toBeVisible();
    await page.locator("#detail-upload").focus();
    await expect(page.locator("#detail-upload")).toBeFocused();
    const downloadButton = page.getByRole("button", { name: "Download" }).first();
    const removeButton = page.getByRole("button", { name: "Remove" }).first();
    if (await downloadButton.count()) {
      await downloadButton.focus();
      await expect(downloadButton).toBeFocused();
    }
    if (await removeButton.count()) {
      await removeButton.focus();
      await expect(removeButton).toBeFocused();
    }
  });
});
