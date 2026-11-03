import { expect, test, type Locator, type Page, type Route } from "@playwright/test";

/**
 * The "Our Solution" section's picture states that jsdom cannot observe:
 * a picture that fails to load, a picture still on its way, a reload, and
 * where the two rows of tabs sit.
 */
const FIRST_ITEM = "Multilayer surface impedances";
const FIRST_PICTURE = "**/images/solution-multilayer-surface-impedances.webp";
const MIN_PICTURE_HEIGHT = 220;
const CAPABILITIES = ["Multilayer surface impedances", "Cable Solver", "Conformal modelling"];
const APPLICATIONS = ["Radiated emissions", "Radiated immunity", "Conducted susceptibility"];

const section = (page: Page) => page.locator("#software");

const heightOf = (locator: Locator) =>
  locator.evaluate((el) => el.getBoundingClientRect().height);

const firstItem = (page: Page) => {
  const card = section(page);
  return {
    title: card.getByRole("heading", { level: 3, name: FIRST_ITEM }),
    firstParagraph: card.locator("h3 ~ p").first(),
    picture: card.getByRole("img", { name: `${FIRST_ITEM} screenshot` }),
  };
};

const holdFirstPicture = async (page: Page) => {
  let releaseHeld!: () => void;
  const released = new Promise<void>((resolve) => {
    releaseHeld = resolve;
  });
  await page.route(FIRST_PICTURE, async (route: Route) => {
    await released;
    await route.continue();
  });
  return { release: () => releaseHeld() };
};

test("keeps the item's title, text and picture area when its picture fails to load", async ({ browser, page }) => {
  await page.goto("/");
  const measured = await heightOf(firstItem(page).picture);

  const failing = await browser.newPage({ viewport: page.viewportSize() });
  await failing.route(FIRST_PICTURE, (route) => route.abort());
  await failing.goto("/", { waitUntil: "domcontentloaded" });
  const item = firstItem(failing);

  await expect(item.title).toBeVisible();
  await expect(item.firstParagraph).toBeVisible();
  await expect(item.picture).toBeAttached();
  const height = await heightOf(item.picture);
  expect(height).toBeGreaterThanOrEqual(MIN_PICTURE_HEIGHT);
  expect(Math.abs(height - measured)).toBeLessThanOrEqual(1);
  await failing.close();
});

test("shows the item's title and text and holds the picture area before its picture arrives", async ({ page }) => {
  const held = await holdFirstPicture(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const item = firstItem(page);

  await expect(item.title).toBeVisible();
  await expect(item.firstParagraph).toBeVisible();
  const before = await heightOf(item.picture);
  expect(before).toBeGreaterThanOrEqual(MIN_PICTURE_HEIGHT);

  held.release();
  await page.waitForLoadState("load");
  expect(Math.abs((await heightOf(item.picture)) - before)).toBeLessThanOrEqual(1);
});

test("selects Multilayer surface impedances again after a reload", async ({ page }) => {
  await page.goto("/");
  const card = section(page);
  await card.getByRole("button", { name: "Radiated immunity" }).click();
  await expect(card.getByRole("button", { name: "Radiated immunity" })).toHaveAttribute("aria-pressed", "true");

  await page.reload();

  await expect(section(page).getByRole("button", { name: FIRST_ITEM })).toHaveAttribute("aria-pressed", "true");
  await expect(section(page).getByRole("heading", { level: 3 })).toHaveText(FIRST_ITEM);
});

test("places the capabilities and the applications in two rows at a desktop width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const topOf = (name: string) =>
    section(page)
      .getByRole("button", { name })
      .evaluate((el) => Math.round(el.getBoundingClientRect().top));

  const capabilityTops = await Promise.all(CAPABILITIES.map(topOf));
  const applicationTops = await Promise.all(APPLICATIONS.map(topOf));

  expect(new Set(capabilityTops).size, `capability tops ${capabilityTops.join(", ")}`).toBe(1);
  expect(new Set(applicationTops).size, `application tops ${applicationTops.join(", ")}`).toBe(1);
  expect(applicationTops[0]).toBeGreaterThan(capabilityTops[0]);
});
