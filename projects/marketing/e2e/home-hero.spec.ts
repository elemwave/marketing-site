import { expect, test, type Page } from "@playwright/test";

/**
 * The home page hero shows its heading and subheading, centred, at the height
 * it had before the opening changed wherever the opening fits, so the sections
 * below it start where they did; where the opening needs more room the hero
 * grows by only what it needs and cuts neither text.
 */

const WIDTHS = [
  360, 384, 387, 390, 393, 507, 511, 514, 628, 635, 642, 768, 820, 881, 886, 890, 1024, 1040, 1050, 1280, 1440, 1920,
] as const;

type Width = (typeof WIDTHS)[number];

/**
 * The hero's height in pixels before the opening changed, measured on the
 * base export per browser project and window width (900 px high). The widths
 * 384/390, 507/514, 628/642 and 881/890 sit either side of the four widths at
 * which the former headline changed its number of lines. Firefox and WebKit
 * wrapped it 5 to 13 px later than Chromium did, and 387, 511, 635 and 886 px
 * sit inside those bands, where the engines' former heights differ by one
 * former-headline line. The measurements were taken with a throwaway spec
 * stepping the viewport 1 px at a time on the unchanged export; they are not
 * kept in the repository, so re-measure the same way if a font or width
 * changes.
 *
 * At 360, 390 and 393 px, in Chromium at 387 px, and from 1050 px up, the
 * band's own minimum height `clamp(420px,55vw,700px)` set that height. At every
 * other width (384, 387 in Firefox and WebKit, 507 to 514, 628 to 642, 768, 820,
 * 881 to 890, 1024 and 1040 px) the height exceeded the minimum, because the
 * former headline and the stacked picture and gap filled it: only those widths
 * show the reserved space at work.
 */
const HEIGHT_BEFORE: Record<string, Record<Width, number>> = {
  chromium: {
    360: 420, 384: 432.06, 387: 420, 390: 420, 393: 420, 507: 469.31, 511: 440.16, 514: 441.72, 628: 500.28,
    635: 472.69, 642: 476.28, 768: 547.67, 820: 558.28, 881: 570.69, 886: 608.97, 890: 609.91, 1024: 642.88,
    1040: 646.86, 1050: 577.5, 1280: 700, 1440: 700, 1920: 700,
  },
  firefox: {
    360: 420, 384: 432.13, 387: 433.8, 390: 420, 393: 420, 507: 469.33, 511: 471.4, 514: 441.73, 628: 500.33,
    635: 503.9, 642: 476.33, 768: 547.63, 820: 558.28, 881: 570.7, 886: 571.7, 890: 609.95, 1024: 642.87, 1040: 646.87,
    1050: 577.5, 1280: 700, 1440: 700, 1920: 700,
  },
  webkit: {
    360: 420, 384: 432.06, 387: 433.75, 390: 420, 393: 420, 507: 469.31, 511: 471.34, 514: 441.72, 628: 500.28,
    635: 503.88, 642: 476.28, 768: 547.67, 820: 558.25, 881: 570.69, 886: 571.69, 890: 609.86, 1024: 642.83,
    1040: 646.77, 1050: 577.5, 1280: 700, 1440: 700, 1920: 700,
  },
  "mobile-chromium": {
    360: 420, 384: 432.06, 387: 420, 390: 420, 393: 420, 507: 469.31, 511: 440.16, 514: 441.72, 628: 500.28,
    635: 472.69, 642: 476.28, 768: 547.67, 820: 558.28, 881: 570.69, 886: 608.97, 890: 609.91, 1024: 642.88,
    1040: 646.86, 1050: 577.5, 1280: 700, 1440: 700, 1920: 700,
  },
};

const HEADING = "What does your platform emit, withstand and reflect?";
const SUBHEADING =
  "Elemwave predicts it even before a prototype exists, with open-source, peer-reviewed simulations that you can verify.";

const hero = (page: Page) => page.locator("main section").first();
const subheading = (page: Page) => hero(page).getByText(SUBHEADING, { exact: true });

/** WCAG contrast of a text colour composited over a background colour, both as the browser computes them. */
async function contrastOverBand(page: Page) {
  return page.evaluate((text) => {
    const band = document.querySelector("main section") as HTMLElement;
    const sub = Array.from(band.querySelectorAll("p")).find((p) => p.textContent === text) as HTMLElement;
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const pixel = (colours: string[]) => {
      context.clearRect(0, 0, 1, 1);
      for (const colour of colours) {
        context.fillStyle = colour;
        context.fillRect(0, 0, 1, 1);
      }
      return Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3));
    };
    const background = getComputedStyle(band).backgroundColor;
    const luminance = (rgb: number[]) => {
      const [r, g, b] = rgb.map((value) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const foreground = luminance(pixel([background, getComputedStyle(sub).color]));
    const back = luminance(pixel([background]));
    return (Math.max(foreground, back) + 0.05) / (Math.min(foreground, back) + 0.05);
  }, SUBHEADING);
}

