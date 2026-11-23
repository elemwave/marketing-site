import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  CHALLENGE_VIDEO_FILE as VIDEO_FILE,
  fulfilWithChallengeVideoFixture as fulfilWithFixture,
  requirePlayableChallengeVideoFixture as requirePlayableFixture,
  routeChallengeVideosToFixture as routeVideosToFixture,
} from "./fixtures/challenge-video";

/**
 * The site's item videos as a browser plays them: Radiated emissions, Radiated
 * immunity and Conducted susceptibility in The challenges play Elemwave's own
 * simulations, and The Workbench in Our Solution plays Elemwave's own
 * recording of its workbench, all published with the site as MP4 files under
 * /images/. The cases that need a video to play serve a small WebM stand-in
 * under the item's `.mp4` address, so they do not depend on the browser's
 * H.264 support; one case plays the real files where the browser can decode
 * them.
 */
const MIN_PICTURE_HEIGHT = 220;

const SECTIONS = {
  problems: (page: Page) => page.locator("#problems"),
  software: (page: Page) => page.locator("#software"),
} as const;
type Section = keyof typeof SECTIONS;

/** Each video item: its section, its still and video files, its shape, and the still-picture item of its own section it is compared with. */
const VIDEO_ITEMS = {
  "Radiated emissions": {
    section: "problems",
    still: "problem-radiated-emissions.jpg",
    video: "problem-radiated-emissions.mp4",
    ratio: 802 / 620,
    reference: "Lightning",
  },
  "Radiated immunity": {
    section: "problems",
    still: "problem-radiated-immunity.jpg",
    video: "problem-radiated-immunity.mp4",
    ratio: 1278 / 720,
    reference: "Lightning",
  },
  "Conducted susceptibility": {
    section: "problems",
    still: "problem-conducted-susceptibility.jpg",
    video: "problem-conducted-susceptibility.mp4",
    ratio: 1250 / 720,
    reference: "Lightning",
  },
  "The Workbench": {
    section: "software",
    still: "solution-ew-workbench.jpg",
    video: "solution-ew-workbench.mp4",
    ratio: 1280 / 686,
    reference: "Multilayer surface impedances",
  },
} as const satisfies Record<string, { section: Section; still: string; video: string; ratio: number; reference: string }>;
type VideoItem = keyof typeof VIDEO_ITEMS;
const VIDEO_NAMES = Object.keys(VIDEO_ITEMS) as VideoItem[];
/** One video item of each section, for the cases that follow a single item's playback. */
const PLAYBACK_ITEMS: VideoItem[] = ["Radiated immunity", "The Workbench"];

/** The section an item stands in: a video item's own, or that of the video items a still-picture item is compared with. */
const sectionNameOf = (item: string): Section => {
  const own = (VIDEO_ITEMS as Record<string, { section: Section }>)[item]?.section;
  const asReference = Object.values(VIDEO_ITEMS).find((entry) => entry.reference === item)?.section;
  const section = own ?? asReference;
  if (!section) throw new Error(`no section is known for ${item}`);
  return section;
};
const sectionOf = (page: Page, item: string) => SECTIONS[sectionNameOf(item)](page);
const videos = (page: Page, item: VideoItem) => sectionOf(page, item).locator("video");
/** A video item's picture area: the button that plays and pauses its video, whichever name it has. */
const pictureButton = (page: Page, item: VideoItem) =>
  sectionOf(page, item).getByRole("button", { name: new RegExp(`^(Play|Pause) ${item} video`) });
/** The still beneath the video: the button's first layer, or with reduced motion the picture alone. */
const stillLayer = (page: Page, item: VideoItem) => pictureButton(page, item).locator("div").first();
const stillAlone = (page: Page, item: VideoItem) => sectionOf(page, item).getByRole("img", { name: new RegExp(`^${item} video`) });
/** A still-picture item's picture, named after it. */
const referencePicture = (page: Page, item: VideoItem) => {
  const reference = VIDEO_ITEMS[item].reference;
  return sectionOf(page, reference).getByRole("img", { name: new RegExp(`^${reference} screenshot`) });
};

/** Every video file the page requests, as the browser sends it. */
const videoRequests = (page: Page) => {
  const seen: string[] = [];
  page.on("request", (request) => {
    if (/\.(mp4|webm)(\?|$)/.test(new URL(request.url()).pathname)) seen.push(request.url());
  });
  return seen;
};

