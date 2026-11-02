import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Pins the time allowance of the lint-plugins guard (EWM-128). The guard's
 * first case builds the whole ESLint configuration cold, which exceeds
 * vitest's 5 s default when the gate runs other suites alongside it. The load
 * cannot be reproduced in a focussed run, so the allowance is read from source.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs
  .readFileSync(path.join(here, "lint-plugins.test.mjs"), "utf8")
  .split("\n")
  .filter((line) => !/^\s*(\/\/|\/?\*)/.test(line))
  .join("\n");

const cases = [
  ["reports react/jsx-key for a list item without a key", "react/jsx-key"],
  ["reports jsx-a11y/alt-text for an image without alt text", "jsx-a11y/alt-text"],
  ["reports import/no-anonymous-default-export for an anonymous default", "import/no-anonymous-default-export"],
];

function bodyOf(title) {
  const start = source.indexOf(`it("${title}"`);
  expect(start, `missing case: ${title}`).toBeGreaterThanOrEqual(0);
  const end = source.indexOf("\n  it(", start + 1);
  return source.slice(start, end === -1 ? undefined : end);
}

describe("lint-plugins guard time allowance", () => {
  it("declares an allowance of exactly 15 seconds", () => {
    const match = /const LINT_LOAD_TIMEOUT_MS = ([\d_]+);/.exec(source);
    expect(Number(match?.[1].replaceAll("_", ""))).toBe(15000);
  });

  it.each(cases)("gives the case '%s' the allowance and keeps its assertion", (title, ruleId) => {
    const body = bodyOf(title);
    expect(body).toMatch(/\}, LINT_LOAD_TIMEOUT_MS\);/);
    expect(body).toContain(`expect(ids).toContain("${ruleId}");`);
  });
});
