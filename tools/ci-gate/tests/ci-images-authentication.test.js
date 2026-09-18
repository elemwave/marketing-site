import { describe, expect, it } from 'vitest';
import { executableLines, readRepoFile } from './sh.js';

/** Each top-level job under `jobs:` as { name, text }, from its two-space-indented key. */
function jobBlocks(lines) {
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
  return jobs.map(({ name, lines: body }) => ({ name, text: body.join('\n') }));
}

describe('CI images authentication', () => {
  const lines = executableLines(readRepoFile('.github/workflows/ci.yml'));
  const text = lines.join('\n');
  const jobs = jobBlocks(lines);
  const byName = Object.fromEntries(jobs.map((job) => [job.name, job]));
  const authenticatedJobNames = ['lint', 'typecheck', 'shape', 'audit', 'test-infrastructure', 'app'];

  it('finds the jobs it is meant to check', () => {
    for (const name of [...authenticatedJobNames, 'select-runner', 'ci', 'dispatch-deploy']) {
      expect(byName[name], name).toBeDefined();
    }
  });

  it('declares the CI images role ARN', () => {
    expect(text).toMatch(/^ {2}CI_IMAGES_ROLE_ARN:\s*\S+/m);
  });

  it("widens the &read_only anchor's own definition to grant id-token: write", () => {
    const definition = /permissions: &read_only \{([^}]*)\}/.exec(text);
    expect(definition).not.toBeNull();
    expect(definition[1]).toMatch(/contents:\s*read/);
    expect(definition[1]).toMatch(/id-token:\s*write/);
  });

  it.each(authenticatedJobNames)('%s resolves to the widened anchor and authenticates before preparing images', (name) => {
    const job = byName[name];
    expect(job.text).toMatch(/[&*]read_only\b/);

    const credentialsIndex = job.text.search(/[&*]aws-credentials\b/);
    const loginIndex = job.text.search(/[&*]ecr-public-login\b/);
    const prepareIndex = job.text.indexOf('make ci-images');

    expect(credentialsIndex, `${name}: *aws-credentials`).toBeGreaterThan(-1);
    expect(loginIndex, `${name}: *ecr-public-login`).toBeGreaterThan(-1);
    expect(prepareIndex, `${name}: make ci-images`).toBeGreaterThan(-1);
    expect(credentialsIndex).toBeLessThan(loginIndex);
    expect(loginIndex).toBeLessThan(prepareIndex);
  });

  it.each(['select-runner', 'ci', 'dispatch-deploy'])('%s carries neither id-token: write nor *read_only', (name) => {
    const job = byName[name];
    expect(job.text).not.toMatch(/id-token:\s*write/);
    expect(job.text).not.toMatch(/\*read_only/);
  });
});