async function openAt(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
}

/** Multiplies both texts' size by 1.6, standing in for a visitor's enlarged text. */
async function enlargeText(page: Page) {
  await page.addStyleTag({
    content:
      "main section h1 { font-size: calc(1.6 * clamp(26px, 3.5vw, 44px)) !important; }" +
      "main section p { font-size: calc(1.6 * clamp(16px, 1.5vw, 18px)) !important; }",
  });
}

async function boxes(page: Page) {
  const band = await hero(page).boundingBox();
  const heading = await hero(page).getByRole("heading", { level: 1 }).boundingBox();
  const sub = await subheading(page).boundingBox();
  if (!band || !heading || !sub) {
    throw new Error("expected layout boxes for the hero, its heading and its subheading");
  }
  return { band, heading, sub };
}

async function expectBothInFull(page: Page, label: string) {
  const { band, heading, sub } = await boxes(page);
  for (const [name, box] of [["heading", heading], ["subheading", sub]] as const) {
    expect.soft(box.y, `${name} top at ${label}`).toBeGreaterThanOrEqual(band.y - 0.5);
    expect.soft(box.y + box.height, `${name} bottom at ${label}`).toBeLessThanOrEqual(band.y + band.height + 0.5);
  }
  expect.soft(sub.y, `subheading after heading at ${label}`).toBeGreaterThanOrEqual(heading.y + heading.height - 0.5);
  const overflow = await hero(page).evaluate((element) => element.scrollHeight - element.clientHeight);
  expect.soft(overflow, `hero overflow at ${label}`).toBeLessThanOrEqual(0);
}

test("keeps the hero as tall as it was before the opening changed, wherever the opening fits", async ({ page }) => {
  const expected = HEIGHT_BEFORE[test.info().project.name];
  expect(expected, "heights recorded for this browser project").toBeDefined();
  for (const width of WIDTHS) {
    await openAt(page, width);
    const box = await hero(page).boundingBox();
    expect.soft(Math.abs((box?.height ?? 0) - expected[width]), `hero height at ${width}px`).toBeLessThanOrEqual(1);
  }
});

/** The site mark in the header is the one picture the first view may fetch promptly. */
const isSiteMark = (url: string) => url.includes("logo-elemwave");

test("shows no picture in the hero", async ({ page }) => {
  await page.goto("/");
  const band = hero(page);

  await expect(band.getByRole("heading", { level: 1, name: HEADING, exact: true })).toBeVisible();
  await expect(band.getByRole("img")).toHaveCount(0);
  await expect(band.locator("[data-layer]")).toHaveCount(0);
});

