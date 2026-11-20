import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PROBLEMS, SLIDES, TABS, type SoftwareTab } from "./home-content";
import { PARTNER_LOGOS } from "./site-content";
import { TEAM_MEMBERS } from "./team-content";

const PUBLIC_IMAGES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/images",
);

const ORGANISATION_MARK_MAX_WIDTH = 530;
const ORGANISATION_MARK_MAX_HEIGHT = 410;
// The requester's floor for INTA's mark (FR-13 of EWM-148), not for every mark:
// a tall mark at the 410-pixel height limit is narrower and meets the size rule.
const INTA_MARK = "/images/logo-inta.png";
const PARTNER_MARK_MIN_WIDTH = 400;
const REFERENCE_PUBLICATION = "publication-accelerating-finite-difference.webp";
const REFERENCE_PUBLICATION_MAX_BYTES = 60_000;
const STAFF_PORTRAIT_MIN_WIDTH = 180;
const STAFF_PORTRAIT_MAX_WIDTH = 240;
const STAFF_PORTRAIT_MIN_HEIGHT = 220;
const STAFF_PORTRAIT_MAX_HEIGHT = 280;

function fileFromCataloguePath(src: string): string {
  const prefix = "/images/";
  if (!src.startsWith(prefix)) {
    throw new Error(`catalogue path is not an /images/ URL: ${src}`);
  }
  return path.join(PUBLIC_IMAGES, src.slice(prefix.length));
}

function pngSize(bytes: Buffer): { width: number; height: number } {
  if (bytes.length < 24) {
    throw new Error("PNG is too short to contain IHDR");
  }
  if (
    bytes.subarray(0, 8).toString("binary") !== "\x89PNG\r\n\x1a\n" ||
    bytes.subarray(12, 16).toString("ascii") !== "IHDR"
  ) {
    throw new Error("file is not a PNG with an IHDR chunk");
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

function webpSize(bytes: Buffer): { width: number; height: number } {
  if (
    bytes.length < 16 ||
    bytes.subarray(0, 4).toString("ascii") !== "RIFF" ||
    bytes.subarray(8, 12).toString("ascii") !== "WEBP"
  ) {
    throw new Error("file is not a WebP");
  }

  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const fourcc = bytes.subarray(offset, offset + 4).toString("ascii");
    const size = bytes.readUInt32LE(offset + 4);
    const payload = offset + 8;
    const end = payload + size;
    if (end > bytes.length) {
      throw new Error(`WebP ${fourcc} chunk overruns the file`);
    }

    if (fourcc === "VP8X" && size >= 10) {
      const width =
        1 +
        (bytes[payload + 4] | (bytes[payload + 5] << 8) | (bytes[payload + 6] << 16));
      const height =
        1 +
        (bytes[payload + 7] | (bytes[payload + 8] << 8) | (bytes[payload + 9] << 16));
      return { width, height };
    }

    if (
      fourcc === "VP8 " &&
      size >= 10 &&
      bytes[payload + 3] === 0x9d &&
      bytes[payload + 4] === 0x01 &&
      bytes[payload + 5] === 0x2a
    ) {
      return {
        width: bytes.readUInt16LE(payload + 6) & 0x3fff,
        height: bytes.readUInt16LE(payload + 8) & 0x3fff,
      };
    }

    if (fourcc === "VP8L" && size >= 5 && bytes[payload] === 0x2f) {
      const bits = bytes.readUInt32LE(payload + 1);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }

    offset = end + (size & 1);
  }

  throw new Error("WebP has no VP8, VP8L or VP8X size");
}

function rasterSize(
  bytes: Buffer,
  filename: string,
): { width: number; height: number } {
  if (filename.endsWith(".png")) {
    return pngSize(bytes);
  }
  if (filename.endsWith(".webp")) {
    return webpSize(bytes);
  }
  throw new Error(`unrecognised raster suffix: ${filename}`);
}

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths)];
}

