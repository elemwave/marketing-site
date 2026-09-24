import { expect, test, type Locator, type Page } from "@playwright/test";

const boxOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("expected a layout box");
  }
  return box;
};

const styleOf = (locator: Locator) =>
  locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return { backgroundColor: s.backgroundColor, color: s.color };
  });

/**
 * Both pills use `transition-colors`, so a style read straight after
 * `hover()` can land mid-transition. Waits for two consecutive reads to
 * agree, which settles regardless of the transition's exact duration.
 */
const settledStyleOf = async (locator: Locator) => {
  let previous = await styleOf(locator);
  await expect
    .poll(async () => {
      const current = await styleOf(locator);
      const stable =
        current.backgroundColor === previous.backgroundColor && current.color === previous.color;
      previous = current;
      return stable;
    })
    .toBe(true);
  return previous;
};

const openCertifications = async (page: Page) => {
  await page.goto("/");
  await page.getByRole("heading", { name: "Certifications" }).scrollIntoViewIfNeeded();
};

test.describe("Certifications section document controls, at desktop widths", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1400 });
  });

  test("keeps Certificate and Annex on the same row, for every card, with neither overflowing", async ({
    page,
  }) => {
    await openCertifications(page);

    const cards = await page.getByRole("article").all();
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const cardBox = await boxOf(card);
      const certificateBox = await boxOf(card.getByRole("link", { name: "Certificate" }));
      const annexBox = await boxOf(card.getByRole("link", { name: "Annex" }));

      expect(Math.abs(certificateBox.y - annexBox.y)).toBeLessThanOrEqual(1);
      expect(certificateBox.x + certificateBox.width).toBeLessThanOrEqual(
        cardBox.x + cardBox.width + 1,
      );
      expect(annexBox.x + annexBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);
    }
  });

  test("renders wider than the Book a Meeting panel", async ({ page }) => {
    await openCertifications(page);

    const certificationsGrid = page.getByRole("article").first().locator("..");
    const bookMeetingPanel = page
      .getByRole("heading", { name: "Book a Meeting" })
      .locator("../..");

    const gridBox = await boxOf(certificationsGrid);
    const panelBox = await boxOf(bookMeetingPanel);

    expect(gridBox.width).toBeGreaterThan(panelBox.width);
  });

  test("Certificate darkens on hover, staying legible", async ({ page, isMobile }) => {
    test.skip(isMobile, "no real pointer to hover with on a touch device");
    await openCertifications(page);

    const certificate = page.getByRole("link", { name: "Certificate" }).first();
    const resting = await settledStyleOf(certificate);

    await certificate.hover();
    const hovered = await settledStyleOf(certificate);

    expect(hovered.backgroundColor).not.toBe(resting.backgroundColor);
    expect(hovered.color).toBe(resting.color);
    expect(hovered.color).not.toBe(hovered.backgroundColor);
  });

  test("Annex inverts to filled on hover, staying legible", async ({ page, isMobile }) => {
    test.skip(isMobile, "no real pointer to hover with on a touch device");
    await openCertifications(page);

    const annex = page.getByRole("link", { name: "Annex" }).first();
    const resting = await settledStyleOf(annex);

    await annex.hover();
    const hovered = await settledStyleOf(annex);

    expect(hovered.backgroundColor).not.toBe(resting.backgroundColor);
    expect(hovered.color).not.toBe(resting.color);
    expect(hovered.color).not.toBe(hovered.backgroundColor);
    expect(hovered.backgroundColor).toBe(resting.color);
  });
});

test("neither document control overflows its card at a 390x1800 mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 1800 });
  await openCertifications(page);

  const cards = await page.getByRole("article").all();
  for (const card of cards) {
    const cardBox = await boxOf(card);
    const certificateBox = await boxOf(card.getByRole("link", { name: "Certificate" }));
    const annexBox = await boxOf(card.getByRole("link", { name: "Annex" }));

    expect(certificateBox.x).toBeGreaterThanOrEqual(cardBox.x - 1);
    expect(certificateBox.x + certificateBox.width).toBeLessThanOrEqual(
      cardBox.x + cardBox.width + 1,
    );
    expect(annexBox.x).toBeGreaterThanOrEqual(cardBox.x - 1);
    expect(annexBox.x + annexBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);
  }
});
