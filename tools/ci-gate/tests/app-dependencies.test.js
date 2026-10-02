import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ROOT, executableLines, readRepoFile, sh } from './sh.js';

const SCRIPT = path.join(ROOT, 'scripts/ensure-app-dependencies.sh');

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

describe('app dependency preparation', () => {
  let app;
  let bin;

  /** A stand-in `npm ci` that records its runs and leaves a lint tool behind, as the real one does. */
  function stubNpm(exitCode = 0) {
    writeFileSync(
      path.join(bin, 'npm'),
      `#!/bin/sh\necho run >> "${app}/npm-runs"\n` +
        (exitCode === 0
          ? `mkdir -p node_modules/.bin && : > node_modules/.bin/eslint && chmod +x node_modules/.bin/eslint\n`
          : '') +
        `exit ${exitCode}\n`,
    );
    chmod(path.join(bin, 'npm'));
  }

  function chmod(file) {
    chmodSync(file, 0o755);
  }

  function runs() {
    try {
      return readFileSync(path.join(app, 'npm-runs'), 'utf8').trim().split('\n').length;
    } catch {
      return 0;
    }
  }

  function prepare() {
    return sh(`sh "${SCRIPT}"`, { cwd: app, env: { PATH: `${bin}:${process.env.PATH}` } });
  }

  beforeEach(() => {
    const root = mkdtempSync(path.join(tmpdir(), 'app-deps-'));
    app = path.join(root, 'app');
    bin = path.join(root, 'bin');
    mkdirSync(app);
    mkdirSync(bin);
    writeFileSync(path.join(app, 'package.json'), '{"name":"app"}\n');
    writeFileSync(path.join(app, 'package-lock.json'), '{"lockfileVersion":3}\n');
    stubNpm();
  });

  afterEach(() => rmSync(path.dirname(app), { recursive: true, force: true }));

  it('installs when nothing has been installed and says so', () => {
    const result = prepare();

    expect(result.status).toBe(0);
    expect(runs()).toBe(1);
    expect(result.stdout).toMatch(/running npm ci/);
  });

  it('skips when the declared dependencies match the last installation and says so', () => {
    prepare();
    const result = prepare();

    expect(result.status).toBe(0);
    expect(runs()).toBe(1);
    expect(result.stdout).toMatch(/skipping npm ci/);
  });

  it('installs when the lock file changed since the last installation', () => {
    prepare();
    writeFileSync(path.join(app, 'package-lock.json'), '{"lockfileVersion":3,"packages":{"x":{}}}\n');
    const result = prepare();

    expect(result.status).toBe(0);
    expect(runs()).toBe(2);
    expect(result.stdout).toMatch(/running npm ci/);
  });

  it('installs when the manifest changed since the last installation', () => {
    prepare();
    writeFileSync(path.join(app, 'package.json'), '{"name":"app","devDependencies":{"x":"1"}}\n');
    prepare();

    expect(runs()).toBe(2);
  });

  it('installs over an installation of unknown provenance that already holds a lint tool', () => {
    mkdirSync(path.join(app, 'node_modules/.bin'), { recursive: true });
    writeFileSync(path.join(app, 'node_modules/.bin/eslint'), '#!/bin/sh\n');
    chmod(path.join(app, 'node_modules/.bin/eslint'));
    prepare();

    expect(runs()).toBe(1);
  });

  it('leaves no record of a failed installation, so the next run installs again', () => {
    stubNpm(1);
    const failed = prepare();
    stubNpm(0);
    const retried = prepare();

    expect(failed.status).not.toBe(0);
    expect(retried.status).toBe(0);
    expect(runs()).toBe(2);
  });

  it('is what the deps recipe runs inside the app container, instead of testing for a lint tool', () => {
    const body = executableLines(recipe('deps').join('\n')).join('\n');

    expect(body).toMatch(/docker compose run --rm -T \$\{s\} sh -s < scripts\/ensure-app-dependencies\.sh/);
    expect(body).not.toMatch(/node_modules\/\.bin\/eslint/);
  });
});
