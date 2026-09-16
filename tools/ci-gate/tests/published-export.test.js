import { describe, expect, it } from 'vitest';
import { executableLines, readRepoFile } from './sh.js';

/** Maps each top-level job name to its body text, from the two-space-indented job keys under `jobs:`. */
function parseJobs(lines) {
  const jobs = new Map();
  let inJobs = false;
  let current = null;
  for (const line of lines) {
    if (/^jobs:\s*$/.test(line)) {
      inJobs = true;
      continue;
    }
    if (!inJobs) continue;
    const key = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (key) {
      current = [];
      jobs.set(key[1], current);
      continue;
    }
    current?.push(line);
  }
  return new Map([...jobs].map(([name, body]) => [name, body.join('\n')]));
}

/** The text around the first occurrence of `marker`, wide enough to read a step's `with:` block. */
function around(text, marker, before = 300, after = 400) {
  const index = text.indexOf(marker);
  expect(index).toBeGreaterThanOrEqual(0);
  return text.slice(Math.max(0, index - before), index + after);
}

describe('the published export is the export CI already checked', () => {
  const ciLines = executableLines(readRepoFile('.github/workflows/ci.yml'));
  const ciJobs = parseJobs(ciLines);
  const deployLines = executableLines(readRepoFile('.github/workflows/deploy.yml'));
  const deployJobs = parseJobs(deployLines);
  const deployJob = deployJobs.get('deploy') ?? '';

  it('reads the two workflows this card changes', () => {
    expect(ciJobs.has('app')).toBe(true);
    expect(ciJobs.has('dispatch-deploy')).toBe(true);
    expect(deployJobs.has('deploy')).toBe(true);
  });

  it('uploads the checked export from the app job, after the browser tests and the performance budget', () => {
    const appJob = ciJobs.get('app');
    const e2eIndex = appJob.indexOf('make e2e');
    const budgetIndex = appJob.indexOf('make performance-budget');
    const uploadIndex = appJob.indexOf('checked-site-export-');
    expect(e2eIndex).toBeGreaterThanOrEqual(0);
    expect(budgetIndex).toBeGreaterThan(e2eIndex);
    expect(uploadIndex).toBeGreaterThan(budgetIndex);

    const block = around(appJob, 'checked-site-export-');
    expect(block).toMatch(/uses: actions\/upload-artifact@v7/);
    expect(block).toMatch(/name: checked-site-export-\$\{\{\s*github\.sha\s*\}\}/);
    expect(block).toMatch(/path: projects\/marketing\/out/);
    expect(block).toMatch(/if-no-files-found: error/);
    expect(block).toMatch(/retention-days: 7/);
  });

  it('limits the upload to a push to staging or main', () => {
    const appJob = ciJobs.get('app');
    const block = around(appJob, 'checked-site-export-', 600, 100);
    expect(block).toMatch(/if:[^\n]*github\.event_name == 'push'/);
    expect(block).toMatch(/refs\/heads\/staging/);
    expect(block).toMatch(/refs\/heads\/main/);
  });

  it('passes the run id to deploy alongside the target sha', () => {
    const dispatchJob = ciJobs.get('dispatch-deploy');
    expect(dispatchJob).toMatch(/-f target_sha="\$GITHUB_SHA"/);
    expect(dispatchJob).toMatch(/-f source_run_id="\$\{\{\s*github\.run_id\s*\}\}"/);
  });

  it('does not rebuild the site on the deploy runner', () => {
    expect(deployJob).not.toMatch(/run: npm run build/);
    expect(deployJob).not.toMatch(/working-directory: projects\/marketing\s*\n\s*run: npm ci/);
  });

  it('downloads the checked export by run id before stamping the revision and deploying', () => {
    const downloadIndex = deployJob.indexOf('actions/download-artifact@v7');
    expect(downloadIndex).toBeGreaterThanOrEqual(0);

    const block = around(deployJob, 'actions/download-artifact@v7', 100, 400);
    expect(block).toMatch(/run-id:/);
    expect(block).toMatch(/github-token: \$\{\{\s*github\.token\s*\}\}/);
    expect(block).toMatch(/name: checked-site-export-\$\{\{\s*env\.RELEASE_SHA\s*\}\}/);

    const stampIndex = deployJob.indexOf('out/version.json');
    const cdkDeployIndex = deployJob.indexOf('npx cdk deploy');
    expect(stampIndex).toBeGreaterThan(downloadIndex);
    expect(cdkDeployIndex).toBeGreaterThan(stampIndex);
  });

  it('refuses a run whose head sha or conclusion does not match', () => {
    expect(deployJob).toMatch(/head_sha/);
    expect(deployJob).toMatch(/RELEASE_SHA/);
    expect(deployJob).toMatch(/conclusion/);
  });

  it("grants the token permission to read another workflow run's artefact", () => {
    expect(deployJobs.get('deploy')).toBeDefined();
    expect(deployLines.join('\n')).toMatch(/actions: read/);
  });

  it("drops the site's lockfile from the Node cache path", () => {
    expect(deployLines.join('\n')).not.toMatch(/projects\/marketing\/package-lock\.json/);
  });
});
