import path from "node:path";

/**
 * Comparing ESLint shape findings to a recorded baseline.
 *
 * Pure functions, separated from `check-shape-lint.mjs` so they can be tested
 * without running ESLint. The entry point around them runs the lint and prints;
 * everything that could be subtly wrong is here.
 *
 * Counts are keyed by file *and* rule. A single count per rule would let a
 * finding fixed in one file pay for a new one introduced in another — the drift
 * these gates exist to detect. Keying per file still allows that within one
 * file, which is a bounded and accepted residue; keying per line or per function
 * would break on every edit above the finding.
 */

/**
 * Findings per file per rule, keyed by path relative to the project root.
 *
 * ESLint reports absolute paths, which differ between a container and a host, so
 * a baseline keyed by them would be unusable in the other place.
 *
 * Messages with no `ruleId` are parse errors rather than findings. They must not
 * enter the baseline — a syntax error is the lint stage's business, and counting
 * it here would record it as an acceptable shape defect.
 */
export function countByFileAndRule(results, root) {
  const counts = {};

  for (const result of results) {
    const relative = path.relative(root, result.filePath);

    for (const message of result.messages ?? []) {
      if (!message.ruleId) continue;

      counts[relative] ??= {};
      counts[relative][message.ruleId] =
        (counts[relative][message.ruleId] ?? 0) + 1;
    }
  }

  return counts;
}

/**
 * Failures and improvements, given current counts and the recorded ones.
 *
 * `rose` and `appeared` are distinguished because the remedy differs in tone:
 * one is a file getting worse at something it was already bad at, the other is a
 * new kind of defect in a file the baseline thought was clean of it.
 */
export function compareToBaseline(counts, baseline) {
  const observed = judgeObserved(counts, baseline);
  const vanished = findVanished(counts, baseline);

  return {
    failures: observed.failures.sort(byFileThenRule),
    improvements: [...observed.improvements, ...vanished].sort(byFileThenRule),
  };
}

/** Each finding that is present now, judged against what was recorded. */
function judgeObserved(counts, baseline) {
  const failures = [];
  const improvements = [];

  for (const [file, rules] of Object.entries(counts)) {
    for (const [rule, current] of Object.entries(rules)) {
      const recorded = baseline[file]?.[rule] ?? 0;

      if (current > recorded) {
        failures.push({
          file,
          rule,
          recorded,
          current,
          reason: recorded === 0 ? "appeared" : "rose",
        });
      } else if (current < recorded) {
        improvements.push({ file, rule, recorded, current });
      }
    }
  }

  return { failures, improvements };
}

/**
 * Recorded findings that are gone entirely.
 *
 * Left in the baseline they stay as headroom, so the next change can
 * reintroduce exactly what somebody fixed and the gate will not notice.
 */
function findVanished(counts, baseline) {
  const improvements = [];

  for (const [file, rules] of Object.entries(baseline)) {
    for (const [rule, recorded] of Object.entries(rules)) {
      if (recorded > 0 && (counts[file]?.[rule] ?? 0) === 0) {
        improvements.push({ file, rule, recorded, current: 0 });
      }
    }
  }

  return improvements;
}

function byFileThenRule(left, right) {
  return (
    left.file.localeCompare(right.file) || left.rule.localeCompare(right.rule)
  );
}

/** Sorted by file and by rule, so re-recording one file is a small diff. */
export function toBaseline(counts) {
  const baseline = {};

  for (const file of Object.keys(counts).sort()) {
    baseline[file] = Object.fromEntries(
      Object.keys(counts[file])
        .sort()
        .map((rule) => [rule, counts[file][rule]]),
    );
  }

  return baseline;
}

export function formatFailures(failures) {
  const lines = [];

  const rose = failures.filter((failure) => failure.reason === "rose");
  const appeared = failures.filter((failure) => failure.reason === "appeared");

  if (rose.length > 0) {
    lines.push("These rules fire more often than was recorded:");
    for (const failure of rose) {
      lines.push(
        `  ${failure.file}  ${failure.rule}: recorded ${failure.recorded}, ` +
          `now ${failure.current} (+${failure.current - failure.recorded})`,
      );
    }
  }

  if (appeared.length > 0) {
    if (rose.length > 0) lines.push("");
    lines.push("These findings are new here:");
    for (const failure of appeared) {
      lines.push(`  ${failure.file}  ${failure.rule}: ${failure.current}`);
    }
  }

  return lines.join("\n");
}

export function formatImprovements(improvements) {
  const lines = ["These recorded findings are gone:"];

  for (const improvement of improvements) {
    lines.push(
      `  ${improvement.file}  ${improvement.rule}: ` +
        `recorded ${improvement.recorded}, now ${improvement.current}`,
    );
  }

  return lines.join("\n");
}
