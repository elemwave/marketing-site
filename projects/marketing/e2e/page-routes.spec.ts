import { expect, test } from "@playwright/test";

const ROUTES = [
  { path: "/", heading: "INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS" },
  { path: "/partnerships", heading: "Partnerships Built On Technical Trust" },
  { path: "/team", heading: "The people behind Elemwave" },
  { path: "/team/", heading: "The people behind Elemwave" },
  { path: "/contact", heading: "Contact us" },
  { path: "/integrated-policy", heading: "Integrated policy" },
  { path: "/privacy-policy", heading: "Privacy policy" },
  { path: "/missing-page-for-route-test", heading: "Page not found" },
];

for (const { path, heading } of ROUTES) {
  test(`${path} loads and presents its primary heading`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response).not.toBeNull();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  });
}
