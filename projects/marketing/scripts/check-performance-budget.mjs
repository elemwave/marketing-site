import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"];

export function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

export function measureExport(exportDirectory, files) {
  const staticRoot = join(exportDirectory, "_next", "static");
  const javascript = files.filter((f) => f.startsWith(staticRoot) && extname(f) === ".js");
  const images = files.filter((f) => IMAGE_EXTENSIONS.includes(extname(f).toLowerCase()));

  return {
    javascriptGzippedBytes: javascript.reduce((total, f) => total + gzipSync(readFileSync(f)).length, 0),
    largestImageBytes: images.reduce((largest, f) => Math.max(largest, statSync(f).size), 0),
    totalExportBytes: files.reduce((total, f) => total + statSync(f).size, 0),
  };
}

export function evaluateBudgets(budgets, measured) {
  return Object.entries(budgets).map(([metric, { limit }]) => ({
    metric,
    limit,
    measured: measured[metric],
    withinBudget: measured[metric] <= limit,
  }));
}

export function formatResult({ metric, measured, limit, withinBudget }) {
  const kilobytes = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
  return `${withinBudget ? "ok  " : "FAIL"}  ${metric.padEnd(24)} ${kilobytes(measured).padStart(10)} / ${kilobytes(limit).padStart(10)}`;
}

function run() {
  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const exportDirectory = join(projectRoot, "out");
  const budget = JSON.parse(readFileSync(join(projectRoot, "performance-budget.json"), "utf8"));

  let files;
  try {
    files = listFiles(exportDirectory);
  } catch {
    console.error(`No export found at ${exportDirectory}. Build first.`);
    process.exit(2);
  }

  const results = evaluateBudgets(budget.budgets, measureExport(exportDirectory, files));
  for (const result of results) console.log(formatResult(result));

  if (results.some((result) => !result.withinBudget)) {
    console.error(`\nOver budget. ${budget.scenario}`);
    console.error(`Limits were set against a measurement on ${budget.measuredOn}; raise one only with a reason.`);
    process.exit(1);
  }
  console.log("\nWithin budget.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run();