describe("published organisation marks and publication pictures", () => {
  const markPaths = uniquePaths([
    ...PARTNER_LOGOS.map((logo) => logo.src),
    ...SLIDES.flatMap((slide) => slide.logos.map((logo) => logo.src)),
  ]);
  const publicationPaths = uniquePaths(SLIDES.map((slide) => slide.imageUrl));

  it("should keep every organisation mark inside 530 by 410 source pixels", () => {
    const oversized: string[] = [];

    for (const src of markPaths) {
      const file = fileFromCataloguePath(src);
      const bytes = readFileSync(file);
      const { width, height } = rasterSize(bytes, path.basename(file));
      if (
        width > ORGANISATION_MARK_MAX_WIDTH ||
        height > ORGANISATION_MARK_MAX_HEIGHT
      ) {
        oversized.push(`${path.basename(file)} ${width}×${height}`);
      }
    }

    expect(oversized, oversized.join("; ")).toEqual([]);
  });

  it("should publish INTA's partner mark at least 400 pixels wide", () => {
    const inta = PARTNER_LOGOS.find((logo) => logo.src === INTA_MARK);
    expect(inta, "INTA is a partner").toBeDefined();

    const file = fileFromCataloguePath(INTA_MARK);
    const { width, height } = rasterSize(readFileSync(file), path.basename(file));

    expect(width, `${path.basename(file)} ${width}×${height}`).toBeGreaterThanOrEqual(
      PARTNER_MARK_MIN_WIDTH,
    );
  });

  it("should keep every science-section publication picture in the compressed-photograph weight band", () => {
    const referencePath = publicationPaths.find((src) =>
      src.endsWith(`/${REFERENCE_PUBLICATION}`),
    );
    expect(referencePath, "the reference publication is in the catalogue").toBeTruthy();

    const referenceBytes = readFileSync(fileFromCataloguePath(referencePath!));
    expect(referenceBytes.byteLength).toBeLessThanOrEqual(
      REFERENCE_PUBLICATION_MAX_BYTES,
    );

    const ceiling = 2 * referenceBytes.byteLength;
    const overweight: string[] = [];

    for (const src of publicationPaths) {
      const file = fileFromCataloguePath(src);
      const bytes = readFileSync(file);
      rasterSize(bytes, path.basename(file));
      if (bytes.byteLength > ceiling) {
        overweight.push(
          `${path.basename(file)} ${bytes.byteLength} bytes (ceiling ${ceiling})`,
        );
      }
    }

    expect(overweight, overweight.join("; ")).toEqual([]);
  });
});

/**
 * The pinned pictures of items: Elemwave's own for the Cable Solver (EWM-139),
 * Radar cross section (EWM-166) and the FDTD solver (EWM-167), and the video
 * stills YouTube publishes for Radiated emissions, Radiated immunity and
 * Conducted susceptibility (EWM-165), copied byte for byte.
 */
const CABLE_SOLVER_PICTURE = {
  width: 764,
  height: 734,
  sha256: "d0c70e5746c8652e7b902165a92bf6c110ee557b0fe9f33b61c8393dc4ade6d2",
} as const;
const FDTD_SOLVER_PICTURE = {
  width: 1876,
  height: 849,
  sha256: "2dd4e74032b829d1241b9262c3c464d83804ea4d7400fc3d0bf0383ccfabb453",
} as const;
const RADAR_CROSS_SECTION_PICTURE = {
  width: 1051,
  height: 841,
  sha256: "2429a2e85e19c3af1ba650bbe2b83d687a6a87cb16440d0d925d0ceb3512bc69",
} as const;
const RADIATED_EMISSIONS_STILL = {
  sha256: "c8e75eb120634a610aaa676ce44af428d4475bc1ee1e7781015391c0769b65f0",
} as const;
const RADIATED_IMMUNITY_STILL = {
  sha256: "d081789885f75d46da582da4ace7211dd6cf6cb300e0e94804fe9a8432fb7fd6",
} as const;
const CONDUCTED_SUSCEPTIBILITY_STILL = {
  sha256: "7a6247b2d3ef0941ce0127f9865b8f9fb38cbcb3a2e888a89ec9a01ea756da77",
} as const;

