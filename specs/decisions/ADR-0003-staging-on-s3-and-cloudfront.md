# ADR-0003: Host the staging site on S3 and CloudFront, provisioned with CDK

Status: Draft

## Context

The marketing site needs a staging environment
where the team can review merged work before it reaches production.
The site is a Next.js application
that, after the Calendly change in ADR-0002,
holds no server-side behaviour at all:
no API routes, no server actions, no request-time rendering.

Two constraints shape the design.
The `elemwave.com` DNS zone is hosted outside AWS
(the authoritative name servers are Google's),
so Route 53 cannot validate certificates or publish records automatically.
And the repository already targets AWS,
with `eu-west-1` as the project region.

## Decision

- The marketing app switches to Next.js **static export** (`output: "export"`).
  The whole site becomes a directory of files,
  which removes the need for any server runtime in staging.
  The now-unreachable `builder` and `runner` stages of the root `Dockerfile`
  are deleted; `docker compose` only ever used the `base` stage for `next dev`.
- Staging is an **S3 bucket, private, fronted by CloudFront** through an
  Origin Access Control.
  The bucket has no public access and no website hosting;
  CloudFront is the only reader.
- All AWS resources are defined in **CDK (TypeScript)** under `infra/`,
  split into three stacks by lifecycle rather than by resource type:
  - `ElemwaveGithubOidcStack` (`eu-west-1`) — the OIDC trust and deploy role,
    deployed once by an operator.
  - `ElemwaveStagingCertificateStack` (`us-east-1`) — the ACM certificate,
    deployed once by an operator.
    CloudFront only accepts certificates from `us-east-1`.
  - `ElemwaveStagingSiteStack` (`eu-west-1`) — bucket, distribution, edge function.
    This is the only stack the pipeline deploys.
- **Certificate validation and the staging DNS record are manual, one-off steps.**
  Without a Route 53 zone, CDK cannot write the validation record,
  so certificate creation blocks until an operator adds the CNAME
  in the external DNS zone.
  Isolating the certificate in its own stack keeps that wait
  out of the deployment pipeline entirely.
  The alternative — delegating a `staging.elemwave.com` sub-zone to Route 53 —
  was rejected for now as more moving parts than the team wants.
- Access is restricted by **HTTP basic authentication in a CloudFront Function**
  on the viewer-request event.
  The same function rewrites extension-less paths to their `index.html`,
  which a static S3 origin cannot do on its own.
  The credentials are injected at synth time from the environment,
  never committed, and supplied by the pipeline from repository secrets.
  Trade-off: the rendered function code holds the credentials in clear text
  and is readable by anyone with read access to the AWS account.
  This keeps out crawlers and casual visitors;
  it is not a strong access control, and it is not treated as one.
- Every response carries `X-Robots-Tag: noindex, nofollow`
  through a response headers policy,
  so an accidental link never puts staging in a search index.
- **Content is uploaded by the pipeline, not by the stack.**
  `BucketDeployment` was rejected:
  it packages the whole site as a CDK asset and runs a Lambda for every publish,
  and it makes per-prefix cache headers awkward.
  The workflow instead runs two `aws s3 sync` passes —
  fingerprinted assets as immutable for a year,
  page documents as `no-cache` — followed by a CloudFront invalidation.
- The bucket name is **deterministic** (`elemwave-staging-site-<account>`)
  so that the deploy role can be granted access to it
  without creating a dependency between the OIDC stack and the site stack.
- GitHub Actions authenticates through **OIDC**, with no stored AWS keys.
  The role's trust policy is pinned to the `staging` branch of this repository.
- The pipeline deploys the site stack on every run rather than only on infra changes.
  A no-op CloudFormation deployment is cheap,
  and it guarantees infrastructure and content never drift apart.
