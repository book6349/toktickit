import { expect, Locator, Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const evidenceViewports = [
  { name: "desktop-1280x900", width: 1280, height: 900 },
  { name: "tablet-900x900", width: 900, height: 900 },
  { name: "mobile-390x844", width: 390, height: 844 },
];

export async function captureLab4Evidence(page: Page, screen: string, state: string, anchor?: Locator) {
  const original = page.viewportSize() ?? { width: 1280, height: 900 };
  const originalScroll = await page.evaluate(() => window.scrollY);
  const directory = path.resolve("artifacts/lab-04/screenshots", screen);
  await mkdir(directory, { recursive: true });

  try {
    for (const viewport of evidenceViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      if (anchor) await anchor.scrollIntoViewIfNeeded();
      const widths = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(widths.scroll, `${screen}/${state} overflows horizontally at ${viewport.name}`).toBeLessThanOrEqual(widths.client);
      await page.screenshot({
        path: path.join(directory, `${state}-${viewport.name}.png`),
        fullPage: false,
      });
    }
  } finally {
    await page.setViewportSize(original);
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), originalScroll);
  }
}
