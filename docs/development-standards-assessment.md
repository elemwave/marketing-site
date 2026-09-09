# Development standards assessment

Assessed on 2026-08-28 against the standards published at
https://curipedia.aircury.net/development-standards

## Position

| Dimension                          | Code | Agreed | Observed | Outcome        |
| :--------------------------------- | :--- | :----- | :------- | :------------- |
| Code review                        | R    | R3     | R3       | Meets          |
| Documentation and specifications   | D    | D2     | D2       | Meets          |
| API contracts and interoperability | I    | —      | —        | Not applicable |
| Test coverage                      | C    | C2     | C2       | Meets          |
| E2E testing                        | E    | E2     | E2       | Meets          |
| Static analysis                    | L    | L2     | L2       | Meets          |
| Security                           | S    | S2     | S2       | Meets          |
| Deployment                         | Y    | Y2     | Y2       | Meets          |
| Observability                      | O    | O1     | O1       | Meets          |
| Backups and recovery               | B    | —      | —        | Not applicable |
| Performance                        | P    | P2     | P2       | Meets          |
| Uptime commitment                  | U    | U1     | U1       | Meets          |
| Support SLA                        | T    | T1     | T1       | Meets          |
| Accessibility and browser support  | A    | A2     | A2       | Meets          |

## Agreed levels below the published minimum

The agreed levels for `C`, `S`, `O`, `U` and `T` sit below the published
minimum for a production product (`C3 S3 O2 U2 T2`).
They are deliberate deviations, recorded in the `README.md` with the reason for
each one, and they are not gaps.
Every one of them is met at the level agreed, so none appears as a gap.

## Gaps

None: every dimension meets its agreed level.

## Dimensions that meet the agreed level

### R — code review (R3)

- Agreed: R3. Observed: R3.
- Evidence: `.github/CODEOWNERS` carries a single catch-all rule naming three
  handles, each verified to resolve.
  Branch protection on `main` and `staging` requires the `CI` status check and
  one approving review from a code owner, dismisses stale approvals, and blocks
  force pushes and deletions.
- `enforce_admins` is off, so this holds for contributors and not for the two
  repository administrators.

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

### C — test coverage (C2)

- Agreed: C2 (50% of lines, 50% of files). Observed: C2.
- Evidence: Vitest with the v8 provider covers the app; 46 tests across 8 files.
  Measured on 2026-09-09: 83.72% of lines, 82.47% of statements and 87.5% of
  files. `config/coverage-thresholds.json` pins the enforced thresholds just
  under each figure, with the measurement and its date beside them.
- Two gates enforce it in CI: Vitest's own thresholds for lines, statements,
  functions and branches, and `tools/coverage-files-gate` for the files half,
  which Vitest cannot express.
- The tests cover behaviour rather than markup: the booking dialog's escape
  handling, scroll lock and restore, the provider's context and its refusal to
  be used without one, and the software tabs. Each page section carries one
  rendering assertion, so a component that throws is caught without asserting
  presentational detail line by line.

### E — E2E testing (E2)

- Agreed: E2. Observed: E2.
- Evidence: `projects/marketing/e2e/smoke.spec.ts` opens the home page and
  completes the site's one interactive path, opening the booking dialog.
  The `Browser tests` CI job runs it in Playwright's official image, pinned to
  the same version as `@playwright/test`.
- The suite runs on a single worker against the built export served by
  `npm run start:export`, which applies the same headers the CDN sends and starts
  no file watcher. `make up-prod` runs the same command on the port `make up`
  uses, so the production bundle and the dev server share one address.

### L — static analysis (L2)

- Agreed: L2. Observed: L2.
- Evidence: the agreed level is recorded in the `README.md` commitment, and CI
  permits no errors from ESLint or the TypeScript check over the app and the
  infrastructure.
  Three shape gates hold the tree against recorded baselines: file size against
  an 800-line ceiling (`file-size-budgets.txt`, empty), duplication as a
  proportion per area (`duplication-budgets.json`), and complexity as counts per
  file per rule (`shape-lint-baseline.json`, empty).
- Each gate offers check, report and update; the file size gate adds the
  apply-drift verb, which the local gate runs and CI never does.