/** The file an item shows, its digest and, for a PNG, its size, or why it cannot be read. */
function publishedPictureOf(items: SoftwareTab[], label: string) {
  const item = items.find((candidate) => candidate.label === label);
  if (!item) {
    return { error: `no ${label} item` };
  }
  const file = fileFromCataloguePath(item.imageUrl);
  if (!existsSync(file)) {
    return { error: `${path.basename(file)} is not published` };
  }
  const bytes = readFileSync(file);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return path.extname(file) === ".png" ? { ...pngSize(bytes), sha256 } : { sha256 };
}

describe("published own pictures of The challenges and Our Solution items", () => {
  it("should publish Elemwave's own Cable Solver picture byte for byte as committed in its repository", () => {
    expect(publishedPictureOf(TABS, "Cable Solver")).toEqual(CABLE_SOLVER_PICTURE);
  });

  it("should publish Elemwave's own FDTD solver picture byte for byte as supplied", () => {
    expect(publishedPictureOf(TABS, "FDTD solver")).toEqual(FDTD_SOLVER_PICTURE);
  });

  it("should publish Elemwave's own Radar cross section picture byte for byte as supplied", () => {
    expect(publishedPictureOf(PROBLEMS, "Radar cross section")).toEqual(RADAR_CROSS_SECTION_PICTURE);
  });

  it("should publish Radiated emissions' video still byte for byte as YouTube publishes it", () => {
    expect(publishedPictureOf(PROBLEMS, "Radiated emissions")).toEqual(RADIATED_EMISSIONS_STILL);
  });

  it("should publish Radiated immunity's video still byte for byte as YouTube publishes it", () => {
    expect(publishedPictureOf(PROBLEMS, "Radiated immunity")).toEqual(RADIATED_IMMUNITY_STILL);
  });

  it("should publish Conducted susceptibility's video still byte for byte as YouTube publishes it", () => {
    expect(publishedPictureOf(PROBLEMS, "Conducted susceptibility")).toEqual(CONDUCTED_SUSCEPTIBILITY_STILL);
  });

  it("should no longer publish the pictures the items stopped showing", () => {
    const stillPublished = [
      "solution-cable-solver.webp",
      "solution-fdtd-solver.webp",
      "problem-radar-cross-section.webp",
      "problem-radiated-emissions.webp",
      "problem-radiated-immunity.webp",
      "problem-conducted-susceptibility.webp",
    ].filter((name) => existsSync(path.join(PUBLIC_IMAGES, name)));

    expect(stillPublished).toEqual([]);
  });
});

/** One ISO base media file box: its four-character type and where its payload lies. */
interface Mp4Box {
  type: string;
  start: number;
  end: number;
}

/** The boxes directly inside `bytes[start, end)`, in file order. */
function mp4Boxes(bytes: Buffer, start = 0, end = bytes.length): Mp4Box[] {
  const boxes: Mp4Box[] = [];
  let offset = start;
  while (offset + 8 <= end) {
    let size = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString("latin1");
    let header = 8;
    if (size === 1) {
      size = Number(bytes.readBigUInt64BE(offset + 8));
      header = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < header || offset + size > end) {
      throw new Error(`MP4 ${type} box at ${offset} overruns its parent`);
    }
    boxes.push({ type, start: offset + header, end: offset + size });
    offset += size;
  }
  return boxes;
}

/** The first box found by following `path` of box types down from the top level. */
function mp4Box(bytes: Buffer, path: string[], within?: Mp4Box): Mp4Box | undefined {
  let parent = within;
  for (const type of path) {
    parent = mp4Boxes(bytes, parent?.start, parent?.end).find((box) => box.type === type);
    if (!parent) {
      return undefined;
    }
  }
  return parent;
}

