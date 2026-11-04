import { expect, test, type Page, type Route } from "@playwright/test";

const PUBLICATION =
  "FDTD Voxels-in-Cell Method With Debye Media";

const holdPartnerMarks = async (page: Page) => {
  let releaseHeld!: () => void;
  const released = new Promise<void>((resolve) => {
    releaseHeld = resolve;
  });

  await page.route("**/images/logo-*", async (route: Route) => {
    if (route.request().url().includes("logo-elemwave")) {
      await route.continue();
      return;
    }

    await released;
    await route.continue();
  });

  return { release: () => releaseHeld() };
};

const boxOf = async (locator: ReturnType<Page["locator"]>) => {
  const box = await locator.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.x + window.scrollX,
      y: rect.y + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  });
  if (!box) {
    throw new Error("expected a layout box");
  }
  return box;
};

const samePosition = (
  before: { x: number; y: number },
  after: { x: number; y: number },
) => {
  expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
};

const measureScience = async (page: Page) => {
  await page.getByRole("heading", { name: "Peer-Reviewed Publications" }).scrollIntoViewIfNeeded();

  const publication = page.getByRole("img", { name: PUBLICATION });
  const previous = page.getByRole("button", { name: "Previous slide" });
  const next = page.getByRole("button", { name: "Next slide" });
  const square = page.locator('img[src*="logo-amasya-university"]').first();

  await expect(publication).toBeVisible();

  return {
    publication,
    previous,
    next,
    square,
    publicationBox: await boxOf(publication),
    previousBox: await boxOf(previous),
    nextBox: await boxOf(next),
    squareBox: await boxOf(square),
  };
};

const delayedLoadCases = [
  {
    title:
      "delayed science partner marks do not move the publication at 1280x900",
    viewport: { width: 1280, height: 900 },
    squareHeight: { min: 204, max: 206 },
  },
  {
    title: "delayed science partner marks keep the clamp floor at 375px",
    viewport: { width: 375, height: 800 },
    squareHeight: { min: 63, max: 65 },
  },
] as const;

for (const spec of delayedLoadCases) {
  test(spec.title, async ({ page }) => {
    await page.setViewportSize(spec.viewport);
    const held = await holdPartnerMarks(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const before = await measureScience(page);
    expect(before.squareBox.height).toBeGreaterThanOrEqual(spec.squareHeight.min);
    expect(before.squareBox.height).toBeLessThanOrEqual(spec.squareHeight.max);

    held.release();
    await expect
      .poll(async () =>
        before.square.evaluate((el) => (el as HTMLImageElement).naturalHeight > 0),
      )
      .toBe(true);

    samePosition(before.publicationBox, await boxOf(before.publication));
    samePosition(before.previousBox, await boxOf(before.previous));
    samePosition(before.nextBox, await boxOf(before.next));

    await before.next.click();
    const afterSlide = page.locator("div.bg-cover.bg-top[role='img']");
    samePosition(before.publicationBox, await boxOf(afterSlide));
  });
}

const ADDED_SLIDES = [
  {
    dot: "Go to slide 9",
    caption:
      "A Study of Nonlinear Effects on an Aircraft Electrical-Structure Network Mockup",
    logos: 3,
  },
  {
    dot: "Go to slide 10",
    caption:
      "Numerical Computation of Unshielded Multiwires In-Cell Parameters for Coupling Between FDTD and MTL Methods Using Multipolar Expansions",
    logos: 2,
  },
] as const;

const ADDED_SLIDE_VIEWPORTS = [
  { width: 1280, height: 900 },
  { width: 375, height: 800 },
] as const;

for (const viewport of ADDED_SLIDE_VIEWPORTS) {
  test(`the added publication slides keep every logo whole and unorphaned at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page
      .getByRole("heading", { name: "Peer-Reviewed Publications" })
      .scrollIntoViewIfNeeded();

    for (const slide of ADDED_SLIDES) {
      await page.getByRole("button", { name: slide.dot }).click();
      await expect(
        page.locator("div.bg-cover.bg-top[role='img']"),
      ).toHaveAttribute("aria-label", slide.caption);

      const row = page.locator('div.grid > div:not([aria-hidden="true"])');
      const logos = row.locator("img");
      await expect(logos).toHaveCount(slide.logos);
      await expect
        .poll(async () =>
          logos.evaluateAll((marks) =>
            marks.every((mark) => (mark as HTMLImageElement).naturalHeight > 0),
          ),
        )
        .toBe(true);

      const rowBox = await boxOf(row);
      const boxes = await Promise.all(
        (await logos.all()).map((logo) => boxOf(logo)),
      );
      for (const box of boxes) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
        expect(box.x).toBeGreaterThanOrEqual(rowBox.x - 1);
        expect(box.x + box.width).toBeLessThanOrEqual(rowBox.x + rowBox.width + 1);
        expect(box.y).toBeGreaterThanOrEqual(rowBox.y - 1);
        expect(box.y + box.height).toBeLessThanOrEqual(rowBox.y + rowBox.height + 1);
      }

      // Marks of different heights share a row centred, so a row is keyed by
      // its vertical centre rather than its top.
      const perRow = new Map<number, number>();
      for (const box of boxes) {
        const centre = Math.round(box.y + box.height / 2);
        perRow.set(centre, (perRow.get(centre) ?? 0) + 1);
      }
      expect([...perRow.values()]).not.toContain(1);
    }
  });
}

// 320 and 393 are the widths where the longest journal names wrap to two lines.
for (const width of [1280, 393, 320]) {
  test(`keeps the publication picture, the arrows and the dots in place across all ten papers at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page
      .getByRole("heading", { name: "Peer-Reviewed Publications" })
      .scrollIntoViewIfNeeded();

    const picture = page.locator("div.bg-cover.bg-top[role='img']");
    const previous = page.getByRole("button", { name: "Previous slide" });
    const firstDot = page.getByRole("button", { name: "Go to slide 1", exact: true });
    // The journal row is the block directly above the dots.
    const journalRow = firstDot.locator("xpath=../preceding-sibling::div[1]");
    const dotCount = await page.getByRole("button", { name: /^Go to slide \d+$/ }).count();
    expect(dotCount).toBe(10);

    const tops = async () => ({
      picture: (await boxOf(picture)).y,
      previous: (await boxOf(previous)).y,
      dots: (await boxOf(firstDot)).y,
    });

    const first = await tops();
    const rowHeights: number[] = [];
    let withJournal = 0;
    let withoutJournal = 0;
    for (let slide = 1; slide <= dotCount; slide += 1) {
      const dot = page.getByRole("button", { name: `Go to slide ${slide}`, exact: true });
      await dot.click();
      await expect(dot).toHaveAttribute(
        "aria-current",
        "true",
      );

      const now = await tops();
      samePosition({ x: 0, y: first.picture }, { x: 0, y: now.picture });
      samePosition({ x: 0, y: first.previous }, { x: 0, y: now.previous });
      samePosition({ x: 0, y: first.dots }, { x: 0, y: now.dots });
      rowHeights.push((await boxOf(journalRow)).height);

      if ((await journalRow.getByRole("link").count()) > 0) {
        withJournal += 1;
      } else {
        withoutJournal += 1;
      }
    }

    expect(withJournal).toBeGreaterThan(0);
    expect(withoutJournal).toBeGreaterThan(0);
    for (const height of rowHeights) {
      expect(height).toBeGreaterThanOrEqual(24);
    }
  });
}
