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
    expect(Math.abs((box?.height ?? 0) - expected[width]), `hero height at ${width}px`).toBeLessThanOrEqual(1);
  }
});