/** What a published MP4 says about each of its tracks. */
interface Mp4Track {
  handler: string;
  width: number;
  height: number;
  frames: number;
  seconds: number;
}

function mp4Tracks(bytes: Buffer): Mp4Track[] {
  const moov = mp4Box(bytes, ["moov"]);
  if (!moov) {
    throw new Error("MP4 has no moov box");
  }
  return mp4Boxes(bytes, moov.start, moov.end)
    .filter((box) => box.type === "trak")
    .map((trak) => {
      const hdlr = mp4Box(bytes, ["mdia", "hdlr"], trak);
      const mdhd = mp4Box(bytes, ["mdia", "mdhd"], trak);
      const tkhd = mp4Box(bytes, ["tkhd"], trak);
      const stts = mp4Box(bytes, ["mdia", "minf", "stbl", "stts"], trak);
      if (!hdlr || !mdhd || !tkhd) {
        throw new Error("MP4 track lacks its hdlr, mdhd or tkhd box");
      }

      const mdhdVersion = bytes[mdhd.start];
      const timescale = bytes.readUInt32BE(mdhd.start + (mdhdVersion === 1 ? 20 : 12));
      const duration =
        mdhdVersion === 1
          ? Number(bytes.readBigUInt64BE(mdhd.start + 24))
          : bytes.readUInt32BE(mdhd.start + 16);

      const sizeAt = tkhd.start + (bytes[tkhd.start] === 1 ? 88 : 76);

      let frames = 0;
      if (stts) {
        const entries = bytes.readUInt32BE(stts.start + 4);
        for (let i = 0; i < entries; i += 1) {
          frames += bytes.readUInt32BE(stts.start + 8 + i * 8);
        }
      }

      return {
        handler: bytes.subarray(hdlr.start + 8, hdlr.start + 12).toString("latin1"),
        width: bytes.readUInt32BE(sizeAt) / 65536,
        height: bytes.readUInt32BE(sizeAt + 4) / 65536,
        frames,
        seconds: duration / timescale,
      };
    });
}

function videoTrackOf(bytes: Buffer): Mp4Track {
  const video = mp4Tracks(bytes).find((track) => track.handler === "vide");
  if (!video) {
    throw new Error("MP4 has no video track");
  }
  return video;
}

const CHALLENGE_VIDEOS = [
  "problem-radiated-emissions.mp4",
  "problem-radiated-immunity.mp4",
  "problem-conducted-susceptibility.mp4",
] as const;
const CHALLENGE_VIDEO_MAX_BYTES = 6_000_000;
const MP4_BRANDS = ["isom", "iso2", "iso4", "iso5", "iso6", "mp41", "mp42", "avc1", "M4V "];
/** Interpolated to 30 pictures per second, keeping each 1-picture-per-second source's own length (FR-28). */
const INTERPOLATED_VIDEOS = [
  { file: "problem-radiated-immunity.mp4", seconds: 35 },
  { file: "problem-conducted-susceptibility.mp4", seconds: 61 },
] as const;
/**
 * `antenna_zarzuela_3d.mp4`, the owner's Vivaldi horn simulation on the card,
 * read from its MP4 boxes on 20 Nov 2026: 244 frames at 12 per second (FR-29).
 */
const RADIATED_EMISSIONS_SOURCE = { frames: 244, framesPerSecond: 12 } as const;

function publishedVideo(name: string): Buffer {
  const file = path.join(PUBLIC_IMAGES, name);
  if (!existsSync(file)) {
    throw new Error(`${name} is not published`);
  }
  return readFileSync(file);
}

