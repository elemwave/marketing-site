import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The home page's sections, top to bottom, as a visitor sees them laid out:
 * The challenges comes straight after the hero and before Our Solution, and
 * Book a Meeting comes straight after the publications and before the
 * certifications. Runs in every browser project, the phone included.
 */

const topOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("expected a layout box");
  }
  return box.y;
};

/** Top edges of the hero, The challenges, Our Solution, Peer-Reviewed Publications, Book a Meeting, Certifications and the footer. */
const sectionTops = async (page: Page) => [
  await topOf(page.getByRole("heading", { level: 1 })),
  await topOf(page.getByRole("heading", { name: "The challenges" })),
  await topOf(page.getByRole("heading", { name: "Our Solution" })),
  await topOf(page.getByRole("heading", { name: "Peer-Reviewed Publications" })),
  await topOf(page.getByRole("heading", { name: "Book a Meeting" })),
  await topOf(page.getByRole("heading", { name: "Certifications", exact: true })),
  await topOf(page.locator("footer")),
];

const ascending = (values: number[]) => [...values].sort((a, b) => a - b);

test("shows The challenges between the hero and Our Solution, Book a Meeting between Peer-Reviewed Publications and Certifications, with Certifications last before the footer", async ({
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

test("keeps the Book a Meeting panel only as wide as its content on a wide screen", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const panel = page.getByRole("region", { name: "Book a Meeting", exact: true });
  const fit = await panel.evaluate((el) => {
    const style = getComputedStyle(el);
    const innerWidth =
      el.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const contentWidth = Math.max(
      ...Array.from(el.querySelectorAll("h2, p")).map((child) => child.getBoundingClientRect().width),
    );
    return { innerWidth, contentWidth };
  });

  expect(fit.innerWidth).toBeLessThanOrEqual(fit.contentWidth + 1);
});


for (const width of [1280, 393, 320]) {
  test(`retains the three section introductions and solution link at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const description = (name: string) => page.getByRole("heading", { name, exact: true })
      .locator("xpath=following-sibling::p[1]");
    const challenges = description("The challenges");
    const solution = description("Our Solution");
    const publications = description("Peer-Reviewed Publications");
    await expect(challenges).toBeVisible();
    await expect(challenges).toContainText("The electromagnetic questions a platform has to answer before it is certified");
    await expect(solution).toBeVisible();
    await expect(solution).toContainText("Electromagnetic-compatibility simulation built on open-source FDTD and DGTD solvers");
    await expect(solution).toContainText("validated through peer review by the scientific community.");
    await expect(solution.getByRole("link", { name: "opensemba/fdtd" }))
      .toHaveAttribute("href", "https://github.com/opensemba/fdtd");
    await expect(publications).toBeVisible();
    await expect(publications).toContainText("Developed and validated through academic publications and joint projects");
    for (const paragraph of [challenges, solution, publications]) {
      const box = await paragraph.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
  });
}
