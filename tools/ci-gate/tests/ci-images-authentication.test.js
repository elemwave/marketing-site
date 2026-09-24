import { describe, expect, it } from 'vitest';
import { executableLines, readRepoFile } from './sh.js';

/** The workflow's jobs as { name, text }, from its two-space-indented job keys. */
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
  return jobs.map(({ name, lines: body }) => ({ name, text: body.join('\n') }));
}

const AUTHENTICATED_JOBS = ['lint', 'typecheck', 'shape', 'audit', 'test-infrastructure', 'app'];
const UNAUTHENTICATED_JOBS = ['select-runner', 'ci', 'dispatch-deploy'];

describe('CI image pulls authenticate to Amazon ECR Public', () => {
  const text = readRepoFile('.github/workflows/ci.yml');
  const lines = executableLines(text);
  const jobs = workflowJobs(lines);
  const byName = Object.fromEntries(jobs.map((job) => [job.name, job]));

  it('declares the CI images role', () => {
    expect(text).toMatch(/CI_IMAGES_ROLE_ARN:\s*\S+/);
  });

  it('widens the shared read_only anchor to also grant id-token: write', () => {
    expect(byName.lint.text).toMatch(/permissions:\s*&read_only/);
    expect(byName.lint.text).toMatch(/contents:\s*read/);
    expect(byName.lint.text).toMatch(/id-token:\s*write/);
  });

  it.each(AUTHENTICATED_JOBS)('authenticates before pulling images in the %s job', (name) => {
    const job = byName[name];
    expect(job).toBeDefined();
    expect(job.text).toMatch(/[&*]read_only/);

    const credentialsIndex = job.text.search(/[&*]aws-credentials/);
    const loginIndex = job.text.search(/[&*]ecr-public-login/);
    const imagesIndex = job.text.indexOf('make ci-images');

    expect(credentialsIndex).toBeGreaterThanOrEqual(0);
    expect(loginIndex).toBeGreaterThan(credentialsIndex);
    expect(imagesIndex).toBeGreaterThan(loginIndex);
  });

  it.each(UNAUTHENTICATED_JOBS)('leaves the %s job without the widened permissions', (name) => {
    const job = byName[name];
    expect(job).toBeDefined();
    expect(job.text).not.toMatch(/id-token: write/);
    expect(job.text).not.toMatch(/\*read_only/);
  });
});
