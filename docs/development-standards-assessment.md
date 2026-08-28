# Development standards assessment

Assessed on 2026-08-28 against the standards published at
https://curipedia.aircury.net/development-standards

## Position

| Dimension                          | Code | Agreed | Observed | Outcome        |
| :--------------------------------- | :--- | :----- | :------- | :------------- |
| Code review                        | R    | R3     | R1       | Short          |
| Documentation and specifications   | D    | D2     | D2       | Meets          |
| API contracts and interoperability | I    | —      | —        | Not applicable |
| Test coverage                      | C    | C2     | Below C1 | Short          |
| E2E testing                        | E    | E2     | E1       | Short          |
| Static analysis                    | L    | L2     | Below L1 | Short          |
| Security                           | S    | S2     | Below S1 | Short          |
| Deployment                         | Y    | Y2     | Y1       | Short          |
| Observability                      | O    | O1     | Below O1 | Short          |
| Backups and recovery               | B    | —      | —        | Not applicable |
| Performance                        | P    | P2     | P1       | Short          |
| Uptime commitment                  | U    | U1     | Below U1 | Short          |
| Support SLA                        | T    | T1     | Below T1 | Short          |
| Accessibility and browser support  | A    | A2     | A1       | Short          |

## Agreed levels below the published minimum

The agreed levels for `C`, `S`, `O`, `U` and `T` sit below the published
minimum for a production product (`C3 S3 O2 U2 T2`).
They are deliberate deviations, recorded in the `README.md` with the reason for
each one, and they are not gaps.
The distances recorded below are measured against the agreed level, not against
the published minimum.

## Gaps

### R — code review

- Agreed: R3. Observed: R1.
- Evidence: the repository has no branch protection —
  `GET /repos/elemwave/website/branches/master/protection` returns 404 —
  so direct pushes are permitted.
  There is no `CODEOWNERS` file and no pull request template.
- To close: protect the trunk with required status checks and one required
  approval, add a catch-all `CODEOWNERS` rule with a handle verified to resolve,
  and add a pull request template that asks for the change, the problem behind
  it, how it was verified, and notes for the reviewer.
  R3 also depends on CI existing to be required, which is the `L` gap below.

### C — test coverage

- Agreed: C2 (50% of lines, 50% of files, enforced in CI). Observed: below C1.
- Evidence: `projects/marketing` declares no test runner and contains no tests.
  `infra` has Jest with three specs
  (`infra/test/edge-function.test.ts`, `infra/test/staging-site-stack.test.ts`),
  but no workflow runs them and no coverage is measured or enforced anywhere.
- To close: add a test runner to the marketing app, run both suites in CI, and
  report coverage with the C2 thresholds enforced.
  The standards pin the enforced threshold just below the measured coverage and
  record the measurement and its date beside it.

### E — E2E testing

- Agreed: E2 (one browser smoke test in CI). Observed: E1.
- Evidence: no Playwright or Cypress configuration exists;
  `.gitignore` anticipates Playwright output but no suite is present.
- To close: add one browser test that opens the site and completes a primary
  interaction — opening the booking dialog is the obvious candidate — and run it
  in CI.
  The suite starts the server in the mode CI runs it in, without the file
  watcher.

### L — static analysis

- Agreed: L2 (documented level, no errors in CI). Observed: below L1.
- Evidence: ESLint 9 is configured for the marketing app
  (`projects/marketing/eslint.config.mjs`, `eslint-config-next` core web vitals
  and TypeScript) and `make lint` runs it,
  but the only workflow in `.github/workflows/` is the staging deployment,
  so no analyser runs in CI.
  The TypeScript compiler is not wired for the marketing app at all;
  `infra` has `tsc --noEmit` under `npm run build`, also unrun in CI.
  None of the three shape gates L2 requires — file size, duplication,
  complexity — exists.
- To close: add a CI workflow that runs ESLint and the type check on pull
  requests and on the trunk, permitting no errors, record the agreed level, and
  add the shape gates against recorded baselines.

### S — security

- Agreed: S2. Observed: below S1.
- Evidence: neither npm ecosystem (`projects/marketing`, `infra`) has Dependabot,
  Renovate, or an equivalent configured, and no workflow audits dependencies,
  so a vulnerable dependency does not block a merge.
  The deployment job does declare least-privilege `permissions` and uses OIDC.
  The staging distribution sends `Strict-Transport-Security`,
  `X-Content-Type-Options`, `X-Frame-Options` and a referrer policy
  (`infra/index.ts`), but no `Content-Security-Policy`.
  Third-party actions are pinned to major tags (`@v7`) rather than exact
  versions.
- To close: configure automated dependency updates for both ecosystems (S1);
  add an audit gate that fails the build on a finding and treats an audit that
  could not run as a failure rather than a pass, with any exception recorded as
  versioned data carrying an advisory identifier and an expiry (S2);
  and add an enforcing `Content-Security-Policy`, which S2 requires.
  The static export publishes no per-response nonce, so the policy needs either
  build-time hashes for the inline bootstrap or an edge function that can set
  one.

### Y — deployment

