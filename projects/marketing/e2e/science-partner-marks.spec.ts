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
  const box = await locator.boundingBox();
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
  await page.getByRole("heading", { name: "The Science Behind Us" }).scrollIntoViewIfNeeded();

  const publication = page.getByRole("img", { name: PUBLICATION });
  const previous = page.getByRole("button", { name: "Previous slide" });
  const next = page.getByRole("button", { name: "Next slide" });
  const square = page.locator('img[alt="Partner logo"][src*="logo-amasya-university"]').first();

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

test("delayed science partner marks do not move the publication at 1280x900", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const held = await holdPartnerMarks(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const before = await measureScience(page);
  expect(before.squareBox.height).toBeGreaterThanOrEqual(204);
  expect(before.squareBox.height).toBeLessThanOrEqual(206);

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

test("delayed science partner marks keep the clamp floor at 375px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  const held = await holdPartnerMarks(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const before = await measureScience(page);
  expect(before.squareBox.height).toBeGreaterThanOrEqual(63);
  expect(before.squareBox.height).toBeLessThanOrEqual(65);

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
