import { expect, test } from "@playwright/test";

test("a visitor can reach the home page and open the booking dialog", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Elemwave/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("button", { name: /schedule a meeting/i }).first().click();

  const scheduler = page.locator("iframe").first();
  await expect(scheduler).toBeVisible();
  await expect(scheduler).toHaveAttribute(
    "src",
    /^https:\/\/calendly\.com\/jose-aircury\/30min(?:[?#]|$)/,
  );
});
