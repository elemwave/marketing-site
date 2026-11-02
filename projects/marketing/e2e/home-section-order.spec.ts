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

/** Top edges of the hero, Our Solution, Book a Meeting, Peer-Reviewed Publications, Certifications and the footer. */
const sectionTops = async (page: Page) => [
  await topOf(page.getByRole("heading", { level: 1 })),
  await topOf(page.getByRole("heading", { name: "Our Solution" })),
  await topOf(page.getByRole("heading", { name: "Book a Meeting" })),
  await topOf(page.getByRole("heading", { name: "Peer-Reviewed Publications" })),
  await topOf(page.getByRole("heading", { name: "Certifications", exact: true })),
  await topOf(page.locator("footer")),
];

const ascending = (values: number[]) => [...values].sort((a, b) => a - b);

test("shows Book a Meeting between Our Solution and Peer-Reviewed Publications, with Certifications last before the footer", async ({
  page,
}) => {
  await page.goto("/");

  const tops = await sectionTops(page);
  expect(tops).toEqual(ascending(tops));
  expect(new Set(tops).size).toBe(tops.length);
});

test("keeps that order on a tablet-sized screen", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/");

  const tops = await sectionTops(page);
  expect(tops).toEqual(ascending(tops));
  expect(new Set(tops).size).toBe(tops.length);
});

test("keeps the order after the page is reloaded", async ({ page }) => {
  await page.goto("/");
  await page.reload();

  const tops = await sectionTops(page);
  expect(tops).toEqual(ascending(tops));
  expect(new Set(tops).size).toBe(tops.length);
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
