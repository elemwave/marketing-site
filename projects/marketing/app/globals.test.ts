import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CSS_PATH = path.join(__dirname, "globals.css");
const MINIMUM_NORMAL_TEXT_CONTRAST = 4.5;

function readCustomProperty(name: string): string {
  const css = readFileSync(CSS_PATH, "utf-8");
  const match = css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6});`));
  if (!match) {
    throw new Error(`Custom property ${name} not found in ${CSS_PATH}`);
  }
  return match[1];
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const linearize = (channel: number) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

  const [rLin, gLin, bLin] = [linearize(r), linearize(g), linearize(b)];
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("the muted body text colour", () => {
  it("should reach the WCAG AA contrast minimum for normal text against white", () => {
    const inkMuted = readCustomProperty("--color-ink-muted");
    expect(contrastRatio(inkMuted, "#ffffff")).toBeGreaterThanOrEqual(
      MINIMUM_NORMAL_TEXT_CONTRAST,
    );
  });

  it("should reach the WCAG AA contrast minimum for normal text against the surface background", () => {
    const inkMuted = readCustomProperty("--color-ink-muted");
    const surface = readCustomProperty("--color-surface");
    expect(contrastRatio(inkMuted, surface)).toBeGreaterThanOrEqual(
      MINIMUM_NORMAL_TEXT_CONTRAST,
    );
  });
});
