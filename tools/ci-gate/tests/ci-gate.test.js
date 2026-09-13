import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { executableLines, readRepoFile, sh } from './sh.js';

/**
 * Runs the tier runner against a fake stage table and a fake runner, never
 * `make`, so each property is observed on stages whose behaviour is known:
 *
 *   pass-x      succeeds
 *   fail-x      prints "broke fail-x" and fails
 *   sleep-x     takes one second, then succeeds
 *   mark-x      leaves marker-x in the log directory
 *   slowmark-x  takes one second, then leaves marker-x
 *   check-x     succeeds only when marker-x already exists
 */
function harness(table, body) {
  const logDir = mkdtempSync(path.join(tmpdir(), 'ci-gate-'));
  const script = `
    . scripts/lib/ci-stages.sh
    CI_STAGES='${table.join('\n')}'
    . scripts/lib/ci-gate.sh
    ci_gate_runner() {
      case "$1" in
        pass-*) echo "ran $1" ;;
        fail-*) echo "broke $1"; return 1 ;;
        sleep-*) sleep 1; echo "slept $1" ;;
        mark-*) : > "$LOG_DIR/marker-\${1#mark-}" ;;
        slowmark-*) sleep 1; : > "$LOG_DIR/marker-\${1#slowmark-}" ;;
        check-*) [ -f "$LOG_DIR/marker-\${1#check-}" ] ;;
        drain-*) cat > /dev/null ;;
        truncate-*) for f in "$LOG_DIR"/lane-*.stages; do : > "$f"; done ;;
      esac
    }
    ${body}
  `;
  const started = Date.now();
  const result = sh(script, { env: { LOG_DIR: logDir } });
  return {
    ...result,
    output: `${result.stdout}${result.stderr}`,
    elapsed: Date.now() - started,
    marker: (name) => existsSync(path.join(logDir, `marker-${name}`)),
  };
}

describe('the gate tier runner', () => {
  it('runs the lanes of a tier in parallel and marks each stage', () => {
    const run = harness(['One|cheap|one|sleep-one|', 'Two|cheap|two|sleep-two|'], 'ci_gate_run_tier cheap');

    expect(run.status).toBe(0);
    expect(run.elapsed).toBeLessThan(1900);
    expect(run.output).toMatch(/^==> One$/m);
    expect(run.output).toMatch(/^==> Two$/m);
  });

  it('runs the stages of one lane in order', () => {
    const run = harness(
      ['First|cheap|serial|slowmark-first|', 'Second|cheap|serial|check-first|'],
      'ci_gate_run_tier cheap',
    );

    expect(run.status).toBe(0);
  });

  // `docker compose run` reads standard input by default. A stage that does so
  // must not swallow the list its lane is reading and end the lane early.
  it('runs every later stage of a lane even when a stage reads standard input', () => {
    const run = harness(
      ['Reads input|prepare|deps|drain-input|', 'After it|prepare|deps|mark-after|'],
      'ci_gate_run_tier prepare',
    );

    expect(run.status).toBe(0);
    expect(run.marker('after')).toBe(true);
    expect(run.output).toMatch(/^==> After it$/m);
  });

  it('fails the tier and names a stage that recorded no result, rather than passing it by', () => {
    const run = harness(
      ['Cuts the list|cheap|a|truncate-list|', 'Never reached|cheap|a|mark-never|'],
      'ci_gate_run_tier cheap',
    );

    expect(run.marker('never')).toBe(false);
    expect(run.status).not.toBe(0);
    expect(run.output).toMatch(/NOT RECORDED: Never reached/);
  });

  it('reports every failure in a tier together and never starts the next tier', () => {
    const run = harness(
      ['Prep|prepare|deps|pass-prep|', 'Broken one|cheap|a|fail-one|', 'Broken two|cheap|b|fail-two|', 'Later|verify|v|mark-later|'],
      'ci_gate_run_all',
    );

    expect(run.status).not.toBe(0);
    expect(run.output).toMatch(/FAILED: Broken one/);
    expect(run.output).toMatch(/FAILED: Broken two/);
    expect(run.output).toMatch(/broke fail-one/);
    expect(run.output).toMatch(/broke fail-two/);
    expect(run.marker('later')).toBe(false);
  });

  it('passes when every tier passes', () => {
    const run = harness(
      ['Prep|prepare|deps|mark-prep|', 'Cheap|cheap|c|mark-cheap|', 'Verify|verify|v|check-cheap|'],
      'ci_gate_run_all',
    );

    expect(run.status).toBe(0);
    expect(run.marker('prep')).toBe(true);
  });

  it('starts a dependent stage only after its dependency has passed', () => {
    const run = harness(
      ['Build|verify|app|slowmark-build|', 'Browser|verify|browser|check-build|Build'],
      'ci_gate_run_tier verify',
    );

    expect(run.status).toBe(0);
  });

  it('does not run a dependent stage when its dependency fails', () => {
    const run = harness(
      ['Build|verify|app|fail-build|', 'Browser|verify|browser|mark-browser|Build'],
      'ci_gate_run_tier verify',
    );

    expect(run.status).not.toBe(0);
    expect(run.marker('browser')).toBe(false);
    expect(run.output).toMatch(/NOT RUN: Browser \(Build did not pass\)/);
  });

  it('runs one named stage after the prepare tier and its dependency, as a diagnostic', () => {
    const run = harness(
      [
        'Prep|prepare|deps|mark-prep|',
        'Cheap|cheap|c|mark-cheap|',
        'Build|verify|app|mark-build|',
        'Browser|verify|browser|check-build|Build',
      ],
      "ci_gate_run_single 'Browser'",
    );

    expect(run.status).toBe(0);
    expect(run.marker('prep')).toBe(true);
    expect(run.marker('build')).toBe(true);
    expect(run.marker('cheap')).toBe(false);
    expect(run.output).toMatch(/diagnostic only — not a verification verdict/);
  });

  it('refuses an unknown stage name with status 2 and lists the stages', () => {
    const run = harness(['Prep|prepare|deps|pass-prep|', 'Cheap|cheap|c|pass-cheap|'], "ci_gate_run_single 'Nope'");

    expect(run.status).toBe(2);
    expect(run.stderr).toMatch(/Unknown stage: Nope/);
    expect(run.stderr).toMatch(/^Prep$/m);
    expect(run.stderr).toMatch(/^Cheap$/m);
  });
});