- Agreed: Y2. Observed: Y1.
- Evidence: `.github/workflows/deploy-staging.yml` builds and publishes the site
  on every push to `staging`, authenticating through OIDC with no stored AWS
  credentials, and the infrastructure is defined with CDK in `infra/`.
  Nothing publishes or verifies which revision is deployed: the site exposes no
  version or health document, and the workflow performs no post-deployment
  check.
  No production environment exists.
  The required deployment parameters are read from Parameter Store during the
  run rather than checked for presence and non-emptiness by a gate before it.
- To close: publish the built commit with the site, verify that value after
  deployment, and gate the workflow on the required parameters being present and
  non-empty.

### O — observability

- Agreed: O1 (production records errors, starts, stops, and relevant
  operations). Observed: below O1.
- Evidence: the site is a static export and emits nothing of its own.
  The CDK stack configures no access logging on the distribution or the bucket,
  so no record of production activity is kept anywhere.
- To close: enable distribution access logging with an explicit retention
  period.
  A log group left to be created implicitly never expires, so the retention is
  set rather than defaulted.

### P — performance

- Agreed: P2. Observed: P1.
- Evidence: no bundle size budget or other numerical performance limit is
  declared or checked; the build produces no size report.
- To close: record a bundle size budget for the static export and fail CI when
  it is exceeded.
  The standards name this as the minimum example of a performance budget.

### U — uptime commitment

- Agreed: U1. Observed: below U1.
- Evidence: U1 requires the `README.md` to state that no availability target is
  guaranteed. It does not say so.
  The position that nothing is agreed came from the person who invoked this run,
  not from the repository.
- To close: state in the `README.md` that no availability target is guaranteed.

### T — support SLA

- Agreed: T1. Observed: below T1.
- Evidence: T1 requires a documented contact channel.
  The site publishes contact details on its own contact page, but the repository
  documents no channel for reporting a problem with the project.
  The position came from the person who invoked this run, not from the
  repository.
- To close: name the support contact channel in the `README.md`.

### A — accessibility and browser support

- Agreed: A2. Observed: A1.
- Evidence: no supported browser or version list is declared —
  `projects/marketing/package.json` has no `browserslist` key and no matrix is
  documented — and no automated test covers one.
- To close: declare the supported browser and version list, and cover it with
  the browser test the `E` gap introduces.
  Where the declared list is wider than the set the tests run on, the standards
  require that difference to be recorded where the list is declared.

## Dimensions that meet the agreed level

### D — documentation and specifications (D2)

- Agreed: D2. Observed: D2.
- Evidence: `README.md` explains the requirements, first-time setup, the
  day-to-day commands, the architecture, the deployment, and how to contribute.
  `specs/features/` holds specifications for the home, contact and partnerships
  pages and for the staging deployment.
  `specs/decisions/` holds five ADRs.
  `AGENTS.md` is present, and the project is worked by agents.
- D3 is neither agreed nor claimed: no document names an owner or source of
  truth, and the project keeps no improvement audit in `/IMPROVEMENTS.md` or on
  a delivery board.

## Repository requirements

These requirements apply to every repository and are not scored as dimension
levels.

- `README.md` is present and explains installation, startup, the day-to-day
  commands, the architecture, and how to contribute.
- `Makefile` is present, and a bare `make` lists the targets with descriptions.
  `make up` and `make init` exist.
  There is no `make ci`, so the project offers no single command that runs the
  checks, and no narrowed form of any check over a named set of files.
  There is no command that reprints the published addresses without restarting.
  A seed command is not required: the project loads no data.
- The development container has no `USER`, so the tools run as root against the
  bind-mounted working tree and can leave root-owned files in it.
- `.editorconfig` is absent, and no checker verifies it.
- The trunk is named `master`; the standards require `main`.
- Commit subjects carry the card reference at the front
  (`ELEM-15 | feat(site): …`) rather than in square brackets at the end
  (`feat(site): … [ELEM-15]`).
- No workflow runs any check on a pull request or on the trunk; the only
  workflow is the staging deployment.
  Its `concurrency.group` is the fixed string `deploy-staging` rather than a
  group derived from the branch, and runner selection is not configurable
  through `ACTIONS_RUNNER_TARGET`.
- Staging is excluded from search engines: the distribution sends
  `X-Robots-Tag: noindex, nofollow` and the whole environment is behind basic
  auth.
  The intention to have the production site indexed is not recorded anywhere,
  and the site publishes no `robots.txt`.
- `specs/decisions/ADR-0001` carries `Status: Superseded` and a
  `Superseded by:` marker.
  The standards hold that exactly one ADR states any given position, that an ADR
  carries no status, and that one whose decision no longer applies is deleted
  rather than marked.
- The agent skills under `.agents/skills/` and `.claude/skills/` are duplicated
  directories of real files.
  The standards require the Claude copies to be symlinks.

## Not applicable

- `I` — the site exposes no HTTP API.
  It is a static export (`output: "export"`), and the booking route handlers
  described in ADR-0001 were superseded by the embedded Calendly widget
  (ADR-0002); no route handler remains in the tree.
- `B` — the project retains no data of its own.
  The site is rebuilt from the repository on every deployment, the staging
  bucket is declared with a destroy removal policy and republished each time,
  and scheduling data is held by Calendly.

## Unresolved

None.
