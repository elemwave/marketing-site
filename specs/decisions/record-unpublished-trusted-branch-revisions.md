# Record unpublished trusted-branch revisions in the Deploy run list

## Context

A push to `staging` or `main` whose CI checks fail or are cancelled is never
published, correctly. But nothing recorded that outcome anywhere: `dispatch-deploy`
only runs once `ci` has succeeded, so a failed or cancelled trusted-branch run
left no trace in the Deploy workflow's own run list. A person comparing the
branch head with the last successful Deploy was the only way to notice the
environment had fallen behind, and by the time that comparison happens a
release can already have been promoted on the belief that the environment was
checked.

## Decision

`ci.yml`'s `record-unpublished` job dispatches `deploy.yml` with `mode: record`
whenever a trusted-branch push's `ci` job fails or is cancelled. `deploy.yml`
reports the unpublished revision to its step summary and exits before any
AWS, CDK, S3 or CloudFront step.

`dispatch-deploy` and `record-unpublished` are mutually exclusive by
construction: GitHub Actions implicitly ANDs `success()` onto any `if:`
naming no status-check function, so `dispatch-deploy`'s unchanged condition
already requires `ci` to have succeeded, and `record-unpublished`'s own `if:`
requires `needs.ci.result` to be `failure` or `cancelled`. A revision can
never be both published and recorded as unpublished for the same run.

That exclusivity is about which job dispatches `deploy.yml`, not about what
happens once it does. `deploy.yml`'s own `concurrency.group` is
`deploy-${{ github.ref_name }}-${{ inputs.mode }}`, scoped by `mode` as well
as branch: a record-mode run only writes a step-summary line and holds no
resource a later run needs to wait for, so it must never cancel a
publish-mode run still uploading to S3 or mid CDK deploy. Sharing one group
per branch would let a later commit's failed CI cancel an earlier commit's
still-running publish through `cancel-in-progress`, leaving staging mid-upload
with nothing to finish or roll it back — the opposite of what recording an
unpublished revision is for. Two publish-mode runs still share a group and
still cancel each other, unchanged from before this decision.

Rejected alternatives:

- **A new `publish` gating input on `deploy.yml`.** Reworking the trigger to
  gate publication itself would also gate the existing on-demand publication
  path (`workflow_dispatch` with no `mode`), breaking the ability to
  republish by hand documented in `infra/README.md`.
- **A separate recording workflow.** Keeping the unpublished record outside
  `deploy.yml`'s own run list would leave exactly the gap this decision
  exists to close: the card's evidence was that Deploy's run list already
  showed the CI conclusion but not the missing publication, so the record
  belongs there, not in a second place a reader has to know to check.
