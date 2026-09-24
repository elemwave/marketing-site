# Record unpublished trusted-branch revisions in the Deploy run list

A push to `staging` or `main` that fails or is cancelled in CI left no
trace anywhere in the Deploy workflow's own run list: `dispatch-deploy`
only fires once `ci` has succeeded, so the environment kept serving its
last publication with nothing recording that a newer revision existed
and was never published. A person could only notice the lag by
comparing the branch head against the last successful Deploy run by
hand.

`ci.yml` gains a `record-unpublished` job, parallel to `dispatch-deploy`
and sharing its `needs: [ci]`. It dispatches `deploy.yml` with
`mode: record` whenever `ci` fails or is cancelled on a trusted-branch
push (`needs.ci.result == 'failure' || needs.ci.result == 'cancelled'`,
wrapped in `always()` so it still runs when `ci` itself did not run to
completion). `deploy.yml` gains a `mode` choice input (`publish`, the
default, or `record`): in `record` mode it reports the unpublished
revision to its own step summary and every step that touches AWS, CDK,
S3 or CloudFront is skipped, via a shared `&publish_only` anchor
(`${{ inputs.mode == 'publish' }}`) applied to each of them.

`dispatch-deploy` and `record-unpublished` are mutually exclusive by
construction, not by an explicit check against each other. GitHub
Actions implicitly prepends `success()` to any `if:` that names no
status-check function, so `dispatch-deploy`'s condition — unchanged by
this decision — already only evaluates true once `ci` has succeeded;
`record-unpublished`'s condition requires the opposite outcome. A
revision is therefore never both published and recorded as unpublished.

`deploy.yml`'s `concurrency.group` is scoped by `mode` as well as
branch (`deploy-${{ github.ref_name }}-${{ inputs.mode }}`). A
record-mode dispatch only writes a step-summary line and holds no
resource a later run needs to wait for; sharing one group per branch
would let a later commit's failed CI cancel an earlier commit's
still-running publish through `cancel-in-progress`, leaving the
environment mid-upload with nothing to finish or roll it back.

Rejected: a new gating input on the existing `publish` path, which
would have broken on-demand publication from the Actions UI; a separate
recording workflow, which would leave the gap in Deploy's own run list
this decision is about, rather than closing it where a person already
looks.
