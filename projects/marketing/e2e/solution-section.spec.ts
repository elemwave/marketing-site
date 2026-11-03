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

/**
 * On a phone the tabs used to be as wide as their labels, so the circles fell
 * into ragged rows at unrelated positions. Each tab now takes a third of the
 * row: circles share three column centres and a short last row is centred.
 */
const PHONE = { width: 393, height: 851 };

const circleBoxes = (tabs: Locator) =>
  tabs.evaluateAll((buttons) =>
    buttons.map((button) => {
      const tab = button.getBoundingClientRect();
      const circle = (button.firstElementChild as HTMLElement).getBoundingClientRect();
      const labelElement = button.children[1] as HTMLElement;
      const label = labelElement.getBoundingClientRect();
      return {
        labelLeft: label.left,
        labelRight: label.right,
        labelCentre: label.left + label.width / 2,
        labelAlign: getComputedStyle(labelElement).textAlign,
        name: button.textContent ?? "",
        width: tab.width,
        left: tab.left,
        right: tab.right,
        top: Math.round(tab.top),
        centre: circle.left + circle.width / 2,
      };
    }),
  );

test("stands both sections' circles in even rows of three on a phone", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/");

  for (const group of [problems(page).getByRole("group"), section(page).getByRole("group")]) {
    const boxes = await circleBoxes(group.getByRole("button"));
    const groupBox = await group.evaluate((el) => {
      const { left, right } = el.getBoundingClientRect();
      return { left, right, middle: (left + right) / 2 };
    });

    for (const box of boxes) {
      expect(box.width, `${box.name} width`).toBeCloseTo(boxes[0].width, 0);
      expect(box.left, `${box.name} left edge`).toBeGreaterThanOrEqual(0);
      expect(box.right, `${box.name} right edge`).toBeLessThanOrEqual(PHONE.width);
      expect(box.labelLeft, `${box.name} label left edge`).toBeGreaterThanOrEqual(box.left - 0.5);
      expect(box.labelRight, `${box.name} label right edge`).toBeLessThanOrEqual(box.right + 0.5);
      expect(box.labelCentre, `${box.name} label centred under its circle`).toBeCloseTo(box.centre, 0);
      expect(box.labelAlign, `${box.name} label lines centred`).toBe("center");
    }

    const rows = [...new Set(boxes.map((box) => box.top))].map((top) => boxes.filter((box) => box.top === top));
    const fullRows = rows.slice(0, -1);
    expect(rows.length, "number of circle rows").toBe(Math.ceil(boxes.length / 3));
    for (const row of fullRows) {
      expect(row.map((box) => box.name).length, "circles in a full row").toBe(3);
      row.forEach((box, column) => expect(box.centre, `${box.name} column centre`).toBeCloseTo(fullRows[0][column].centre, 0));
    }
    const last = rows[rows.length - 1];
    const lastMiddle = (last[0].centre + last[last.length - 1].centre) / 2;
    expect(lastMiddle, "last row centred").toBeCloseTo(groupBox.middle, 0);
  }
});

test("switches the shown item when a circle picture is tapped on a phone", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/");

  for (const card of [problems(page), section(page)]) {
    const tabs = card.getByRole("group").getByRole("button");
    const count = await tabs.count();
    for (let i = count - 1; i >= 1; i--) {
      const tab = tabs.nth(i);
      const label = (await tab.textContent()) ?? "";
      await tab.locator("span").first().click();
      await expect(tab).toHaveAttribute("aria-pressed", "true");
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(label);
    }
  }
});
