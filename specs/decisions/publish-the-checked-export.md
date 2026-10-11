# Publish the export CI already checked, not a second build

## Context

CI's `app` job builds a static export of the marketing site and runs the
browser journeys and the performance budget against it. Deploy then built
its own copy of the same source on a different runner and published that
copy. A green CI run described a sibling of the published site, not the
published site itself: a difference between the two builds, including a
difference in the inline scripts the content policy admits by hash, could
reach the pre-production copy or the public site without the export checks
having seen it.

## Decision

- **Deploy publishes the export CI already checked, and does not rebuild
  the site.** The CI `app` job uploads `projects/marketing/out` as a
  GitHub Actions artefact, `checked-site-export-<sha>`, once `make e2e` and
  `make performance-budget` have passed against it, and only on a push to
  `staging` or `main`. `deploy.yml` downloads that artefact into
  `projects/marketing/out` instead of installing the site's dependencies
  and building it again.
- **A missing or mismatched artefact fails closed.** Deploy resolves the CI
  run that produced the artefact — from an explicit run id passed at
  dispatch, or otherwise the most recent completed successful `push` run of
  `ci.yml` for the SHA being deployed — and refuses to continue unless that
  run's head commit matches and its conclusion is success. It does not fall
  back to building the site itself.
- **On-demand dispatch resolves the most recent completed successful `push`
  CI run for the SHA.** Automatic dispatch already carries the run id that
  produced the artefact. An operator dispatching deploy with only a SHA
  gets the same guarantee: the artefact must come from a `push` run (never
  a pull-request run) that actually verified that SHA.
- **The artefact's retention bounds on-demand republication.** It is kept
  for 7 days, matching the Playwright report the same job already uploads.
  Publishing a SHA whose artefact has expired fails; recreating it means
  re-running CI for that SHA so the export checks run again.
- **Node stays on the deploy runner for infrastructure synthesis only.**
  `infra/` still runs `npm ci` and `npx cdk`; the site no longer needs a
  Node toolchain there.

## Consequences

Deploy needs `actions: read` to download another workflow run's artefact,
and no longer needs the site's dependencies or `npm run build`. The
content-policy hasher and the live-revision check are unaffected: both
still read `projects/marketing/out`, which is now the downloaded export
plus the revision marker stamped at publication time.
