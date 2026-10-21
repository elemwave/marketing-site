import { describe, expect, it } from 'vitest';
import { readRepoFile } from './sh.js';

/** The recipe lines (each still carrying its leading tab) of one Makefile target. */
function recipeLines(makefile, target) {
  const lines = makefile.split('\n');
  const start = lines.findIndex((line) => line.startsWith(`${target}:`));
  if (start === -1) return [];
  const recipe = [];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith('\t')) break;
    recipe.push(line.slice(1));
  }
  return recipe;
}

describe('shape-apply-drift', () => {
  it('wires the complexity gate\'s own apply-drift mode through an npm script', () => {
    const manifest = JSON.parse(readRepoFile('projects/marketing/package.json'));
    expect(manifest.scripts['shape:apply-drift']).toBe('node scripts/check-shape-lint.mjs --apply-drift');
  });

  it('runs both gates\' drift application from the make target', () => {
    const recipe = recipeLines(readRepoFile('Makefile'), 'shape-apply-drift');

    expect(recipe).toContain('./scripts/check-file-size-budgets.sh --apply-drift');
    expect(recipe.some((line) => /docker compose run --rm \$\{s\} npm run shape:apply-drift/.test(line))).toBe(true);
  });
});