describe('the gate entry points', () => {
  const SOURCES = ['scripts/lib/ci-gate.sh', 'scripts/lib/ci-stages.sh', 'scripts/run-ci-gate.sh', 'scripts/run-ci-stage.sh'];

  it('offer no way to skip a tier', () => {
    for (const file of SOURCES) {
      const code = executableLines(readRepoFile(file)).join('\n');
      expect(code.length).toBeGreaterThan(0);
      expect(code).not.toMatch(/skip/i);
    }
  });

  it('reference no variable but the stage table, the tier order and the log directory, all set by the scripts themselves', () => {
    const references = SOURCES.flatMap((file) =>
      executableLines(readRepoFile(file)).flatMap((line) =>
        [...line.matchAll(/\$\{?([A-Z][A-Z0-9_]*)/g)].map((match) => match[1]),
      ),
    );
    expect(references.length).toBeGreaterThan(0);
    expect([...new Set(references)].sort()).toEqual(['CI_STAGES', 'CI_TIERS', 'LOG_DIR']);
  });

  it('ignore a stage table supplied through the environment', () => {
    const real = sh('. scripts/lib/ci-stages.sh; ci_stages_list');
    const listed = sh('sh scripts/run-ci-stage.sh --list', { env: { CI_STAGES: 'Lint|cheap|lint|lint|' } });

    expect(listed.status).toBe(0);
    expect(listed.stdout.split('\n').filter(Boolean)).toHaveLength(14);
    expect(listed.stdout).toBe(real.stdout);
  });

  it('are what make ci, make ci-stages and make ci-stage run', () => {
    const makefile = readRepoFile('Makefile');
    expect(makefile).toMatch(/^ci: ## .*\n\t@sh scripts\/run-ci-gate\.sh$/m);
    expect(makefile).toMatch(/^ci-stages: ## .*\n\t@sh scripts\/run-ci-stage\.sh --list$/m);
    expect(makefile).toMatch(/^ci-stage: ## .*\n\t@sh scripts\/run-ci-stage\.sh "\$\(STAGE\)"$/m);
  });
});
