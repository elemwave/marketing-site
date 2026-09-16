import { describe, expect, it } from 'vitest';
import { executableLines, readRepoFile } from '../../ci-gate/tests/sh.js';

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
  return jobs.map(({ name, lines: body }) => ({ name, text: body.join('\n'), lines: body }));
}

function jobSteps(jobLines) {
  const steps = [];
  let current = null;
  for (const line of jobLines) {
    if (/^ {6}- (?:name|uses):/.test(line)) {
      current = [line];
      steps.push(current);
      continue;
    }
    current?.push(line);
  }
  return steps.map((body) => body.join('\n'));
}

describe('the Deploy workflow gate', () => {
  const deployLines = executableLines(readRepoFile('.github/workflows/deploy.yml'));
  const deployText = deployLines.join('\n');
  const deployJobs = workflowJobs(deployLines);
  const deployJob = deployJobs.find((job) => job.name === 'deploy');
  const steps = jobSteps(deployJob?.lines ?? []);

  it('reads the publication workflow it is meant to check', () => {
    expect(deployJob).toBeDefined();
    expect(steps.length).toBeGreaterThanOrEqual(3);
  });

  it('grants checks read without dropping the existing token permissions', () => {
    expect(deployText).toMatch(/^permissions:\n(?: {2}.+\n)* {2}checks: read/m);
    expect(deployText).toMatch(/^permissions:\n(?: {2}.+\n)* {2}id-token: write/m);
    expect(deployText).toMatch(/^permissions:\n(?: {2}.+\n)* {2}contents: read/m);
  });

  it('does not attach a GitHub environment to the publication job', () => {
    expect(deployJob.text).not.toMatch(/^ {4}environment:/m);
  });

  it('still names the published revision from the optional input or the dispatched commit', () => {
    expect(deployText).toMatch(/RELEASE_SHA: \${{ inputs\.target_sha \|\| github\.sha }}/);
  });

  it('checks out the dispatched commit with full history before running the publication gate', () => {
    const trustedCheckout = steps.findIndex(
      (step) => /actions\/checkout@/.test(step) && /ref: \${{ github\.sha }}/.test(step) && /fetch-depth: 0/.test(step),
    );
    const gate = steps.findIndex((step) => /scripts\/verify-publishable-revision\.sh/.test(step));

    expect(trustedCheckout).toBeGreaterThanOrEqual(0);
    expect(gate).toBeGreaterThan(trustedCheckout);
  });

  it('runs the publication gate before Node is set up and before the named revision is checked out', () => {
    const gate = steps.findIndex((step) => /scripts\/verify-publishable-revision\.sh/.test(step));
    const setupNode = steps.findIndex((step) => /actions\/setup-node@/.test(step));
    const namedCheckout = steps.findIndex(
      (step) =>
        /actions\/checkout@/.test(step) &&
        (/ref: \${{ env\.RELEASE_SHA }}/.test(step) || /ref: \${{ inputs\.target_sha }}/.test(step)),
    );

    expect(gate).toBeGreaterThanOrEqual(0);
    expect(setupNode).toBeGreaterThan(gate);
    expect(namedCheckout).toBeGreaterThan(gate);
  });

  it('gives the gate the named revision, the dispatched branch, and the token used to read checks', () => {
    const gate = steps.find((step) => /scripts\/verify-publishable-revision\.sh/.test(step));

    expect(gate).toBeDefined();
    expect(gate).toMatch(/verify-publishable-revision\.sh/);
    expect(gate).toMatch(/github\.ref_name|GITHUB_REF_NAME/);
    expect(gate).toMatch(/RELEASE_SHA|inputs\.target_sha|github\.sha/);
    expect(gate).toMatch(/GH_TOKEN: \${{ github\.token }}/);
  });

  it('keeps the first step as environment selection', () => {
    expect(steps[0]).toMatch(/name: Select the environment for this branch/);
  });
});

describe('the CI dispatch of Deploy', () => {
  const ciLines = executableLines(readRepoFile('.github/workflows/ci.yml'));
  const ciJobs = workflowJobs(ciLines);
  const dispatch = ciJobs.find((job) => job.name === 'dispatch-deploy');

  it('still dispatches Deploy only after the aggregator CI job on staging or main', () => {
    expect(dispatch).toBeDefined();
    expect(dispatch.text).toMatch(/needs:\s*\[ci\]/);
    expect(dispatch.text).toMatch(
      /if: github\.event_name == 'push' && \(github\.ref == 'refs\/heads\/staging' \|\| github\.ref == 'refs\/heads\/main'\)/,
    );
    expect(dispatch.text).toMatch(/gh workflow run deploy\.yml/);
    expect(dispatch.text).toMatch(/--ref "\$GITHUB_REF_NAME"/);
    expect(dispatch.text).toMatch(/-f target_sha="\$GITHUB_SHA"/);
  });
});
