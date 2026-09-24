import { describe, expect, it } from 'vitest';
import { executableLines, readRepoFile } from './sh.js';

/** The `deploy` job's steps as { name, text }, from its `- name:` step headers. */
function deploySteps(text) {
  const steps = [];
  for (const line of text.split('\n')) {
    const header = /^ {6}- name: (.+)$/.exec(line);
    if (header) {
      steps.push({ name: header[1], lines: [] });
      continue;
    }
    steps.at(-1)?.lines.push(line);
  }
  return steps.map(({ name, lines }) => ({ name, text: lines.join('\n') }));
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

describe('deploy.yml only publishes when CI passed', () => {
  const deployText = readRepoFile('.github/workflows/deploy.yml');
  const deployLines = executableLines(deployText);
  const steps = deploySteps(deployLines.join('\n'));
  const byName = Object.fromEntries(steps.map((step) => [step.name, step]));

  it('declares the mode choice input, defaulting to publish', () => {
    expect(deployText).toMatch(/mode:\s*\n\s*type:\s*choice/);
    expect(deployText).toMatch(/options:\s*\[publish,\s*record\]/);
    expect(deployText).toMatch(/default:\s*publish/);
  });

  it("defines &publish_only on Check out the repository, gated on inputs.mode == 'publish'", () => {
    const step = byName['Check out the repository'];
    expect(step).toBeDefined();
    expect(step.text).toMatch(/&publish_only/);
    expect(step.text).toMatch(/inputs\.mode == 'publish'/);
  });

  it.each(PUBLISH_ONLY_STEPS)('gates %s on *publish_only', (name) => {
    const step = byName[name];
    expect(step).toBeDefined();
    expect(step.text).toMatch(/\*publish_only/);
  });

  it.each(STAGING_ONLY_STEPS)('gates %s on staging and publish mode together', (name) => {
    const step = byName[name];
    expect(step).toBeDefined();
    expect(step.text).toMatch(/env\.ENVIRONMENT == 'staging'/);
    expect(step.text).toMatch(/inputs\.mode == 'publish'/);
  });
});

describe('ci.yml dispatches a record only when CI did not pass', () => {
  const ciText = executableLines(readRepoFile('.github/workflows/ci.yml')).join('\n');

  it('gives record-unpublished the same needs as dispatch-deploy, gated on failure or cancellation', () => {
    const jobIndex = ciText.indexOf('record-unpublished:');
    expect(jobIndex).toBeGreaterThanOrEqual(0);
    const jobText = ciText.slice(jobIndex);
    expect(jobText).toMatch(/needs:\s*\[ci\]/);
    expect(jobText).toMatch(/needs\.ci\.result == 'failure'/);
    expect(jobText).toMatch(/needs\.ci\.result == 'cancelled'/);
  });

  it('keeps dispatch-deploy gated only by the implicit success() GitHub Actions prepends', () => {
    const jobIndex = ciText.indexOf('dispatch-deploy:');
    const nextJobIndex = ciText.indexOf('\n  record-unpublished:');
    expect(jobIndex).toBeGreaterThanOrEqual(0);
    expect(nextJobIndex).toBeGreaterThan(jobIndex);
    const jobText = ciText.slice(jobIndex, nextJobIndex);
    for (const forbidden of ['success()', 'failure()', 'cancelled()', 'needs.ci.result']) {
      expect(jobText).not.toContain(forbidden);
    }
  });
});
