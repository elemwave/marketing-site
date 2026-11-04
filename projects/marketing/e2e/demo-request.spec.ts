import { expect, test, type Page } from "@playwright/test";

const formURL = "https://forms.gle/nYArag8bmw7HwwAaA";
const formRoute = /^https:\/\/(docs\.google\.com\/forms|forms\.gle)\//;
const demoName = "Download a Demo (opens in a new tab)";

test.use({ reducedMotion: "reduce" });

test.beforeEach(async ({ context, page }) => {
  await context.route(formRoute, (route) => route.fulfill({
    contentType: "text/html",
    body: "<!doctype html><html lang='en'><title>Demo request</title><h1>Demo request</h1></html>",
  }));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

async function openForm(page: Page) {
  const opened = page.context().waitForEvent("page", { timeout: 5000 });
  await page.getByRole("link", { name: demoName, exact: true }).click();
  const form = await opened;
  await expect(form).toHaveURL(formURL);
  return form;
}

test("gives meeting and demo requests separate equal peer panels on a wide screen", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const meeting = page.getByRole("region", { name: "Book a Meeting", exact: true });
  const demo = page.getByRole("region", { name: "Download a Demo", exact: true });
  await expect(meeting.getByRole("button", { name: "Schedule a Call" })).toBeVisible();
  await expect(meeting.getByRole("link", { name: demoName })).toHaveCount(0);
  await expect(demo.getByRole("link", { name: demoName })).toBeVisible();
  await expect(demo.getByRole("button")).toHaveCount(0);
  expect(await meeting.evaluate((element) => element.nextElementSibling?.getAttribute("aria-labelledby")))
    .toBe(await demo.getAttribute("aria-labelledby"));
  const bookingBox = (await meeting.boundingBox())!;
  const demoBox = (await demo.boundingBox())!;
  expect(Math.abs(bookingBox.y - demoBox.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(bookingBox.width - demoBox.width)).toBeLessThanOrEqual(1);
  expect(demoBox.x).toBeGreaterThan(bookingBox.x + bookingBox.width);
});

test("stacks the separate demo panel below the meeting panel on a phone without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 851 });
  const meeting = page.getByRole("region", { name: "Book a Meeting", exact: true });
  const demo = page.getByRole("region", { name: "Download a Demo", exact: true });
  await expect(meeting).toBeVisible();
  await expect(demo).toBeVisible();
  const bookingBox = (await meeting.boundingBox())!;
  const demoBox = (await demo.boundingBox())!;
  expect(demoBox.y).toBeGreaterThan(bookingBox.y + bookingBox.height);
  for (const panel of [meeting, demo]) {
    const panelBox = (await panel.boundingBox())!;
    expect(panelBox.x).toBeGreaterThanOrEqual(0);
    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(393);
    const contents = panel.locator("h2, p, a, button");
    for (const element of await contents.all()) {
      const box = (await element.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(panelBox.x);
      expect(box.x + box.width).toBeLessThanOrEqual(panelBox.x + panelBox.width);
      expect(await element.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    }
    const action = (await panel.locator("a, button").boundingBox())!;
    expect(action.width).toBeGreaterThanOrEqual(24);
    expect(action.height).toBeGreaterThanOrEqual(24);
  }
});

test("opens the demo request form in a new tab and leaves the home page where it was", async ({ page }) => {
  await page.getByRole("link", { name: demoName }).scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => window.scrollY);
  await openForm(page);
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("opens the demo request form from the keyboard alone", async ({ page, context }) => {
  await page.locator("#book").getByRole("button").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: demoName })).toBeFocused();
  const opened = context.waitForEvent("page", { timeout: 5000 });
  await page.keyboard.press("Enter");
  await expect(await opened).toHaveURL(formURL);
});

test("leaves the home page usable when the demo request form cannot be reached", async ({ page, context }) => {
  await context.route(formRoute, (route) => route.abort("internetdisconnected"));
  await context.route("https://calendly.com/**", (route) => route.fulfill({ body: "Scheduler" }));
  const opened = context.waitForEvent("page", { timeout: 5000 });
  await page.getByRole("link", { name: demoName }).click();
  await opened;
  await expect(page).toHaveURL(/\/$/);
  await page.locator("#book").getByRole("button").click();
  await expect(page.locator("iframe").first()).toBeVisible();
});

test("opens the form again in a fresh tab after its tab is closed", async ({ page }) => {
  await page.getByRole("link", { name: demoName }).scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => window.scrollY);
  const first = await openForm(page);
  await first.close();
  const second = await openForm(page);
  expect(second).not.toBe(first);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
});

test("opens the form once per activation and sends nothing on the visitor's behalf", async ({ page, context }) => {
  const methods: string[] = [];
  context.on("request", (request) => {
    if (formRoute.test(request.url())) methods.push(request.method());
  });
  await openForm(page);
  await openForm(page);
  await openForm(page);
  expect(context.pages()).toHaveLength(4);
  expect(methods).toEqual(["GET", "GET", "GET"]);
});
