/**
 * The share of source files the test suite reaches at all.
 *
 * The agreed commitment level states two thresholds, a percentage of lines and
 * a percentage of files. Vitest enforces the first; the second has no metric of
 * its own, so it is computed here from the coverage summary.
 *
 * A file with no executable statements (a type-only module, a barrel) can never
 * be reached and is not counted either way: including them would make the
 * measurement depend on how the code is split up rather than on what is tested.
 */
export function evaluateFileCoverage(summary, thresholdPercent) {
  const files = Object.entries(summary)
    .filter(([path]) => path !== 'total')
    .map(([path, entry]) => ({
      path,
      total: entry?.statements?.total ?? 0,
      covered: entry?.statements?.covered ?? 0,
    }));
  const measurable = files.filter((file) => file.total > 0);
  const covered = measurable.filter((file) => file.covered > 0);
  const percent = measurable.length === 0 ? 0 : (covered.length / measurable.length) * 100;
  const uncovered = measurable
    .filter((file) => file.covered === 0)
    .map((file) => file.path)
    .sort();

  return {
    measurableFiles: measurable.length,
    coveredFiles: covered.length,
    percent,
    thresholdPercent,
    meetsThreshold: measurable.length > 0 && percent >= thresholdPercent,
    uncovered,
  };
}
