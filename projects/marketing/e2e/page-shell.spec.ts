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

/**
 * Growing the last child to meet the footer (contentGapAboveFooter, above)
 * only closes the gap between that element and the footer. Its own visible
 * content could still hug the top of that grown box, leaving the same kind
 * of unstyled gap one level in — below the content, inside the grown
 * element. This reads the *extra* margin `justify-content: center` adds
 * above and below that content, beyond the container's own (deliberately
 * asymmetric, page-specific) padding, which the footer-gap assertion alone
 * cannot see and a raw edge-to-edge comparison would misread as a
 * mismatch whenever the top and bottom padding already differ.
 */
function contentMarginsWithinGrownLastChild(
  page: import("@playwright/test").Page,
) {
  return page.evaluate(() => {
    const beforeFooter = document.querySelector("body > *:has(+ footer)");
    const lastChild = beforeFooter?.lastElementChild;
    const first = lastChild?.firstElementChild;
    const last = lastChild?.lastElementChild;
    if (!lastChild || !first || !last) {
      return null;
    }
    const containerBox = lastChild.getBoundingClientRect();
    const firstBox = first.getBoundingClientRect();
    const lastBox = last.getBoundingClientRect();
    const style = getComputedStyle(lastChild);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);
    return {
      above: firstBox.top - containerBox.top - paddingTop,
      below: containerBox.bottom - lastBox.bottom - paddingBottom,
    };
  });
}

test.describe("the page shell centres a grown page's own content, on any page that shares it", () => {
  test("centres the team page's own content within the leftover height on a 1440x2700 window", async ({
    page,
  }) => {
    // Team's natural content is ~2094px of main at 1440px width (footer
    // starts at ~2186px); 2700px leaves real leftover height to distribute.
    await page.setViewportSize({ width: 1440, height: 2700 });
    await page.goto("/team");

    const gap = await contentGapAboveFooter(page);
    expect(gap).not.toBeNull();
    withinOnePixel(gap!, 0);

    const margins = await contentMarginsWithinGrownLastChild(page);
    expect(margins).not.toBeNull();
    withinOnePixel(margins!.above, margins!.below);
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
