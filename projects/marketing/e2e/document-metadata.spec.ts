import { expect, test } from "@playwright/test";

const TEMPLATED_PAGES = [
  { path: "/contact", title: "Contact" },
  { path: "/partnerships", title: "Partnerships" },
  { path: "/privacy-policy", title: "Privacy policy" },
  { path: "/integrated-policy", title: "Integrated policy" },
  { path: "/missing-page-for-route-test", title: "Page not found" },
];

for (const { path, title } of TEMPLATED_PAGES) {
  test(`${path} serves its document title through the root layout's template`, async ({ page }) => {
    await page.goto(path);

    await expect(page).toHaveTitle(`${title} | Elemwave`);
  });
}

test("the home page serves its own title with no brand suffix added", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Elemwave - Advanced electromagnetics simulations");
});

test("the shared link-preview image resolves to an absolute production address", async ({ page }) => {
  await page.goto("/");

  const content = await page.locator('meta[property="og:image"]').getAttribute("content");

  expect(content).toMatch(/^https:\/\/www\.elemwave\.com\//);
});
