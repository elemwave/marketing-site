import { readFileSync } from "node:fs";
import path from "node:path";
import { test, type Page, type Route } from "@playwright/test";

/**
 * A sixty-second VP9 stand-in served under the site's item videos' `.mp4`
 * addresses (The challenges' simulations and Our Solution's EW Workbench), so the cases that need a video to play do not depend on the
 * browser's H.264 support. Playwright runs from the project root, the
 * directory holding playwright.config.ts.
 *
 * It lasts as long as a case may run (playwright.config.ts's `timeout`), so no
 * case plays it to its end. WebKit stalls for good at a routed video's loop
 * point: its seek back to the start never completes, though the range request
 * it sends is answered in full, and the video keeps the time it had reached.
 *
 * Generated once with FFmpeg 7.1.5 (`7:7.1.5-0+deb13u1`) and libvpx 1.15.0,
 * in `public.ecr.aws/docker/library/debian:trixie-slim@sha256:a72b4433de1cf7d6bae0c4cee74d0547f58601a643b3375f070c51600d63b6b2`
 * with Debian's `ffmpeg` package:
 *
 *     ffmpeg -f lavfi -i testsrc2=size=320x180:rate=30:duration=60 -an -c:v libvpx-vp9 -pix_fmt yuv420p -b:v 0 -crf 63 -deadline good -cpu-used 4 -row-mt 1 -g 300 challenge-video.webm
 */
const FIXTURE = readFileSync(path.join("e2e", "fixtures", "challenge-video.webm"));

/**
 * An item video's address on the site: a challenge simulation (`problem-…`) or
 * an Our Solution video (`solution-…`). The export keeps its first name, which
 * the specs import.
 */
export const CHALLENGE_VIDEO_FILE = /\/images\/(?:problem|solution)-[a-z-]+\.mp4$/;

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

/** Serves every item video request with the stand-in. */
export function routeChallengeVideosToFixture(page: Page) {
  return page.route(CHALLENGE_VIDEO_FILE, fulfilWithChallengeVideoFixture);
}

/** Skips a case that needs playback where this browser cannot play the stand-in. */
export async function requirePlayableChallengeVideoFixture(page: Page) {
  const answer = await page.evaluate(() => document.createElement("video").canPlayType('video/webm; codecs="vp9"'));
  // A browser build without VP9 cannot play the stand-in, so a case that needs playback is skipped there rather than failed.
  test.skip(!answer, "this browser cannot play the WebM stand-in");
}
