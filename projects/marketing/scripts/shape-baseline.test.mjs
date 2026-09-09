import { describe, expect, it } from "vitest";

import {
  compareToBaseline,
  countByFileAndRule,
  formatFailures,
  toBaseline,
} from "./shape-baseline.mjs";

/**
 * The frontend shape-lint comparison.
 *
 * ESLint has no baseline mechanism of its own, so this is ours, and being ours
 * means a parsing or comparison bug reads as a gate with nothing to say rather
 * than as a failure. Hence unit tests on the pure functions: the entry point
 * around them only runs ESLint and prints.
 *
 * Counted per file *and* per rule, not per rule alone. A single global count per
 * rule lets a finding fixed in one file pay for a new one introduced in another,
 * which is exactly the drift these gates exist to detect.
 */
const result = (filePath, ruleIds) => ({
  filePath,
  messages: ruleIds.map((ruleId) => ({ ruleId, line: 1, severity: 2 })),
});

describe("countByFileAndRule", () => {
  it("counts each rule separately within each file, relative to the root", () => {
    const counts = countByFileAndRule(
      [
        result("/app/src/a.tsx", [
          "sonarjs/cognitive-complexity",
          "sonarjs/cognitive-complexity",
          "sonarjs/no-nested-conditional",
        ]),
        result("/app/src/b.tsx", ["sonarjs/cognitive-complexity"]),
      ],
      "/app",
    );

    expect(counts).toEqual({
      "src/a.tsx": {
        "sonarjs/cognitive-complexity": 2,
        "sonarjs/no-nested-conditional": 1,
      },
      "src/b.tsx": { "sonarjs/cognitive-complexity": 1 },
    });
  });

  it("omits files with no findings, so a clean file never enters the baseline", () => {
    const counts = countByFileAndRule(
      [result("/app/src/clean.tsx", [])],
      "/app",
    );

    expect(counts).toEqual({});
  });

  it("ignores messages with no rule id, which are parse errors rather than findings", () => {
    const counts = countByFileAndRule(
      [
        {
          filePath: "/app/src/broken.tsx",
          messages: [{ ruleId: null, message: "Parsing error", severity: 2 }],
        },
      ],
      "/app",
    );

    expect(counts).toEqual({});
  });
});

describe("compareToBaseline", () => {
  const baseline = {
    "src/a.tsx": { "sonarjs/cognitive-complexity": 2 },
  };

  it("passes when a count equals what was recorded", () => {
    const { failures, improvements } = compareToBaseline(
      { "src/a.tsx": { "sonarjs/cognitive-complexity": 2 } },
      baseline,
    );

    expect(failures).toEqual([]);
    expect(improvements).toEqual([]);
  });

  it("fails when a recorded rule fires more often in the same file", () => {
    const { failures } = compareToBaseline(
      { "src/a.tsx": { "sonarjs/cognitive-complexity": 3 } },
      baseline,
    );

    expect(failures).toEqual([
      {
        file: "src/a.tsx",
        rule: "sonarjs/cognitive-complexity",
        recorded: 2,
        current: 3,
        reason: "rose",
      },
    ]);
  });

  it("fails when a rule new to a recorded file appears", () => {
    const { failures } = compareToBaseline(
      {
        "src/a.tsx": {
          "sonarjs/cognitive-complexity": 2,
          "sonarjs/no-nested-conditional": 1,
        },
      },
      baseline,
    );

    expect(failures).toEqual([
      {
        file: "src/a.tsx",
        rule: "sonarjs/no-nested-conditional",
        recorded: 0,
        current: 1,
        reason: "appeared",
      },
    ]);
  });

  it("fails when a finding appears in a file absent from the baseline", () => {
    const { failures } = compareToBaseline(
      {
        "src/a.tsx": { "sonarjs/cognitive-complexity": 2 },
        "src/new.tsx": { "sonarjs/pseudo-random": 1 },
      },
      baseline,
    );

    expect(failures).toEqual([
      {
        file: "src/new.tsx",
        rule: "sonarjs/pseudo-random",
        recorded: 0,
        current: 1,
        reason: "appeared",
      },
    ]);
  });

  it("reports a reduction as an improvement rather than a failure", () => {
    const { failures, improvements } = compareToBaseline(
      { "src/a.tsx": { "sonarjs/cognitive-complexity": 1 } },
      baseline,
    );

    expect(failures).toEqual([]);
    expect(improvements).toEqual([
      {
        file: "src/a.tsx",
        rule: "sonarjs/cognitive-complexity",
        recorded: 2,
        current: 1,
      },
    ]);
  });

  it("reports a rule that has gone entirely as an improvement", () => {
    const { failures, improvements } = compareToBaseline({}, baseline);

    expect(failures).toEqual([]);
    expect(improvements).toEqual([
      {
        file: "src/a.tsx",
        rule: "sonarjs/cognitive-complexity",
        recorded: 2,
        current: 0,
      },
    ]);
  });

  /**
   * A fix in one file must not pay for a regression in another. This is the
   * whole reason the baseline is keyed per file rather than per rule.
   */
  it("does not let a fix in one file offset a regression in another", () => {
    const { failures, improvements } = compareToBaseline(
      {
        "src/a.tsx": { "sonarjs/cognitive-complexity": 1 },
        "src/b.tsx": { "sonarjs/cognitive-complexity": 1 },
      },
      baseline,
    );

    expect(failures).toEqual([
      {
        file: "src/b.tsx",
        rule: "sonarjs/cognitive-complexity",
        recorded: 0,
        current: 1,
        reason: "appeared",
      },
    ]);
    expect(improvements).toHaveLength(1);
  });
});

describe("toBaseline", () => {
  it("sorts files and rules, so re-recording one file is a small diff", () => {
    const baseline = toBaseline({
      "src/z.tsx": { b: 1, a: 2 },
      "src/a.tsx": { c: 3 },
    });

    expect(Object.keys(baseline)).toEqual(["src/a.tsx", "src/z.tsx"]);
    expect(Object.keys(baseline["src/z.tsx"])).toEqual(["a", "b"]);
  });
});

describe("formatFailures", () => {
  it("states the file, the rule, and both counts", () => {
    const text = formatFailures([
      {
        file: "src/a.tsx",
        rule: "sonarjs/cognitive-complexity",
        recorded: 2,
        current: 3,
        reason: "rose",
      },
    ]);

    expect(text).toContain("src/a.tsx");
    expect(text).toContain("sonarjs/cognitive-complexity");
    expect(text).toContain("2");
    expect(text).toContain("3");
  });
});