- `infra/test` records 45.68% duplication. CDK assertion tests repeat their
  template shapes deliberately, which is why test areas carry their own budgets.

### S — security (S2)

- Agreed: S2. Observed: S2.
- Evidence: `.github/dependabot.yml` covers both npm ecosystems and the GitHub
  Actions pins, and `dependabot_security_updates` is enabled.
  The `Audit` CI job runs `tools/audit-gate` over each ecosystem and fails on any
  high or critical advisory; an audit that cannot be run is a failure rather than
  a pass, and exceptions are versioned data in `config/audit-allowlist.json`
  pinned to an advisory identifier with a start date and an expiry. The allowlist
  is empty.
  `config/security-headers.json` is the single source for the header set, read by
  the CDN stack in `infra/index.ts`. The policy is enforcing, never report-only,
  and its `script-src` carries no `'unsafe-inline'`.
- The static export inlines Next's RSC payload, and a static file behind
  CloudFront cannot carry a per-response nonce, so `script-src` lists a
  `sha256-` hash for each inline script, collected from the built HTML at synth
  time.
- `style-src` keeps `'unsafe-inline'`: the standards allow a documented
  exception where the asset class cannot execute, and CSS cannot.
- Known limitation: because the policy names a hash per inline script, it is
  specific to one build's markup. A deployment updates the policy before the new
  documents are uploaded, so for that window the CDN answers the previous build
  under the new policy and its scripts are refused. Staging is behind basic auth
  and no production environment exists, so this is recorded rather than closed;
  it must be resolved before a public environment serves this policy.

### Y — deployment (Y2)

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

### O — observability (O1)

- Agreed: O1. Observed: O1.
- Evidence: CloudFront publishes `Requests`, `4xxErrorRate` and `5xxErrorRate`
  for the staging distribution, and each returned fourteen daily datapoints when
  checked on 2026-09-09 — production records errors and relevant operations.
  CloudWatch retains them without configuration: one-minute data for fifteen
  days, five-minute for sixty-three, one-hour for four hundred and fifty-five.
- The site is a static export with no process of its own, so there is nothing to
  start, stop or instrument beyond what the CDN reports.
- This rests on AWS defaults rather than on anything this repository declares.
  Nothing here would fail if the account stopped publishing them.
- Per-URL detail is not available: the metrics are per-distribution, so a rise in
  4xx is visible but the page causing it is not.

### P — performance (P2)

- Agreed: P2. Observed: P2.
- Evidence: `projects/marketing/performance-budget.json` records the scenario,
  three metrics and their numerical limits, with the measurement and its date
  beside them.
  `scripts/check-performance-budget.mjs` measures the export and fails the
  `Performance budget` CI job when a limit is exceeded; its own tests run
  alongside it.
  [`docs/performance-budget.md`](performance-budget.md) documents the metrics and
  what changing a limit means.
- The budget covers image and total weight as well as JavaScript: the export is
  8.3 MB, of which JavaScript is 203 kB, so a JavaScript-only budget would pass
  regardless of what the site actually weighs.

### U — uptime commitment (U1)

- Agreed: U1. Observed: U1.
- Evidence: the `README.md` states that no availability target is guaranteed and
  that availability is not measured.

### T — support SLA (T1)

- Agreed: T1. Observed: T1.
- Evidence: the `README.md` names the Elemwave Web Marketing board as the
  channel for reporting a problem, and states that no response time is
  guaranteed.

### A — accessibility and browser support (A2)

- Agreed: A2. Observed: A2.
- Evidence: `browserslist` in `projects/marketing/package.json` declares Chrome
  and Edge 111, Firefox 128 and Safari 16.4, and every spec runs across
  `chromium`, `firefox`, `webkit` and `mobile-chromium`.
  [`docs/browser-support.md`](browser-support.md) records the list.
- The declared list is wider than the tested set in one respect: it names version
  floors, and the suite runs whichever version the pinned image ships. That
  difference is recorded where the list is declared, as the standards require.

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
  Dependabot's own commits carry no card reference at all: it writes its own
  subjects and cannot append one. This is an accepted permanent exception rather
  than a gap.
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
