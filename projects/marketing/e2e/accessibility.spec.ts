import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Fails with each axe violation's id, description and node count. */
async function expectNoDefiniteFailure(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();

  const violationSummary = results.violations
    .map((violation) => `${violation.id} (${violation.description}): ${violation.nodes.length} node(s)`)
    .join("\n");
  expect(results.violations, violationSummary).toEqual([]);
}

const pages = [
  { path: "/", name: "the home page" },
  { path: "/contact", name: "the contact page" },
  { path: "/partnerships", name: "the partnerships page" },
  { path: "/team", name: "the team page" },
  { path: "/privacy-policy", name: "the privacy policy page" },
  { path: "/integrated-policy", name: "the integrated policy page" },
  { path: "/this-page-does-not-exist", name: "a path with no page" },
];

for (const { path, name } of pages) {
  // One representative rendering is enough for a structural, name and contrast scan; the
  // config restricts this file to the chromium project rather than skipping here at runtime.
  test(`${name} has no definite accessibility failure at rest`, async ({ page }) => {
    await page.goto(path);

    await expectNoDefiniteFailure(page);
  });
}

/** WCAG relative luminance of an `rgb(...)` colour. */
const luminance = (rgb: string) => {
  const [r, g, b] = (rgb.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map((channel) => {
    const c = Number(channel) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

test("the home page has no definite accessibility failure with a problem chosen in the research tree", async ({ page }) => {
  await page.goto("/");
  await page.locator("#problems").getByRole("button", { name: "Lightning" }).click();
  await expect(page.locator("#software").getByRole("button", { name: "Cable Solver" })).toHaveAttribute("data-relation", "related");

  await expectNoDefiniteFailure(page);
});

test("unrelated carousel dots keep a 3:1 contrast against the section with a problem chosen", async ({ page }) => {
  await page.goto("/");
  await page.locator("#problems").getByRole("button", { name: "Lightning" }).click();
  const science = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { level: 2, name: "Peer-Reviewed Publications" }) });
  const background = await science.evaluate((section) => getComputedStyle(section).backgroundColor);
  const unrelated = science.locator('button[data-relation="unrelated"]:not([aria-current])');

  const colours = await unrelated.evaluateAll((dots) =>
    dots.map((dot) => ({ colour: getComputedStyle(dot).backgroundColor, opacity: getComputedStyle(dot).opacity })),
  );

  expect(colours.length).toBeGreaterThan(0);
  for (const { colour, opacity } of colours) {
    expect(opacity).toBe("1");
    expect(contrast(colour, background)).toBeGreaterThanOrEqual(3);
  }
});
