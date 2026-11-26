import { expect, test } from "@playwright/test";
import { mp4VideoSamples } from "./fixtures/mp4-samples";

/**
 * What the two interpolated challenge videos hold, decoded picture by picture:
 * Radiated immunity and Conducted susceptibility show 30 pictures per second,
 * with generated pictures between the simulation's own (FR-28). Radiated
 * immunity's own pictures are one second apart, 30 frames each; Conducted
 * susceptibility plays at three times its simulation's pace, its own pictures a
 * third of a second apart, 10 frames each (EWM-192). A picture generated
 * between two others is nearer to each of them than they are to each other; a
 * repeated picture is a copy of one neighbour and no nearer to the other than
 * they are to each other.
 *
 * The published file is decoded with the browser's own WebCodecs decoder and
 * compared on its stored 4:2:0 planes, as FFmpeg's `psnr` filter compares
 * them, so no colour conversion adds noise of its own. The pictures a file
 * holds do not depend on the browser, so Chromium decodes it once.
 */
/** The plan's bound: the middle picture scores against each neighbour at least this much higher than they score against each other. */
const GENERATED_MARGIN_DB = 1;
/** Above this PSNR two pictures differ by no more than the encoding's own noise, which it shows between two identical pictures. */
const STILL_PSNR_DB = 50;

/**
 * Each file's frames per own picture, the pictures its file holds (read from
 * its sample tables), the frames its last own picture is held for to the end of
 * the file, and its first interval between own pictures that differ visibly.
 * Before that interval the simulation's own pictures are identical or differ in
 * a few faint pixels (PSNR above 71 dB between the sources), which the encoding
 * holds as one picture and then the other; the decision record lists those
 * intervals, and the case checks they stay still in the published file.
 * Radiated immunity's file holds its last own picture for 31 frames, so it
 * holds 35 × 30 + 1 pictures.
 */
const INTERPOLATED_VIDEOS = [
  { file: "problem-radiated-immunity.mp4", ownPictures: 35, framesPerOwnPicture: 30, pictures: 1_051, holdFrames: 31, firstMovingSecond: 4 },
  { file: "problem-conducted-susceptibility.mp4", ownPictures: 61, framesPerOwnPicture: 10, pictures: 610, holdFrames: 10, firstMovingSecond: 2 },
] as const;

interface Interval {
  k: number;
  /** PSNR between own pictures k and k + 1. */
  ab: number;
  /** PSNR between the picture midway after own picture k and own picture k. */
  ma: number;
  /** PSNR between the picture midway after own picture k and own picture k + 1. */
  mb: number;
}

interface Decoded {
  intervals: Interval[];
  /** How many pictures the decoder output. */
  output: number;
  /** PSNR between the picture its last `holdFrames` start at, the last own picture, and the file's last picture. */
  hold: number;
}

for (const video of INTERPOLATED_VIDEOS) {
  test(`holds generated pictures between the simulation's own at every interval ${video.file} moves`, async ({ page, browserName }, testInfo) => {
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

    const decoded: Decoded | string = await page.evaluate(
      async ({ address, codec, description, samples, perSecond, last, lastOwn }) => {
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
            if (index % half !== 0 && index !== last) {
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
        const intervals = [];
        for (let k = 0; kept.has((k + 1) * perSecond); k += 1) {
          const a = kept.get(k * perSecond)!;
          const m = kept.get(k * perSecond + half)!;
          const b = kept.get((k + 1) * perSecond)!;
          intervals.push({ k, ab: psnr(a, b), ma: psnr(m, a), mb: psnr(m, b) });
        }
        const hold = kept.has(lastOwn) && kept.has(last) ? psnr(kept.get(lastOwn)!, kept.get(last)!) : -Infinity;
        return { intervals, output: shown, hold };
      },
      {
        address: `/images/${video.file}`,
        codec,
        description,
        samples,
        perSecond: video.framesPerOwnPicture,
        last: video.pictures - 1,
        lastOwn: video.pictures - video.holdFrames,
      },
    );
    if (typeof decoded === "string") {
      throw new Error(decoded);
    }

    // The file holds exactly its pictures, its last own picture's hold counted, and that hold is one picture to the end:
    // the picture where the hold starts, the last own picture, matches the file's last.
    expect(decoded.output, `pictures ${video.file} decodes to`).toBe(video.pictures);
    expect(decoded.hold, "PSNR between the last own picture and the file's last picture").toBeGreaterThan(STILL_PSNR_DB);

    // Every interval between two of the simulation's own pictures, up to the last one, which the file holds to its end.
    const between = decoded.intervals.filter((second) => second.k <= video.ownPictures - 2);
    expect(between.map((second) => second.k)).toEqual(Array.from({ length: video.ownPictures - 1 }, (_, k) => k));

    const visibleBeforeTheFirstMovingSecond = between
      .filter((second) => second.k < video.firstMovingSecond && second.ab < STILL_PSNR_DB)
      .map((second) => `k=${second.k}: own pictures ${second.ab.toFixed(2)} dB apart`);
    expect(visibleBeforeTheFirstMovingSecond, "an interval treated as still shows a visible change").toEqual([]);

    const repeated = between
      .filter((second) => second.k >= video.firstMovingSecond)
      .filter((second) => second.ma < second.ab + GENERATED_MARGIN_DB || second.mb < second.ab + GENERATED_MARGIN_DB)
      .map((second) => `k=${second.k}: own pictures ${second.ab.toFixed(2)} dB apart, middle ${second.ma.toFixed(2)} / ${second.mb.toFixed(2)} dB`);
    expect(repeated, "intervals whose middle picture is not generated between the simulation's own").toEqual([]);
  });
}
