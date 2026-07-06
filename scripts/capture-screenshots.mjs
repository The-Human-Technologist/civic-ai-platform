/**
 * Capture website-only PNG screenshots for README / OSS applications.
 * Uses Playwright viewport capture — no browser chrome or OS taskbar.
 *
 * Usage:
 *   npm run dev   (or set SCREENSHOT_BASE_URL to production)
 *   npm run capture:screenshots
 */

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "docs", "screenshots");
const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };

async function ensureOutputDir() {
  await mkdir(OUT_DIR, { recursive: true });
}

async function waitForApp(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(400);
}

async function hideDevChrome(page) {
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-nextjs-toast],
      [data-nextjs-dialog],
      #__next-build-watcher,
      .nextjs-toast-errors-parent {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `,
  });
}

async function capture(page, filename) {
  const path = join(OUT_DIR, filename);
  await page.screenshot({ path, type: "png", fullPage: false });
  console.log(`✓ ${filename}`);
  return path;
}

async function scrollTo(page, y) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(350);
}

async function assertProposalAnchors(page) {
  const anchors = ["#challenges", "#privacy", "#security"];
  for (const href of anchors) {
    await page.locator(`a[href="${href}"]`).first().click();
    await page.waitForTimeout(500);
    const ok = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top >= 48 && rect.top <= 220;
    }, href);
    if (!ok) {
      console.warn(`⚠ Anchor ${href} may not have scrolled into view cleanly`);
    } else {
      console.log(`✓ Anchor ${href} scroll OK`);
    }
  }
  await scrollTo(page, 0);
}

async function assertEventsTableColumns(page) {
  const overlap = await page.evaluate(() => {
    const rows = document.querySelectorAll("[data-slot=table-body] tr");
    if (!rows.length) return null;
    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length < 4) continue;
      const location = cells[2]?.getBoundingClientRect();
      const date = cells[3]?.getBoundingClientRect();
      if (!location || !date) continue;
      if (location.right > date.left + 2) return true;
    }
    return false;
  });
  if (overlap === null) {
    console.log("ℹ Events table not visible at this viewport (mobile cards may be shown)");
  } else if (overlap) {
    console.warn("⚠ Possible location/date column overlap in events table");
  } else {
    console.log("✓ Events table columns do not overlap");
  }
}

async function main() {
  await ensureOutputDir();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: "light",
  });
  const page = await context.newPage();
  await hideDevChrome(page);

  try {
    // 1. Landing
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await waitForApp(page);
    await page.getByRole("heading", { level: 1 }).first().waitFor({ timeout: 15_000 });
    await capture(page, "landing.png");

    // 2. Dashboard overview — KPI rows + charts + review queue footer
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
    await waitForApp(page);
    await page.getByText("Operations Overview").waitFor({ timeout: 15_000 });
    await page.getByText("Detection categories").waitFor({ timeout: 15_000 });
    await page.getByText("Weekly detection volume").scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -160));
    await page.waitForTimeout(300);
    await capture(page, "dashboard.png");
    await scrollTo(page, 0);

    // 3. Upload demo with mock processing
    await page.goto(
      `${BASE_URL}/dashboard/upload?demo=synthetic-barasat-junction`,
      { waitUntil: "domcontentloaded" },
    );
    await waitForApp(page);
    await page.getByRole("button", { name: "Run Mock Processing" }).waitFor({ timeout: 15_000 });
    await page.getByRole("button", { name: "Run Mock Processing" }).click();
    await page.getByText("Detections generated").waitFor({ timeout: 20_000 });
    await page.getByText(/events queued for review/i).waitFor({ timeout: 10_000 });
    await scrollTo(page, 0);
    await capture(page, "upload-demo.png");

    // 4. Demo footage library
    await page.goto(`${BASE_URL}/dashboard/demo-footage`, { waitUntil: "domcontentloaded" });
    await waitForApp(page);
    await page.getByRole("heading", { name: "Safe for public mock demo" }).waitFor({
      timeout: 15_000,
    });
    await scrollTo(page, 0);
    await capture(page, "demo-footage.png");

    // 5. Data sources
    await page.goto(`${BASE_URL}/dashboard/data-sources`, { waitUntil: "domcontentloaded" });
    await waitForApp(page);
    await page.getByText("Dataset & source registry").waitFor({ timeout: 15_000 });
    await scrollTo(page, 240);
    await capture(page, "data-sources.png");

    // 6. Events / detections
    await page.goto(`${BASE_URL}/dashboard/events`, { waitUntil: "domcontentloaded" });
    await waitForApp(page);
    await page.getByText("Events & Detections").waitFor({ timeout: 15_000 });
    await assertEventsTableColumns(page);
    await scrollTo(page, 0);
    await capture(page, "events.png");

    // 7. Event review
    await page.goto(`${BASE_URL}/dashboard/events/EVT-BRS-2401`, {
      waitUntil: "domcontentloaded",
    });
    await waitForApp(page);
    await page.getByText("Assisted review only").waitFor({ timeout: 15_000 });
    await page.getByText("Reviewer actions", { exact: true }).first().scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -300));
    await page.waitForTimeout(300);
    await capture(page, "event-review.png");

    // 8. Pilot proposal + anchor scroll test
    await page.goto(`${BASE_URL}/pilot-proposal`, { waitUntil: "domcontentloaded" });
    await waitForApp(page);
    await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 15_000 });
    await capture(page, "pilot-proposal.png");
    await assertProposalAnchors(page);

    // 9. Privacy settings
    await page.goto(`${BASE_URL}/dashboard/settings`, { waitUntil: "domcontentloaded" });
    await waitForApp(page);
    await page.getByText("Privacy & Settings").waitFor({ timeout: 15_000 });
    await scrollTo(page, 0);
    await capture(page, "privacy.png");

    console.log(`\nDone — ${OUT_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
