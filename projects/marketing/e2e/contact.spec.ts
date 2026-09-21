import { expect, test } from "@playwright/test";

function withinOnePixel(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);
}

/**
 * On a window taller than the contact page, the page shell grows the
 * primary-content area down to the footer. The contact card must sit in the
 * middle of that grown area rather than hugging its top edge, so this reads
 * the space above and below the card inside the primary-content landmark.
 */
function cardMarginsInsideMain(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const heading = document.querySelector("main h1");
    const card = heading?.closest("section")?.firstElementChild;
    const main = document.querySelector("main");
    if (!card || !main) {
      return null;
    }
    const cardBox = card.getBoundingClientRect();
    const mainBox = main.getBoundingClientRect();
    return {
      above: cardBox.top - mainBox.top,
      below: mainBox.bottom - cardBox.bottom,
    };
  });
}

test.describe("the contact page on a window taller than its content", () => {
  test("centres the contact card vertically in the content area on a 1440x1400 window", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1400 });
    await page.goto("/contact");

    const margins = await cardMarginsInsideMain(page);
    expect(margins).not.toBeNull();
    withinOnePixel(margins!.above, margins!.below);
  });

  test("centres the contact card vertically in the content area on a 390x1800 window", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 1800 });
    await page.goto("/contact");

    const margins = await cardMarginsInsideMain(page);
    expect(margins).not.toBeNull();
    withinOnePixel(margins!.above, margins!.below);
  });
});
