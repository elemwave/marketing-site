# Elemwave infrastructure

AWS CDK (TypeScript) definitions for the staging and production environments of
the marketing site.

The site is a Next.js static export served from a private S3 bucket through
CloudFront. The decision records behind this design are
[`specs/decisions/staging-on-s3-and-cloudfront.md`](../specs/decisions/staging-on-s3-and-cloudfront.md)
and
[`specs/decisions/production-on-s3-and-cloudfront.md`](../specs/decisions/production-on-s3-and-cloudfront.md);
the behaviour they must provide is
[`specs/features/staging-deployment/spec.md`](../specs/features/staging-deployment/spec.md)
and
[`specs/features/production-deployment/spec.md`](../specs/features/production-deployment/spec.md).

## Environments and stacks

Every stack lives in [`index.ts`](./index.ts), the layout used by the CDK
projects under `aircury/implementations`: constants at the top, stack classes
below, and the `App` wired up at the end of the file.

`ENVIRONMENT` selects which environment is synthesised (`staging` by default);
`siteEnvironment` in `index.ts` is where each one is described.

| Environment | Branch | Domain | Access | Search engines |
| --- | --- | --- | --- | --- |
| `staging` | `staging` | `staging.elemwave.com` | shared basic auth | excluded (`X-Robots-Tag`) |
| `production` | `main` | `www.elemwave.com` | public | allowed |

Each environment has two stacks:

| Stack | Region | Deployed by | Contents |
| --- | --- | --- | --- |
| `elemwave-website-<environment>-certificate` | `us-east-1` | operator, once | ACM certificate for the environment's domain |
| `elemwave-website-<environment>` | `eu-west-1` | the workflow, every run | origin bucket, CloudFront distribution, edge function |

The IAM role GitHub Actions assumes is **not** managed here: it is created and
maintained by hand in the AWS console (see step 2 below).

## Required environment

| Variable | Needed for | Purpose |
| --- | --- | --- |
| `ENVIRONMENT` | every command | `staging` (default) or `production`. |
| `STAGING_BASIC_AUTH_USER` | staging | Username the staging distribution demands. |
| `STAGING_BASIC_AUTH_PASSWORD` | staging | Password the staging distribution demands. |
| `PUBLISHED_EXPORT_DIRECTORY` | optional | Page documents already published; their inline script hashes stay admitted (see Notes). |

The target account (`663038650422`) and regions are constants in `index.ts`.
Synthesis also reads the static export (`projects/marketing/out`) to hash its
inline scripts, so build the site first (`make app-build`).

Parameter Store owns the staging credentials. The workflow reads them and
exports them before running `cdk`; locally, do the same:

```sh
export STAGING_BASIC_AUTH_USER=$(aws ssm get-parameter --name /elemwave/website/staging/basic-auth/username --with-decryption --query Parameter.Value --output text)
export STAGING_BASIC_AUTH_PASSWORD=$(aws ssm get-parameter --name /elemwave/website/staging/basic-auth/password --with-decryption --query Parameter.Value --output text)
```

They are read at synthesis time, not at deployment time, because the values are
baked into the CloudFront Function — an edge function cannot reach Parameter
Store while it runs.

Synthesis of staging fails when the credentials are absent, so staging cannot
be deployed open by accident. Production needs none.

## First-time setup

Run these once per environment, with credentials for the Elemwave AWS account.
Prefix every `cdk` command with the environment, for example
`ENVIRONMENT=production npx cdk deploy …`.

1. **Bootstrap both regions.** The workflow does this on every run, so the only
   reason to run it by hand is to deploy a certificate before the first
   workflow run. Certificates live in `us-east-1`, everything else in
   `eu-west-1`.

   ```sh
   cdk bootstrap aws://663038650422/eu-west-1 aws://663038650422/us-east-1
   ```

