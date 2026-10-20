import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ROOT, executableLines, readRepoFile, sh } from './sh.js';

/** The recipe lines of one Makefile target: the tab-indented lines after its rule line. */
function recipe(target) {
  const lines = readRepoFile('Makefile').split('\n');
  const start = lines.findIndex((line) => line.startsWith(`${target}:`));
  expect(start).toBeGreaterThanOrEqual(0);
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith('\t')) break;
    body.push(line);
  }
  return body;
}

describe('workspace dependencies', () => {
  // Compose mounts the app's node_modules volume inside the bind-mounted app
  // directory, so on a fresh checkout Docker creates projects/marketing/node_modules
  // on the host as root. An install into it as the invoking user then fails with
  // EACCES, which `npm ci --silent` reports as nothing but exit 243.
  it('recreates both dependency directories for the invoking user before installing into them', () => {
    const body = recipe('deps-workspace');
    const installs = body.flatMap((line, index) =>
      /ensure-app-dependencies\.sh(?! --check)/.test(line) ? [index] : [],
    );
    const heal = body.findIndex((line) => /(?:--user|-u) 0:0/.test(line));

    expect(installs).toHaveLength(1);
    expect(body[installs[0]]).toMatch(/projects\/marketing infra/);
    expect(heal).toBeGreaterThanOrEqual(0);
    expect(heal).toBeLessThan(Math.min(...installs));

    const healing = body.slice(heal, Math.min(...installs)).join('\n');
    expect(healing).toMatch(/\/repo\/projects\/marketing/);
    expect(healing).toMatch(/\/repo\/infra/);
    expect(healing).toMatch(/rm -rf "\$\$workspace\/node_modules"/);
    expect(healing).toMatch(/mkdir -p "\$\$workspace\/node_modules"/);
    expect(healing).toMatch(/chown \$\(HOST_UID\):\$\(HOST_GID\) "\$\$workspace"/);
    expect(healing).toMatch(/chown -R \$\(HOST_UID\):\$\(HOST_GID\)/);
  });
});

describe('workspace dependency guard', () => {
  const GUARD = path.join(ROOT, 'scripts/require-workspace-dependencies.sh');
  let repo;

  /** A workspace whose install record matches (or, when `record` is false, is missing) its declarations. */
  function workspace(name, { record = true } = {}) {
    const dir = path.join(repo, name);
    mkdirSync(path.join(dir, 'node_modules'), { recursive: true });
    writeFileSync(path.join(dir, 'package.json'), `{"name":"${name}"}\n`);
    writeFileSync(path.join(dir, 'package-lock.json'), '{"lockfileVersion":3}\n');
    if (record) {
      const digest = createHash('sha256')
        .update(readFileSync(path.join(dir, 'package.json')))
        .update(readFileSync(path.join(dir, 'package-lock.json')))
        .digest('hex');
      writeFileSync(path.join(dir, 'node_modules/.deps-fingerprint'), `${digest}\n`);
    }
    return dir;
  }

  function guard(...dirs) {
    return sh(`sh "${GUARD}" ${dirs.join(' ')}`, { cwd: repo });
  }

  beforeEach(() => {
    repo = mkdtempSync(path.join(tmpdir(), 'workspace-guard-'));
    mkdirSync(path.join(repo, 'scripts'));
    writeFileSync(
      path.join(repo, 'scripts/ensure-app-dependencies.sh'),
      readFileSync(path.join(ROOT, 'scripts/ensure-app-dependencies.sh')),
    );
  });

  afterEach(() => rmSync(repo, { recursive: true, force: true }));

  it('passes silently when every workspace matches its declared dependencies', () => {
    workspace('app');
    workspace('infra');
    const result = guard('app', 'infra');

    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  it('refuses a workspace whose lock file changed, naming it and the refresh command', () => {
    const dir = workspace('app');
    writeFileSync(path.join(dir, 'package-lock.json'), '{"lockfileVersion":3,"packages":{"x":{}}}\n');
    const result = guard('app');

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/app/);
    expect(result.stderr).toMatch(/make deps-workspace/);
  });

  it('refuses a workspace whose manifest changed', () => {
    const dir = workspace('app');
    writeFileSync(path.join(dir, 'package.json'), '{"name":"app","dependencies":{"x":"1"}}\n');

    expect(guard('app').status).toBe(1);
  });

  it('refuses a workspace with no record of what it was installed from', () => {
    workspace('app', { record: false });

    expect(guard('app').status).toBe(1);
  });

  it('refuses a workspace that has no installation at all', () => {
    const dir = workspace('app', { record: false });
    rmSync(path.join(dir, 'node_modules'), { recursive: true });

    expect(guard('app').status).toBe(1);
  });

  it('names only the stale workspace when another is current', () => {
    workspace('app');
    workspace('infra', { record: false });
    const result = guard('app', 'infra');

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/infra/);
    expect(result.stderr).not.toMatch(/\bapp\b/);
  });

  it('installs nothing', () => {
    workspace('app', { record: false });
    mkdirSync(path.join(repo, 'bin'));
    writeFileSync(path.join(repo, 'bin/npm'), `#!/bin/sh\ntouch "${repo}/npm-ran"\n`, { mode: 0o755 });
    sh(`PATH="${repo}/bin:$PATH" sh "${GUARD}" app`, { cwd: repo });

    expect(() => readFileSync(path.join(repo, 'npm-ran'))).toThrow();
  });
});

describe('Makefile wiring of the workspace guard', () => {
  /** The first executable recipe line of a target, with comment-only lines dropped. */
  const body = (target) => executableLines(recipe(target).join('\n')).join('\n');

  it.each([
    ['typecheck', 'infra'],
    ['test-app', 'projects/marketing'],
    ['test-infrastructure', 'infra'],
    ['audit', 'projects/marketing infra'],
  ])('%s refuses a stale install before it runs its check', (target, workspaces) => {
    const guard = `$(repo-run) 'sh scripts/require-workspace-dependencies.sh ${workspaces}'`;
    const lines = body(target).split('\n').map((line) => line.trim());
    const guardAt = lines.indexOf(guard);
    const readsInstall = lines.findIndex((line) => /\$\(repo-run\)/.test(line) && !line.includes('require-workspace'));

    expect(guardAt).toBeGreaterThanOrEqual(0);
    expect(guardAt).toBeLessThan(readsInstall);
  });

  it('deps-workspace installs through the fingerprint script and heals only a stale workspace', () => {
    const lines = body('deps-workspace');

    expect(lines).toMatch(/ensure-app-dependencies\.sh --check/);
    expect(lines).toMatch(/sh \/repo\/scripts\/ensure-app-dependencies\.sh/);
    expect(lines).not.toMatch(/npm ci/);
  });
});
