import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { evaluateAuditReport } from '../evaluate-audit-report.js';

const braceExpansionAdvisory = 'https://github.com/advisories/GHSA-mh99-v99m-4gvg';
const braceExpansionNode = 'node_modules/aws-cdk-lib/node_modules/brace-expansion';

/**
 * Shaped after the real `npm audit --json --omit=dev` output captured from
 * `infrastructure/`, so the fixtures stay honest about what npm actually emits.
 */
function reportWithBraceExpansion(severity = 'high') {
  return {
    auditReportVersion: 2,
    vulnerabilities: {
      'brace-expansion': {
        name: 'brace-expansion',
        severity,
        isDirect: false,
        via: [
          {
            source: 1124334,
            name: 'brace-expansion',
            dependency: 'brace-expansion',
            title: 'brace-expansion: DoS via unbounded expansion length',
            url: braceExpansionAdvisory,
            severity,
            range: '<=5.0.7',
          },
        ],
        effects: [],
        range: '<=5.0.7',
        nodes: [braceExpansionNode],
        fixAvailable: true,
      },
    },
  };
}

function braceExpansionAllowance(overrides = {}) {
  return {
    advisory: braceExpansionAdvisory,
    package: 'brace-expansion',
    nodes: [braceExpansionNode],
    expires: '2026-10-31',
    reason: 'Bundled inside the aws-cdk-lib tarball and unreachable by overrides.',
    ...overrides,
  };
}

describe('evaluateAuditReport', () => {
  it('passes a report with no vulnerabilities at all', () => {
    const result = evaluateAuditReport({
      report: { auditReportVersion: 2, vulnerabilities: {} },
      allowances: [],
      today: '2026-07-26',
    });

    expect(result).toEqual({ failures: [], expired: [], unused: [] });
  });

  it('fails a high advisory that no allowance covers', () => {
    const result = evaluateAuditReport({
      report: reportWithBraceExpansion(),
      allowances: [],
      today: '2026-07-26',
    });

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toMatchObject({
      package: 'brace-expansion',
      advisory: braceExpansionAdvisory,
      severity: 'high',
      nodes: [braceExpansionNode],
    });
    expect(result.expired).toEqual([]);
    expect(result.unused).toEqual([]);
  });

  it('allows a high advisory covered by an unexpired allowance', () => {
    const result = evaluateAuditReport({
      report: reportWithBraceExpansion(),
      allowances: [braceExpansionAllowance()],
      today: '2026-07-26',
    });

    expect(result).toEqual({ failures: [], expired: [], unused: [] });
  });

  it('treats the expiry date itself as still covered', () => {
    const result = evaluateAuditReport({
      report: reportWithBraceExpansion(),
      allowances: [braceExpansionAllowance({ expires: '2026-10-31' })],
      today: '2026-10-31',
    });

    expect(result).toEqual({ failures: [], expired: [], unused: [] });
  });

  it('reports an expired allowance instead of silently covering the advisory', () => {
    const result = evaluateAuditReport({
      report: reportWithBraceExpansion(),
      allowances: [braceExpansionAllowance({ expires: '2026-10-31' })],
      today: '2026-11-01',
    });

    expect(result.expired).toHaveLength(1);
    expect(result.expired[0]).toMatchObject({
      advisory: braceExpansionAdvisory,
      package: 'brace-expansion',
      expires: '2026-10-31',
    });
    expect(result.failures).toEqual([]);
    expect(result.unused).toEqual([]);
  });

  it('reports an allowance that no longer matches any advisory', () => {
    const result = evaluateAuditReport({
      report: { auditReportVersion: 2, vulnerabilities: {} },
      allowances: [braceExpansionAllowance()],
      today: '2026-07-26',
    });

    expect(result.unused).toHaveLength(1);
    expect(result.unused[0]).toMatchObject({
      advisory: braceExpansionAdvisory,
      package: 'brace-expansion',
    });
    expect(result.failures).toEqual([]);
    expect(result.expired).toEqual([]);
  });

  it('fails when the advisory appears at a dependency path the allowance does not list', () => {
    const report = reportWithBraceExpansion();
    report.vulnerabilities['brace-expansion'].nodes = [
      braceExpansionNode,
      'node_modules/some-other-package/node_modules/brace-expansion',
    ];

    const result = evaluateAuditReport({
      report,
      allowances: [braceExpansionAllowance()],
      today: '2026-07-26',
    });

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].nodes).toContain(
      'node_modules/some-other-package/node_modules/brace-expansion',
    );
    expect(result.unused).toEqual([]);
  });

  it('ignores advisories below the high severity threshold', () => {
    const result = evaluateAuditReport({
      report: reportWithBraceExpansion('moderate'),
      allowances: [],
      today: '2026-07-26',
    });

    expect(result).toEqual({ failures: [], expired: [], unused: [] });
  });

  it('treats critical advisories the same as high ones', () => {
    const result = evaluateAuditReport({
      report: reportWithBraceExpansion('critical'),
      allowances: [],
      today: '2026-07-26',
    });

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].severity).toBe('critical');
  });

  it('reports the root advisory once rather than every package it flows through', () => {
    const report = reportWithBraceExpansion();
    report.vulnerabilities['brace-expansion'].effects = ['minimatch'];
    report.vulnerabilities.minimatch = {
      name: 'minimatch',
      severity: 'high',
      isDirect: false,
      via: ['brace-expansion'],
      effects: [],
      range: '*',
      nodes: ['node_modules/aws-cdk-lib/node_modules/minimatch'],
      fixAvailable: true,
    };

    const result = evaluateAuditReport({ report, allowances: [], today: '2026-07-26' });

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].package).toBe('brace-expansion');
  });

  it('rejects an allowance that is missing a required field', () => {
    const incomplete = braceExpansionAllowance();
    delete incomplete.expires;

    expect(() =>
      evaluateAuditReport({
        report: reportWithBraceExpansion(),
        allowances: [incomplete],
        today: '2026-07-26',
      }),
    ).toThrow(/expires/);
  });

  it('rejects an allowance whose expiry is not an ISO calendar date', () => {
    expect(() =>
      evaluateAuditReport({
        report: reportWithBraceExpansion(),
        allowances: [braceExpansionAllowance({ expires: '31/10/2026' })],
        today: '2026-07-26',
      }),
    ).toThrow(/YYYY-MM-DD/);
  });
});

