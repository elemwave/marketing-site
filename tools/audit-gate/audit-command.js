/**
 * The `npm audit` invocation the gate runs.
 *
 * It names no `--omit`, `--only` or `--production` narrowing, so the report
 * covers every installed dependency, development tooling included: that tooling
 * runs on developer and CI machines.
 *
 * Node built-ins only, like the rest of the gate.
 */
export const NPM_AUDIT_ARGUMENTS = ['audit', '--json'];
