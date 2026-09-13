import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { makefileTargets, readRepoFile, sh } from './sh.js';

function listedTargets(output) {
  return output
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split(/\s+/)[0]);
}

describe('make help', () => {
  it('lists every documented rule, whatever characters its name holds, and nothing else', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'make-help-'));
    const fixture = path.join(dir, 'Makefile');
    writeFileSync(
      fixture,
      [
        '.PHONY: e2e',
        's = app',
        'foo := bar ## Not a target',
        'e2e: ## Browser',
        'a-b: x ## Dashed',
        'c_d: ## Underscored',
        'hidden:',
        '',
      ].join('\n'),
    );

    const { stdout, status } = sh(`sh scripts/make-help.sh '${fixture}'`);

    expect(status).toBe(0);
    expect(listedTargets(stdout)).toEqual(['e2e', 'a-b', 'c_d']);
    expect(stdout).toMatch(/^e2e\s+Browser$/m);
    expect(stdout).toMatch(/^a-b\s+Dashed$/m);
    expect(stdout).toMatch(/^c_d\s+Underscored$/m);
  });

  it('lists every documented target of the real Makefile, including e2e', () => {
    const documented = makefileTargets().filter((target) =>
      new RegExp(`^${target.replace(/[.-]/g, '\\$&')}:.*## `, 'm').test(readRepoFile('Makefile')),
    );
    expect(documented.length).toBeGreaterThan(10);

    const { stdout, status } = sh('sh scripts/make-help.sh Makefile');

    expect(status).toBe(0);
    expect(listedTargets(stdout)).toEqual(documented);
    expect(listedTargets(stdout)).toContain('e2e');
  });

  it('is what the help target runs', () => {
    expect(readRepoFile('Makefile')).toMatch(/^help: ## .*\n\t@sh scripts\/make-help\.sh \$\(MAKEFILE_LIST\)$/m);
  });
});
