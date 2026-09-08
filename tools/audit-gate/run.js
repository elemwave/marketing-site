#!/usr/bin/env node
/**
 * Dependency vulnerability gate.
 *
 * Runs `npm audit` in the current working directory and fails on high or
 * critical advisories, except those recorded in `config/audit-allowlist.json`
 * with a justification and an expiry date.
 *
 * Deliberately free of third-party imports: CI audits `infrastructure/` with
 * only that package's own dependencies installed, so this must run on a bare
 * Node runtime from any working directory in the repository.
 *
 * Usage: node tools/audit-gate/run.js --scope <root|infrastructure>
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { evaluateAuditReport } from './evaluate-audit-report.js';

const ALLOWLIST_PATH = new URL('../../config/audit-allowlist.json', import.meta.url);

function parseScope(argv) {
  const flagIndex = argv.indexOf('--scope');
  const scope = flagIndex === -1 ? undefined : argv[flagIndex + 1];

  if (!scope) {
    throw new Error('Missing required argument: --scope <marketing|infrastructure>');
  }

  return scope;
}

function readAllowances(scope) {
  const allowlist = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'));

  if (!Object.hasOwn(allowlist, scope)) {
    const known = Object.keys(allowlist).join(', ');
    throw new Error(`Unknown scope "${scope}". config/audit-allowlist.json defines: ${known}.`);
  }

  return allowlist[scope];
}

/**
 * `npm audit` exits non-zero whenever it finds anything, which is the normal
 * case here — the report on stdout is what matters. Only unparseable output
 * means npm itself failed.
 */
function runNpmAudit() {
  let stdout;

  try {
    stdout = execFileSync('npm', ['audit', '--json', '--omit=dev'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    stdout = error.stdout ?? '';

    if (!stdout.trim()) {
      throw new Error(`npm audit could not be run: ${error.stderr || error.message}`);
    }
  }

  try {
    return JSON.parse(stdout);
  } catch {
    throw new Error(`npm audit did not return a JSON report:\n${stdout}`);
  }
}

function describeFinding(finding) {
  return [
    `  ${finding.package} (${finding.severity}) ${finding.range ?? ''}`.trimEnd(),
    `    ${finding.title ?? 'no title'}`,
    `    ${finding.advisory}`,
    ...finding.nodes.map((node) => `    at ${node}`),
  ].join('\n');
}

function report({ failures, expired, unused }, scope) {
  if (failures.length > 0) {
    console.error(`Unallowed high or critical advisories in scope "${scope}":\n`);
    console.error(failures.map(describeFinding).join('\n\n'));
    console.error(
      '\nFix the dependency, or record a justified, time-boxed exception in ' +
        'config/audit-allowlist.json.\n',
    );
  }

  if (expired.length > 0) {
    console.error(`Expired allowances in scope "${scope}":\n`);
    for (const finding of expired) {
      console.error(`${describeFinding(finding)}\n    expired on ${finding.expires}`);
      console.error(`    reason given: ${finding.reason}\n`);
    }
    console.error('Re-check whether the advisory is still unfixable, then extend or remove it.\n');
  }

  if (unused.length > 0) {
    console.error(`Allowances in scope "${scope}" that no longer match any advisory:\n`);
    for (const allowance of unused) {
      console.error(`  ${allowance.package} — ${allowance.advisory}`);
    }
    console.error('\nRemove them so the allowlist keeps describing real exceptions.\n');
  }
}

function main() {
  const scope = parseScope(process.argv.slice(2));
  const allowances = readAllowances(scope);
  const today = new Date().toISOString().slice(0, 10);

  const result = evaluateAuditReport({ report: runNpmAudit(), allowances, today });
  const blocked = result.failures.length + result.expired.length + result.unused.length > 0;

  if (!blocked) {
    const allowed = allowances.length;
    const suffix =
      allowed === 0 ? '' : ` (${allowed} recorded exception${allowed === 1 ? '' : 's'})`;
    console.log(`Vulnerability gate passed for scope "${scope}"${suffix}.`);
    return;
  }

  report(result, scope);
  process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(`Vulnerability gate could not run: ${error.message}`);
  process.exitCode = 1;
}
