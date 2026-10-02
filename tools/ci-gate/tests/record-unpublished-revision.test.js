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
  'Verify the revision may be published',
  'Check out the named revision',
  'Resolve the CI run that checked this revision',
  'Download the checked export',
  'Stamp the deployed revision',
  'Set up Node.js',
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

// The only steps a record-mode run executes. Every other step either publishes
// or is part of the publication gate, which would refuse the very revision a
// record run exists to report.
const RECORD_MODE_STEPS = ['Select the environment for this branch', 'Report a revision that was not published'];

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

  it("defines &publish_only on Check out the dispatched revision, gated on inputs.mode == 'publish'", () => {
    const step = byName['Check out the dispatched revision'];
    expect(step).toBeDefined();
    expect(step.text).toMatch(/&publish_only/);
    expect(step.text).toMatch(/inputs\.mode == 'publish'/);
  });

  it.each(PUBLISH_ONLY_STEPS)('gates %s on *publish_only', (name) => {
    const step = byName[name];
    expect(step).toBeDefined();
    expect(step.text).toMatch(/\*publish_only/);
  });

  it('runs no step in record mode beyond selecting the environment and reporting the revision', () => {
    const ungated = steps
      .filter((step) => !RECORD_MODE_STEPS.includes(step.name))
      .filter((step) => !/\*publish_only|&publish_only|inputs\.mode == 'publish'/.test(step.text))
      .map((step) => step.name);
    expect(ungated).toEqual([]);
  });

  it('reports the unpublished revision to the step summary, only in record mode', () => {
    const step = byName['Report a revision that was not published'];
    expect(step).toBeDefined();
    expect(step.text).toMatch(/if: \$\{\{ inputs\.mode == 'record' \}\}/);
    expect(step.text).toMatch(/\$RELEASE_SHA was not published/);
    expect(step.text).toMatch(/>> "\$GITHUB_STEP_SUMMARY"/);
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

  const recordJob = () => {
    const jobIndex = ciText.indexOf('record-unpublished:');
    expect(jobIndex).toBeGreaterThanOrEqual(0);
    return ciText.slice(jobIndex);
  };

  it('gives record-unpublished the same needs as dispatch-deploy', () => {
    expect(recordJob()).toMatch(/needs:\s*\[ci\]/);
  });

  it('runs record-unpublished whatever ci concluded, so a failure does not skip it', () => {
    expect(recordJob()).toMatch(/if: \$\{\{ always\(\) && /);
  });

  // A run cancelled as a whole skips `ci` through its own `!cancelled()` guard,
  // so `skipped` must be recorded alongside `failure` and `cancelled`.
  it('records every ci result other than success, on a push to staging or main', () => {
    const condition = /if: (.+)$/m.exec(recordJob())?.[1] ?? '';
    expect(condition).toContain("needs.ci.result != 'success'");
    expect(condition).toContain("github.event_name == 'push'");
    expect(condition).toContain("github.ref == 'refs/heads/staging'");
    expect(condition).toContain("github.ref == 'refs/heads/main'");
  });

  it('dispatches Deploy in record mode for the pushed revision', () => {
    const job = recordJob();
    expect(job).toMatch(/gh workflow run deploy\.yml/);
    expect(job).toMatch(/-f target_sha="\$GITHUB_SHA"/);
    expect(job).toMatch(/-f mode=record/);
  });

  it("scopes Deploy's concurrency group by mode, so a record dispatch cannot cancel a publish", () => {
    const deployText = readRepoFile('.github/workflows/deploy.yml');
    const group = /^ {2}group: (.+)$/m.exec(executableLines(deployText).join('\n'));
    expect(group?.[1]).toContain('inputs.mode');
  });

  it('gives each recorded revision its own concurrency group, so one record cannot cancel or replace another', () => {
    const deployText = readRepoFile('.github/workflows/deploy.yml');
    const group = /^ {2}group: (.+)$/m.exec(executableLines(deployText).join('\n'))?.[1] ?? '';
    expect(group).toMatch(/inputs\.mode == 'record' && format\('-\{0\}', inputs\.target_sha\)/);
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
