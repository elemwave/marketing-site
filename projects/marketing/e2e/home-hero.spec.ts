import { expect, test, type Page } from "@playwright/test";

/**
 * The home page hero shows its headline alone, centred, at the height it had
 * while it held the airplane picture, so the sections below it start where
 * they did on every screen.
 */

const WIDTHS = [360, 393, 768, 820, 1024, 1040, 1050, 1280, 1440, 1920] as const;

type Width = (typeof WIDTHS)[number];

/**
 * The hero's height in pixels before its picture was removed, measured on the
 * base export per browser project and window width (900 px high).
 *
 * At 360 and 393 px, and from 1050 px up, the band's own minimum height
 * `clamp(420px,55vw,700px)` set that height. At 768, 820, 1024 and 1040 px the
 * height exceeded the minimum, because the stacked picture and gap filled it:
 * only those widths show the reserved space at work.
 */
const HEIGHT_BEFORE: Record<string, Record<Width, number>> = {
  chromium: { 360: 420, 393: 420, 768: 547.67, 820: 558.28, 1024: 642.88, 1040: 646.86, 1050: 577.5, 1280: 700, 1440: 700, 1920: 700 },
  firefox: { 360: 420, 393: 420, 768: 547.63, 820: 558.28, 1024: 642.87, 1040: 646.87, 1050: 577.5, 1280: 700, 1440: 700, 1920: 700 },
  webkit: { 360: 420, 393: 420, 768: 547.67, 820: 558.25, 1024: 642.83, 1040: 646.77, 1050: 577.5, 1280: 700, 1440: 700, 1920: 700 },
  "mobile-chromium": { 360: 420, 393: 420, 768: 547.67, 820: 558.28, 1024: 642.88, 1040: 646.86, 1050: 577.5, 1280: 700, 1440: 700, 1920: 700 },
};

const hero = (page: Page) => page.locator("main section").first();

async function openAt(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
}

test("keeps the hero as tall as it was before its picture was removed", async ({ page }) => {
  const expected = HEIGHT_BEFORE[test.info().project.name];
  expect(expected, "heights recorded for this browser project").toBeDefined();
  for (const width of WIDTHS) {
    await openAt(page, width);
    const box = await hero(page).boundingBox();
    expect.soft(Math.abs((box?.height ?? 0) - expected[width]), `hero height at ${width}px`).toBeLessThanOrEqual(1);
  }
});

/** The site mark in the header is the one picture the first view may fetch promptly. */
const isSiteMark = (url: string) => url.includes("logo-elemwave");

test("shows no picture in the hero", async ({ page }) => {
  await page.goto("/");
  const band = hero(page);

  await expect(band.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(band.getByRole("img")).toHaveCount(0);
  await expect(band.locator("[data-layer]")).toHaveCount(0);
});

test("asks the browser for no airplane picture and preloads none", async ({ page }) => {
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const preloadedPictures = await page
    .locator('link[rel="preload"][as="image"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));

  expect(requested.filter((url) => url.includes("hero-"))).toEqual([]);
  expect(preloadedPictures.filter((href) => !isSiteMark(href))).toEqual([]);
});

test("centres the headline in the hero", async ({ page }) => {
  for (const width of [360, 768, 1050, 1440]) {
    await openAt(page, width);
    const band = await hero(page).boundingBox();
    const heading = page.getByRole("heading", { level: 1 });
    const box = await heading.boundingBox();
    if (!band || !box) {
      throw new Error("expected layout boxes for the hero and its headline");
    }

    expect(Math.abs(box.x + box.width / 2 - (band.x + band.width / 2)), `across at ${width}px`).toBeLessThanOrEqual(1);
    expect(Math.abs(box.y + box.height / 2 - (band.y + band.height / 2)), `down at ${width}px`).toBeLessThanOrEqual(1);
    expect(await heading.evaluate((el) => getComputedStyle(el).textAlign), `line alignment at ${width}px`).toBe("center");
  }
});

test("answers that the CAD-model picture does not exist", async ({ page }) => {
  const response = await page.request.get("/images/hero-a320-cad.webp");

  expect(response.status()).toBe(404);
});
