# Elemwave infrastructure

AWS CDK (TypeScript) definitions for the staging environment of the marketing site.

The site is a Next.js static export served from a private S3 bucket through
CloudFront. The decision record behind this design is
[`specs/decisions/ADR-0003-staging-on-s3-and-cloudfront.md`](../specs/decisions/ADR-0003-staging-on-s3-and-cloudfront.md);
the behaviour it must provide is
[`specs/features/staging-deployment/spec.md`](../specs/features/staging-deployment/spec.md).

## Stacks

| Stack | Region | Deployed by | Contents |
| --- | --- | --- | --- |
| `ElemwaveGithubOidcStack` | `eu-west-1` | operator, once | GitHub OIDC provider, `elemwave-staging-github-deploy` role |
| `ElemwaveStagingCertificateStack` | `us-east-1` | operator, once | ACM certificate for `staging.elemwave.com` |
| `ElemwaveStagingSiteStack` | `eu-west-1` | the workflow, every run | origin bucket, CloudFront distribution, edge function |

## Required environment

Every `cdk` command synthesises all three stacks, so all of these must be set:

| Variable | Purpose |
| --- | --- |
| `CDK_DEPLOY_ACCOUNT` | Target AWS account id. Falls back to `CDK_DEFAULT_ACCOUNT` from your credentials. |
| `STAGING_BASIC_AUTH_USER` | Username the staging distribution demands. |
| `STAGING_BASIC_AUTH_PASSWORD` | Password the staging distribution demands. |

Synthesis fails when the credentials are absent, so staging cannot be deployed
open by accident.

## First-time setup

Run these once, with credentials for the Elemwave AWS account.

1. **Bootstrap both regions.** The certificate lives in `us-east-1`, everything
   else in `eu-west-1`.

   ```sh
   cdk bootstrap aws://<ACCOUNT_ID>/eu-west-1 aws://<ACCOUNT_ID>/us-east-1
   ```

2. **Deploy the OIDC trust** and keep the printed role ARN.

   ```sh
   npx cdk deploy ElemwaveGithubOidcStack
   ```

3. **Deploy the certificate.** The `elemwave.com` zone is not in Route 53, so
   this stack waits at `CREATE_IN_PROGRESS`. Open the certificate in the ACM
   console (`us-east-1`), copy the CNAME name and value it asks for, add that
   record in the Google DNS zone for `elemwave.com`, and the stack completes on
   its own once ACM sees it.

   ```sh
   npx cdk deploy ElemwaveStagingCertificateStack
   ```

4. **Deploy the site stack** to create the bucket and distribution.

   ```sh
   npx cdk deploy ElemwaveStagingSiteStack
   ```

5. **Point the subdomain at CloudFront.** Add a CNAME in the Google DNS zone:
   `staging.elemwave.com` → the distribution domain (`d***.cloudfront.net`,
   printed by the previous step and shown in the CloudFront console).

6. **Add the repository secrets** in GitHub → Settings → Secrets and variables →
   Actions:

   | Secret | Value |
   | --- | --- |
   | `AWS_DEPLOY_ROLE_ARN` | `DeployRoleArn` output from step 2 |
   | `STAGING_BASIC_AUTH_USER` | staging username |
   | `STAGING_BASIC_AUTH_PASSWORD` | staging password |

After that, every push to the `staging` branch publishes the site, and
**Actions → Deploy staging → Run workflow** republishes it on demand.

The workflow runs in a GitHub environment named `staging`, which GitHub creates
on the first run. Add approvals or branch restrictions to it if the team wants a
gate in front of staging deployments.

## Day-to-day commands

```sh
npm test            # unit tests for the edge function and the stack templates
npm run synth       # synthesise all stacks
npm run diff        # compare against what is deployed
npm run deploy:site # deploy the site stack only
```

## Notes and limits

- **The basic auth credentials are readable in AWS.** CloudFront Functions have
  no secret store, so the rendered function code holds them in clear text.
  Anyone with read access to the AWS account can see them. They keep crawlers
  and casual visitors out; they are not an access control for sensitive data.
- **Rotating the credentials** means changing the repository secrets and
  re-running the workflow; the new function version is published by the deploy.
- **The trust policy is pinned to the `staging` branch.** Deploying from another
  branch requires changing `deploymentBranch` in `lib/config.ts` and
  redeploying `ElemwaveGithubOidcStack`.
- **The bucket is disposable.** It is destroyed with the stack and its contents
  are deleted with it; the site is republished from the repository every time.
