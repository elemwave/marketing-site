import { spawn } from 'node:child_process';
import { copyFileSync, mkdirSync, readdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ROOT, readRepoFile } from './sh.js';

/**
 * Time allowance, in milliseconds, for a test that runs `eslint` over `tools/`,
 * once or twice. Alone a run takes about a second, but the full gate runs the
 * app and infrastructure suites side by side, and under that load these tests
 * have exceeded vitest's 5 s default. Finite, so a hung lint still fails the test.
 */
const LINT_TIMEOUT_MS = 90_000;

/**
 * Like `sh`, but asynchronous, so two invocations can genuinely overlap and a
 * per-test timeout can interrupt a wait. `timeout` is best-effort cleanup: it
 * signals the `sh` child so it is not left running when it fires.
 */
function shAsync(script, { cwd = ROOT, timeout } = {}) {
  return new Promise((resolve) => {
    const child = spawn('sh', ['-c', script], { cwd, env: process.env, timeout });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (status) => resolve({ stdout, stderr, status }));
  });
}

/** Run the tools/ lint from `cwd` as `make lint` does, bounded by the allowance. */
function lintTools(cwd) {
  return shAsync('npx eslint --config tools/eslint.config.mjs tools', { cwd, timeout: LINT_TIMEOUT_MS });
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
 * imports (`@eslint/js`, `globals`) only because it runs from `/`, where
 * the app service's `/tools` mount sits beside a second, read-only mount
 * of the app's `node_modules` volume at `/node_modules`. Neither mount
 * lies inside the `projects/marketing` bind mount, so Docker creates no
 * mountpoint on the host. Reproduce that layout — `tools/` beside
 * `node_modules` under one parent — in a disposable sandbox: a real
 * `tools/` directory holding a copy of the config and a symlink per real
 * `tools/` entry, rather than depending on Docker Compose or the
 * checkout's own sibling-directory layout, so the
 * config's real resolution and rule behaviour can be exercised directly.
 * A symlinked config file would resolve its imports against its link
 * target's own ancestry, not the sandbox's, which is why the config
 * itself is copied rather than linked.
 */
let sandboxes = [];
function nestedSandbox({ configOnly = false } = {}) {
  const app = mkdtempSync(path.join(tmpdir(), 'lint-tools-app-'));
  symlinkSync(path.join(ROOT, 'projects/marketing/node_modules'), path.join(app, 'node_modules'));
  const tools = path.join(app, 'tools');
  mkdirSync(tools);
  copyFileSync(path.join(ROOT, 'tools/eslint.config.mjs'), path.join(tools, 'eslint.config.mjs'));
  const entries = configOnly ? [] : ['audit-gate', 'ci-gate', 'coverage-files-gate', 'deploy-gate', 'inline-script-hashes'];
  for (const entry of entries) {
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
  it('runs tools/eslint.config.mjs over tools/, laid out as make lint lays it out, and reports no problem', async () => {
    const app = nestedSandbox();

    const { stdout, status } = await lintTools(app);

    expect(status, `lint:tools failed:\n${stdout}`).toBe(0);
    expect(stdout).not.toMatch(/\berror\b|\bwarning\b/i);
  }, LINT_TIMEOUT_MS);

  it('fails and names the file when a file under tools/ violates a rule the recommended set catches', async () => {
    const app = nestedSandbox();
    writeFileSync(path.join(app, 'tools', 'probe.js'), 'const unused = 1;\n');

    const { stdout, status } = await lintTools(app);

    expect(status).not.toBe(0);
    expect(stdout).toMatch(/probe\.js/);
    expect(stdout).toMatch(/no-unused-vars/);
  }, LINT_TIMEOUT_MS);

  it('exits clean when tools/ holds only its own config', async () => {
    const app = nestedSandbox({ configOnly: true });
    expect(readdirSync(path.join(app, 'tools'))).toEqual(['eslint.config.mjs']);

    const { stdout, status } = await lintTools(app);

    expect(status, `lint:tools failed:\n${stdout}`).toBe(0);
    expect(stdout).not.toMatch(/\berror\b|\bwarning\b/i);
  }, LINT_TIMEOUT_MS);

  it("wires the tools/ lint invocation into the Makefile's lint target, alongside the app lint", () => {
    const body = recipe('lint');
    expect(body).toEqual([
      '\tdocker compose run --rm ${s} npm run lint -- $(FILES)',
      '\tdocker compose run --rm -v app_node_modules:/node_modules:ro ${s} npm run lint:tools',
    ]);
  });

  it("mounts nothing for the tools/ pass inside projects/marketing's bind mount, so Docker creates no host mountpoint", () => {
    const toolsLine = recipe('lint')[1];
    expect(toolsLine).not.toMatch(/:\/app\//);
    expect(readRepoFile('projects/marketing/package.json')).toMatch(
      /"lint:tools": "cd \/ && eslint --config tools\/eslint\.config\.mjs tools"/,
    );
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

  it('reports the same result when run again with nothing changed', async () => {
    const app = nestedSandbox();

    const first = await lintTools(app);
    const second = await lintTools(app);

    expect(second).toEqual(first);
  }, LINT_TIMEOUT_MS);

  it('reports only its own result when two runs happen at the same time', async () => {
    const cleanApp = nestedSandbox();
    const dirtyApp = nestedSandbox();
    writeFileSync(path.join(dirtyApp, 'tools', 'probe.js'), 'const unused = 1;\n');

    const [clean, dirty] = await Promise.all([
      lintTools(cleanApp),
      lintTools(dirtyApp),
    ]);

    expect(clean.status, `expected the clean sandbox to stay clean:\n${clean.stdout}`).toBe(0);
    expect(dirty.status).not.toBe(0);
    expect(dirty.stdout).toMatch(/probe\.js/);
  }, LINT_TIMEOUT_MS);

  it('stops waiting for a lint run that never finishes once its timeout passes', async () => {
    const started = Date.now();

    const result = await shAsync('sleep 600', { timeout: 200 });

    expect(Date.now() - started).toBeLessThan(4000);
    expect(result.status).not.toBe(0);
  });

  it('gives every test that runs the tools/ lint one finite allowance past the 5 s default', () => {
    const pinTitle = 'gives every test that runs the tools/ lint one finite allowance past the 5 s default';
    const lintTitles = [
      'runs tools/eslint.config.mjs over tools/, laid out as make lint lays it out, and reports no problem',
      'fails and names the file when a file under tools/ violates a rule the recommended set catches',
      'exits clean when tools/ holds only its own config',
      'reports the same result when run again with nothing changed',
      'reports only its own result when two runs happen at the same time',
    ];
    const source = readRepoFile('tools/ci-gate/tests/lint-tools.test.js')
      .split('\n')
      .filter((line) => !/^\s*(\/\/|\/?\*)/.test(line))
      .join('\n');
    const bodies = new Map();
    const starts = [...source.matchAll(/\n {2}it\((['"])(.*?)\1/g)];
    starts.forEach((match, index) => {
      const end = index + 1 < starts.length ? starts[index + 1].index : undefined;
      bodies.set(match[2], source.slice(match.index, end));
    });

    const declared = /const LINT_TIMEOUT_MS = ([\d_]+);/.exec(source);
    expect(declared, 'LINT_TIMEOUT_MS must be a finite number of milliseconds').not.toBeNull();
    const allowance = Number(declared[1].replaceAll('_', ''));
    expect(allowance).toBeGreaterThanOrEqual(30_000);
    expect(allowance).toBeLessThanOrEqual(300_000);

    const helper = /function lintTools\([^)]*\) \{[\s\S]*?\n\}/.exec(source)?.[0];
    expect(helper, 'missing lintTools helper').toBeDefined();
    expect(helper).toMatch(/shAsync\(/);
    expect(helper).toMatch(/timeout: LINT_TIMEOUT_MS/);

    for (const title of lintTitles) {
      const body = bodies.get(title);
      expect(body, `missing test: ${title}`).toBeDefined();
      expect(body, `${title} must lint through lintTools`).toMatch(/lintTools\(/);
      // A synchronous `sh` blocks vitest's timer, so the allowance could not end a hung lint.
      expect(body, `${title} must not run a lint through the synchronous sh`).not.toMatch(/\bsh\(/);
      expect(body, `${title} must not run eslint directly`).not.toMatch(/npx eslint/);
      expect(body.trimEnd(), `${title} must use the allowance`).toMatch(/\}, LINT_TIMEOUT_MS\);(\n\}\);)?$/);
    }
    for (const [title, body] of bodies) {
      if (title === pinTitle || lintTitles.includes(title)) continue;
      expect(body, `${title} runs the lint without the allowance`).not.toMatch(/npx eslint|lintTools\(/);
    }
  });
});
