import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SLIDES } from "./home-content";

type ScienceMark = { src: string; width: number; height: number };

const asMark = (value: unknown): ScienceMark | null => {
  if (
    typeof value !== "object" ||
    value === null ||
    !("src" in value) ||
    !("width" in value) ||
    !("height" in value)
  ) {
    return null;
  }

  const mark = value as { src: unknown; width: unknown; height: unknown };
  if (
    typeof mark.src !== "string" ||
    typeof mark.width !== "number" ||
    typeof mark.height !== "number"
  ) {
    return null;
  }

  return { src: mark.src, width: mark.width, height: mark.height };
};

const readUint24Le = (file: Buffer, offset: number): number =>
  file[offset] | (file[offset + 1] << 8) | (file[offset + 2] << 16);

const pngSize = (file: Buffer): { width: number; height: number } => {
  if (file.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error("PNG is missing an IHDR chunk");
  }

  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
};

const webpSize = (file: Buffer): { width: number; height: number } => {
  let offset = 12;
  while (offset + 8 <= file.length) {
    const type = file.toString("ascii", offset, offset + 4);
    const size = file.readUInt32LE(offset + 4);
    const payload = offset + 8;

    if (type === "VP8X") {
      return {
        width: readUint24Le(file, payload + 4) + 1,
        height: readUint24Le(file, payload + 7) + 1,
      };
    }

    if (type === "VP8 ") {
      const signature = payload + 3;
      return {
        width: file.readUInt16LE(signature + 3) & 0x3fff,
        height: file.readUInt16LE(signature + 5) & 0x3fff,
      };
    }

    if (type === "VP8L") {
      const bits = file.readUInt32LE(payload + 1);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }

    offset = payload + size + (size & 1);
  }

  throw new Error("WEBP file has no VP8, VP8L or VP8X chunk");
};

const pixelSize = (file: Buffer): { width: number; height: number } => {
  if (file[0] === 0x89 && file.toString("ascii", 1, 4) === "PNG") {
    return pngSize(file);
  }

  if (
    file.toString("ascii", 0, 4) === "RIFF" &&
    file.toString("ascii", 8, 12) === "WEBP"
  ) {
    return webpSize(file);
  }

  throw new Error("unrecognised image format");
};

describe("science-section partner marks", () => {
  it("should record each unique mark's picture-file pixel size", () => {
    const seen = new Set<string>();

    for (const slide of SLIDES) {
      for (const value of slide.logos as unknown[]) {
        const mark = asMark(value);
        expect(
          mark,
          `science mark ${JSON.stringify(value)} must declare src, width and height`,
        ).not.toBeNull();
        if (!mark || seen.has(mark.src)) {
          continue;
        }

        seen.add(mark.src);
        const filePath = path.join(process.cwd(), "public", mark.src.replace(/^\//, ""));
        expect(pixelSize(readFileSync(filePath)), mark.src).toEqual({
          width: mark.width,
          height: mark.height,
        });
      }
    }

    expect(seen.size).toBeGreaterThan(0);
  });
});
