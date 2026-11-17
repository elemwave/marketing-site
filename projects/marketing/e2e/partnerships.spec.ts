import { expect, test, type Page } from "@playwright/test";

test("the partner marquee sits above the band it is tucked under", async ({ page }) => {
  await page.goto("/partnerships");

  // Freeze the strip so the card measured is the card queried.
  await page.addStyleTag({
    content: ".animate-logo-scroll { animation: none !important; }",
  });

  const firstLogo = page.getByRole("img", { name: "Airbus" });
  await expect(firstLogo).toBeVisible();

  const box = await firstLogo.boundingBox();
  if (!box) throw new Error("the first partner logo has no box to measure");

  // The band above is positioned, so without its own stacking the strip would
  // paint underneath it and every card would lose its top edge.
  const painted = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.tagName.toLowerCase(),
    { x: box.x + box.width / 2, y: box.y + 2 },
  );

  expect(painted).toBe("img");
});

const PARTNER_NAMES = [
  "Airbus",
  "Universidad de Granada",
  "Universitat Politècnica de Catalunya",
  "Royal Netherlands Aerospace Centre",
  "Instituto Nacional de Técnica Aeroespacial",
];

const FORMER_PARTNER_FILES = [
  "logo-uv",
  "logo-uca",
  "logo-university-of-manchester",
  "logo-york-university",
  "logo-amasya-university",
  "logo-politecnica-marche",
  "logo-hartree-centre",
  "logo-wavecore",
  "logo-msca",
  "logo-cost",
  "logo-aei",
  "logo-european-union",
];

const FORMER_PARTNER_NAMES = [
  "Universitat de València",
  "Universidad de Cádiz",
  "The University of Manchester",
  "University of York",
  "Amasya Üniversitesi",
  "Università Politecnica delle Marche",
  "Hartree Centre",
  "Wavecore",
  "Marie Skłodowska-Curie Actions",
  "COST",
  "Agencia Estatal de Investigación",
  "European Union",
];

const MARK_GAP_LIMIT = 140; // card padding 40 + widest card gap 90 + 10 of slack

test("the strip presents exactly the five partners in order", async ({ page }) => {
  await page.goto("/partnerships");

  const marks = page.getByRole("region", { name: "Partners" }).getByRole("img");

  await expect(marks).toHaveCount(PARTNER_NAMES.length);
  expect(await marks.evaluateAll((images) => images.map((image) => image.getAttribute("alt")))).toEqual(
    PARTNER_NAMES,
  );
});

test("no former partner is on the page", async ({ page }) => {
  await page.goto("/partnerships");

  const marks = await page
    .locator("img")
    .evaluateAll((images) =>
      images.map((image) => ({ src: image.getAttribute("src") ?? "", alt: image.getAttribute("alt") ?? "" })),
    );

  for (const mark of marks) {
    for (const file of FORMER_PARTNER_FILES) {
      expect(mark.src).not.toContain(file);
    }
    expect(FORMER_PARTNER_NAMES).not.toContain(mark.alt);
  }
});

/** Freeze the strip's animation at `fraction` of its cycle and read where every mark sits. */
async function markBoxesAt(page: Page, fraction: number, endOffsetMs = 0) {
  return page.evaluate(
    ({ fraction: at, endOffsetMs: offset }) => {
      const animation = document
        .getAnimations()
        .find((candidate) => "animationName" in candidate && candidate.animationName === "logo-scroll");
      if (!animation) throw new Error("the strip has no running logo-scroll animation");
      const duration = Number(animation.effect?.getComputedTiming().duration);
      animation.pause();
      animation.currentTime = duration * at - offset;
      return [...document.querySelectorAll('section[aria-label="Partners"] img')].map((image) => {
        const { x, width } = image.getBoundingClientRect();
        return { x, width };
      });
    },
    { fraction, endOffsetMs },
  );
}

const VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
];

for (const viewport of VIEWPORTS) {
  test(`the strip has no empty stretch at ${viewport.width}x${viewport.height}`, async ({ page, isMobile }) => {
    test.skip(isMobile, "viewport widths are set explicitly; the desktop projects cover them");
    await page.setViewportSize(viewport);
    await page.goto("/partnerships");
    await expect(page.getByRole("img", { name: "Airbus" })).toBeVisible();

    for (const [fraction, endOffsetMs] of [[0, 0], [0.5, 0], [1, 1]] as const) {
      const boxes = (await markBoxesAt(page, fraction, endOffsetMs)).sort((a, b) => a.x - b.x);

      expect(boxes[0].x, `first mark at ${fraction}`).toBeLessThanOrEqual(MARK_GAP_LIMIT);
      const last = boxes[boxes.length - 1];
      expect(last.x + last.width, `last mark at ${fraction}`).toBeGreaterThanOrEqual(
        viewport.width - MARK_GAP_LIMIT,
      );
      for (let index = 1; index < boxes.length; index += 1) {
        const gap = boxes[index].x - (boxes[index - 1].x + boxes[index - 1].width);
        expect(gap, `gap before mark ${index} at ${fraction}`).toBeLessThanOrEqual(MARK_GAP_LIMIT);
      }
    }
  });
}

test("the strip keeps its pace", async ({ page, isMobile }) => {
  test.skip(isMobile, "the pace is the desktop pace");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/partnerships");
  await expect(page.getByRole("img", { name: "Airbus" })).toBeVisible();

  const pixelsPerSecond = await page.evaluate(() => {
    const row = document.querySelector<HTMLElement>(".animate-logo-scroll");
    const animation = document
      .getAnimations()
      .find((candidate) => "animationName" in candidate && candidate.animationName === "logo-scroll");
    if (!row || !animation) throw new Error("the strip has no running logo-scroll animation");
    const seconds = Number(animation.effect?.getComputedTiming().duration) / 1000;
    return row.getBoundingClientRect().width / 2 / seconds;
  });

  expect(pixelsPerSecond).toBeGreaterThanOrEqual(70);
  expect(pixelsPerSecond).toBeLessThanOrEqual(80);
});

test("the strip keeps its height whether or not the pictures arrive", async ({ page, context }) => {
  await page.goto("/partnerships");
  const region = page.getByRole("region", { name: "Partners" });
  await expect(page.getByRole("img", { name: "Airbus" })).toBeVisible();
  const loadedHeight = (await region.boundingBox())?.height;

  const blocked = await context.newPage();
  await blocked.route("**/images/logo-*", (route) => route.abort());
  await blocked.goto("/partnerships");
  const blockedRegion = blocked.getByRole("region", { name: "Partners" });
  await expect(blockedRegion).toBeVisible();

  expect((await blockedRegion.boundingBox())?.height).toBe(loadedHeight);
  for (const name of PARTNER_NAMES) {
    await expect(blocked.getByRole("img", { name })).toHaveCount(1);
  }
});
