import { expect, test, type Page } from "@playwright/test";

/** The content policy violations the browser reports on the page, as they arrive. */
function policyViolations(page: Page): string[] {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) violations.push(message.text());
  });
  return violations;
}

test("the site sends its hardening headers and an enforcing content policy", async ({ page }) => {
  const violations = policyViolations(page);

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
  const violations = policyViolations(page);

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
  const bookingIframe = page.getByTitle("Schedule a meeting with Elemwave");
  await expect(bookingIframe).toBeVisible();
  // Wait for the framed document, not page-wide network quiet: the dialog
  // does not reload the host page, and networkidle is forbidden by sonarjs.
  await expect(bookingIframe.contentFrame().locator("html")).toBeAttached();

  expect(violations).toEqual([]);
});

test("choosing each of the three video items raises no policy violation", async ({ page }) => {
  const violations = policyViolations(page);

  // YouTube is stubbed so the gate does not depend on a third party being
  // reachable; as for the booking dialog, the policy still decides in the
  // renderer whether the frame may load at all.
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>player</title>" }),
  );
  await page.route(/https:\/\/([a-z0-9-]+\.)*(youtube\.com|ytimg\.com)\//, (route) => route.fulfill({ status: 204 }));

  await page.goto("/");
  const challenges = page.locator("#problems");
  for (const item of ["Radiated emissions", "Radiated immunity", "Conducted susceptibility"]) {
    const tab = challenges.getByRole("button", { name: item });
    await expect(async () => {
      await tab.click();
      await expect(tab).toHaveAttribute("aria-pressed", "true", { timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
    const player = challenges.locator("iframe");
    await expect(player).toHaveCount(1);
    await expect(player.contentFrame().locator("html")).toBeAttached();
  }

  expect(violations).toEqual([]);
});