/** Chooses an item in its own section, repeating the click until the tab reports it is chosen. */
const choose = (page: Page, item: string) => {
  const tab = sectionOf(page, item).getByRole("button", { name: item, exact: true });
  return expect(async () => {
    await tab.click();
    await expect(tab).toHaveAttribute("aria-pressed", "true", { timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
};

const box = async (locator: Locator) => (await locator.boundingBox())!;
const opacityOf = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).opacity);
const currentTime = (page: Page, item: VideoItem) => videos(page, item).evaluate((element: HTMLVideoElement) => element.currentTime);
const isPaused = (page: Page, item: VideoItem) => videos(page, item).evaluate((element: HTMLVideoElement) => element.paused);

/**
 * Waits until the item's video is playing: its time advances, or wraps round to the start, which a looping
 * published file does whenever the time first read was within 0.2 s of its end. The stand-in outlasts
 * every case, so it never wraps. A stalled video keeps the time it was read at and fails both.
 */
const playsOn = async (page: Page, item: VideoItem, message?: string) => {
  await expect(videos(page, item)).toHaveCount(1);
  const start = await currentTime(page, item);
  await expect.poll(async () => {
    const time = await currentTime(page, item);
    return time > start + 0.2 || time < start;
  }, { message, timeout: 15_000 }).toBe(true);
};

/** The shown video item's picture area and its button, measured together so a scroll in progress moves both alike. */
const areaAndFrame = (page: Page, item: VideoItem) =>
  videos(page, item).evaluate((element) => {
    const rect = (target: Element) => {
      const { x, y, width, height } = target.getBoundingClientRect();
      return { x, y, width, height };
    };
    const button = element.parentElement!;
    return { own: rect(button.parentElement!), frame: rect(button) };
  });

test("downloads no video on load or before any item is chosen", async ({ page }) => {
  const requests = videoRequests(page);
  await page.goto("/");
  await expect(SECTIONS.problems(page).getByRole("button")).toHaveCount(5);
  await expect(SECTIONS.software(page).getByRole("button")).toHaveCount(11);
  await SECTIONS.problems(page).scrollIntoViewIfNeeded();
  await SECTIONS.software(page).scrollIntoViewIfNeeded();
  await page.waitForLoadState("load");

  expect({ requests, videos: await page.locator("video").count() }).toEqual({ requests: [], videos: 0 });
});

test("downloads the item's own video file from the site when an item is chosen, answered as video/mp4", async ({ page }) => {
  const elsewhere: string[] = [];
  // The page plays the stand-in, so moving on to the next item does not wait on the browser decoding a real H.264
  // file; the site's own answer for the same address is read directly below.
  await routeVideosToFixture(page);
  await page.goto("/");
  const origin = new URL(page.url()).origin;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (/^https?:$/.test(url.protocol) && url.origin !== origin) elsewhere.push(request.url());
  });

  const answers = [];
  for (const item of VIDEO_NAMES) {
    const address = `${origin}/images/${VIDEO_ITEMS[item].video}`;
    const requested = page.waitForRequest(address);
    await choose(page, item);
    await requested;
    // WebKit's media loader does not report its responses to Playwright, so the site's answer is read for the same request.
    const response = await page.request.get(address, { headers: { range: "bytes=0-1023" } });
    answers.push({ item, status: [200, 206].includes(response.status()), type: response.headers()["content-type"] });
  }

  expect(answers).toEqual(VIDEO_NAMES.map((item) => ({ item, status: true, type: "video/mp4" })));
  expect(elsewhere).toEqual([]);
});

test("points each video item's tab circle and picture area at the site's own thumbnail", async ({ page }) => {
  await routeVideosToFixture(page);
  await page.goto("/");
  const origin = new URL(page.url()).origin;

  for (const item of VIDEO_NAMES) {
    const circle = sectionOf(page, item).getByRole("button", { name: item, exact: true }).locator("span").first();
    await choose(page, item);
    const addresses = {
      circle: await circle.evaluate((element) => getComputedStyle(element).backgroundImage),
      still: await stillLayer(page, item).evaluate((element) => getComputedStyle(element).backgroundImage),
    };

    const expected = `url("${origin}/images/${VIDEO_ITEMS[item].still}")`;
    expect(addresses, item).toEqual({ circle: expected, still: expected });
  }
});

