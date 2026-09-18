import { describe, expect, it } from 'vitest';
import { executableLines, readRepoFile } from './sh.js';

/** Each `- name: <step>` block in a workflow file as { name, text }. */
function stepBlocks(lines) {
  const steps = [];
  for (const line of lines) {
    const name = /^\s*-\s*(?:&\S+\s+)?name:\s*(.+?)\s*$/.exec(line);
    if (name) {
      steps.push({ name: name[1], lines: [] });
      continue;
    }
    steps.at(-1)?.lines.push(line);
  }
  return steps.map(({ name, lines: body }) => ({ name, text: body.join('\n') }));
}

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

const PUBLISH_ONLY_STEPS = [
  'Set up Node.js',
  'Install site dependencies',
  'Build the static site',
  'Stamp the deployed revision',
  'Install infrastructure dependencies',
  'Assume the deployment role',
  'Download the page documents currently published',
  'Bootstrap the CDK environments',
  'Deploy the site infrastructure',
  'Read the stack outputs',
  'Upload fingerprinted assets',
  'Upload public images',
  'Upload page documents',
  'Refresh the CloudFront cache',
  'Install the live-publication browser',
  'Observe the live environment',
  'Report the published site',
];

const STAGING_ONLY_STEPS = ['Verify required SSM parameters', 'Read the staging credentials from Parameter Store'];

describe('record-only Deploy dispatch', () => {
  const deployLines = executableLines(readRepoFile('.github/workflows/deploy.yml'));
  const deployText = deployLines.join('\n');
  const deploySteps = stepBlocks(deployLines);
  const byStepName = Object.fromEntries(deploySteps.map((step) => [step.name, step]));

  const ciLines = executableLines(readRepoFile('.github/workflows/ci.yml'));
  const ciJobs = jobBlocks(ciLines);
  const byJobName = Object.fromEntries(ciJobs.map((job) => [job.name, job]));

  it('finds the steps and jobs it is meant to check', () => {
    expect(byStepName['Check out the repository']).toBeDefined();
    for (const name of [...PUBLISH_ONLY_STEPS, ...STAGING_ONLY_STEPS]) {
      expect(byStepName[name], name).toBeDefined();
    }
    expect(byJobName['record-unpublished']).toBeDefined();
    expect(byJobName['dispatch-deploy']).toBeDefined();
  });

  it('declares the mode choice input, defaulting to publish', () => {
    const inputBlock = /^ {6}mode:\n((?: {8}.*\n)+)/m.exec(`${deployText}\n`);
    expect(inputBlock).not.toBeNull();
    expect(inputBlock[1]).toMatch(/type:\s*choice/);
    expect(inputBlock[1]).toMatch(/options:\s*\[publish,\s*record\]/);
    expect(inputBlock[1]).toMatch(/default:\s*publish/);
  });

  it('defines the &publish_only anchor on Check out the repository', () => {
    const step = byStepName['Check out the repository'];
    expect(step.text).toMatch(/if:\s*&publish_only/);
    expect(step.text).toContain("inputs.mode == 'publish'");
  });

  it.each(PUBLISH_ONLY_STEPS)('%s is guarded by *publish_only', (name) => {
    expect(byStepName[name].text).toMatch(/if:\s*\*publish_only/);
  });

  it.each(STAGING_ONLY_STEPS)('%s requires staging and publish mode together', (name) => {
    const step = byStepName[name];
    expect(step.text).toMatch(/env\.ENVIRONMENT == 'staging'/);
    expect(step.text).toMatch(/inputs\.mode == 'publish'/);
  });

  it('record-unpublished depends on ci and fires only on failure or cancellation', () => {
    const job = byJobName['record-unpublished'];
    expect(job.text).toMatch(/needs:\s*\[ci\]/);
    expect(job.text).toMatch(/needs\.ci\.result == 'failure'/);
    expect(job.text).toMatch(/needs\.ci\.result == 'cancelled'/);
  });

  it('scopes the concurrency group by mode so a record dispatch cannot cancel an in-flight publish', () => {
    const groupLine = /^concurrency:\n {2}group:\s*(.+)$/m.exec(deployText);
    expect(groupLine).not.toBeNull();
    expect(groupLine[1]).toContain('inputs.mode');
  });

  it('dispatch-deploy stays gated only by the implicit success() GitHub Actions prepends', () => {
    const job = byJobName['dispatch-deploy'];
    const ifLine = /^\s*if:.*$/m.exec(job.text)[0];
    expect(ifLine).not.toMatch(/success\(\)/);
    expect(ifLine).not.toMatch(/failure\(\)/);
    expect(ifLine).not.toMatch(/cancelled\(\)/);
    expect(ifLine).not.toMatch(/needs\.ci\.result/);
  });
});
