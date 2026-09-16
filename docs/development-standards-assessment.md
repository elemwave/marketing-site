# Development standards assessment

Assessed on 2026-09-16 against the standards published at
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

Every scored dimension meets its agreed level.

Remaining repository-requirement failures:

- There is no `.editorconfig` in the repository, and no checker verifies it.
- The development image's `Dockerfile` sets no non-root `USER`, so the tools
  run as root against the bind-mounted working tree and can leave root-owned
  files in it.

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
  `specs/features/` holds specifications for the home, contact, partnerships and
  legal pages, for site chrome, for search visibility, for security headers, and
  for staging and production deployment.
  `specs/decisions/` holds five topic records plus the directory index.
  `AGENTS.md` is present, and the project is worked by agents.
- D3 is neither agreed nor claimed: no document names an owner or source of
  truth, and the project keeps no improvement audit in `/IMPROVEMENTS.md` or on
  a delivery board.

### C — test coverage (C2)

- Agreed: C2 (50% of lines, 50% of files). Observed: C2.
- Evidence: Vitest with the v8 provider covers the app; a listing of `*.test.*`
  and `*.spec.*` files, excluding dependencies, is 40 files.
  Measured on 2026-09-09: 83.72% of lines, 82.47% of statements, 73.68% of
  functions, 83.33% of branches and 87.5% of files.
  `config/coverage-thresholds.json` pins the enforced thresholds just under
  each figure, with the measurement and its date beside them.
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
- Evidence: `projects/marketing/e2e/` holds `smoke.spec.ts` (the home page and
  the site's one interactive path, opening the booking dialog),
  `partnerships.spec.ts`, and `security-headers.spec.ts`.
  The `Browser tests` CI job runs them in Playwright's official image, pinned to
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
- Duplication budgets are per area in `duplication-budgets.json`. CDK assertion
  tests repeat their template shapes deliberately, which is why test areas carry
  their own budgets.

### S — security (S2)

- Agreed: S2. Observed: S2.
- Evidence: dependency updates come from a scheduled task rather than from
  Renovate or Dependabot.
  The delivery board named in `README.md § AI delivery board` carries the
  recurring card `EWM-1`, "Recurrent: Update patch, minor and security
  dependencies", which Overboards runs daily: it updates every declared
  dependency within its compatibility family, audits each ecosystem, takes the
  upgrade an open advisory requires, and files a card for each newer major.
  Neither bot is configured, and GitHub's automated security fixes are off.
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
  documents are uploaded, so for that window the CDN could answer the previous
  build under the new policy. Production is public
  (`specs/features/production-deployment/spec.md`,
  `specs/features/search-visibility/spec.md`).
  `infra/index.ts` `withPublishedHashes` and the deploy workflow's
  "Download the page documents currently published" step keep the hashes of the
  currently published documents in the new policy, which is the overlap the tree
  already has for that window.

### Y — deployment (Y2)

- Agreed: Y2. Observed: Y2.
- Evidence: `.github/workflows/deploy.yml` builds and publishes the site on
  every push to `staging` and `main`, authenticating through OIDC with no stored
  AWS credentials, and the infrastructure is defined with CDK in `infra/`.
  `infra/index.ts` selects production when `ENVIRONMENT` is `production`
  (`www.elemwave.com`, public, search indexing allowed) and staging otherwise.
  Production is specified in `specs/features/production-deployment/spec.md`.
  The workflow writes `version.json` into the published export and has a
  "Verify the deployed revision" step that reads that document back from the
  live site.
  Publication concurrency is `deploy-${{ github.ref_name }}`.
  For staging, a "Verify required SSM parameters" step gates the basic-auth
  parameters before deploy. Production takes no basic-auth parameters, so that
  step does not run there.

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
- The budget covers image and total weight as well as JavaScript. Recorded on
  2026-09-16: the export is 4,434,467 bytes, of which gzipped JavaScript is
  206,922 bytes, so a JavaScript-only budget would pass regardless of what the
  site actually weighs.

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
  `make ci`, `make ci-stage` and `make ci-stages` exist, so the project has a
  single command that runs the checks and a diagnostic that reprints one stage.
  `lint` accepts `FILES` and `test-infrastructure` accepts `PATHS`.
  `make urls` reprints the published addresses without restarting.
  A seed command is not required: the project loads no data.
- The development container has no `USER`, so the tools run as root against the
  bind-mounted working tree and can leave root-owned files in it.
- `.editorconfig` is absent, and no checker verifies it.
- The trunk is named `main`. `.github/workflows/ci.yml` and
  `.github/workflows/deploy.yml` treat `main` as the default-branch trunk that
  publishes production.
- Commit subjects carry the card's public key as a leading bracketed prefix
  (`[EWM-16] docs: …`), then a Conventional Commits subject, as
  `FRAMEWORK.local.md` § Card commit subjects requires.
- `.github/workflows/ci.yml` runs checks on pull requests and on push to
  `staging` and `main`. `.github/workflows/deploy.yml` publishes.
  Publication concurrency is `deploy-${{ github.ref_name }}`.
  Runner selection is configurable through `ACTIONS_RUNNER_TARGET` via
  `.github/actions/select-runner/action.yml`.
- Staging is excluded from search engines: the distribution sends
  `X-Robots-Tag: noindex, nofollow` and the whole environment is behind basic
  auth.
  Production is specified to be indexed
  (`specs/features/search-visibility/spec.md`).
  `projects/marketing/app/robots.ts` publishes a robots policy.
- `.claude/skills` is a symlink to `../.agents/skills`.

## Not applicable

- `I` — the site exposes no HTTP API.
  It is a static export (`output: "export"`), and booking is handed to
  Calendly's own popup modal (`specs/decisions/calendly-popup-modal-booking-dialog.md`);
  no route handler remains in the tree.
- `B` — the project retains no data of its own.
  The site is rebuilt from the repository on every deployment, the staging
  bucket is declared with a destroy removal policy and republished each time,
  and scheduling data is held by Calendly.

## Unresolved

None.
