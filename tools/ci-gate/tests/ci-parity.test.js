import { describe, expect, it } from 'vitest';
import { executableLines, readRepoFile, sh } from './sh.js';

/** The declared stages as { name, tier, target }, read from the gate's own declaration. */
function declaredStages() {
  const { stdout, status } = sh(
    '. scripts/lib/ci-stages.sh; ci_stages_list | while IFS= read -r s; do printf "%s|%s|%s\\n" "$s" "$(ci_stage_tier "$s")" "$(ci_stage_target "$s")"; done',
  );
  expect(status).toBe(0);
  return stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [name, tier, target] = line.split('|');
      return { name, tier, target };
    });
}

/** The workflow's jobs as { name, needs, targets, text }, from its two-space-indented job keys. */
function workflowJobs(lines) {
  const jobs = [];
  let inJobs = false;
  for (const line of lines) {
    if (/^jobs:\s*$/.test(line)) {
      inJobs = true;
      continue;
    }
    if (!inJobs) continue;
    const key = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (key) {
      jobs.push({ name: key[1], lines: [] });
      continue;
    }
    jobs.at(-1)?.lines.push(line);
  }
  return jobs.map(({ name, lines: body }) => {
    const text = body.join('\n');
    const needsLine = /^\s{4}needs:\s*\[([^\]]*)\]/m.exec(text);
    const needs = needsLine ? needsLine[1].split(',').map((need) => need.trim()).filter(Boolean) : [];
    const targets = [...text.matchAll(/\bmake\s+([^\n#;&|]+)/g)].flatMap((match) =>
      match[1]
        .trim()
        .split(/\s+/)
        .filter((word) => /^[a-z0-9][a-z0-9-]*$/.test(word)),
    );
    return { name, needs, targets, text };
  });
}

describe('CI parity with the local gate', () => {
  const lines = executableLines(readRepoFile('.github/workflows/ci.yml'));
  const stages = declaredStages();
  const jobs = workflowJobs(lines);
  const checkJobs = jobs.filter((job) => job.targets.length > 0);
  const targetsIn = (tier) => stages.filter((stage) => stage.tier === tier).map((stage) => stage.target);

  it('reads the declaration and the workflow it is meant to compare', () => {
    expect(stages).toHaveLength(14);
    expect(jobs.length).toBeGreaterThanOrEqual(4);
    expect(checkJobs.length).toBeGreaterThanOrEqual(4);
  });

  it('runs for proposed changes, the integration branch and the default branch', () => {
    const text = lines.join('\n');
    expect(text).toMatch(/^on:\n {2}pull_request:\n/m);
    const branches = /^ {2}push:\n {4}branches: \[([^\]]+)\]/m.exec(text);
    expect(branches).not.toBeNull();
    const names = branches[1].split(',').map((name) => name.trim());
    expect(names).toContain('staging');
    expect(names).toContain('main');
  });

  it('calls exactly the make targets the gate declares', () => {
    const called = new Set(checkJobs.flatMap((job) => job.targets));
    expect([...called].sort()).toEqual(stages.map((stage) => stage.target).sort());
  });

  it('prepares every check job the way the gate prepares', () => {
    for (const job of checkJobs) {
      for (const target of targetsIn('prepare')) {
        expect({ job: job.name, targets: job.targets }).toEqual({
          job: job.name,
          targets: expect.arrayContaining([target]),
        });
      }
    }
  });

  it('runs no check outside make', () => {
    const text = lines.join('\n');
    expect(text).not.toMatch(/\bnpm (?:ci|run|test|install)\b/);
    expect(text).not.toMatch(/\bnpx\b/);
    expect(text).not.toMatch(/actions\/setup-node/);
  });

  it('starts the verify tier only after every cheap job has passed', () => {
    const cheap = targetsIn('cheap');
    const verify = targetsIn('verify');
    const cheapJobs = checkJobs.filter((job) => job.targets.some((target) => cheap.includes(target)));
    const verifyJobs = checkJobs.filter((job) => job.targets.some((target) => verify.includes(target)));

    expect(cheapJobs.length).toBeGreaterThanOrEqual(1);
    expect(verifyJobs.length).toBeGreaterThanOrEqual(1);
    for (const job of verifyJobs) {
      expect(job.targets.some((target) => cheap.includes(target))).toBe(false);
      for (const cheapJob of cheapJobs) {
        expect({ job: job.name, needs: job.needs }).toEqual({
          job: job.name,
          needs: expect.arrayContaining([cheapJob.name]),
        });
      }
    }
  });

  it('builds the static export before anything that reads it, in the same job', () => {
    const readers = checkJobs.filter((job) => job.targets.includes('e2e') || job.targets.includes('performance-budget'));
    expect(readers.length).toBeGreaterThanOrEqual(1);
    for (const job of readers) {
      const build = job.targets.indexOf('app-build');
      expect(build).toBeGreaterThanOrEqual(0);
      for (const reader of ['e2e', 'performance-budget']) {
        if (job.targets.includes(reader)) {
          expect(job.targets.indexOf(reader)).toBeGreaterThan(build);
        }
      }
    }
  });

  it('holds the aggregate result to every check job', () => {
    const aggregate = jobs.find((job) => job.name === 'ci');
    expect(aggregate).toBeDefined();
    for (const job of checkJobs) {
      expect(aggregate.needs).toContain(job.name);
    }
  });
});
