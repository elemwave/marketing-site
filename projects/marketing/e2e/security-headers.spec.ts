import { expect, test } from "@playwright/test";

test("the site sends its hardening headers and an enforcing content policy", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) violations.push(message.text());
  });

  const response = await page.goto("/");
  expect(response).not.toBeNull();

  const headers = response!.headers();
  expect(headers["content-security-policy-report-only"]).toBeUndefined();

  const policy = headers["content-security-policy"];
  expect(policy).toBeDefined();
  expect(headers["x-content-type-options"]).toBe("nosniff");

  const scriptSrc = policy.split(";").find((directive) => directive.trim().startsWith("script-src"))!;
  expect(scriptSrc).not.toContain("'unsafe-inline'");
  expect(scriptSrc).toContain("sha256-");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(violations).toEqual([]);
});

test("opening the booking dialog raises no policy violation", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) violations.push(message.text());
  });

  // Calendly is stubbed so the gate does not depend on a third party being
  // reachable. The policy is still evaluated against the real origins, because a
  // refusal happens in the renderer and never reaches a route handler.
  await page.route("https://assets.calendly.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "image/svg+xml", body: "<svg xmlns='http://www.w3.org/2000/svg'/>" }),
  );
  await page.route("https://calendly.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>scheduler</title>" }),
  );

  await page.goto("/");
  await page.getByRole("button", { name: /schedule a meeting/i }).first().click();
  await expect(page.locator("iframe").first()).toBeVisible();
  await page.waitForLoadState("networkidle");

  expect(violations).toEqual([]);
});
