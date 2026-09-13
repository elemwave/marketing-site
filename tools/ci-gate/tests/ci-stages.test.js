import { describe, expect, it } from 'vitest';
import { makefileTargets, sh } from './sh.js';

const LIB = '. scripts/lib/ci-stages.sh';

// Stated literally, not derived from the declaration under test, so a change to
// the gate's stages has to change this list too.
const STAGES = [
  ['Tool images', 'prepare', 'ci-images'],
  ['App dependencies', 'prepare', 'deps'],
  ['Workspace dependencies', 'prepare', 'deps-workspace'],
  ['Lint', 'cheap', 'lint'],
  ['Type-check', 'cheap', 'typecheck'],
  ['File size', 'cheap', 'shape-size'],
  ['Duplication', 'cheap', 'shape-duplication'],
  ['Complexity', 'cheap', 'shape-complexity'],
  ['Audit', 'cheap', 'audit'],
  ['App tests', 'verify', 'test-app'],
  ['Static export', 'verify', 'app-build'],
  ['Infrastructure tests', 'verify', 'test-infrastructure'],
  ['Browser tests', 'verify', 'e2e'],
  ['Performance budget', 'verify', 'performance-budget'],
];

function run(snippet) {
  return sh(`${LIB}; ${snippet}`);
}

function lines(output) {
  return output.split('\n').filter(Boolean);
}

describe('the gate stage declaration', () => {
  it('defines functions and runs nothing when sourced', () => {
    const { stdout, stderr, status } = run('echo sourced');
    expect(status).toBe(0);
    expect(stdout).toBe('sourced\n');
    expect(stderr).toBe('');
  });

  it('lists the stages in gate order', () => {
    const { stdout, status } = run('ci_stages_list');
    expect(status).toBe(0);
    expect(lines(stdout)).toEqual(STAGES.map(([name]) => name));
    expect(new Set(lines(stdout)).size).toBe(STAGES.length);
  });

  it('holds every tier in order: prepare, then cheap, then verify', () => {
    const tiers = lines(run('ci_stages_list | while IFS= read -r s; do ci_stage_tier "$s"; done').stdout);
    expect(tiers).toEqual(STAGES.map(([, tier]) => tier));
    expect(tiers.join(' ')).toMatch(/^(prepare )+(cheap )+(verify ?)+$/);
    for (const tier of ['prepare', 'cheap', 'verify']) {
      expect(lines(run(`ci_stages_in_tier ${tier}`).stdout)).toEqual(
        STAGES.filter(([, t]) => t === tier).map(([name]) => name),
      );
    }
  });

  it('maps every stage to its make target', () => {
    for (const [name, , target] of STAGES) {
      expect(run(`ci_stage_target '${name}'`).stdout).toBe(`${target}\n`);
    }
  });

  it('refuses an unknown stage name with status 2', () => {
    const { stdout, status } = run("ci_stage_target 'Lint the app'");
    expect(status).toBe(2);
    expect(stdout).toBe('');
  });

  it('runs the browser tests and the performance budget only after the static export', () => {
    expect(run("ci_stage_after 'Browser tests'").stdout).toBe('Static export\n');
    expect(run("ci_stage_after 'Performance budget'").stdout).toBe('Static export\n');
    expect(run("ci_stage_after 'Lint'").stdout).toBe('');
  });

  it('only lets a stage depend on an earlier stage of its own tier', () => {
    const names = STAGES.map(([name]) => name);
    const dependants = names.filter((name) => run(`ci_stage_after '${name}'`).stdout !== '');
    expect(dependants).toEqual(['Browser tests', 'Performance budget']);

    for (const name of dependants) {
      const after = run(`ci_stage_after '${name}'`).stdout.trim();
      expect(names.indexOf(after)).toBeGreaterThanOrEqual(0);
      expect(names.indexOf(after)).toBeLessThan(names.indexOf(name));
      expect(run(`ci_stage_tier '${after}'`).stdout).toBe(run(`ci_stage_tier '${name}'`).stdout);
    }
  });

  it('keeps stages that write the same app artefacts in one lane', () => {
    expect(run("ci_stage_lane 'App tests'").stdout).toBe(run("ci_stage_lane 'Static export'").stdout);
    expect(run("ci_stage_lane 'App tests'").stdout).not.toBe(run("ci_stage_lane 'Infrastructure tests'").stdout);
  });

  it('points every stage at a target the Makefile declares', () => {
    const targets = makefileTargets();
    expect(targets.length).toBeGreaterThan(10);
    for (const [, , target] of STAGES) {
      expect(targets).toContain(target);
    }
  });
});
