import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { sh } from '../../ci-gate/tests/sh.js';

const SCRIPT = 'scripts/verify-publishable-revision.sh';
const REVISION = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const REVISION_UPPER = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
const BRANCH = 'main';
const REPO = 'elemwave/marketing-site';

function checksList({ count = 1, status = 'completed', conclusion = 'success' } = {}) {
  if (count === 0) {
    return '{"total_count":0,"check_runs":[]}';
  }
  const conclusionJson = conclusion === null ? 'null' : `"${conclusion}"`;
  return `{"total_count":${count},"check_runs":[{"name":"CI","status":"${status}","conclusion":${conclusionJson}}]}`;
}

function runGate({
  revision = REVISION,
  branch = BRANCH,
  repo = REPO,
  ancestorExit = 0,
  fetchExit = 0,
  responses = [checksList()],
  waitSeconds = '0',
  extraEnv = {},
} = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'deploy-gate-'));
  const bin = path.join(dir, 'bin');
  mkdirSync(bin);
  const gitLog = path.join(dir, 'git.log');
  const ghLog = path.join(dir, 'gh.log');
  const gitLogJson = JSON.stringify(gitLog);
  const ghLogJson = JSON.stringify(ghLog);
  const nFileJson = JSON.stringify(path.join(dir, 'gh-n'));
  const responsesDirJson = JSON.stringify(dir);

  responses.forEach((body, index) => {
    writeFileSync(path.join(dir, `gh-${index + 1}.json`), body);
  });

  writeFileSync(
    path.join(bin, 'git'),
    `#!/bin/sh
{
  printf 'ARGS'
  for arg in "$@"; do
    printf '|%s' "$arg"
  done
  printf '\\n'
} >> ${gitLogJson}
for arg in "$@"; do
  if [ "$arg" = checkout ]; then
    printf 'checkout-forbidden\\n' >&2
    exit 99
  fi
done
case "$1" in
  fetch) exit ${fetchExit} ;;
  merge-base)
    if [ "$2" = --is-ancestor ]; then
      exit ${ancestorExit}
    fi
    exit 0
    ;;
  *) exit 0 ;;
esac
`,
    { mode: 0o755 },
  );

  writeFileSync(
    path.join(bin, 'gh'),
    `#!/bin/sh
{
  printf 'ARGS'
  for arg in "$@"; do
    printf '|%s' "$arg"
  done
  printf '\\n'
} >> ${ghLogJson}
nfile=${nFileJson}
n=$(cat "$nfile" 2>/dev/null || echo 0)
n=$((n + 1))
printf '%s\\n' "$n" > "$nfile"
file=${responsesDirJson}/gh-$n.json
if [ -f "$file" ]; then
  cat "$file"
  exit 0
fi
printf '%s\\n' '{"total_count":0,"check_runs":[]}'
exit 0
`,
    { mode: 0o755 },
  );

  const started = Date.now();
  const result = sh(`${JSON.stringify(SCRIPT)} ${JSON.stringify(revision)} ${JSON.stringify(branch)} ${JSON.stringify(repo)}`, {
    env: {
      PATH: `${bin}:${process.env.PATH}`,
      GH_TOKEN: extraEnv.GH_TOKEN === undefined ? 'test-token' : extraEnv.GH_TOKEN,
      PUBLISHABLE_REVISION_CHECK_WAIT_SECONDS: waitSeconds,
      ...extraEnv,
    },
  });
  const gitInvocations = (() => {
    try {
      return readFileSync(gitLog, 'utf8');
    } catch {
      return '';
    }
  })();
  const ghInvocations = (() => {
    try {
      return readFileSync(ghLog, 'utf8');
    } catch {
      return '';
    }
  })();

  return {
    ...result,
    output: `${result.stdout}${result.stderr}`,
    gitInvocations,
    ghInvocations,
    elapsed: Date.now() - started,
  };
}

