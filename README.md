# Elemwave Website

Marketing website for Elemwave,
built with [Next.js](https://nextjs.org/) 16, React 19, TypeScript and Tailwind CSS 4.
The app lives in [`projects/marketing/`](./projects/marketing) and runs in Docker behind an nginx reverse proxy.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) with the Compose plugin
- GNU Make

No local Node.js installation is needed;
all npm commands run inside the app container.

## First-time setup

1. Build the image, install dependencies and start the containers:

   ```sh
   make init
   ```

2. Open http://test.localhost.elemwave.com in your browser.

The dev server runs with hot reload;
changes under `projects/marketing/` are picked up automatically.

## Day-to-day commands

Run `make help` for the full list. The most useful targets:

| Command          | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `make up`        | Start containers (detached)                          |
| `make stop`      | Stop containers                                      |
| `make logs`      | Follow container logs (`c=app` for a single service) |
| `make bash`      | Open a shell in the app container                    |
| `make install`   | Install dependencies (`npm ci`)                      |
| `make lint`      | Lint the app                                         |
| `make test`      | App and infrastructure tests                         |
| `make app-build` | Static export of the app (`projects/marketing/out`)  |
| `make ci`        | The full verification gate (see [Verification](#verification)) |
| `make rm`        | Stop and remove containers and volumes               |

The stack publishes nginx on host port 80.
When that port is taken, choose another with `APP_HTTP_PORT`,
for example `make up APP_HTTP_PORT=8081`;
`make urls` reprints the address that follows from it.

## Verification

Every check runs inside a container as the invoking user,
so Docker with the Compose plugin and GNU Make are the only prerequisites.
Checks read the dependencies `make init` installs.
On a checkout that has not run it, prepare them first:

```sh
make ci-images deps deps-workspace
```

### Focused checks

| Command                                          | What it checks                                     | Narrowing                                         |
| ------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------- |
| `make lint FILES="a.tsx b.tsx"`                  | ESLint over the app                                | `FILES` names app files                           |
| `make typecheck`                                 | TypeScript, app and infrastructure                 | None: the compiler checks whole projects          |
| `make test-app`                                  | App and tooling tests with the coverage gates      | None: coverage is measured over the whole suite   |
| `make test-infrastructure PATHS=test/x.test.ts`  | Infrastructure tests                               | `PATHS` names test files                          |
| `make shape-size`                                | File size against the 800-line ceiling             | None: the rule is over the whole tree             |
| `make shape-duplication`                         | Duplication against the per-area budgets           | None: duplication is measured across the tree     |
| `make shape-complexity`                          | Complexity against the recorded counts             | None: the baseline covers the whole tree          |
| `make audit`                                     | High and critical dependency advisories            | None: advisories apply to whole lockfiles         |
| `make app-build`                                 | The static export (`projects/marketing/out`)       | None                                              |
| `make e2e`                                       | Browser tests across the supported browsers        | Run `make app-build` first                        |
| `make performance-budget`                        | The static export against the performance budget   | Run `make app-build` first                        |

### The full gate

`make ci` runs every check CI runs,
in three tiers declared once in `scripts/lib/ci-stages.sh`:

1. **prepare**: the Node image, the app image and the dependencies
   (the browser tests pull their own image when they first run);
2. **cheap**: lint, type-check, file size, duplication, complexity and audit, all in parallel;
3. **verify**: the app tests then the static export, the infrastructure tests beside them,
   then the browser tests and the performance budget, which read the export.

A tier starts only once the tier before it has passed,
and every failure in a tier is reported together
with the tail of each failed stage's log.
No argument, flag or environment variable leaves a tier out.
The gate prints where it keeps each stage's full log.
Stages run with standard input closed,
so a stage that reads it cannot cut its lane short,
and a stage that records no result fails its tier rather than passing unnoticed.
Before installing, `deps-workspace` gives the dependency directories back to the invoking user,
because Docker creates `projects/marketing/node_modules` as root
when Compose mounts the dependency volume on a fresh checkout.

`make ci-stages` lists the stages by the names the gate prints.
`make ci-stage STAGE="Lint"` re-runs one of them,
after the prepare tier and the stage's own dependency, in the gate's environment.
That is a diagnostic only, never a verification verdict:
only `make ci` answers whether a tree passes.

**No check is left to CI alone.**
Every check CI runs, `make ci` runs, through the same make targets and containers,
and `tools/ci-gate/tests/ci-parity.test.js` keeps the two aligned.
The [Deploy staging](./.github/workflows/deploy-staging.yml) workflow
publishes the site and runs no check, so it keeps its own Node set-up.

**Images.**
Official images come from `public.ecr.aws/docker/library`,
pinned to a major version, with Node on the major CI runs.
The browser tests use Playwright's own image,
pinned to the `@playwright/test` version:
Playwright publishes no official image,
and the browsers need the system libraries its image carries.

## Architecture

- **app** — Next.js dev server (`npm run dev`) on port 3000, with `projects/marketing/` bind-mounted into the container and `node_modules` kept in a named volume.
- **nginx** — reverse proxy listening on port 80, serving `test.localhost.elemwave.com` and proxying to the app (including WebSocket upgrades for HMR).

The app declares that hostname in `allowedDevOrigins`
([`projects/marketing/next.config.ts`](./projects/marketing/next.config.ts))
so the Next.js dev server accepts requests proxied from it.

The [`Dockerfile`](./Dockerfile) provides the `base` target Compose uses for development.
There is no production image:
the site is a static export (`output: "export"`),
served from S3 behind CloudFront.

## Deployment

Pushing to the `staging` branch publishes the site to
`https://staging.elemwave.com` once [CI](./.github/workflows/ci.yml) passes:
its final job dispatches the
[Deploy staging](./.github/workflows/deploy-staging.yml) workflow
for the commit it verified.
A revision that fails CI is never published.
Staging is behind shared basic auth credentials and is excluded from search engines.

The AWS resources are defined with CDK in [`infra/`](./infra);
its [README](./infra/README.md) holds the one-off setup runbook.

## AI delivery board

Work on this project is queued and delivered on a Boards board of its own.
There is one board, so every run targets it; there is no target to choose.

| What     | Value                                                    |
| -------- | -------------------------------------------------------- |
| Board    | `https://boards.aircury.net/b/elemwave-marketing-dev-ai` |
| API base | `https://api.boards.aircury.net`                         |
| Token    | Environment variable `ELEMWAVE_MARKETING_DEV_AI_TOKEN`   |
| Cards    | Public keys `EWM-<number>`                               |

The board's **Backlog** column is the canonical backlog for known defects,
improvements and development-standards follow-up work.
New actionable findings are filed through the `overboards-add-card` skill,
which checks the board before creating a duplicate.
This board is the delivery queue, not the place to report a problem with the
site: that is the support board named under
[Support and availability](#support-and-availability).

**Overboards** — the delivery pipeline, which lives in its own repository,
[`aircury/overboards`](https://github.com/aircury/overboards) —
works the board one card and one stage per run,
from **Discovery** through to **Merged to staging**,
pausing at **QA**, where a person tries the change before the pipeline resumes.
Everything shared between those stages — the pipeline columns, blocking a card
while a stage holds it, escalation, declining a card, time logging and the
artefacts each stage attaches — is defined once in that repository.
What follows is only what the pipeline reads from this project.

The shared agent skills, the `overboards-*` helpers among them, mount at
`.agents/skills` as a submodule tracking `aircury/shared-agent-skills`.
Bring them up to date with `git submodule update --remote .agents/skills`
and commit the pointer change like any other change.

### Branches

The integration branch is `staging`.
Each card is implemented on `ai/<card public key>`, cut from `staging`,
and lands back there, so the staging deployment described under
[Deployment](#deployment) is where finished cards first run.
When the remote carries no `staging`, the first stage that needs it creates it
from `main`; that is a resting state, not a fault.
After a card lands, the merge stage maintains the single release pull request
from `staging` to `main`.

### What the pipeline reads from this project

| What a stage asks for          | This project's answer                                                                                                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The governing standards        | [`FRAMEWORK.md`](./FRAMEWORK.md), with project rules in [`FRAMEWORK.local.md`](./FRAMEWORK.local.md)                                                                                   |
| The full verification gate     | `make ci` from the repository root. Every check must pass, not only the changed layer's. `make ci-stages` lists its stages; `make ci-stage STAGE="…"` re-runs one as a diagnostic, never a verdict                                                                                                |
| Targeted checks                | The focused checks under [Verification](#verification): `make lint FILES="…"`, `make typecheck`, `make test-app`, `make test-infrastructure PATHS=…`, the shape checks, `make audit`, and `make e2e` or `make performance-budget` after `make app-build` |
| Where a systemic lesson lands  | `FRAMEWORK.local.md`, inside the section already covering the topic                                                                                                                   |
| Card commit subjects           | `[EWM-<number>] type(scope): description`, as `FRAMEWORK.local.md § Card commit subjects` states |
| The canonical behaviour record | `specs/features/`, alongside `specs/decisions/` (one consolidated record per decision, edited in place) and `specs/ui/`                                                                |
| Where the pipeline itself lives | The [`aircury/overboards`](https://github.com/aircury/overboards) repository, not this one                                                                                           |

**The gate is judged by its own exit status.**
Piping its output reports the pipe's status instead, which turns a red gate
green. Redirect to a log and record make's status:
`make ci > gate.log 2>&1; echo "GATE_EXIT=$?" >> gate.log`.

**`FRAMEWORK.md` is framework-managed and is never edited by a stage.**
A lesson about this repository goes to `FRAMEWORK.local.md`.

### The token

The token is operator configuration, not application configuration:
export it in the environment the agent runs in.
Nothing in the site or the infrastructure reads it,
so it never belongs in an `.env` file and is never committed.

It is a Boards API token scoped to this one board,
issued from **Manage tokens** by somebody with contributor or administrator
authority on it, using the **Unattended contributor** shortcut, which grants
exactly these fourteen capabilities:
`board:read`, `card:read`, `card:create`, `card:update`,
`comment:create`, `comment:update`, `comment:delete`, `attachment:read`,
`attachment:create`, `attachment:delete`, `checklist:write`,
`checklist:delete`, `time-entry:read` and `time-entry:write`.
The canonical statement of that grant is `reference/target-and-board.md`
in the Overboards repository, and this list must agree with it.

Grant comparison: not yet recorded against the fourteen capabilities above.
Compare the issued token's capabilities with that list,
then replace this paragraph with who confirmed the match and on what date.
Record a new comparison here whenever the token is reissued.

A token grants no more than its issuer holds on the board at the moment of the
request, so removing or demoting that person stops every write with nothing
revoked. Its expiry is terminal and nothing warns beforehand:
keep the expiry in a diary and issue a replacement before it lapses.

### Registration

The project maintainer registers this project with the Overboards runner;
this repository records what that registration says, not the registration itself.
An explicit value is decided for this project.
An inherited one takes the runner's documented default.

| Fact                          | Value                                                         | Source                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository                    | `git@github.com:elemwave/marketing-site.git`                  | Explicit                                                                                                                                                                            |
| API base                      | `https://api.boards.aircury.net`                              | Explicit                                                                                                                                                                            |
| Board slug                    | `elemwave-marketing-dev-ai`                                   | Explicit                                                                                                                                                                            |
| Board token variable          | `ELEMWAVE_MARKETING_DEV_AI_TOKEN`                             | Explicit                                                                                                                                                                            |
| Merge token variable          | `BOARDS_GH_TOKEN`                                             | Explicit. The runner's shared GitHub token: its grant must include write access to this repository and to `aircury/shared-agent-skills`, and every registration reusing it receives its whole repository grant |
| Integration branch            | `staging`                                                     | Explicit                                                                                                                                                                            |
| Autonomous scheduling         | `true`                                                        | Explicit                                                                                                                                                                            |
| Application stack             | `true`                                                        | Explicit. `make init` prepares it                                                                                                                                                   |
| Stages                        | The runner's shared standard declaration                      | Inherited. The nineteen-column pipeline                                                                                                                                             |
| Coding agent                  | The runner's default                                          | Inherited until the maintainer chooses one at registration                                                                                                                          |
| Verification stack            | `false`                                                       | Explicit. The gate prepares no environment ahead of time, and there is no `make warm-gate`                                                                                          |
| Card continuity               | `false`                                                       | Inherited                                                                                                                                                                           |
| Worker environment variables  | None                                                          | Explicit                                                                                                                                                                            |

## Project structure

```
projects/
  marketing/ Next.js app (pages, components, styles)
infra/       AWS CDK definitions for the staging environment
docker/      nginx configuration
specs/       Living specifications and style guide
docs/        Framework capability docs
```

## Support and availability

No availability target is guaranteed for this site.
There are no defined maintenance windows, and availability is not measured.

Report a problem with this project on the
[Elemwave Web Marketing board](https://boards.aircury.net/b/elemwave-web-marketing).
No response time is guaranteed.

## Contributing

This repository follows the Aircury engineering framework —
read [FRAMEWORK.md](./FRAMEWORK.md) before making changes.
Canonical behaviour specs live in `specs/features/`.

<!-- development-standards:begin -->

## Development standards

This project is assessed against
[Aircury's development standards](https://curipedia.aircury.net/development-standards).
It is a production product: a public marketing site for Elemwave.

Commitment: `R3 D2 C2 E2 L2 S2 Y2 O1 P2 U1 T1 A2`

Observed: `R3 D2 C2 E2 L2 S2 Y2 O1 P2 U1 T1 A2`.
Every dimension meets its agreed level.

Not applicable:

- `I` — the site exposes no HTTP API.
  It is a static export, and booking is handed to Calendly's own popup modal
  ([`specs/decisions/calendly-popup-modal-booking-dialog.md`](./specs/decisions/calendly-popup-modal-booking-dialog.md)).
- `B` — the project retains no data of its own.
  The site is rebuilt from the repository on every deployment, the staging
  bucket is republished each time, and scheduling data is held by Calendly.

Agreed below the published minimum for a production product (`C3 S3 O2 U2 T2`):
`C`, `S`, `O`, `U` and `T`.
These are deliberate deviations rather than gaps:

- `C` — C2. The site is presentational: content and layout with no backend
  behaviour, so most of what a C3 bar would cover is markup.
- `S` — S2. No authentication, no data of our own and no backend; S2 is the
  floor the standards set for any repository where security applies.
- `O` — O1. There is no server process to instrument: the site is a static
  export, so distribution access logs are the whole of what production
  activity there is to record.
- `U` — U1. No availability target has been agreed with Elemwave.
- `T` — T1. No support response times have been agreed.

Assessed on 2026-08-28 — see
[docs/development-standards-assessment.md](./docs/development-standards-assessment.md).

<!-- development-standards:end -->
