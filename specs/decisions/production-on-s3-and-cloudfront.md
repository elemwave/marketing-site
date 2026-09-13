# Publish production from `main` on the staging design

## Context

The marketing site is replacing the page currently answering at `www.elemwave.com`.
Staging already runs on a private S3 bucket behind CloudFront,
provisioned with CDK and published by a workflow CI dispatches
(`specs/decisions/staging-on-s3-and-cloudfront.md`).
Production needs the same hosting, but it is public and indexed,
it is released from `main` rather than `staging`,
and its content policy must never break the pages visitors are served mid-publication.

The bare `elemwave.com` already redirects to `https://www.elemwave.com`
through the registrar's domain forwarding,
and the zone is still in Google's DNS rather than Route 53.

## Decision

- **Production is a second environment of the same CDK app,**
  not a separate project.
  `index.ts` describes each environment once —
  its domain, whether it demands the shared credentials,
  and whether search engines may index it —
  and `ENVIRONMENT` (`staging` or `production`) selects which one is synthesised.
  Stack, bucket and edge resource names follow the environment,
  so production gets `elemwave-website-production-certificate`
  and `elemwave-website-production`
  without touching any staging resource.
- **Production serves `www.elemwave.com` only.**
  The bare domain stays with the registrar's forwarding to `www`:
  the Google zone cannot point an apex record at CloudFront,
  and the forwarding already does what is needed.
- **Production is public and indexable.**
  Its viewer-request function resolves paths and demands no credentials,
  and its response headers policy carries no `X-Robots-Tag`.
  Staging keeps both, so an accidental link still never indexes it.
  Synthesising production needs no credentials at all.
- **One deploy workflow, keyed by branch.**
  `deploy.yml` replaces `deploy-staging.yml`:
  dispatched against `staging` it publishes staging,
  against `main` it publishes production,
  and against any other branch it stops before doing anything.
  The last CI job dispatches it for both branches with the verified commit.
  Two near-identical workflows were rejected as duplicated steps that would drift apart.
  Staging runs still cancel a superseded run;
  production runs queue, so an upload is never cut off halfway.
- **Production reuses the `github-action` role.**
  Its trust policy admits both the `staging` and the `main` branch,
  and its permissions cover both site buckets.
  A separate production role was considered and rejected by the maintainer
  in favour of one role to administer.
  Trade-off: a workflow running from `staging` could, if altered,
  write to the production bucket;
  review of what lands on `staging` is what guards against that.
- **The content policy admits the published pages' scripts while they are replaced.**
  The policy names each inline script by hash,
  and CloudFront applies a new policy before the new documents are uploaded
  and the cache is refreshed.
  Before synthesising, the workflow downloads the page documents already in the bucket,
  and the policy admits their hashes as well as the new build's.
  The next publication drops them.
  A two-phase deployment (widen, upload, narrow) was rejected
  for doubling the CloudFront update on every release;
  carrying the policy in each document through a `<meta>` element was rejected
  because it cannot express `frame-ancestors`
  and would weaken the header policy the standards test.
- **The production certificate and the `www` record are manual, one-off steps,**
  exactly as for staging, and for the same reason.

## Consequences

- `www.elemwave.com` moves from its current host to CloudFront
  once an operator repoints its CNAME.
  Until then the first production publication fails its revision check,
  because the address still answers from the old host;
  re-running it after the switch confirms the release.
- Staging deployments now run through `deploy.yml`.
  GitHub dispatches a workflow by the file on the default branch,
  so a staging push made before this change reaches `main`
  may fail to dispatch until it does.
