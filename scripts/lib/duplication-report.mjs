#!/usr/bin/env node
/**
 * Attributes jscpd's clones to areas, and holds each area against its budget.
 *
 * The shell entry point (`scripts/check-duplication-budgets.sh`) runs jscpd in
 * a container and hands the report here. All the logic is in this file, which
 * is why the tests drive it directly.
 *
 * Five areas, because duplication means different things in different places.
 * Test code is the largest share in this repository — around 17% of
 * `backend/tests` — and much of it is deliberate: fixtures repeated for
 * readability, arrangements kept independent on purpose. Holding tests to the
 * source figure would push contributors toward shared fixtures that make tests
 * harder to read, so tests get their own budgets and are judged against
 * themselves.
 *
 * Budgets are proportions, not counts. A count fails the gate for adding code,
 * which is the wrong incentive and would fire on every new test file; a
 * proportion only moves when the ratio of copied to written code moves.
 *
 * Two properties of jscpd that this file exists to survive:
 *
 *   1. **Paths must be absolute.** jscpd 5 strips the common prefix of its
 *      inputs unless `--absolute` is passed. When that happened during
 *      development, every path lost its `backend/src` or `frontend/src` stem,
 *      every clone fell through to whichever branch the classifier reached
 *      last, and the tool cheerfully reported 20,588 duplicated lines in
 *      `frontend/src` and none at all in either backend area. A wrong number
 *      is worse than no number, so a relative path is a hard error here.
 *   2. **The report carries no per-file line counts** — `statistics.formats`
 *      has an empty `sources` map — so the denominator is counted here, over
 *      the same file selection `measurements.md` recorded. It will not equal
 *      jscpd's own headline percentage, which counts a different set (it
 *      includes CSS, and skips formats it cannot tokenise). Consistency
 *      between runs is what the gate needs; agreement with jscpd's summary
 *      line is not.
 *
 * Comparison is at two decimal places, matching how the measurements are stored.
 * That leaves an implicit tolerance below 0.005 of a percentage point — four
 * or five duplicated lines in `backend/src` — which is deliberate: a gate that
 * fires on a single eight-line clone in 90,000 lines would be re-recorded into
 * uselessness within a month. A real copy-paste moves the second decimal.
 *
 * Usage:
 *   node duplication-report.mjs --root DIR --report FILE --budgets FILE \
 *     [--mode check|report|update]
 *
 * Exit codes:
 *   0  every area is at or below its recorded threshold
 *   1  an area exceeds its threshold
 *   2  the report, the baseline, or the invocation is unusable
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * Area definitions, in the order they are tested.
 *
 * `frontend/tests` must be tested before `frontend/src`: the frontend keeps
 * tests beside the code they cover, so the two areas share a directory and are
 * told apart by filename alone. Reverse the order and every test file is
 * charged to the source budget.
 */
const AREAS = [
  {
    name: "infra/test",
    matches: (rel) => rel.startsWith("infra/test/"),
    extensions: [".ts", ".js", ".cjs", ".mjs"],
    roots: ["infra"],
    countsTests: true,
  },
  {
    name: "infra",
    matches: (rel) => rel.startsWith("infra/") && !rel.startsWith("infra/test/"),
    extensions: [".ts", ".js", ".cjs", ".mjs"],
    roots: ["infra"],
    countsTests: false,
  },
  {
    name: "projects/marketing",
    matches: (rel) => rel.startsWith("projects/marketing/") && !isTestFile(rel),
    extensions: [".ts", ".tsx", ".mjs"],
    roots: ["projects/marketing"],
    countsTests: false,
  },
];

function isTestFile(rel) {
  const base = path.basename(rel);
  return /\.(test|spec)\./.test(base);
}

function isDeclarationFile(rel) {
  return rel.endsWith(".d.ts");
}

function die(message) {
  console.error(message);
  process.exit(2);
}

function parseArguments(argv) {
  const options = { mode: "check" };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    switch (flag) {
      case "--root":
      case "--report":
      case "--budgets":
      case "--mode":
        if (!value) die(`Missing value for ${flag}.`);
        options[flag.slice(2)] = value;
        i += 1;
        break;
      default:
        die(`Unknown argument: ${flag}`);
    }
  }
  for (const required of ["root", "report", "budgets"]) {
    if (!options[required]) die(`Missing required --${required}.`);
  }
  if (!["check", "report", "update"].includes(options.mode)) {
    die(`Unknown mode: ${options.mode}`);
  }
  return options;
}

function readJson(file, what) {
  let raw;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    die(`${what} is not valid JSON (${file}): ${error.message}`);
  }
  return null;
}

