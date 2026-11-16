import { spawn, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Shared helpers for the gate tooling tests.
 *
 * The gate's scripts are POSIX `sh` so that a worker host with no language
 * toolchain can run them, and so that they can be exercised here, inside the
 * Node image, which carries `sh` but not `bash`.
 */

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export function sh(script, { cwd = ROOT, env = {} } = {}) {
  const result = spawnSync('sh', ['-c', script], {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  return { stdout: result.stdout, stderr: result.stderr, status: result.status };
}

/**
 * Like `sh`, but asynchronous, so two invocations can genuinely overlap and a
 * per-test timeout can interrupt a wait. When `timeout` passes, the whole run
 * ends: the shell is started as the leader of its own process group, and the
 * timeout kills that group. Node's own `timeout` option would signal only the
 * `sh` child, and where the shell forks its command instead of exec-ing it
 * (dash does, busybox does for anything but a lone last command) the orphan
 * keeps the stdout and stderr pipes open, so `close` never fires.
 */
export function shAsync(script, { cwd = ROOT, timeout } = {}) {
  return new Promise((resolve) => {
    const child = spawn('sh', ['-c', script], { cwd, env: process.env, detached: true });
    let stdout = '';
    let stderr = '';
    const timer =
      timeout === undefined
        ? undefined
        : setTimeout(() => {
            try {
              process.kill(-child.pid, 'SIGKILL');
            } catch {
              // The group has already gone: nothing is left to end.
            }
          }, timeout);
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (status) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, status });
    });
  });
}

export function readRepoFile(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

/** Lines a shell or YAML reader would execute: comment-only lines removed. */
export function executableLines(text) {
  return text.split('\n').filter((line) => !/^\s*#/.test(line));
}

/** Every rule target the Makefile declares, from `target:` lines, excluding `:=` assignments. */
export function makefileTargets() {
  return executableLines(readRepoFile('Makefile'))
    .map((line) => /^([A-Za-z0-9_][A-Za-z0-9_./-]*):(?!=)/.exec(line))
    .filter(Boolean)
    .map((match) => match[1]);
}
