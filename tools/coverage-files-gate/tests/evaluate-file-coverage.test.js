import { describe, expect, it } from 'vitest';
import { evaluateFileCoverage } from '../evaluate-file-coverage.js';

function file(total, covered) {
  return { statements: { total, covered } };
}

describe('evaluateFileCoverage', () => {
  it('measures the share of reachable files the suite reaches', () => {
    const result = evaluateFileCoverage(
      {
        total: file(10, 5),
        'src/a.ts': file(4, 4),
        'src/b.ts': file(4, 1),
        'src/c.ts': file(4, 0),
      },
      50,
    );

    expect(result.measurableFiles).toBe(3);
    expect(result.coveredFiles).toBe(2);
    expect(result.percent).toBeCloseTo(66.7, 1);
    expect(result.meetsThreshold).toBe(true);
  });

  // A type-only module or a barrel can never be reached, so counting it would
  // make the measurement depend on how the code is split up.
  it('ignores files with nothing to execute', () => {
    const result = evaluateFileCoverage(
      { 'src/types.ts': file(0, 0), 'src/a.ts': file(2, 2) },
      100,
    );

    expect(result.measurableFiles).toBe(1);
    expect(result.meetsThreshold).toBe(true);
  });

  it('names the files the suite never reaches when it falls short', () => {
    const result = evaluateFileCoverage(
      { 'src/a.ts': file(4, 4), 'src/b.ts': file(4, 0), 'src/c.ts': file(4, 0) },
      80,
    );

    expect(result.meetsThreshold).toBe(false);
    expect(result.uncovered).toEqual(['src/b.ts', 'src/c.ts']);
  });

  it('does not pass a summary with nothing measurable in it', () => {
    expect(evaluateFileCoverage({}, 50).meetsThreshold).toBe(false);
  });
});
