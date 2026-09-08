#!/usr/bin/env node
/**
 * Frontend code-shape findings, held against a recorded count per file per rule.
 *
 * Runs `eslint.shape.config.mjs` — a second ESLint pass, separate from the one
 * `npm run lint` runs — and compares the result to `shape-lint-baseline.json`.
 * The comparison lives in `shape-baseline.mjs` and is unit-tested; this file
 * runs the lint and prints.
 *
 * Why a baseline at all: the sonarjs recommended set finds 255 findings across
 * 102 files on this tree, none of them introduced by this change. Failing on all
 * of them would either stop every contributor or demand 255 inline suppressions
 * in product code. Recording them instead means only *new* findings fail, which
 * is the same bargain the file-size and duplication gates strike.
 *
 * Usage:
 *   node scripts/check-shape-lint.mjs            # check (default)
 *   node scripts/check-shape-lint.mjs --report   # show current vs recorded
 *   node scripts/check-shape-lint.mjs --update   # re-record the baseline
 *   node scripts/check-shape-lint.mjs --apply-drift  # record what moved and succeed
 *
 * Exit codes:
 *   0  every file is at or below its recorded count for every rule
 *   1  a rule fires more often, or a finding appeared where none was recorded
 *   2  the baseline or the invocation is unusable
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import { ESLint } from "eslint";

import {
  compareToBaseline,
  countByFileAndRule,
  formatFailures,
  formatImprovements,
  toBaseline,
} from "./shape-baseline.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const baselineFile = path.join(projectRoot, "shape-lint-baseline.json");
const configFile = path.join(projectRoot, "eslint.shape.config.mjs");

const mode = (() => {
  const argument = process.argv[2];
  if (argument === undefined || argument === "--check") return "check";
  if (
    argument === "--report" ||
    argument === "--update" ||
    argument === "--apply-drift"
  ) {
    return argument.slice(2);
  }
  console.error(`Unknown argument: ${argument}`);
  console.error(
    "Usage: check-shape-lint.mjs [--report | --update | --apply-drift]",
  );
  process.exit(2);
})();

async function currentCounts() {
  const eslint = new ESLint({
    cwd: projectRoot,
    // `overrideConfigFile` is what keeps this pass from inheriting
    // `eslint.config.mjs`: the shape rules are a separate opinion about the same
    // files, and merging the two would report every ordinary lint error here as
    // well, then count it against a baseline that has no business holding it.
    overrideConfigFile: configFile,
  });

  const results = await eslint.lintFiles(["."]);

  // A parse error would otherwise be counted as zero findings for that file,
  // which reads as an improvement. Fail loudly instead.
  const fatal = results.filter((result) =>
    (result.messages ?? []).some((message) => message.fatal),
  );
  if (fatal.length > 0) {
    console.error("ESLint could not parse these files:");
    for (const result of fatal) {
      console.error(`  ${path.relative(projectRoot, result.filePath)}`);
    }
    console.error("");
    console.error("Fix the syntax error first: an unparsed file reports no");
    console.error(
      "findings, which this gate would otherwise read as progress.",
    );
    process.exit(2);
  }

  return countByFileAndRule(results, projectRoot);
}

function readBaseline() {
  if (!existsSync(baselineFile)) {
    console.error(
      `Missing ${path.basename(baselineFile)}. Record it with \`npm run shape:update\`.`,
    );
    process.exit(2);
  }

  try {
    return JSON.parse(readFileSync(baselineFile, "utf8"));
  } catch (error) {
    console.error(
      `${path.basename(baselineFile)} is not valid JSON: ${error.message}`,
    );
    process.exit(2);
  }
  return {};
}

function totalFindings(counts) {
  return Object.values(counts).reduce(
    (sum, rules) => sum + Object.values(rules).reduce((a, b) => a + b, 0),
    0,
  );
}

const counts = await currentCounts();

if (mode === "update") {
  writeFileSync(
    baselineFile,
    `${JSON.stringify(toBaseline(counts), null, 2)}\n`,
  );
  console.log(
    `Recorded ${totalFindings(counts)} findings across ` +
      `${Object.keys(counts).length} files in ${path.basename(baselineFile)}.`,
  );
  process.exit(0);
}

const baseline = readBaseline();
const { failures, improvements } = compareToBaseline(counts, baseline);

if (mode === "report") {
  console.log(
    `Frontend shape findings against ${path.basename(baselineFile)}:`,
  );
  if (failures.length > 0) console.log(formatFailures(failures));
  if (improvements.length > 0) console.log(formatImprovements(improvements));
  if (failures.length === 0 && improvements.length === 0) {
    console.log("  every recorded count is unchanged");
  }
  console.log(
    `\n${totalFindings(counts)} findings across ${Object.keys(counts).length} files.`,
  );
  process.exit(0);
}

/* Recording is mechanical, so the local gate does it here rather than spending
 * a second full run on it. The judgement it replaces — is this complexity
 * worth it — moves to the baseline diff, which a reviewer reads like any other
 * change. Everything that moved is named, in both directions, so nothing is
 * recorded quietly. */
if (
  mode === "apply-drift" &&
  (failures.length > 0 || improvements.length > 0)
) {
  writeFileSync(
    baselineFile,
    `${JSON.stringify(toBaseline(counts), null, 2)}\n`,
  );
  console.error(
    "Recorded the findings that moved, so this needs no second run:",
  );
  if (failures.length > 0) console.error(formatFailures(failures));
  if (improvements.length > 0) console.error(formatImprovements(improvements));
  console.error("");
  console.error(
    "Simplify anyway if the complexity is yours — the recording books it,",
  );
  console.error(
    "it does not justify it. Say what it buys when you commit, and if it is",
  );
  console.error("not yours, commit it on its own.");
  process.exit(0);
}

if (failures.length > 0) {
  // Failures win over improvements. Reporting the improvement first would
  // advise re-recording, and a re-record would take the regression with it.
  console.error(formatFailures(failures));
  console.error("");
  console.error("Simplify rather than recording the finding. `npm run");
  console.error(
    "shape:report` shows the whole picture; re-record with `npm run",
  );
  console.error("shape:update` only when the complexity is deliberate and the");
  console.error("commit message says what it buys.");
  process.exit(1);
}

if (improvements.length > 0) {
  console.error(formatImprovements(improvements));
  console.error("");
  console.error("Good news, and the baseline must record it: re-record with");
  console.error(
    "`npm run shape:update` so the improvement is kept rather than",
  );
  console.error("left as headroom for the next change.");
  process.exit(2);
}

console.log(
  `Shape findings match ${path.basename(baselineFile)}: ` +
    `${totalFindings(counts)} across ${Object.keys(counts).length} files.`,
);
process.exit(0);
