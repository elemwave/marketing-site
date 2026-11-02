import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The home page's sections, top to bottom, as a visitor sees them laid out:
 * Book a Meeting comes straight after Our Solution, ahead of the publications
 * and the certifications. Runs in every browser project, the phone included.
 */

const topOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("expected a layout box");
  }
  return box.y;
};

const expectSectionsInOrder = async (page: Page) => {
  const tops = [
    await topOf(page.getByRole("heading", { level: 1 })),
    await topOf(page.getByRole("heading", { name: "Our Solution" })),
    await topOf(page.getByRole("heading", { name: "Book a Meeting" })),
    await topOf(page.getByRole("heading", { name: "Peer-Reviewed Publications" })),
    await topOf(page.getByRole("heading", { name: "Certifications", exact: true })),
    await topOf(page.locator("footer")),
  ];

  for (let index = 1; index < tops.length; index += 1) {
    expect(tops[index]).toBeGreaterThan(tops[index - 1]!);
  }
};

test("shows Book a Meeting between Our Solution and Peer-Reviewed Publications, with Certifications last before the footer", async ({
  page,
}) => {
  await page.goto("/");

  await expectSectionsInOrder(page);
});

test("keeps that order on a tablet-sized screen", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/");

  await expectSectionsInOrder(page);
});

test("keeps the order after the page is reloaded", async ({ page }) => {
  await page.goto("/");
  await page.reload();

  await expectSectionsInOrder(page);
});

test("brings Book a Meeting into view from a link to it", async ({ page }) => {
  await page.goto("/#book");

  await expect(page.getByRole("heading", { name: "Book a Meeting" })).toBeInViewport();
});

test("opens the booking dialog from Schedule a Call in its new place", async ({ page }) => {
  await page.goto("/");

  await page.locator("#book").getByRole("button", { name: "Schedule a Call" }).click();

  await expect(page.locator("iframe").first()).toBeVisible();
});

test("keeps Certifications within the screen's width now that it closes the page", async ({ page }) => {
  await page.goto("/");

  const screenWidth = page.viewportSize()!.width;
  const certificationsGrid = page.locator("#certifications").getByRole("article").first().locator("..");
  const box = await certificationsGrid.boundingBox();

  expect(box).not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(screenWidth);
});
