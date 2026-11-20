import { expect, test, type Page } from "@playwright/test";
import { requirePlayableChallengeVideoFixture, routeChallengeVideosToFixture } from "./fixtures/challenge-video";

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

test("choosing each of the four video items raises no policy violation", async ({ page }) => {
  const violations = policyViolations(page);

  // The videos are the site's own; the stand-in serves them so playback does
  // not depend on the browser's H.264 support, and the policy still decides
  // in the renderer whether the media may load at all.
  await routeChallengeVideosToFixture(page);

  await page.goto("/");
  await requirePlayableChallengeVideoFixture(page);
  for (const { section, item } of [
    { section: "#problems", item: "Radiated emissions" },
    { section: "#problems", item: "Radiated immunity" },
    { section: "#problems", item: "Conducted susceptibility" },
    { section: "#software", item: "EW Workbench" },
  ]) {
    const items = page.locator(section);
    const tab = items.getByRole("button", { name: item, exact: true });
    await expect(async () => {
      await tab.click();
      await expect(tab).toHaveAttribute("aria-pressed", "true", { timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
    const video = items.locator("video");
    await expect(video, item).toHaveCount(1);
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState >= 2 || element.error !== null)).toBe(true);
  }

  expect(violations).toEqual([]);
});
