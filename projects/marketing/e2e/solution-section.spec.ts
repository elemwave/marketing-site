import { expect, test, type Locator, type Page, type Route } from "@playwright/test";

/**
 * The "The challenges" and "Our Solution" sections' states that jsdom cannot
 * observe: a picture that fails to load, a picture still on its way, a
 * reload, and how their rows of tabs lay out.
 */
const FIRST_ITEM = "Multilayer surface impedances";
const FIRST_PICTURE = "**/images/solution-multilayer-surface-impedances.webp";
const MIN_PICTURE_HEIGHT = 220;
const FIRST_PROBLEM = "Radiated emissions";

const section = (page: Page) => page.locator("#software");
const problems = (page: Page) => page.locator("#problems");

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

test("selects each section's first item again after a reload", async ({ page }) => {
  await page.goto("/");
  await problems(page).getByRole("button", { name: "Lightning" }).click();
  await section(page).getByRole("button", { name: "HPC" }).click();
  await expect(problems(page).getByRole("button", { name: "Lightning" })).toHaveAttribute("aria-pressed", "true");
  await expect(section(page).getByRole("button", { name: "HPC" })).toHaveAttribute("aria-pressed", "true");

  await page.reload();

  await expect(problems(page).getByRole("button", { name: FIRST_PROBLEM })).toHaveAttribute("aria-pressed", "true");
  await expect(problems(page).getByRole("heading", { level: 3 })).toHaveText(FIRST_PROBLEM);
  await expect(section(page).getByRole("button", { name: FIRST_ITEM })).toHaveAttribute("aria-pressed", "true");
  await expect(section(page).getByRole("heading", { level: 3 })).toHaveText(FIRST_ITEM);
});

test("keeps every tab of both sections apart and inside the screen at a desktop width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  for (const tabs of [problems(page).getByRole("button"), section(page).getByRole("button")]) {
    const boxes = await tabs.evaluateAll((buttons) =>
      buttons.map((button) => {
        const { left, right, top, bottom } = button.getBoundingClientRect();
        return { name: button.textContent ?? "", left, right, top, bottom };
      }),
    );
    for (const box of boxes) {
      expect(box.left, `${box.name} left edge`).toBeGreaterThanOrEqual(0);
      expect(box.right, `${box.name} right edge`).toBeLessThanOrEqual(1280);
    }
    for (const [i, a] of boxes.entries()) {
      for (const b of boxes.slice(i + 1)) {
        const overlap = a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
        expect(overlap, `${a.name} overlaps ${b.name}`).toBe(false);
      }
    }
  }
});

/**
 * On a laptop-sized window the nine Our Solution tabs wrap onto two rows and
 * the item card sits below the window when the tabs are in view, so a chosen
 * item must be brought into view or the click looks like nothing happened.
 */
const showSolutionTabs = async (page: Page) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/");
  await section(page)
    .getByRole("heading", { level: 2 })
    .evaluate((heading) => heading.scrollIntoView({ block: "start", behavior: "instant" }));
  return section(page).getByRole("group").getByRole("button").last();
};

test("brings the chosen Our Solution item into view when its tab is clicked", async ({ page }) => {
  const lastTab = await showSolutionTabs(page);

  await lastTab.click();

  await expect(section(page).getByRole("heading", { level: 3 })).toBeInViewport({ ratio: 1 });
  await expect(lastTab).toBeFocused();
});

test("brings the chosen Our Solution item into view when its tab is activated from the keyboard", async ({ page }) => {
  const lastTab = await showSolutionTabs(page);

  await lastTab.focus();
  await page.keyboard.press("Enter");

  await expect(section(page).getByRole("heading", { level: 3 })).toBeInViewport({ ratio: 1 });
  await expect(lastTab).toHaveAttribute("aria-pressed", "true");
});
