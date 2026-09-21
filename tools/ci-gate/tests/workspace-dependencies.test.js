import { describe, expect, it } from 'vitest';
import { readRepoFile } from './sh.js';

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
    const installs = body.flatMap((line, index) => (/npm ci/.test(line) ? [index] : []));
    const heal = body.findIndex((line) => /(?:--user|-u) 0:0/.test(line));

    expect(installs).toHaveLength(2);
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