describe("published challenge videos", () => {
  it("should publish a video for each challenge item whose size is within its weight target", () => {
    for (const name of CHALLENGE_VIDEOS) {
      const bytes = publishedVideo(name).byteLength;
      expect(bytes, name).toBeGreaterThan(0);
      expect(bytes, name).toBeLessThanOrEqual(CHALLENGE_VIDEO_MAX_BYTES);
    }
  });

  it("should publish the challenge videos as MP4 files that start playing before they finish downloading", () => {
    for (const name of CHALLENGE_VIDEOS) {
      const bytes = publishedVideo(name);
      const order = mp4Boxes(bytes).map((box) => box.type);

      expect(order[0], name).toBe("ftyp");
      expect(MP4_BRANDS, name).toContain(bytes.subarray(8, 12).toString("latin1"));
      expect(order.indexOf("moov"), name).toBeGreaterThanOrEqual(0);
      expect(order.indexOf("mdat"), name).toBeGreaterThan(order.indexOf("moov"));
    }
  });

  it("should publish the challenge videos with no sound track", () => {
    for (const name of CHALLENGE_VIDEOS) {
      const handlers = mp4Tracks(publishedVideo(name)).map((track) => track.handler);

      expect(handlers, name).toContain("vide");
      expect(handlers, name).not.toContain("soun");
    }
  });

  it("should publish the interpolated challenge videos at 30 pictures per second, lasting as long as their sources play", () => {
    for (const { file, seconds } of INTERPOLATED_VIDEOS) {
      const video = videoTrackOf(publishedVideo(file));

      expect(Math.abs(video.frames / video.seconds - 30), `${file} ${video.frames} frames in ${video.seconds} s`).toBeLessThanOrEqual(0.5);
      expect(Math.abs(video.seconds - seconds), `${file} lasts ${video.seconds} s`).toBeLessThanOrEqual(0.5);
    }
  });

  it("should publish the Radiated emissions video at its source's own frame rate, with no generated pictures", () => {
    const video = videoTrackOf(publishedVideo("problem-radiated-emissions.mp4"));

    expect(video.frames).toBe(RADIATED_EMISSIONS_SOURCE.frames);
    expect(video.frames / video.seconds).toBeCloseTo(RADIATED_EMISSIONS_SOURCE.framesPerSecond, 3);
  });

  it("should give every video item the aspect ratio of its published file", () => {
    const videoItems = PROBLEMS.filter((item) => item.video);
    expect(videoItems.map((item) => item.label)).toEqual([
      "Radiated emissions",
      "Radiated immunity",
      "Conducted susceptibility",
    ]);

    for (const item of videoItems) {
      const file = fileFromCataloguePath(item.video!.src);
      const { width, height } = videoTrackOf(publishedVideo(path.basename(file)));

      expect(item.video!.aspectRatio, item.label).toBe(`${width} / ${height}`);
    }
  });
});

describe("published hero pictures", () => {
  it("should no longer publish the airplane pictures the hero showed", () => {
    const stillPublished = [
      "hero-a320-cad.webp",
      "hero-a320-solver.webp",
      "hero-a320-texture.webp",
      "hero-a320-cad.png",
      "hero-a320-solver.png",
      "hero-a320-texture.png",
    ].filter((name) => existsSync(path.join(PUBLIC_IMAGES, name)));

    expect(stillPublished).toEqual([]);
  });
});

describe("published staff portraits", () => {
  it("should keep every team portrait as a readable WebP in the source-size band", () => {
    const invalid: string[] = [];

    for (const member of TEAM_MEMBERS) {
      const file = fileFromCataloguePath(member.portrait);
      const bytes = readFileSync(file);
      const { width, height } = webpSize(bytes);
      if (
        width < STAFF_PORTRAIT_MIN_WIDTH ||
        width > STAFF_PORTRAIT_MAX_WIDTH ||
        height < STAFF_PORTRAIT_MIN_HEIGHT ||
        height > STAFF_PORTRAIT_MAX_HEIGHT
      ) {
        invalid.push(`${path.basename(file)} ${width}×${height}`);
      }
    }

    expect(invalid, invalid.join("; ")).toEqual([]);
  });
});
