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
