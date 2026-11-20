import { expect, test, type Locator, type Page, type Route } from "@playwright/test";

/**
 * The challenge videos as a browser plays them: Radiated emissions, Radiated
 * immunity and Conducted susceptibility show Elemwave's own simulation videos
 * from YouTube's privacy-enhanced player. YouTube is stubbed, so the gate never
 * depends on a third party: the stub frame answers the page's `listening`
 * handshake and reports playback only when a test asks it to.
 */
const PLAYER_HOST = "https://www.youtube-nocookie.com";
const YOUTUBE = /youtube|ytimg/;
const MIN_PICTURE_HEIGHT = 220;

const VIDEO_ITEMS = {
  "Radiated emissions": { still: "problem-radiated-emissions.jpg", ratio: 4 / 3 },
  "Radiated immunity": { still: "problem-radiated-immunity.jpg", ratio: 16 / 9 },
  "Conducted susceptibility": { still: "problem-conducted-susceptibility.jpg", ratio: 16 / 9 },
} as const;
type VideoItem = keyof typeof VIDEO_ITEMS;
const VIDEO_NAMES = Object.keys(VIDEO_ITEMS) as VideoItem[];

/** A player that answers the handshake and says it is playing only when `reportPlaying()` is called. */
const STUB_PLAYER = `<!doctype html><title>player</title><body style="margin:0;background:#000"><script>
window.greeted = false;
window.addEventListener("message", (event) => {
  try {
    const message = JSON.parse(event.data);
    if (message.event === "listening") { window.greeted = true; window.widgetId = message.id; }
  } catch (error) { /* not the page's protocol */ }
});
window.reportPlaying = () => parent.postMessage(JSON.stringify({ event: "onStateChange", info: 1, id: window.widgetId, channel: "widget" }), "*");
</script></body>`;

const problems = (page: Page) => page.locator("#problems");
const playerFrames = (page: Page) => problems(page).locator("iframe");
const still = (page: Page, item: string) => problems(page).getByRole("img", { name: new RegExp(`^${item} video`) });
/** The shown video item's picture area: the box every item's picture fills, holding the still and the player. */
const pictureArea = (page: Page) => playerFrames(page).locator("xpath=../..");

