import { expect, test } from "@playwright/test";
import { mp4VideoSamples } from "./fixtures/mp4-samples";

/**
 * What the two interpolated challenge videos hold, decoded picture by picture:
 * Radiated immunity and Conducted susceptibility show 30 pictures per second,
 * the simulation's own pictures one second apart with generated pictures
 * between them (FR-28). A picture generated between two others is nearer to
 * each of them than they are to each other; a repeated picture is a copy of
 * one neighbour and no nearer to the other than they are to each other.
 *
 * The published file is decoded with the browser's own WebCodecs decoder and
 * compared on its stored 4:2:0 planes, as FFmpeg's `psnr` filter compares
 * them, so no colour conversion adds noise of its own. The pictures a file
 * holds do not depend on the browser, so Chromium decodes it once.
 */
const PICTURES_PER_SECOND = 30;
/** The plan's bound: the middle picture scores against each neighbour at least this much higher than they score against each other. */
const GENERATED_MARGIN_DB = 1;
/** Above this PSNR two pictures differ by no more than the encoding's own noise, which it shows between two identical pictures. */
const STILL_PSNR_DB = 50;

/**
 * Each file's first second whose two own pictures differ visibly. Before it
 * the simulation's own pictures are identical or differ in a few faint pixels
 * (PSNR above 71 dB between the sources), which the encoding holds as one
 * picture and then the other; the decision record lists those seconds, and
 * the case checks they stay still in the published file.
 */
const INTERPOLATED_VIDEOS = [
  { file: "problem-radiated-immunity.mp4", ownPictures: 35, firstMovingSecond: 4 },
  { file: "problem-conducted-susceptibility.mp4", ownPictures: 61, firstMovingSecond: 2 },
] as const;

interface Second {
  k: number;
  /** PSNR between the own pictures at k and k + 1 seconds. */
  ab: number;
  /** PSNR between the picture half a second after k and the own picture at k. */
  ma: number;
  /** PSNR between the picture half a second after k and the own picture at k + 1. */
  mb: number;
}

for (const video of INTERPOLATED_VIDEOS) {
  test(`holds generated pictures between the simulation's own at every second ${video.file} moves`, async ({ page, browserName }, testInfo) => {
    // The file is the same in every browser, so one desktop Chromium project decodes it and the others skip the case.
    test.skip(
      browserName !== "chromium" || testInfo.project.name !== "chromium",
      "the pictures a file holds do not depend on the browser, so the desktop Chromium project decodes it once",
    );
    test.setTimeout(240_000);

    const response = await page.request.get(`/images/${video.file}`);
    expect(response.ok()).toBe(true);
    const { codec, description, samples } = mp4VideoSamples(await response.body());
    await page.goto("/");

    const seconds: Second[] | string = await page.evaluate(
      async ({ address, codec, description, samples, perSecond }) => {
        const config = { codec, description: new Uint8Array(description), hardwareAcceleration: "prefer-software" as const };
        if (!(await VideoDecoder.isConfigSupported(config)).supported) {
          return `this browser's WebCodecs cannot decode ${codec}`;
        }
        const file = new Uint8Array(await (await fetch(address)).arrayBuffer());
        const half = perSecond / 2;
        const kept = new Map<number, Uint8Array>();
        const psnr = (one: Uint8Array, other: Uint8Array) => {
          let sum = 0;
          for (let i = 0; i < one.length; i += 1) {
            const difference = one[i] - other[i];
            sum += difference * difference;
          }
          return sum === 0 ? Infinity : 10 * Math.log10((255 * 255 * one.length) / sum);
        };
        const pending: Promise<void>[] = [];
        let shown = 0;
        let failure = "";
        const decoder = new VideoDecoder({
          output: (frame) => {
            const index = shown;
            shown += 1;
            if (index % half !== 0) {
              frame.close();
              return;
            }
            if (frame.format !== "I420") {
              failure = `decoded pictures are ${frame.format}, not I420`;
              frame.close();
              return;
            }
            const planes = new Uint8Array(frame.allocationSize());
            pending.push(
              frame.copyTo(planes).then(() => {
                kept.set(index, planes);
                frame.close();
              }),
            );
          },
          error: (error) => {
            failure = String(error);
          },
        });
        decoder.configure(config);
        for (const sample of samples) {
          decoder.decode(
            new EncodedVideoChunk({
              type: sample.key ? "key" : "delta",
              timestamp: sample.timestamp,
              data: file.subarray(sample.offset, sample.offset + sample.size),
            }),
          );
        }
        await decoder.flush();
        await Promise.all(pending);
        decoder.close();
        if (failure) {
          return failure;
        }
        const result = [];
        for (let k = 0; kept.has((k + 1) * perSecond); k += 1) {
          const a = kept.get(k * perSecond)!;
          const m = kept.get(k * perSecond + half)!;
          const b = kept.get((k + 1) * perSecond)!;
          result.push({ k, ab: psnr(a, b), ma: psnr(m, a), mb: psnr(m, b) });
        }
        return result;
      },
      { address: `/images/${video.file}`, codec, description, samples, perSecond: PICTURES_PER_SECOND },
    );
    if (typeof seconds === "string") {
      throw new Error(seconds);
    }

    // Every interval between two of the simulation's own pictures, up to the last one, which the file holds for its own second.
    const between = seconds.filter((second) => second.k <= video.ownPictures - 2);
    expect(between.map((second) => second.k)).toEqual(Array.from({ length: video.ownPictures - 1 }, (_, k) => k));

    const visibleBeforeTheFirstMovingSecond = between
      .filter((second) => second.k < video.firstMovingSecond && second.ab < STILL_PSNR_DB)
      .map((second) => `k=${second.k}: own pictures ${second.ab.toFixed(2)} dB apart`);
    expect(visibleBeforeTheFirstMovingSecond, "a second treated as still shows a visible change").toEqual([]);

    const repeated = between
      .filter((second) => second.k >= video.firstMovingSecond)
      .filter((second) => second.ma < second.ab + GENERATED_MARGIN_DB || second.mb < second.ab + GENERATED_MARGIN_DB)
      .map((second) => `k=${second.k}: own pictures ${second.ab.toFixed(2)} dB apart, middle ${second.ma.toFixed(2)} / ${second.mb.toFixed(2)} dB`);
    expect(repeated, "seconds whose middle picture is not generated between the simulation's own").toEqual([]);
  });
}