2. **Check the deployment role.** It is maintained by hand in the account as
   `arn:aws:iam::663038650422:role/github-action`, and the workflow names it
   directly (`DEPLOY_ROLE_ARN` in
   [`deploy.yml`](../.github/workflows/deploy.yml)). Both environments use it.

   It needs `token.actions.githubusercontent.com` registered as an OIDC identity
   provider with audience `sts.amazonaws.com`, and this trust policy, which
   admits the two branches the workflow publishes from and nothing else:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": { "Federated": "arn:aws:iam::663038650422:oidc-provider/token.actions.githubusercontent.com" },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
             "token.actions.githubusercontent.com:sub": [
               "repo:elemwave/marketing-site:ref:refs/heads/staging",
               "repo:elemwave/marketing-site:ref:refs/heads/main"
             ]
           }
         }
       }
     ]
   }
   ```

   The role needs four things: to assume the `eu-west-1` CDK bootstrap roles so
   it can deploy the site stacks, to read the staging credentials from Parameter
   Store, to read and write both site buckets, and to invalidate the
   distributions. Distribution ids are generated by CloudFront, so the
   invalidation statement cannot name a resource. Reading a bucket is also what
   lets a deployment find the page documents already published.

   The workflow also runs `cdk bootstrap` for both regions, which needs
   permission to create the `CDKToolkit` stack and its roles — including in
   `us-east-1`. Nothing else in the pipeline touches that region: the
   certificate stacks are deployed by an operator, and the cross-region
   reference is read by a resource inside the `eu-west-1` stack, under its own
   role.

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AssumeCdkBootstrapRoles",
         "Effect": "Allow",
         "Action": "sts:AssumeRole",
         "Resource": [
           "arn:aws:iam::663038650422:role/cdk-hnb659fds-deploy-role-663038650422-eu-west-1",
           "arn:aws:iam::663038650422:role/cdk-hnb659fds-file-publishing-role-663038650422-eu-west-1",
           "arn:aws:iam::663038650422:role/cdk-hnb659fds-image-publishing-role-663038650422-eu-west-1",
           "arn:aws:iam::663038650422:role/cdk-hnb659fds-lookup-role-663038650422-eu-west-1"
         ]
       },
       {
         "Sid": "PublishSiteContent",
         "Effect": "Allow",
         "Action": [
           "s3:ListBucket",
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:GetBucketLocation"
         ],
         "Resource": [
           "arn:aws:s3:::elemwave-website-staging-site-663038650422",
           "arn:aws:s3:::elemwave-website-staging-site-663038650422/*",
           "arn:aws:s3:::elemwave-website-production-site-663038650422",
           "arn:aws:s3:::elemwave-website-production-site-663038650422/*"
         ]
       },
       {
         "Sid": "ReadStagingCredentials",
         "Effect": "Allow",
         "Action": "ssm:GetParameter",
         "Resource": "arn:aws:ssm:eu-west-1:663038650422:parameter/elemwave/website/staging/*"
       },
       {
         "Sid": "DecryptStagingCredentials",
         "Effect": "Allow",
         "Action": "kms:Decrypt",
         "Resource": "*",
         "Condition": { "StringEquals": { "kms:ViaService": "ssm.eu-west-1.amazonaws.com" } }
       },
       {
         "Sid": "InvalidateSiteCache",
         "Effect": "Allow",
         "Action": [
           "cloudfront:CreateInvalidation",
           "cloudfront:GetInvalidation",
           "cloudfront:ListDistributions"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

   The bucket names are derived from the environment and the account id
   (`siteBucketName` in [`index.ts`](./index.ts)), so they can be
   written into the policy before the buckets exist.

3. **Deploy the certificate.** The `elemwave.com` zone is not in Route 53, so
   this stack waits at `CREATE_IN_PROGRESS`. Open the certificate in the ACM
   console (`us-east-1`), copy the CNAME name and value it asks for, add that
   record in the Google DNS zone for `elemwave.com`, and the stack completes on
   its own once ACM sees it. Adding the validation record changes nothing about
   what the domain currently serves.

   ```sh
   ENVIRONMENT=production npx cdk deploy elemwave-website-production-certificate
   ```

   Deploy it before the environment's first workflow run: the site stack reads
   the certificate across regions and fails to deploy without it.

4. **Deploy the site stack**, by hand or through the environment's first
   workflow run, to create the bucket and distribution.

   ```sh
   ENVIRONMENT=production npx cdk deploy elemwave-website-production
   ```

5. **Point the domain at CloudFront.** In the Google DNS zone, set the CNAME for
   the environment's domain to the distribution domain (`d***.cloudfront.net`,
   printed by the previous step and shown in the CloudFront console). For
   production that replaces the `www` record that points at
   `elemwave.github.io`; remove the custom domain from that GitHub Pages site
   once the switch has propagated. The bare `elemwave.com` keeps the
   registrar's forwarding to `https://www.elemwave.com`.

   Until this record changes, the workflow's final check fails, because the
   address still answers from the old host. Re-run the workflow once it has
   changed (**Actions → Deploy → Run workflow**, on the environment's branch).

6. **Store the staging credentials** in Parameter Store, in `eu-west-1`
   (staging only):

   ```sh
   aws ssm put-parameter --region eu-west-1 --type SecureString \
     --name /elemwave/website/staging/basic-auth/username --value '<username>'
   aws ssm put-parameter --region eu-west-1 --type SecureString \
     --name /elemwave/website/staging/basic-auth/password --value '<password>'
   ```

   The repository holds no secrets at all: the role ARN and the parameter names
   live in the workflow, and the trust policy is what keeps other repositories
   and branches out.

After that, every push to `staging` or `main` publishes the matching
environment once CI has passed: the final CI job dispatches the deploy workflow
against the pushed branch with the commit it verified. **Actions → Deploy → Run
workflow** republishes on demand from either branch. A deploy dispatched from
any other branch stops before it builds anything, and would fail to assume the
role regardless.

The workflow deliberately does not use a GitHub environment. Referencing one
changes the OIDC subject claim from
`repo:elemwave/marketing-site:ref:refs/heads/<branch>` to
`repo:elemwave/marketing-site:environment:<name>`, and the role stops trusting
the workflow. Adding an environment later means updating the trust policy in
the same commit.

## Day-to-day commands

```sh
npm run build   # type-check
npm test        # unit tests for the edge function and the stack templates
npm run synth   # synthesise the stacks of $ENVIRONMENT
npm run diff    # compare against what is deployed
npm run deploy  # deploy the site stack of $ENVIRONMENT
```

## Notes and limits

- **The basic auth credentials are readable in AWS.** CloudFront Functions have
  no secret store, so the rendered function code holds them in clear text.
  Anyone with read access to the AWS account can see them. They keep crawlers
  and casual visitors out; they are not an access control for sensitive data.
- **Rotating the credentials** means updating the two Parameter Store values and
  re-running the staging workflow; the new function version is published by the
  deploy.
- **The content policy briefly admits two builds' scripts.** It names inline
  scripts by hash and changes before the new documents are uploaded and the
  cache is refreshed. The workflow downloads the page documents already
  published into `PUBLISHED_EXPORT_DIRECTORY`, so the policy admits their hashes
  as well as the new build's and those pages keep working until they are
  replaced. The next deployment drops the old hashes.
- **One role serves both environments.** Its trust policy admits `staging` and
  `main`, so a workflow running from `staging` holds write access to the
  production bucket as well. Publishing from another branch means editing the
  trust policy by hand and the branch mapping in the workflow.
- **The buckets are disposable.** Each is destroyed with its stack and its
  contents are deleted with it; the site is republished from the repository
  every time.
