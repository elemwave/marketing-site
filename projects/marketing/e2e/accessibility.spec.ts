import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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

    const results = await new AxeBuilder({ page }).analyze();

    const violationSummary = results.violations
      .map((violation) => `${violation.id} (${violation.description}): ${violation.nodes.length} node(s)`)
      .join("\n");
    expect(results.violations, violationSummary).toEqual([]);
  });
}
