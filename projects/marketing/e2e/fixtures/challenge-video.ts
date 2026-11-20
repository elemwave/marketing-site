import { readFileSync } from "node:fs";
import path from "node:path";
import { test, type Page, type Route } from "@playwright/test";

/**
 * A two-second VP9 stand-in served under the challenge videos' `.mp4`
 * addresses, so the cases that need a video to play do not depend on the
 * browser's H.264 support. Playwright runs from the project root, the
 * directory holding playwright.config.ts.
 */
const FIXTURE = readFileSync(path.join("e2e", "fixtures", "challenge-video.webm"));

/** A challenge video's address on the site. */
export const CHALLENGE_VIDEO_FILE = /\/images\/problem-[a-z-]+\.mp4$/;

/** Answers a video request with the stand-in, honouring a byte range as a media server does. */
export function fulfilWithChallengeVideoFixture(route: Route) {
  const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers()["range"] ?? "");
  if (!range) {
    return route.fulfill({ status: 200, contentType: "video/webm", headers: { "accept-ranges": "bytes" }, body: FIXTURE });
  }
  const start = Number(range[1]);
  const end = range[2] ? Math.min(Number(range[2]), FIXTURE.length - 1) : FIXTURE.length - 1;
  return route.fulfill({
    status: 206,
    contentType: "video/webm",
    headers: { "accept-ranges": "bytes", "content-range": `bytes ${start}-${end}/${FIXTURE.length}` },
    body: FIXTURE.subarray(start, end + 1),
  });
}

/** Serves every challenge video request with the stand-in. */
export function routeChallengeVideosToFixture(page: Page) {
  return page.route(CHALLENGE_VIDEO_FILE, fulfilWithChallengeVideoFixture);
}

/** Skips a case that needs playback where this browser cannot play the stand-in. */
export async function requirePlayableChallengeVideoFixture(page: Page) {
  const answer = await page.evaluate(() => document.createElement("video").canPlayType('video/webm; codecs="vp9"'));
  test.skip(!answer, "this browser cannot play the WebM stand-in");
}
