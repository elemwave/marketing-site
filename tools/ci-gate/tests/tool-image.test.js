import { existsSync, mkdtempSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { sh } from './sh.js';

/**
 * Exercises the pinned-image helper against a stub `docker` on PATH, never a
 * registry, so each property is observed on pulls whose outcome is known.
 *
 * The stub counts its own pull attempts in a file and fails the first
 * `DOCKER_STUB_PULL_FAILURES` of them the way a rate-limited registry does:
 * non-zero, with the reason on stderr.
 *
 * Two injection points keep the tests fast and deterministic. `sleep` is
 * shadowed by a shell function, so a backoff schedule is asserted from what the
 * helper asked to wait rather than by waiting; `tool_image_jitter` is shadowed
 * to remove the randomness that desynchronises concurrent callers.
 */
const DOCKER_STUB = `#!/bin/sh
if [ "$1 $2" = "image inspect" ]; then
    exit "\${DOCKER_STUB_INSPECT_STATUS:-1}"
fi
if [ "$1" = pull ]; then
    attempts=$(cat "$DOCKER_STUB_COUNTER" 2>/dev/null || echo 0)
    attempts=$((attempts + 1))
    echo "$attempts" > "$DOCKER_STUB_COUNTER"
    if [ "$attempts" -le "\${DOCKER_STUB_PULL_FAILURES:-0}" ]; then
        echo "toomanyrequests: Rate exceeded" >&2
        echo "pull $attempts noise on stdout"
        exit 1
    fi
    echo "Status: Downloaded newer image"
    exit 0
fi
exit 0
`;

function harness({ body = 'ensure_tool_image tool:pinned; echo "status=$?"', env = {}, stubJitter = true } = {}) {
  const stubDir = mkdtempSync(path.join(tmpdir(), 'tool-image-'));
  const counter = path.join(stubDir, 'attempts');
  writeFileSync(path.join(stubDir, 'docker'), DOCKER_STUB);
  chmodSync(path.join(stubDir, 'docker'), 0o755);

  const script = `
    PATH="${stubDir}:$PATH"
    . scripts/lib/tool-image.sh
    sleep() { echo "slept $1"; }
    ${stubJitter ? 'tool_image_jitter() { echo 0; }' : ''}
    ${body}
  `;
  const result = sh(script, { env: { DOCKER_STUB_COUNTER: counter, ...env } });

  return {
    ...result,
    output: `${result.stdout}${result.stderr}`,
    pulls: existsSync(counter) ? Number(readFileSync(counter, 'utf8').trim()) : 0,
    waits: [...result.stdout.matchAll(/^slept (\d+)$/gm)].map((match) => Number(match[1])),
  };
}

describe('the pinned tool image helper', () => {
  it('succeeds without pulling when the image is already present', () => {
    const run = harness({ env: { DOCKER_STUB_INSPECT_STATUS: '0' } });

    expect(run.output).toMatch(/^status=0$/m);
    expect(run.pulls).toBe(0);
  });

  it('pulls once and succeeds when the image is absent', () => {
    const run = harness();

    expect(run.output).toMatch(/^status=0$/m);
    expect(run.pulls).toBe(1);
    expect(run.waits).toEqual([]);
  });

  it('keeps the successful pull quiet', () => {
    const run = harness();

    expect(run.output).not.toMatch(/Downloaded newer image/);
  });

  it('stops retrying as soon as a pull succeeds', () => {
    const run = harness({ env: { DOCKER_STUB_PULL_FAILURES: '2', TOOL_IMAGE_PULL_ATTEMPTS: '5' } });

    expect(run.output).toMatch(/^status=0$/m);
    expect(run.pulls).toBe(3);
  });

  it('fails after exhausting the configured attempts', () => {
    const run = harness({ env: { DOCKER_STUB_PULL_FAILURES: '99', TOOL_IMAGE_PULL_ATTEMPTS: '4' } });

    expect(run.output).toMatch(/^status=1$/m);
    expect(run.pulls).toBe(4);
    expect(run.output).toMatch(/Could not obtain the pinned image tool:pinned after 4 attempts\./);
  });

  it('reports the registry’s own reason on every failed attempt', () => {
    const run = harness({ env: { DOCKER_STUB_PULL_FAILURES: '99', TOOL_IMAGE_PULL_ATTEMPTS: '2' } });

    expect(run.output).toMatch(/toomanyrequests: Rate exceeded/);
    expect(run.output).toMatch(/Pulling tool:pinned failed \(attempt 1\)/);
  });

  it('keeps the failed pull’s stdout out of the report', () => {
    const run = harness({ env: { DOCKER_STUB_PULL_FAILURES: '99', TOOL_IMAGE_PULL_ATTEMPTS: '2' } });

    expect(run.output).not.toMatch(/noise on stdout/);
  });

  it('backs off exponentially between attempts, up to the cap', () => {
    const run = harness({
      env: {
        DOCKER_STUB_PULL_FAILURES: '99',
        TOOL_IMAGE_PULL_ATTEMPTS: '5',
        TOOL_IMAGE_RETRY_DELAY_SECONDS: '2',
        TOOL_IMAGE_RETRY_MAX_DELAY_SECONDS: '8',
      },
    });

    expect(run.waits).toEqual([2, 4, 8, 8]);
  });

  it('waits after a failed attempt only when another attempt follows', () => {
    const run = harness({
      env: {
        DOCKER_STUB_PULL_FAILURES: '99',
        TOOL_IMAGE_PULL_ATTEMPTS: '3',
        TOOL_IMAGE_RETRY_DELAY_SECONDS: '1',
      },
    });

    expect(run.waits).toHaveLength(2);
  });

  it('announces the delay it actually waits', () => {
    const run = harness({
      env: {
        DOCKER_STUB_PULL_FAILURES: '99',
        TOOL_IMAGE_PULL_ATTEMPTS: '2',
        TOOL_IMAGE_RETRY_DELAY_SECONDS: '3',
      },
    });

    expect(run.output).toMatch(/retrying in 3s\./);
  });

  it('adds jitter within the base delay, so concurrent callers desynchronise', () => {
    const run = harness({
      stubJitter: false,
      body: 'i=0; while [ "$i" -lt 40 ]; do tool_image_jitter 4; i=$((i + 1)); done',
    });
    const values = run.stdout.trim().split('\n').map(Number);

    expect(values).toHaveLength(40);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThanOrEqual(4);
    expect(new Set(values).size).toBeGreaterThan(1);
  });
});