describe('the recorded infrastructure exceptions', () => {
  const recordedAllowances = JSON.parse(
    readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../../config/audit-allowlist.json',
      ),
      'utf8',
    ),
  ).infrastructure;

  function viaEntry(url, range) {
    return {
      name: 'brace-expansion',
      dependency: 'brace-expansion',
      title: 'brace-expansion: DoS via stack exhaustion',
      url,
      severity: 'high',
      range,
    };
  }

  /** Shaped after the `npm audit --json --omit=dev` output seen on 2026-10-02. */
  const bundledBraceExpansionReport = {
    auditReportVersion: 2,
    vulnerabilities: {
      'brace-expansion': {
        name: 'brace-expansion',
        severity: 'high',
        isDirect: false,
        via: [
          viaEntry('https://github.com/advisories/GHSA-qhr7-859c-m2p7', '>=4.0.0 <5.0.11'),
          viaEntry('https://github.com/advisories/GHSA-6j4f-fj2g-mc7p', '>=4.0.0 <5.0.10'),
        ],
        effects: [],
        range: '4.0.0 - 5.0.11',
        nodes: [braceExpansionNode],
        fixAvailable: true,
      },
    },
  };

  it('clear the two bundled brace-expansion advisories while they are unexpired', () => {
    const result = evaluateAuditReport({
      report: bundledBraceExpansionReport,
      allowances: recordedAllowances,
      today: '2026-10-02',
    });

    expect(result).toEqual({ failures: [], expired: [], unused: [] });
  });

  it('expire within 30 days of being recorded', () => {
    expect(recordedAllowances).toHaveLength(2);

    for (const allowance of recordedAllowances) {
      expect(allowance.expires <= '2026-11-01').toBe(true);
    }
  });
});