/** Stubs every YouTube host, so a test never reaches the third party. */
const stubYouTube = async (page: Page) => {
  await page.route(`${PLAYER_HOST}/**`, (route) => route.fulfill({ status: 200, contentType: "text/html", body: STUB_PLAYER }));
  await page.route(/https:\/\/([a-z0-9-]+\.)*(youtube\.com|ytimg\.com)\//, (route) => route.fulfill({ status: 204 }));
};

/** Every request the page and its frames make to a YouTube host, as the browser sends it. */
const youtubeRequests = (page: Page) => {
  const seen: string[] = [];
  page.on("request", (request) => {
    if (YOUTUBE.test(new URL(request.url()).host)) seen.push(request.url());
  });
  return seen;
};

/** Chooses an item in The challenges, repeating the click until the tab reports it is chosen. */
const choose = (page: Page, item: string) => {
  const tab = problems(page).getByRole("button", { name: item });
  return expect(async () => {
    await tab.click();
    await expect(tab).toHaveAttribute("aria-pressed", "true", { timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
};

const box = async (locator: Locator) => (await locator.boundingBox())!;

/** The stub player frame of the shown video item, once it has been greeted by the page. */
const greetedPlayer = async (page: Page) => {
  await expect(playerFrames(page)).toHaveCount(1);
  const frame = (await (await playerFrames(page).elementHandle())!.contentFrame())!;
  await expect.poll(() => frame.evaluate(() => (window as unknown as { greeted: boolean }).greeted)).toBe(true);
  return frame;
};

/** The shown video item's picture area and its player, measured together so a scroll in progress moves both alike. */
const areaAndFrame = (page: Page) =>
  playerFrames(page).evaluate((element) => {
    const rect = (target: Element) => {
      const { x, y, width, height } = target.getBoundingClientRect();
      return { x, y, width, height };
    };
    return { own: rect(element.parentElement!.parentElement!), frame: rect(element) };
  });

const opacityOf = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).opacity);

test.beforeEach(async ({ page }) => {
  await stubYouTube(page);
});

test("makes no request to a YouTube host on load or before any item is chosen", async ({ page }) => {
  const requests = youtubeRequests(page);
  await page.goto("/");
  await expect(problems(page).getByRole("button")).toHaveCount(5);
  await problems(page).scrollIntoViewIfNeeded();
  await page.waitForLoadState("load");

  expect(requests).toEqual([]);
});

test("points each video item's tab circle and picture area at the site's own thumbnail", async ({ page }) => {
  await page.goto("/");
  const origin = new URL(page.url()).origin;

  for (const item of VIDEO_NAMES) {
    const circle = problems(page).getByRole("button", { name: item }).locator("span").first();
    await choose(page, item);
    const addresses = {
      circle: await circle.evaluate((element) => getComputedStyle(element).backgroundImage),
      still: await still(page, item).evaluate((element) => getComputedStyle(element).backgroundImage),
    };

    const expected = `url("${origin}/images/${VIDEO_ITEMS[item].still}")`;
    expect(addresses).toEqual({ circle: expected, still: expected });
  }
});

for (const width of [390, 1024, 1440]) {
  test(`shows each video item's player frame in the same picture area as Lightning's, at ${width} px`, { tag: "@desktop-only" }, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await choose(page, "Lightning");
    const area = await box(problems(page).getByRole("img", { name: /^Lightning screenshot/ }));

    for (const item of VIDEO_NAMES) {
      await choose(page, item);
      await expect(playerFrames(page)).toHaveCount(1);
      const { own, frame } = await areaAndFrame(page);

      expect.soft(Math.abs(own.width - area.width), `${item} area width at ${width}`).toBeLessThanOrEqual(1);
      expect.soft(Math.abs(own.height - area.height), `${item} area height at ${width}`).toBeLessThanOrEqual(1);
      expect.soft(frame.x, `${item} left at ${width}`).toBeGreaterThanOrEqual(own.x - 1);
      expect.soft(frame.y, `${item} top at ${width}`).toBeGreaterThanOrEqual(own.y - 1);
      expect.soft(frame.x + frame.width, `${item} right at ${width}`).toBeLessThanOrEqual(own.x + own.width + 1);
      expect.soft(frame.y + frame.height, `${item} bottom at ${width}`).toBeLessThanOrEqual(own.y + own.height + 1);
      expect.soft(Math.abs(frame.width / frame.height - VIDEO_ITEMS[item].ratio), `${item} shape at ${width}`).toBeLessThan(0.02);
      expect
        .soft(Math.min(own.width - frame.width, own.height - frame.height), `${item} fills one side at ${width}`)
        .toBeLessThanOrEqual(1);
    }
  });
}

test("keeps the video item's text and still while the player frame request is held", async ({ page }) => {
  let release!: () => void;
  const released = new Promise<void>((resolve) => (release = resolve));
  await page.route(`${PLAYER_HOST}/**`, async (route: Route) => {
    await released;
    await route.fulfill({ status: 200, contentType: "text/html", body: STUB_PLAYER });
  });
  await page.goto("/");
  await choose(page, "Radiated immunity");

  await expect(problems(page).getByRole("heading", { level: 3, name: "Radiated immunity" })).toBeVisible();
  await expect(problems(page).locator("h3 ~ p").first()).toBeVisible();
  await expect(still(page, "Radiated immunity")).toBeVisible();
  await expect(playerFrames(page)).toHaveCount(1);
  expect(await opacityOf(playerFrames(page))).toBe("0");
  expect((await box(pictureArea(page))).height).toBeGreaterThanOrEqual(MIN_PICTURE_HEIGHT);
  release();
});

test("keeps the video item's title, text and picture area when the player frame request is aborted", async ({ browser, page }) => {
  await page.goto("/");
  await choose(page, "Lightning");
  const measured = (await box(problems(page).getByRole("img", { name: /^Lightning screenshot/ }))).height;

  const failing = await browser.newPage({ viewport: page.viewportSize() });
  await failing.route(`${PLAYER_HOST}/**`, (route) => route.abort());
  await failing.goto("/");
  await choose(failing, "Radiated immunity");

  await expect(problems(failing).getByRole("heading", { level: 3, name: "Radiated immunity" })).toBeVisible();
  await expect(problems(failing).locator("h3 ~ p").first()).toBeVisible();
  await expect(still(failing, "Radiated immunity")).toBeVisible();
  await expect(playerFrames(failing)).toHaveCount(1);
  expect(await opacityOf(playerFrames(failing))).toBe("0");
  expect(Math.abs((await box(pictureArea(failing))).height - measured)).toBeLessThanOrEqual(1);
  await failing.close();
});

test("keeps the still visible until the player reports that the video is playing", async ({ page }) => {
  await page.goto("/");
  await choose(page, "Radiated immunity");
  const frame = await greetedPlayer(page);

  const before = { player: await opacityOf(playerFrames(page)), still: await still(page, "Radiated immunity").isVisible() };
  await frame.evaluate(() => (window as unknown as { reportPlaying: () => void }).reportPlaying());
  await expect.poll(() => opacityOf(playerFrames(page))).toBe("1");

  expect(before).toEqual({ player: "0", still: true });
});

test("shows the still alone and requests nothing from YouTube when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests = youtubeRequests(page);
  await page.goto("/");

  for (const item of VIDEO_NAMES) {
    await choose(page, item);
    await expect(still(page, item)).toBeVisible();
    await expect(playerFrames(page)).toHaveCount(0);
  }
  expect(requests).toEqual([]);
});

test("removes the player frame when another item is chosen", async ({ page }) => {
  await page.goto("/");
  await choose(page, "Radiated immunity");
  await expect(playerFrames(page)).toHaveCount(1);

  await choose(page, "Lightning");

  await expect(playerFrames(page)).toHaveCount(0);
});

test("starts a fresh player frame after a reload and after leaving the page and returning", async ({ page }) => {
  const mark = () => playerFrames(page).evaluate((element) => element.setAttribute("data-seen", "1"));
  const freshFrame = async () => {
    await expect(playerFrames(page)).toHaveCount(0);
    await choose(page, "Radiated immunity");
    await expect(playerFrames(page)).toHaveCount(1);
    return playerFrames(page).getAttribute("data-seen");
  };
  await page.goto("/");
  await choose(page, "Radiated immunity");
  await expect(playerFrames(page)).toHaveCount(1);
  await mark();

  await page.reload();
  const afterReload = await freshFrame();
  await mark();
  await page.goto("/contact");
  await page.goBack();
  const afterReturn = await freshFrame();

  expect({ afterReload, afterReturn }).toEqual({ afterReload: null, afterReturn: null });
});