/** Lines in every file of an area, counted the way `measurements.md` counted. */
function countAreaLines(root, area) {
  let total = 0;

  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        walk(full);
        continue;
      }
      const rel = path.relative(root, full);
      if (!area.extensions.includes(path.extname(full))) continue;
      if (isDeclarationFile(rel)) continue;
      // Within a shared directory the area owns only its own half.
      if (area.countsTests === false && isTestFile(rel)) continue;
      if (area.name === "frontend/tests" && !isTestFile(rel)) continue;
      total += countLines(full);
    }
  };

  for (const areaRoot of area.roots) {
    const absolute = path.join(root, areaRoot);
    try {
      if (!statSync(absolute).isDirectory()) continue;
    } catch {
      continue;
    }
    walk(absolute);
  }

  return total;
}

function countLines(file) {
  const contents = readFileSync(file, "utf8");
  if (contents === "") return 0;
  const newlines = contents.split("\n").length - 1;
  // A final line with no newline still counts, matching `wc -l` only when the
  // file ends in one — which the file-convention gate enforces repository-wide.
  return contents.endsWith("\n") ? newlines : newlines + 1;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function format(value) {
  return value.toFixed(2);
}

/**
 * Duplicated lines per area, plus the clone locations behind each figure.
 *
 * Both halves of a clone are charged, and a clone whose halves land in
 * different areas is charged to both — copying between two areas is
 * duplication in each of them.
 */
function attribute(root, report) {
  const duplicates = Array.isArray(report?.duplicates) ? report.duplicates : [];
  const lines = new Map(AREAS.map((area) => [area.name, 0]));
  const locations = new Map(AREAS.map((area) => [area.name, []]));
  const unattributable = new Set();
  const relative = new Set();

  const classify = (file) => {
    const name = file?.name ?? "";
    if (!path.isAbsolute(name)) {
      relative.add(name);
      return null;
    }
    const rel = path.relative(root, name);
    if (rel.startsWith("..")) {
      unattributable.add(name);
      return null;
    }
    const area = AREAS.find((candidate) => candidate.matches(rel));
    if (!area) {
      unattributable.add(rel);
      return null;
    }
    return { area: area.name, rel };
  };

  for (const clone of duplicates) {
    const count = Number(clone.lines) || 0;
    const first = classify(clone.firstFile);
    const second = classify(clone.secondFile);
    const charged = new Set();

    for (const side of [first, second]) {
      if (!side || charged.has(side.area)) continue;
      charged.add(side.area);
      lines.set(side.area, lines.get(side.area) + count);
    }

    const where = [first?.rel, second?.rel].filter(Boolean);
    for (const area of charged) {
      locations.get(area).push({ where: where.join(" <> "), lines: count });
    }
  }

  if (relative.size > 0) {
    die(
      [
        "The jscpd report contains paths that are not absolute:",
        ...[...relative].slice(0, 5).map((name) => `  ${name}`),
        "",
        "jscpd strips the common path prefix unless it is run with",
        "--absolute, and without the prefix a clone cannot be attributed to an",
        "area. Add --absolute to the jscpd invocation.",
      ].join("\n"),
    );
  }

  if (unattributable.size > 0) {
    die(
      [
        "These duplicated files belong to no measured area:",
        ...[...unattributable].slice(0, 10).map((name) => `  ${name}`),
        "",
        "Either the jscpd invocation scanned something the areas do not cover,",
        "or a new top-level directory needs an area in duplication-report.mjs.",
        "Dropping them silently would leave that code unmeasured.",
      ].join("\n"),
    );
  }

  return { lines, locations };
}

function loadBudgets(file) {
  const budgets = readJson(file, "The duplication baseline");
  if (budgets === null) {
    die(
      `Missing ${path.basename(file)}. Record thresholds with --update.`,
    );
  }

  const recorded = new Map();
  for (const [area, value] of Object.entries(budgets)) {
    if (typeof value?.percentage === "number") {
      die(
        `Area "${area}" uses the old exact percentage shape in ${path.basename(file)}. ` +
          "Expected numeric thresholdPercentage.",
      );
    }
    const thresholdPercentage = value?.thresholdPercentage;
    if (
      typeof thresholdPercentage !== "number" ||
      Number.isNaN(thresholdPercentage)
    ) {
      die(
        `Area "${area}" has no numeric thresholdPercentage in ${path.basename(file)}.`,
      );
    }
    recorded.set(area, {
      thresholdPercentage,
    });
  }

  const expected = new Set(AREAS.map((area) => area.name));
  const missing = [...expected].filter((area) => !recorded.has(area));
  const stale = [...recorded.keys()].filter((area) => !expected.has(area));

  if (missing.length > 0) {
    die(
      [
        `Areas with no duplication threshold in ${path.basename(file)}:`,
        ...missing.map((area) => `  ${area}`),
        "",
        "An absent area would otherwise read as having no limit to exceed, which is",
        "how a whole area stops being gated without anyone noticing.",
      ].join("\n"),
    );
  }

  if (stale.length > 0) {
    die(
      [
        `Recorded in ${path.basename(file)} but not a measured area:`,
        ...stale.map((area) => `  ${area}`),
        "",
        "Re-record with --update.",
      ].join("\n"),
    );
  }

  return recorded;
}

function measure(options) {
  const report = readJson(options.report, "The jscpd report");
  if (report === null) die(`Cannot read the jscpd report: ${options.report}`);

  const { lines, locations } = attribute(options.root, report);

  return AREAS.map((area) => {
    const duplicated = lines.get(area.name);
    const total = countAreaLines(options.root, area);
    return {
      area: area.name,
      duplicated,
      total,
      percentage: total === 0 ? 0 : round((duplicated / total) * 100),
      locations: locations.get(area.name),
    };
  });
}

function describeMeasuredAgainstThreshold(measured, recorded) {
  return measured.map((entry) => {
    const budget = recorded.get(entry.area);
    const thresholdDelta = round(budget.thresholdPercentage - entry.percentage);
    const thresholdStatus =
      thresholdDelta >= 0
        ? `headroom ${format(thresholdDelta)}%`
        : `breach ${format(Math.abs(thresholdDelta))}%`;

    return (
      `  ${entry.area.padEnd(16)} now ${format(entry.percentage)}%, ` +
      `threshold ${format(budget.thresholdPercentage)}%, ${thresholdStatus}  ` +
      `${entry.duplicated} of ${entry.total} lines`
    );
  });
}

function printThresholdReport(measured, recorded, budgetsFile) {
  console.log(`Duplication against ${path.basename(budgetsFile)}:`);
  for (const line of describeMeasuredAgainstThreshold(measured, recorded)) {
    console.log(line);
  }
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  const measured = measure(options);

  if (options.mode === "update") {
    const written = {};
    for (const entry of measured) {
      written[entry.area] = {
        thresholdPercentage: Math.ceil(entry.percentage),
      };
    }
    writeFileSync(options.budgets, `${JSON.stringify(written, null, 2)}\n`);
    console.log(`Recorded ${measured.length} duplication thresholds in ${path.basename(options.budgets)}:`);
    for (const entry of measured) {
      console.log(
        `  ${entry.area.padEnd(16)} threshold ${format(Math.ceil(entry.percentage))}%  ` +
          `(${entry.duplicated} of ${entry.total} lines)`,
      );
    }
    return 0;
  }

  const recorded = loadBudgets(options.budgets);

  if (options.mode === "report") {
    printThresholdReport(measured, recorded, options.budgets);
    return 0;
  }

  printThresholdReport(measured, recorded, options.budgets);

  const exceeded = measured.filter(
    (entry) => entry.percentage > recorded.get(entry.area).thresholdPercentage,
  );

  if (exceeded.length === 0) return 0;

  console.error("These areas exceed their duplication threshold:");
  for (const entry of exceeded) {
    const budget = recorded.get(entry.area);
    const excess = round(entry.percentage - budget.thresholdPercentage);
    console.error(
      `  ${entry.area}  now ${format(entry.percentage)}%, ` +
        `threshold ${format(budget.thresholdPercentage)}%, ` +
        `exceeds by ${format(excess)}%  ` +
        `(${entry.duplicated} of ${entry.total} lines)`,
    );
    // Ranked by size, and labelled for what it is. The gate compares totals,
    // so it cannot tell which clone is new — listing the first five in report
    // order showed a contributor five pre-existing clones and none of theirs,
    // which sends them to read the wrong code. The largest ones at least name
    // the duplication worth removing.
    const ranked = [...entry.locations].sort((a, b) => b.lines - a.lines);
    console.error(`      largest clones in this area (not necessarily the new one):`);
    for (const location of ranked.slice(0, 5)) {
      console.error(`        ${location.lines} lines  ${location.where}`);
    }
    if (ranked.length > 5) {
      console.error(`        … and ${ranked.length - 5} more`);
    }
  }
  console.error("");
  console.error("Extract the shared code rather than copying it again.");
  console.error(
    "The clone this change introduced is in its own diff; this gate sees only",
  );
  console.error("that the area's total rose.");
  console.error(
    "If the duplication is deliberate, change the threshold in",
  );
  console.error(
    `${path.basename(options.budgets)} and say in the commit message why the limit moved.`,
  );
  return 1;
}

process.exit(main());
