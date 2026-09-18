import { expect, test } from "@playwright/test";

function withinOnePixel(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
}

/**
 * The footer can sit flush with the window's bottom edge (via its own
 * margin) while the element above it still stops well short of the footer,
 * leaving a second, unstyled gap between the page's content and the footer.
 * This reads the vertical distance between that element's own bottom edge
 * and the footer's top edge, which the flush-footer assertions alone cannot
 * see.
 */
function contentGapAboveFooter(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const beforeFooter = document.querySelector("body > *:has(+ footer)");
    const footer = document.querySelector("footer");
    if (!beforeFooter || !footer) {
      return null;
    }
    return (
      footer.getBoundingClientRect().top -
      beforeFooter.getBoundingClientRect().bottom
    );
  });
}

test.describe("the page shell on a page shorter than the viewport", () => {
  test("anchors the footer flush with the bottom of a 1440x1400 window, with no gap below it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1400 });
    await page.goto("/contact");

    const footer = page.getByRole("contentinfo", { name: "Footer" });
    const box = await footer.boundingBox();
    expect(box).not.toBeNull();
    withinOnePixel(box!.y + box!.height, 1400);

    const scrollHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    withinOnePixel(scrollHeight, 1400);

    const gap = await contentGapAboveFooter(page);
    expect(gap).not.toBeNull();
    withinOnePixel(gap!, 0);
  });

  test("anchors the footer flush with the bottom of a 390x1800 window, with no gap below it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 1800 });
    await page.goto("/contact");

    const footer = page.getByRole("contentinfo", { name: "Footer" });
    const box = await footer.boundingBox();
    expect(box).not.toBeNull();
    withinOnePixel(box!.y + box!.height, 1800);

    const scrollHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    withinOnePixel(scrollHeight, 1800);

    const gap = await contentGapAboveFooter(page);
    expect(gap).not.toBeNull();
    withinOnePixel(gap!, 0);
  });
});

test.describe("the page shell on a page taller than the viewport", () => {
  test("leaves the footer's position and the page's scroll length unchanged on a 1440x900 window", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const scrollHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    expect(scrollHeight).toBeGreaterThan(900);

    const footer = page.getByRole("contentinfo", { name: "Footer" });
    await footer.scrollIntoViewIfNeeded();

    const bottom = await footer.evaluate(
      (el) => el.getBoundingClientRect().bottom + window.scrollY,
    );
    withinOnePixel(bottom, scrollHeight);
  });
});
