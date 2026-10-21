import { spawn } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ROOT, readRepoFile, sh } from './sh.js';

/** Like `sh`, but asynchronous, so two invocations can genuinely overlap. */
function shAsync(script, { cwd = ROOT } = {}) {
  return new Promise((resolve) => {
    const child = spawn('sh', ['-c', script], { cwd, env: process.env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (status) => resolve({ stdout, stderr, status }));
  });
}

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

/**
 * `make lint`'s own `tools/` line reaches `tools/eslint.config.mjs`'s
 * imports (`@eslint/js`, `globals`) only because its ad-hoc Compose mount
 * nests `tools/` directly under `/app`, inside `projects/marketing`'s own
 * `node_modules` ancestry (plan.md's Architecture). Reproduce that nesting
 * in a disposable sandbox — a real `tools/` directory holding a copy of
 * the config and a symlink per real `tools/` entry — rather than depending
 * on Docker Compose or the checkout's own sibling-directory layout, so the
 * config's real resolution and rule behaviour can be exercised directly.
 * A symlinked config file would resolve its imports against its link
 * target's own ancestry, not the sandbox's, which is why the config
 * itself is copied rather than linked.
 */
let sandboxes = [];
function nestedSandbox() {
  const app = mkdtempSync(path.join(tmpdir(), 'lint-tools-app-'));
  symlinkSync(path.join(ROOT, 'projects/marketing/node_modules'), path.join(app, 'node_modules'));
  const tools = path.join(app, 'tools');
  mkdirSync(tools);
  copyFileSync(path.join(ROOT, 'tools/eslint.config.mjs'), path.join(tools, 'eslint.config.mjs'));
  for (const entry of ['audit-gate', 'ci-gate', 'coverage-files-gate', 'deploy-gate', 'inline-script-hashes']) {
    symlinkSync(path.join(ROOT, 'tools', entry), path.join(tools, entry));
  }
  sandboxes.push(app);
  return app;
}

afterEach(() => {
  for (const app of sandboxes) rmSync(app, { recursive: true, force: true });
  sandboxes = [];
});

describe('tools/ lint coverage', () => {
  it('runs tools/eslint.config.mjs over tools/, nested as make lint nests it, and reports no problem', () => {
    const app = nestedSandbox();

    const { stdout, status } = sh('npx eslint --config tools/eslint.config.mjs tools', { cwd: app });

    expect(status, `lint:tools failed:\n${stdout}`).toBe(0);
    expect(stdout).not.toMatch(/\berror\b|\bwarning\b/i);
  });

  it('fails and names the file when a file under tools/ violates a rule the recommended set catches', () => {
    const app = nestedSandbox();
    writeFileSync(path.join(app, 'tools', 'probe.js'), 'const unused = 1;\n');

    const { stdout, status } = sh('npx eslint --config tools/eslint.config.mjs tools', { cwd: app });

    expect(status).not.toBe(0);
    expect(stdout).toMatch(/probe\.js/);
    expect(stdout).toMatch(/no-unused-vars/);
  });

  it("wires the tools/ lint invocation into the Makefile's lint target, alongside the app lint", () => {
    const body = recipe('lint');
    expect(body).toEqual([
      '\tdocker compose run --rm ${s} npm run lint -- $(FILES)',
      '\tdocker compose run --rm -v "$(CURDIR)/tools:/app/tools:ro" ${s} npm run lint:tools',
    ]);
  });

  it('applies rules suited to plain Node tooling, not the web-framework rules projects/marketing applies', () => {
    const config = readRepoFile('tools/eslint.config.mjs');
    expect(config).toMatch(/@eslint\/js/);
    expect(config).not.toMatch(/eslint-config-next/);
  });

  it('parses tools/inline-script-hashes/index.js as CommonJS, every other tools/ file as a module', () => {
    const config = readRepoFile('tools/eslint.config.mjs');
    expect(config).toMatch(/sourceType:\s*["']commonjs["']/);
    expect(config).toMatch(/inline-script-hashes\/index\.js/);
  });

  it('reports the same result when run again with nothing changed', () => {
    const app = nestedSandbox();

    const first = sh('npx eslint --config tools/eslint.config.mjs tools', { cwd: app });
    const second = sh('npx eslint --config tools/eslint.config.mjs tools', { cwd: app });

    expect(second).toEqual(first);
  });

  it('reports only its own result when two runs happen at the same time', async () => {
    const cleanApp = nestedSandbox();
    const dirtyApp = nestedSandbox();
    writeFileSync(path.join(dirtyApp, 'tools', 'probe.js'), 'const unused = 1;\n');

    const [clean, dirty] = await Promise.all([
      shAsync('npx eslint --config tools/eslint.config.mjs tools', { cwd: cleanApp }),
      shAsync('npx eslint --config tools/eslint.config.mjs tools', { cwd: dirtyApp }),
    ]);

    expect(clean.status, `expected the clean sandbox to stay clean:\n${clean.stdout}`).toBe(0);
    expect(dirty.status).not.toBe(0);
    expect(dirty.stdout).toMatch(/probe\.js/);
  });
});
