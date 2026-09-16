# Run the verification gate in tiers from one stage declaration, and hold CI to it

## Context

The full gate was `make ci`,
a list of make prerequisites that ran one after another.
It finished no cheap check before starting expensive work,
stopped at the first failure,
could not list its stages or re-run one,
and every check that needed dependencies installed them again.

Continuous integration ran the same checks by a different route:
`actions/setup-node` and `npm` directly,
with only the browser tests in a container.
The two agreed only by convention,
and CI did not run on pushes to `main`.
The local stack pulled its base images from Docker Hub
and published nginx on a fixed host port.

The Overboards pipeline works this repository unattended,
and its readiness assessment requires a gate that runs its cheap checks first and together,
exposes named stages with a diagnostic re-run,
offers no way past the cheap checks,
runs without a host language toolchain,
and is matched by CI.

## Decision

- **One declaration.**
  `scripts/lib/ci-stages.sh` lists every gate stage once:
  its name, tier, lane, make target and any dependency.
  `make ci` runs it, `make ci-stages` lists it,
  `make ci-stage STAGE="…"` runs one entry of it,
  and `tools/ci-gate/tests/ci-parity.test.js` holds CI to it.
- **Three tiers, lanes in parallel.**
  `prepare` makes the images and dependencies available,
  `cheap` runs every check needing no service, build or test suite,
  and `verify` runs the suites, the static export and what reads the export.
  A tier starts only once the one before it has passed.
  Stages that write the same artefacts share a lane and run in order;
  the app tests and the static export do,
  because both write under `projects/marketing`.
  The browser tests and the performance budget wait for the export,
  then run in parallel.
- **Every failure in a tier is reported together**,
  with the tail of each failed stage's log,
  and no argument, flag or environment variable leaves a tier out.
- **Silence is never a pass.**
  Each stage runs with standard input closed,
  because `docker compose run` reads it by default
  and would otherwise swallow the stage list its lane is reading,
  ending the lane early.
  A stage that records no result fails its tier with a `NOT RECORDED` line.
- **One stage on its own is a diagnostic, never a verdict.**
  `make ci-stage` runs the prepare tier, the stage's dependency and the stage,
  and says so when it starts.
- **POSIX `sh`.**
  The runner needs no language toolchain on the host,
  and runs inside the Node image where the tooling tests run.
- **Installs belong to the prepare tier.**
  `deps` fills the Compose volume and `deps-workspace` the working tree;
  no check target installs anything,
  so parallel checks never write the same `node_modules`.
  `make init` runs both, so focused checks work straight after it.
  `deps-workspace` first gives both dependency directories back to the invoking user,
  because Docker creates `projects/marketing/node_modules` on the host as root
  when Compose mounts the dependency volume on a fresh checkout.
  The Playwright image is not pulled in the prepare tier:
  `make e2e` pulls it on first use,
  so jobs that never run a browser do not download it.
- **CI calls the same make targets**,
  on pull requests and on pushes to `staging` and `main`.
  Each job prepares as the prepare tier does,
  the cheap jobs run in parallel,
  and the verify jobs need every cheap job.
  `deploy.yml` keeps its own Node set-up:
  it deploys and runs no check.
- **Images come from `public.ecr.aws/docker/library`**,
  pinned to a major version, with Node on the major CI runs.
  Playwright publishes no official image,
  so its own image stays, pinned to the `@playwright/test` version,
  because the browsers need its system libraries.
  `tools/ci-gate/tests/image-provenance.test.js` enforces both.
  CI's six check jobs authenticate to Amazon ECR Public with the
  `github-action-images` OIDC role before pulling,
  so their pulls draw on identified-client quota rather than the
  anonymous one a public registry refuses under load;
  `scripts/ensure-ci-images.sh` retries the Node image pull through
  `scripts/lib/tool-image.sh`'s existing bounded retry.
  Local runs stay anonymous and unauthenticated:
  the login happens only in the CI workflow, never inside `make ci-images`,
  so the target itself stays one implementation for both paths.
  `tools/ci-gate/tests/ci-images-authentication.test.js` enforces the CI side.
- **The local stack's host port is chosen by whoever starts it.**
  nginx publishes on `APP_HTTP_PORT`, default `80`,
  and `make urls` prints the address that follows from it,
  so two stacks on one machine need not contend for a port.
  The gate itself publishes no port.
- **Trade-offs accepted.**
  CI jobs build the app image and pull tool images
  instead of using the npm cache, which costs time on every run.
  A runner without Docker and Compose cannot run the checks.
  A declared stage waits for its dependency's recorded result,
  so a dependency must sit earlier in the same tier;
  the declaration tests enforce that.