test("shows each video item in the same picture area as its section's still picture, at 390, 1024 and 1440 px", { tag: "@desktop-only" }, async ({ page }) => {
  await routeVideosToFixture(page);
  for (const width of [390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    for (const item of VIDEO_NAMES) {
      await choose(page, VIDEO_ITEMS[item].reference);
      const area = await box(referencePicture(page, item));
      await choose(page, item);
      await expect(videos(page, item)).toHaveCount(1);
      const { own, frame } = await areaAndFrame(page, item);

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
  }
});

test("plays each of the four real published video files, unrouted, where the browser can decode MP4", async ({ page }) => {
  await page.goto("/");
  const answer = await page.evaluate(() => document.createElement("video").canPlayType('video/mp4; codecs="avc1.64001f"'));
  // Some browser builds ship without an H.264 decoder, so the real files are skipped there rather than failed.
  test.skip(!answer, "this browser cannot decode the published H.264 files");

  // A fresh page for each item, so no real file is still playing when the next item's tab is reached: WebKit on
  // Linux stops answering a click that has to scroll while it plays one.
  for (const item of VIDEO_NAMES) {
    await page.goto("/");
    await choose(page, item);
    await expect(videos(page, item)).toHaveAttribute("src", `/images/${VIDEO_ITEMS[item].video}`);
    await playsOn(page, item);
  }
});

test("shows the still alone and downloads no video when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests = videoRequests(page);
  await page.goto("/");

  for (const item of VIDEO_NAMES) {
    await choose(page, item);
    await expect(stillAlone(page, item)).toBeVisible();
    await expect(videos(page, item)).toHaveCount(0);
  }
  expect(requests).toEqual([]);
});

test("keeps one video in each section, the item shown last in that section", async ({ page }) => {
  await routeVideosToFixture(page);
  await page.goto("/");
  await requirePlayableFixture(page);
  const inSection = (section: Section) => SECTIONS[section](page).locator("video");

  await choose(page, "Radiated immunity");
  await choose(page, "The Workbench");
  await expect(inSection("problems")).toHaveCount(1);
  await expect(inSection("software")).toHaveCount(1);
  await inSection("software").evaluate((element) => element.setAttribute("data-seen", "1"));

  // Choosing in The challenges leaves Our Solution's video where it is, the same element. Chromium suspends a muted
  // video scrolled out of sight, so whether it is advancing is not asked here.
  await choose(page, "Lightning");
  await expect(inSection("problems")).toHaveCount(0);
  await expect(inSection("software")).toHaveCount(1);
  await expect(inSection("software")).toHaveAttribute("data-seen", "1");

  await choose(page, "Multilayer surface impedances");
  await expect(inSection("problems")).toHaveCount(0);
  await expect(inSection("software")).toHaveCount(0);

  await choose(page, "The Workbench");
  await choose(page, "Conducted susceptibility");
  await choose(page, "The Workbench");
  await expect(inSection("software")).toHaveAttribute("src", `/images/${VIDEO_ITEMS["The Workbench"].video}`);
  await expect(inSection("problems")).toHaveAttribute("src", `/images/${VIDEO_ITEMS["Conducted susceptibility"].video}`);
  expect(await page.locator("video").evaluateAll((elements) => elements.map((element) => (element as HTMLVideoElement).muted))).toEqual([true, true]);
});

test("starts a fresh video when another video item of the same section is chosen directly", async ({ page }) => {
  await routeVideosToFixture(page);
  await page.goto("/");
  await choose(page, "Radiated immunity");
  await expect(videos(page, "Radiated immunity")).toHaveCount(1);
  await videos(page, "Radiated immunity").evaluate((element) => element.setAttribute("data-seen", "1"));

  // No still-picture item in between: only the picture's remount key replaces the element.
  await choose(page, "Conducted susceptibility");

  await expect(videos(page, "Conducted susceptibility")).toHaveAttribute("src", `/images/${VIDEO_ITEMS["Conducted susceptibility"].video}`);
  expect(await videos(page, "Conducted susceptibility").getAttribute("data-seen")).toBeNull();
});

for (const item of PLAYBACK_ITEMS) {
  const { reference } = VIDEO_ITEMS[item];
  const named = (state: "Play" | "Pause") => new RegExp(`^${state} ${item} video`);

  test(`plays the chosen video by itself, muted, looping and without controls — ${item}`, async ({ page }) => {
    await routeVideosToFixture(page);
    await page.goto("/");
    await requirePlayableFixture(page);

    await choose(page, item);
    await playsOn(page, item);

    expect(
      await videos(page, item).evaluate((element: HTMLVideoElement) => ({
        muted: element.muted,
        loop: element.loop,
        controls: element.controls,
      })),
    ).toEqual({ muted: true, loop: true, controls: false });
  });

  test(`keeps the still visible until the video plays — ${item}`, async ({ page }) => {
    let release!: () => void;
    const released = new Promise<void>((resolve) => (release = resolve));
    await page.route(VIDEO_FILE, async (route) => {
      await released;
      await fulfilWithFixture(route);
    });
    await page.goto("/");
    await requirePlayableFixture(page);
    await choose(page, item);
    await expect(videos(page, item)).toHaveCount(1);

    const before = {
      video: await opacityOf(videos(page, item)),
      still: await stillLayer(page, item).isVisible(),
      height: (await box(pictureButton(page, item).locator("xpath=..")))?.height >= MIN_PICTURE_HEIGHT,
    };
    release();
    await expect.poll(() => opacityOf(videos(page, item)), { timeout: 15_000 }).toBe("1");

    expect(before).toEqual({ video: "0", still: true, height: true });
  });

  test(`pauses the video when it is clicked, holds the picture it reached, and resumes it when it is clicked again, and the same from the keyboard with Enter and Space — ${item}`, async ({ page }) => {
    await routeVideosToFixture(page);
    await page.goto("/");
    await requirePlayableFixture(page);
    await choose(page, item);
    await playsOn(page, item);
    const button = pictureButton(page, item);

    const pausesAndResumes = async (activate: () => Promise<void>, how: string) => {
      await activate();
      await expect.poll(() => isPaused(page, item), `${how} pauses`).toBe(true);
      await expect(button, `${how} names Play once paused`).toHaveAccessibleName(named("Play"));
      const held = await currentTime(page, item);
      await expect(async () => {
        expect({ time: await currentTime(page, item), shown: await opacityOf(videos(page, item)) }).not.toEqual({ time: held, shown: "1" });
      }, `${how} holds the picture`).not.toPass({ timeout: 400 });

      await activate();
      await expect.poll(() => isPaused(page, item), `${how} resumes`).toBe(false);
      await expect(button, `${how} names Pause once playing`).toHaveAccessibleName(named("Pause"));
      await playsOn(page, item, `${how} plays on`);
    };

    await pausesAndResumes(() => button.click(), "a click");
    await button.focus();
    await pausesAndResumes(() => page.keyboard.press("Enter"), "Enter");
    await pausesAndResumes(() => page.keyboard.press("Space"), "Space");
  });

  test(`keeps the item's title, text, picture area and still when the video request is aborted, and starts the video when the button is activated once the next request is let through — ${item}`, async ({ page }) => {
    let failing = true;
    await page.route(VIDEO_FILE, (route) => (failing ? route.abort() : fulfilWithFixture(route)));
    await page.goto("/");
    await choose(page, reference);
    const measured = (await box(referencePicture(page, item))).height;
    await choose(page, item);
    const section = sectionOf(page, item);
    const button = pictureButton(page, item);

    await expect(section.getByRole("heading", { level: 3, name: item })).toBeVisible();
    await expect(section.locator("h3 ~ p").first()).toBeVisible();
    await expect.poll(() => videos(page, item).evaluate((element: HTMLVideoElement) => element.error?.code ?? null)).not.toBeNull();
    await expect(stillLayer(page, item)).toBeVisible();
    await expect(button).toHaveAccessibleName(named("Play"));
    expect({
      video: await opacityOf(videos(page, item)),
      text: await button.textContent(),
      alerts: await section.getByRole("alert").count(),
      sameHeight: Math.abs((await box(button.locator("xpath=.."))).height - measured) <= 1,
    }).toEqual({ video: "0", text: "", alerts: 0, sameHeight: true });

    await requirePlayableFixture(page);
    failing = false;
    await button.click();

    await playsOn(page, item);
  });

  test(`shows the still and the name Play, and starts the video when the button is activated, in a browser that does not start it by itself — ${item}`, async ({ page }) => {
    await page.addInitScript(() => {
      new MutationObserver((records) => {
        for (const record of records) {
          record.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              (node instanceof HTMLVideoElement ? [node] : [...node.querySelectorAll("video")]).forEach((video) => video.removeAttribute("autoplay"));
            }
          });
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await routeVideosToFixture(page);
    await page.goto("/");
    await requirePlayableFixture(page);
    await choose(page, item);
    await expect(videos(page, item)).toHaveCount(1);
    await expect(async () => {
      expect(await currentTime(page, item)).not.toBe(0);
    }, "the video does not start by itself").not.toPass({ timeout: 1_500 });
    const button = pictureButton(page, item);

    expect({
      time: await currentTime(page, item),
      video: await opacityOf(videos(page, item)),
      still: await stillLayer(page, item).isVisible(),
    }).toEqual({ time: 0, video: "0", still: true });
    await expect(button).toHaveAccessibleName(named("Play"));

    await button.click();

    await playsOn(page, item);
  });

  test(`ends in the state the last of several quick activations asked for — ${item}`, async ({ page }) => {
    await routeVideosToFixture(page);
    await page.goto("/");
    await requirePlayableFixture(page);
    await choose(page, item);
    await playsOn(page, item);
    const button = pictureButton(page, item);

    // From playing: three activations end paused, two more end paused again, and one more ends playing.
    for (const { clicks, paused } of [
      { clicks: 3, paused: true },
      { clicks: 2, paused: true },
      { clicks: 1, paused: false },
    ]) {
      await button.evaluate((element: HTMLButtonElement, count) => {
        for (let i = 0; i < count; i += 1) element.click();
      }, clicks);

      await expect.poll(() => isPaused(page, item), `${clicks} quick activations`).toBe(paused);
      await expect(button).toHaveAccessibleName(named(paused ? "Play" : "Pause"));
    }
  });

  /**
   * FR-33 of EWM-165 in a real browser: the browser tells React's own subscriber of the preference's change first
   * and runs the page's other listeners after it has rendered, so a hand-off that waits for a listener of its own
   * finds the button already gone and focus on the page.
   */
  for (const state of ["playing", "paused"] as const) {
    test(`moves focus to the still when reduced motion is turned on while the ${state} video's picture area has focus — ${item}`, async ({ page }) => {
      await routeVideosToFixture(page);
      await page.goto("/");
      await requirePlayableFixture(page);
      await choose(page, item);
      const button = pictureButton(page, item);
      await expect(videos(page, item)).toHaveCount(1);
      if (state === "paused") {
        await button.click();
        await expect.poll(() => isPaused(page, item)).toBe(true);
      }
      await button.focus();
      await expect(button).toBeFocused();

      await page.emulateMedia({ reducedMotion: "reduce" });

      await expect(videos(page, item)).toHaveCount(0);
      await expect(stillAlone(page, item)).toBeFocused();
    });
  }

  test(`carries on from where it is when the ${item} tab is chosen again`, async ({ page }) => {
    await routeVideosToFixture(page);
    await page.goto("/");
    await requirePlayableFixture(page);
    await choose(page, item);
    await playsOn(page, item);
    await videos(page, item).evaluate((element) => element.setAttribute("data-seen", "1"));

    await choose(page, item);

    // The same element, still marked: a remount would have created a new one. Whether it is advancing is not asked
    // again, as Chromium pauses a muted video a tab click has scrolled out of sight.
    await expect(videos(page, item)).toHaveCount(1);
    await expect(videos(page, item)).toHaveAttribute("data-seen", "1");
  });

  test(`stops the video when another item is chosen — ${item}`, async ({ page }) => {
    await routeVideosToFixture(page);
    await page.goto("/");
    await choose(page, item);
    await expect(videos(page, item)).toHaveCount(1);

    await choose(page, reference);

    await expect(page.locator("video")).toHaveCount(0);
  });

  test(`starts a fresh video after another item, after a reload and after leaving the page and returning — ${item}`, async ({ page }) => {
    await routeVideosToFixture(page);
    const mark = () => videos(page, item).evaluate((element) => element.setAttribute("data-seen", "1"));
    const freshVideo = async () => {
      await choose(page, item);
      await expect(videos(page, item)).toHaveAttribute("src", `/images/${VIDEO_ITEMS[item].video}`);
      return videos(page, item).getAttribute("data-seen");
    };
    await page.goto("/");
    await choose(page, item);
    await expect(videos(page, item)).toHaveCount(1);
    await mark();
    await choose(page, reference);
    const afterSwitching = await freshVideo();
    await mark();

    await page.reload();
    await expect(videos(page, item)).toHaveCount(0);
    const afterReload = await freshVideo();
    await mark();
    await page.goto("/contact");
    await page.goBack();
    await expect(videos(page, item)).toHaveCount(0);
    const afterReturn = await freshVideo();

    expect({ afterSwitching, afterReload, afterReturn }).toEqual({ afterSwitching: null, afterReload: null, afterReturn: null });
  });
}