test("asks the browser for no airplane picture and preloads none", async ({ page }) => {
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const preloadedPictures = await page
    .locator('link[rel="preload"][as="image"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));

  expect(requested.filter((url) => url.includes("hero-"))).toEqual([]);
  expect(preloadedPictures.filter((href) => !isSiteMark(href))).toEqual([]);
});

test("centres the heading and the subheading across the hero and the pair down it", async ({ page }) => {
  for (const width of [360, 768, 1050, 1440]) {
    await openAt(page, width);
    const { band, heading, sub } = await boxes(page);
    const centreAcross = band.x + band.width / 2;

    for (const [name, box, locator] of [
      ["heading", heading, hero(page).getByRole("heading", { level: 1 })],
      ["subheading", sub, subheading(page)],
    ] as const) {
      expect(Math.abs(box.x + box.width / 2 - centreAcross), `${name} across at ${width}px`).toBeLessThanOrEqual(1);
      expect(await locator.evaluate((el) => getComputedStyle(el).textAlign), `${name} alignment at ${width}px`).toBe(
        "center",
      );
    }

    const pairCentreDown = (heading.y + sub.y + sub.height) / 2;
    expect(Math.abs(pairCentreDown - (band.y + band.height / 2)), `pair down at ${width}px`).toBeLessThanOrEqual(1);
  }
});

test("shows both texts in full inside the hero at every width", async ({ page }) => {
  for (const width of WIDTHS) {
    await openAt(page, width);
    await expectBothInFull(page, `${width}px`);
  }

  await openAt(page, 360);
  await enlargeText(page);
  await expectBothInFull(page, "360px with enlarged text");
});

test("grows the hero by only what enlarged text needs and cuts neither text", async ({ page }) => {
  await openAt(page, 360);
  await enlargeText(page);
  const { band, heading, sub } = await boxes(page);
  const next = await page.locator("main section").nth(1).boundingBox();
  const bandPadding = await hero(page)
    .locator(":scope > div")
    .evaluate((element) => parseFloat(getComputedStyle(element).paddingTop));
  const pair = sub.y + sub.height - heading.y;

  expect(band.height).toBeGreaterThan(HEIGHT_BEFORE[test.info().project.name][360]);
  expect(heading.y).toBeGreaterThanOrEqual(band.y - 0.5);
  expect(sub.y + sub.height).toBeLessThanOrEqual(band.y + band.height + 0.5);
  expect(next?.y ?? 0).toBeGreaterThanOrEqual(sub.y + sub.height - 0.5);
  expect(band.height).toBeLessThanOrEqual(pair + 2 * bandPadding + 1);
});

test("keeps the former headline's words out of what the hero presents, where its former height is held", async ({
  page,
}) => {
  for (const width of [360, 511, 886]) {
    await openAt(page, width);
    const presented = await hero(page).ariaSnapshot();
    expect.soft(presented, `hero at ${width}px`).toContain(HEADING);
    expect.soft(presented, `hero at ${width}px`).not.toMatch(/innovative solutions|electromagnetics simulations/i);
  }
});

test("shows the question as the page's single main heading with the subheading beneath it", async ({ page }) => {
  await page.goto("/");
  const band = hero(page);
  const heading = page.getByRole("heading", { level: 1 });

  await expect(heading).toHaveCount(1);
  await expect(heading).toHaveAccessibleName(HEADING);
  await expect(band.getByRole("heading")).toHaveCount(1);
  await expect(subheading(page)).toBeVisible();
  expect(await subheading(page).evaluate((element) => element.tagName)).toBe("P");

  const headingBox = await heading.boundingBox();
  const subheadingBox = await subheading(page).boundingBox();
  if (!headingBox || !subheadingBox) {
    throw new Error("expected layout boxes for the heading and the subheading");
  }
  expect(subheadingBox.y).toBeGreaterThanOrEqual(headingBox.y + headingBox.height - 0.5);
});

test("sets the subheading smaller and lighter than the heading, with contrast of at least 4.5 to 1", async ({ page }) => {
  await page.goto("/");
  const heading = hero(page).getByRole("heading", { level: 1 });
  const style = (locator: typeof heading) =>
    locator.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { size: parseFloat(computed.fontSize), weight: Number(computed.fontWeight) };
    });

  const headingStyle = await style(heading);
  const subheadingStyle = await style(subheading(page));

  expect(subheadingStyle.size).toBeLessThan(headingStyle.size);
  expect(subheadingStyle.weight).toBeLessThan(headingStyle.weight);
  expect(await contrastOverBand(page)).toBeGreaterThanOrEqual(4.5);
});

test("shows both texts in sentence case, not in capitals", async ({ page }) => {
  await page.goto("/");
  const transform = (locator: ReturnType<typeof subheading>) =>
    locator.evaluate((element) => getComputedStyle(element).textTransform);

  expect(await transform(hero(page).getByRole("heading", { level: 1 }))).toBe("none");
  expect(await transform(subheading(page))).toBe("none");
  await expect(hero(page).getByRole("heading", { level: 1 })).toHaveText(HEADING);
});

test.describe("with scripts switched off", () => {
  test.use({ javaScriptEnabled: false });

  test("shows the heading and subheading when the browser runs no scripts", async ({ page }) => {
    await openAt(page, 1280);
    const band = await hero(page).boundingBox();
    const heading = hero(page).getByRole("heading", { level: 1, name: HEADING, exact: true });

    await expect(heading).toBeVisible();
    await expect(subheading(page)).toBeVisible();
    for (const box of [await heading.boundingBox(), await subheading(page).boundingBox()]) {
      if (!band || !box) {
        throw new Error("expected layout boxes for the hero and its texts");
      }
      expect(box.y).toBeGreaterThanOrEqual(band.y);
      expect(box.y + box.height).toBeLessThanOrEqual(band.y + band.height);
    }
    expect(Math.abs((band?.height ?? 0) - HEIGHT_BEFORE[test.info().project.name][1280])).toBeLessThanOrEqual(1);
  });
});

test("answers that the CAD-model picture does not exist", async ({ page }) => {
  const response = await page.request.get("/images/hero-a320-cad.webp");

  expect(response.status()).toBe(404);
});
