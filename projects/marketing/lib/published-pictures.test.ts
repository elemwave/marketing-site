import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SLIDES } from "./home-content";
import { PARTNER_LOGOS } from "./site-content";

const PUBLIC_IMAGES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/images",
);

const ORGANISATION_MARK_MAX_WIDTH = 530;
const ORGANISATION_MARK_MAX_HEIGHT = 410;
const REFERENCE_PUBLICATION = "publication-accelerating-finite-difference.webp";
const REFERENCE_PUBLICATION_MAX_BYTES = 60_000;

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
    ...SLIDES.flatMap((slide) => slide.logos),
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
