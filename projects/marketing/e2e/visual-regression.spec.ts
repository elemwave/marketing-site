import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Visual regression for the shared chrome and the shared section heading,
 * in desktop Chromium only (playwright.config.ts ignores this file in the
 * other projects). Baselines live in `visual-regression.spec.ts-snapshots/`
 * and are generated only inside the pinned Playwright image by
 * `make e2e-update-visuals`, so every machine renders the same pixels.
 *
 * Captures: header, home hero, partnerships hero, the page wrapper on a short
 * and a tall page, and SectionHeading (title, underline bar and the band
 * around them, not the rest of the section) on a light band, on the dark
 * certifications band and as a page title.
 */
test.use({ reducedMotion: "reduce" });

const options = {
  animations: "disabled",
  caret: "hide",
  maxDiffPixels: 50,
} as const;

async function open(page: Page, path: string, height = 900) {
  await page.setViewportSize({ width: 1440, height });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

/**
 * The heading, its underline bar and the band immediately around them, as a
 * page-coordinate clip across the section's width. SectionHeading renders a
 * fragment (heading, bar, optional description), so there is no element to
 * capture; the description and the rest of the section are left out, so an
 * ordinary content edit there does not fail the check.
 */
async function headingClip(page: Page, section: Locator) {
  const heading = section.locator("h1, h2").first();
  const bar = heading.locator("xpath=following-sibling::div[1]");
  const margin = 24;
  const [sectionBox, headingBox, barBox] = await Promise.all(
    [section, heading, bar].map((locator) =>
      locator.evaluate((element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x: x + window.scrollX, y: y + window.scrollY, width, height };
      }),
    ),
  );
  const top = Math.max(sectionBox.y, headingBox.y - margin);
  const bottom = Math.min(sectionBox.y + sectionBox.height, barBox.y + barBox.height + margin);
  return { x: sectionBox.x, y: top, width: sectionBox.width, height: bottom - top };
}

test.describe("shared chrome looks as approved", () => {
  test("header", async ({ page }) => {
    await open(page, "/contact");
    await expect(page.locator("body > header, header").first()).toHaveScreenshot("header.png", options);
  });

  test("home hero", async ({ page }) => {
    await open(page, "/");
    await expect(page.locator("main section").first()).toHaveScreenshot("home-hero.png", options);
  });

  test("partnerships hero", async ({ page }) => {
    await open(page, "/partnerships");
    await expect(page.locator("main section").first()).toHaveScreenshot("partnerships-hero.png", options);
  });

  test("page wrapper on a short page", async ({ page }) => {
    await open(page, "/contact", 1400);
    await expect(page).toHaveScreenshot("page-wrapper-contact.png", options);
  });

  test("page wrapper on a tall page", async ({ page }) => {
    await open(page, "/", 4500);
    await expect(page).toHaveScreenshot("page-wrapper-home-tall.png", options);
  });
});

test.describe("the shared section heading looks as approved in each background context", () => {
  test("on a light band", async ({ page }) => {
    await open(page, "/");
    const clip = await headingClip(page, page.locator("#software"));
    await expect(page).toHaveScreenshot("section-heading-light-surface.png", { ...options, fullPage: true, clip });
  });

  test("on the dark certifications band", async ({ page }) => {
    await open(page, "/");
    const clip = await headingClip(page, page.locator("#certifications"));
    await expect(page).toHaveScreenshot("section-heading-dark-band.png", { ...options, fullPage: true, clip });
  });

  test("as a legal page title", async ({ page }) => {
    await open(page, "/privacy-policy");
    const clip = await headingClip(page, page.locator("main section").first());
    await expect(page).toHaveScreenshot("section-heading-legal-h1.png", { ...options, fullPage: true, clip });
  });
});