describe('verify-publishable-revision', () => {
  it('allows a 40-character hexadecimal revision that is on the branch with a successful latest CI check', () => {
    const run = runGate();

    expect(run.status).toBe(0);
    expect(run.output).not.toMatch(/::error /);
    expect(run.gitInvocations).toMatch(/\|fetch\|/);
    expect(run.gitInvocations).toMatch(/\|merge-base\|--is-ancestor\|/);
    expect(run.gitInvocations).not.toMatch(/\|checkout(\||$)/);
    expect(run.ghInvocations).toMatch(/check_name=CI/);
    expect(run.ghInvocations).toMatch(/filter=latest/);
  });

  it('allows an uppercase 40-character hexadecimal revision', () => {
    const run = runGate({ revision: REVISION_UPPER });

    expect(run.status).toBe(0);
    expect(run.gitInvocations).not.toMatch(/\|checkout(\||$)/);
  });

  it('refuses a non-hexadecimal input before any git fetch', () => {
    const run = runGate({ revision: 'malicious-branch' });

    expect(run.status).not.toBe(0);
    expect(run.output).toMatch(/::error title=/);
    expect(run.gitInvocations).toBe('');
    expect(run.ghInvocations).toBe('');
  });

  it('refuses when merge-base --is-ancestor fails, without treating that as a passed check', () => {
    const run = runGate({ ancestorExit: 1 });

    expect(run.status).not.toBe(0);
    expect(run.output).toMatch(/::error title=/);
    expect(run.output).not.toMatch(/required check/i);
    expect(run.gitInvocations).toMatch(/\|merge-base\|--is-ancestor\|/);
    expect(run.gitInvocations).not.toMatch(/\|checkout(\||$)/);
    expect(run.ghInvocations).toBe('');
  });

  it('refuses when gh returns no CI run, including for the branch tip', () => {
    const run = runGate({ responses: [checksList({ count: 0 })] });

    expect(run.status).not.toBe(0);
    expect(run.output).toMatch(/::error title=/);
    expect(run.gitInvocations).not.toMatch(/\|checkout(\||$)/);
  });

  it('refuses a failed CI conclusion', () => {
    const run = runGate({ responses: [checksList({ conclusion: 'failure' })] });

    expect(run.status).not.toBe(0);
    expect(run.output).toMatch(/::error title=/);
  });

  it('refuses a cancelled CI conclusion', () => {
    const run = runGate({ responses: [checksList({ conclusion: 'cancelled' })] });

    expect(run.status).not.toBe(0);
    expect(run.output).toMatch(/::error title=/);
  });

  it('refuses a non-completed CI status', () => {
    const run = runGate({
      responses: [checksList({ status: 'in_progress', conclusion: null })],
    });

    expect(run.status).not.toBe(0);
    expect(run.output).toMatch(/::error title=/);
  });

  it('refuses when an older CI success is followed by a later failed latest run', () => {
    const run = runGate({ responses: [checksList({ conclusion: 'failure' })] });

    expect(run.status).not.toBe(0);
    expect(run.output).toMatch(/::error title=/);
    expect(run.ghInvocations).toMatch(/filter=latest/);
  });

  it('allows the omitted-revision case represented as the branch tip with a successful CI run', () => {
    const run = runGate({ revision: REVISION, branch: BRANCH });

    expect(run.status).toBe(0);
    expect(run.gitInvocations).toMatch(/\|merge-base\|--is-ancestor\|aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\|origin\/main/);
    expect(run.gitInvocations).not.toMatch(/\|checkout(\||$)/);
  });

  it('allows when the first Checks read has no CI run and the second returns completed success', () => {
    const run = runGate({
      waitSeconds: '4',
      responses: [checksList({ count: 0 }), checksList({ conclusion: 'success' })],
    });

    expect(run.status).toBe(0);
    expect(run.elapsed).toBeGreaterThanOrEqual(2000);
    expect(run.ghInvocations.trim().split('\n')).toHaveLength(2);
  });
});
