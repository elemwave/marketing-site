import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import { ROOT } from './sh.js';

/**
 * Drives the duplication reporter through its command line, against a throwaway
 * tree and a hand-written jscpd report, so attribution is observed without
 * running jscpd. The reporter exits the process when loaded, so it cannot be
 * imported.
 */
const REPORTER = path.join(ROOT, 'scripts/lib/duplication-report.mjs');
const AREAS = ['infra/test', 'infra', 'projects/marketing', 'projects/marketing/test'];

const roots = [];

afterEach(() => {
  while (roots.length > 0) rmSync(roots.pop(), { recursive: true, force: true });
});

function tree(files) {
  const root = mkdtempSync(path.join(tmpdir(), 'duplication-report-'));
  roots.push(root);
  for (const [rel, lineCount] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), 'const x = 1;\n'.repeat(lineCount));
  }
  return root;
}

function run(root, clones, { areas = AREAS } = {}) {
  const report = path.join(root, 'report.json');
  const budgets = path.join(root, 'budgets.json');
  const side = (rel) => ({ name: path.join(root, rel) });
  writeFileSync(
    report,
    JSON.stringify({
      duplicates: clones.map(([first, second, lines]) => ({
        lines,
        firstFile: side(first),
        secondFile: side(second),
      })),
    }),
  );
  writeFileSync(
    budgets,
    JSON.stringify(Object.fromEntries(areas.map((area) => [area, { thresholdPercentage: 50 }]))),
  );
  const result = spawnSync('node', [REPORTER, '--root', root, '--report', report, '--budgets', budgets, '--mode', 'report'], {
    encoding: 'utf8',
  });
  return { status: result.status, out: result.stdout, err: result.stderr };
}

function row(out, area) {
  return out.split('\n').find((line) => line.trim().startsWith(`${area} `));
}

describe('marketing test files', () => {
  const files = {
    'projects/marketing/lib/a.ts': 100,
    'projects/marketing/e2e/a.spec.ts': 40,
    'projects/marketing/e2e/b.spec.ts': 40,
    'projects/marketing/lib/c.test.ts': 20,
  };

  it('budgets a clone inside one spec file instead of failing as unmeasured', () => {
    const result = run(tree(files), [['projects/marketing/e2e/a.spec.ts', 'projects/marketing/e2e/a.spec.ts', 11]]);
    expect(result.err).not.toContain('belong to no measured area');
    expect(result.status).toBe(0);
    expect(row(result.out, 'projects/marketing/test')).toContain('11 of 100 lines');
  });

  it('charges a clone between two spec files to the test area once', () => {
    const result = run(tree(files), [['projects/marketing/e2e/a.spec.ts', 'projects/marketing/e2e/b.spec.ts', 9]]);
    expect(result.status).toBe(0);
    expect(row(result.out, 'projects/marketing/test')).toContain('9 of 100 lines');
    expect(row(result.out, 'projects/marketing ')).toContain('0 of 100 lines');
  });

  it('charges a spec-to-source clone to both areas', () => {
    const result = run(tree(files), [['projects/marketing/e2e/a.spec.ts', 'projects/marketing/lib/a.ts', 8]]);
    expect(row(result.out, 'projects/marketing/test')).toContain('8 of 100 lines');
    expect(row(result.out, 'projects/marketing ')).toContain('8 of 100 lines');
  });

  it('counts only test and spec files in the test area total', () => {
    const result = run(tree(files), []);
    expect(row(result.out, 'projects/marketing/test')).toContain('0 of 100 lines');
  });
});

describe('unmeasured files and missing baselines', () => {
  it('still refuses a file that belongs to no area', () => {
    const result = run(tree({ 'other/x.ts': 20 }), [['other/x.ts', 'other/x.ts', 9]]);
    expect(result.status).toBe(2);
    expect(result.err).toContain('belong to no measured area');
  });

  it('refuses a baseline without the marketing test area', () => {
    const result = run(tree({ 'projects/marketing/a.ts': 10 }), [], {
      areas: AREAS.filter((area) => area !== 'projects/marketing/test'),
    });
    expect(result.status).toBe(2);
    expect(result.err).toContain('projects/marketing/test');
  });
});
