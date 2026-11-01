import { readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROOT, executableLines, readRepoFile, sh } from './sh.js';

/** The one GitHub-hosted runner label CI uses; the next OS bump is this and the workflows. */
export const HOSTED_RUNNER_LABEL = 'ubuntu-24.04';

const ACTION = '.github/actions/select-runner/action.yml';

function ciFiles() {
  const workflows = readdirSync(path.join(ROOT, '.github/workflows'))
    .filter((file) => /\.ya?ml$/.test(file))
    .map((file) => `.github/workflows/${file}`);
  const actions = readdirSync(path.join(ROOT, '.github/actions')).map(
    (dir) => `.github/actions/${dir}/action.yml`,
  );
  return [...workflows, ...actions];
}

const SELF_HOSTED = new Set(['self', 'self-hosted']);

/** The labels one YAML scalar or flow list names, without quotes or a trailing comment. */
function scalarLabels(value) {
  const bare = value.replace(/\s+#.*$/, '').trim();
  if (bare.includes('${{')) {
    return [...bare.matchAll(/'([^']+)'|"([^"]+)"/g)].map((quoted) => quoted[1] ?? quoted[2]);
  }
  return bare
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((label) => label.trim().replace(/^(['"])(.*)\1$/, '$2'))
    .filter((label) => label !== '' && !label.startsWith('*'));
}

/**
 * Every hosted label a `runs-on` names: plain, quoted, commented, as a flow or
 * block list, as a `labels:` mapping, or as the select-runner fallback. A list
 * that names `self-hosted` targets the self-hosted fleet and names no hosted label.
 */
export function hostedLabels(text) {
  const lines = executableLines(text);
  const labels = [];
  lines.forEach((line, index) => {
    const runsOn = /^(\s*)runs-on:\s*(?:&\w+\s*)?(.*)$/.exec(line);
    if (!runsOn) return;
    let named = scalarLabels(runsOn[2]);
    if (named.length === 0) {
      const block = [];
      for (const next of lines.slice(index + 1)) {
        if (next.trim() === '') continue;
        if (next.search(/\S/) <= runsOn[1].length) break;
        block.push(next.trim().replace(/^-\s*/, '').replace(/^labels:\s*/, ''));
      }
      named = block.flatMap(scalarLabels);
    }
    const isExpression = runsOn[2].includes('${{');
    if (!isExpression && named.some((label) => SELF_HOSTED.has(label))) return;
    labels.push(...named.filter((label) => !SELF_HOSTED.has(label)));
  });
  return labels;
}

describe('CI names one pinned GitHub-hosted runner label', () => {
  it.each(ciFiles())('%s never names ubuntu-latest', (file) => {
    expect(executableLines(readRepoFile(file)).join('\n')).not.toMatch(/ubuntu-latest/);
  });

  it.each(ciFiles())('%s names only the pinned label for hosted runners', (file) => {
    for (const label of hostedLabels(readRepoFile(file))) {
      expect(label).toBe(HOSTED_RUNNER_LABEL);
    }
  });

  it('finds the hosted labels of the workflows, so the checks above are not vacuous', () => {
    const ci = hostedLabels(readRepoFile('.github/workflows/ci.yml'));
    expect(ci.length).toBeGreaterThanOrEqual(4);
    expect(hostedLabels(readRepoFile('.github/workflows/deploy.yml'))).toEqual([
      HOSTED_RUNNER_LABEL,
    ]);
  });

  it('refuses a workflow that names ubuntu-latest', () => {
    expect(hostedLabels('    runs-on: ubuntu-latest\n')).toEqual(['ubuntu-latest']);
    expect(
      hostedLabels("    runs-on: &runner ${{ x == 'self' && 'self-hosted' || 'ubuntu-22.04' }}\n"),
    ).toEqual(['ubuntu-22.04']);
  });

  it.each([
    ['a trailing comment', '    runs-on: ubuntu-22.04 # pinned\n'],
    ['double quotes', '    runs-on: "ubuntu-22.04"\n'],
    ['a flow list', '    runs-on: [ubuntu-22.04]\n'],
    ['a block list', '    runs-on:\n      - ubuntu-22.04\n    steps:\n      - run: true\n'],
    ['a labels mapping', '    runs-on:\n      labels: ubuntu-22.04\n'],
    [
      'a double-quoted fallback',
      '    runs-on: ${{ x == "self" && "self-hosted" || "ubuntu-22.04" }}\n',
    ],
  ])('sees a hosted label written with %s', (_, text) => {
    expect(hostedLabels(text)).toEqual(['ubuntu-22.04']);
  });

  it('skips the self-hosted label and a reused anchor', () => {
    expect(hostedLabels('    runs-on: [self-hosted, linux]\n')).toEqual([]);
    expect(hostedLabels('    runs-on: *runner\n')).toEqual([]);
  });
});

describe('select-runner resolves the requested fleet', () => {
  const script = (() => {
    const text = readRepoFile(ACTION);
    const start = text.indexOf('      run: |\n') + '      run: |\n'.length;
    return text
      .slice(start)
      .split('\n')
      .map((line) => line.replace(/^ {8}/, ''))
      .join('\n');
  })();

  const resolve = (target) => {
    const output = path.join(process.env.TMPDIR ?? '/tmp', `select-runner-${process.pid}-${Math.random()}`);
    const quoted = script.replace(/'/g, "'\\''");
    return sh(
      `GITHUB_OUTPUT=${output} ACTIONS_RUNNER_TARGET="$T" sh -c '${quoted}'; s=$?; cat ${output} 2>/dev/null; rm -f ${output}; exit $s`,
      { env: { T: target } },
    );
  };

  it('selects GitHub-hosted runners for github-hosted', () => {
    const result = resolve('github-hosted');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('target=github');
  });

  it('selects the self-hosted fleet for self-hosted', () => {
    const result = resolve('self-hosted');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('target=self');
  });

  it('fails, telling the reader to set the repository variable, when none is requested', () => {
    const result = resolve('');
    expect(result.status).not.toBe(0);
    expect(result.stdout).not.toContain('target=');
    expect(result.stdout).toMatch(/ACTIONS_RUNNER_TARGET/);
    expect(result.stdout).toMatch(/repository variable/i);
  });

  it('fails on any other value', () => {
    const result = resolve('ubuntu-latest');
    expect(result.status).not.toBe(0);
    expect(result.stdout).not.toContain('target=');
  });
});
