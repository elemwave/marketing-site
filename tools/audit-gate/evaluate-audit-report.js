/**
 * Decides whether an `npm audit --json` report clears the vulnerability gate,
 * given the exceptions recorded in `config/audit-allowlist.json`.
 *
 * Pure: no filesystem, no process, no clock. The caller supplies the report,
 * the allowances for its ecosystem, and today's date.
 */

const BLOCKING_SEVERITIES = new Set(['high', 'critical']);
const ISO_CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED_ALLOWANCE_FIELDS = ['advisory', 'package', 'nodes', 'expires', 'reason'];

/**
 * A malformed allowlist is a configuration mistake, not a vulnerability, so it
 * throws rather than being folded into the gate's findings.
 */
function assertWellFormedAllowance(allowance, index) {
  for (const field of REQUIRED_ALLOWANCE_FIELDS) {
    if (allowance[field] === undefined) {
      throw new Error(`Allowance ${index} is missing the required field "${field}".`);
    }
  }

  if (!Array.isArray(allowance.nodes) || allowance.nodes.length === 0) {
    throw new Error(
      `Allowance ${index} ("${allowance.package}") must list at least one node path.`,
    );
  }

  if (!ISO_CALENDAR_DATE.test(allowance.expires)) {
    throw new Error(
      `Allowance ${index} ("${allowance.package}") has expiry "${allowance.expires}"; ` +
        'expected an ISO calendar date in YYYY-MM-DD form.',
    );
  }
}

/**
 * Flattens the report into one finding per blocking advisory.
 *
 * A vulnerability whose `via` entries are all package names is a downstream
 * effect of another entry that is reported in its own right, so listing it
 * again would report a single root cause several times over.
 */
function collectBlockingFindings(report) {
  const findings = [];

  for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
    for (const via of vulnerability.via ?? []) {
      if (typeof via === 'string' || !BLOCKING_SEVERITIES.has(via.severity)) {
        continue;
      }

      findings.push({
        package: vulnerability.name,
        advisory: via.url,
        title: via.title,
        severity: via.severity,
        range: via.range,
        nodes: vulnerability.nodes ?? [],
      });
    }
  }

  return findings;
}

function describesSameAdvisory(allowance, finding) {
  return allowance.advisory === finding.advisory && allowance.package === finding.package;
}

/**
 * Every path the advisory was found at must be listed. A vulnerable package
 * reaching the tree through a new parent is a new exposure, and inherits an
 * exception nobody reviewed if path coverage is not checked.
 */
function coversEveryPath(allowance, finding) {
  return finding.nodes.every((node) => allowance.nodes.includes(node));
}

export function evaluateAuditReport({ report, allowances, today }) {
  allowances.forEach(assertWellFormedAllowance);

  const findings = collectBlockingFindings(report);
  const failures = [];
  const expired = [];

  for (const finding of findings) {
    const allowance = allowances.find(
      (candidate) =>
        describesSameAdvisory(candidate, finding) && coversEveryPath(candidate, finding),
    );

    if (!allowance) {
      failures.push(finding);
      continue;
    }

    if (today > allowance.expires) {
      expired.push({ ...finding, expires: allowance.expires, reason: allowance.reason });
    }
  }

  const unused = allowances.filter(
    (allowance) => !findings.some((finding) => describesSameAdvisory(allowance, finding)),
  );

  return { failures, expired, unused };
}
