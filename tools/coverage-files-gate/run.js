#!/usr/bin/env node
/**
 * Files-covered gate.
 *
 * The agreed commitment level states a percentage of lines and a percentage of
 * files. Vitest enforces thresholds over lines, statements, functions and
 * branches; it has no metric for "how many files the suite reaches at all", so
 * this reads the coverage summary and enforces that half of the level.
 *
 * The threshold lives in config/coverage-thresholds.json beside the line
 * thresholds, pinned just under the measurement recorded there.
 *
 * Usage: node tools/coverage-files-gate/run.js [--summary <path>]
 */

import { readFileSync } from 'node:fs';
import { evaluateFileCoverage } from './evaluate-file-coverage.js';

const THRESHOLDS_PATH = new URL('../../config/coverage-thresholds.json', import.meta.url);
const DEFAULT_SUMMARY_PATH = new URL('../../coverage/coverage-summary.json', import.meta.url);

function summaryPath(argv) {
  const flagIndex = argv.indexOf('--summary');
  return flagIndex === -1 ? DEFAULT_SUMMARY_PATH : argv[flagIndex + 1];
}

function readJson(path, what) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`Could not read ${what} (${String(path)}): ${error.message}`);
  }
}

function main() {
  const { filesPercent } = readJson(THRESHOLDS_PATH, 'the coverage thresholds');
  const summary = readJson(summaryPath(process.argv), 'the coverage summary');
  const result = evaluateFileCoverage(summary, filesPercent);

  const measured = `${result.coveredFiles}/${result.measurableFiles} files (${result.percent.toFixed(1)}%)`;
  if (result.meetsThreshold) {
    console.log(`Files-covered gate: ${measured}, threshold ${String(filesPercent)}%.`);
    return;
  }

  console.error(
    `Files-covered gate failed: ${measured} is below the ${String(filesPercent)}% threshold.`,
  );
  for (const path of result.uncovered) {
    console.error(`  no coverage: ${path}`);
  }
  process.exitCode = 1;
}

try {
  main();
} catch (error) {
  // Unusable tooling or invocation, not a violation: a different exit code so
  // the two are never confused for one another.
  console.error(`Files-covered gate could not run: ${error.message}`);
  process.exitCode = 2;
}
