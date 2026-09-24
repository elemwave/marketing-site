import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CSS_PATH = path.join(__dirname, "globals.css");
const MINIMUM_NORMAL_TEXT_CONTRAST = 4.5;
const MINIMUM_NON_TEXT_CONTRAST = 3;

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

function readStylesheet(): string {
  return readFileSync(CSS_PATH, "utf-8");
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractBalancedBlock(
  source: string,
  fromIndex: number,
): { inner: string; start: number; end: number } {
  const start = source.indexOf("{", fromIndex);
  if (start === -1) {
    throw new Error("opening brace not found");
  }

  let depth = 0;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return { inner: source.slice(start + 1, i), start, end: i + 1 };
      }
    }
  }

  throw new Error("unclosed brace block");
}

function reducedMotionQuery(css: string): {
  inner: string;
  start: number;
  end: number;
} {
  const marker = "@media (prefers-reduced-motion: reduce)";
  const index = css.indexOf(marker);
  if (index === -1) {
    throw new Error("reduced-motion query not found");
  }
  return extractBalancedBlock(css, index);
}

function ruleDeclarations(
  block: string,
  selector: string,
): Record<string, string> {
  const pattern = new RegExp(`(^|\\s)${selector}\\s*\\{`);
  const match = pattern.exec(block);
  if (!match) {
    throw new Error(`selector ${selector} not found`);
  }

  const { inner } = extractBalancedBlock(block, match.index);
  const declarations: Record<string, string> = {};
  for (const part of inner.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const colon = trimmed.indexOf(":");
    if (colon === -1) {
      continue;
    }
    declarations[trimmed.slice(0, colon).trim()] = trimmed
      .slice(colon + 1)
      .trim();
  }
  return declarations;
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

describe("the science carousel's idle dot", () => {
  it("should reach the WCAG AA contrast minimum for a non-text control against the surface background", () => {
    const dotIdle = readCustomProperty("--color-dot-idle");
    const surface = readCustomProperty("--color-surface");
    expect(contrastRatio(dotIdle, surface)).toBeGreaterThanOrEqual(
      MINIMUM_NON_TEXT_CONTRAST,
    );
  });
});

describe("the page shell", () => {
  it("should make body a full-viewport flex column so the footer can anchor to its bottom", () => {
    const css = readStylesheet();
    const body = ruleDeclarations(css, "body");
    expect(body["display"]).toBe("flex");
    expect(body["flex-direction"]).toBe("column");
    expect(body["min-height"]).toBe("100dvh");
  });

  it("should grow whichever element precedes the footer to fill the column's leftover height", () => {
    const css = readStylesheet();
    const beforeFooter = ruleDeclarations(
      css,
      escapeRegExp("body > *:has(+ footer)"),
    );
    expect(beforeFooter["display"]).toBe("flex");
    expect(beforeFooter["flex-direction"]).toBe("column");
    expect(beforeFooter["flex"]).toBe("1 1 auto");
  });

  it("should grow that element's own last child too, so its background reaches the footer instead of plain body space", () => {
    const css = readStylesheet();
    const lastChild = ruleDeclarations(
      css,
      escapeRegExp("body > *:has(+ footer) > :last-child"),
    );
    expect(lastChild["flex"]).toBe("1 1 auto");
  });

  it("should centre that grown last child's own content in the leftover height, on every page, not only one", () => {
    const css = readStylesheet();
    const lastChild = ruleDeclarations(
      css,
      escapeRegExp("body > *:has(+ footer) > :last-child"),
    );
    expect(lastChild["display"]).toBe("flex");
    expect(lastChild["flex-direction"]).toBe("column");
    expect(lastChild["justify-content"]).toBe("center");
  });
});

describe("in-page scroll motion", () => {
  it("should reach in-page destinations at once when reduced motion is requested", () => {
    const css = readStylesheet();
    const reduce = reducedMotionQuery(css);
    const html = ruleDeclarations(reduce.inner, "html");
    expect(html["scroll-behavior"]).toBe("auto");
  });

  it("should keep animated in-page scrolling when reduced motion is not requested", () => {
    const css = readStylesheet();
    const reduce = reducedMotionQuery(css);
    const outside = `${css.slice(0, reduce.start)}${css.slice(reduce.end)}`;
    const html = ruleDeclarations(outside, "html");
    expect(html["scroll-behavior"]).toBe("smooth");
  });
});
