#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { readBasicAuthCredentials } from "../lib/basic-auth";
import { siteBucketNameFor, stagingConfiguration } from "../lib/config";
import { GithubOidcStack } from "../lib/github-oidc-stack";
import { StagingCertificateStack } from "../lib/staging-certificate-stack";
import { StagingSiteStack } from "../lib/staging-site-stack";

const account = process.env.CDK_DEPLOY_ACCOUNT ?? process.env.CDK_DEFAULT_ACCOUNT;

if (!account) {
  throw new Error(
    "No AWS account resolved: export CDK_DEPLOY_ACCOUNT, or run the cdk command with credentials for the Elemwave account.",
  );
}

const app = new App();
const siteBucketName = siteBucketNameFor(account);

new GithubOidcStack(app, "ElemwaveGithubOidcStack", {
  env: { account, region: stagingConfiguration.primaryRegion },
  description: "GitHub Actions OIDC trust and staging deploy role",
  repository: stagingConfiguration.repository,
  deploymentBranch: stagingConfiguration.deploymentBranch,
  siteBucketName,
});

const certificateStack = new StagingCertificateStack(app, "ElemwaveStagingCertificateStack", {
  env: { account, region: stagingConfiguration.certificateRegion },
  crossRegionReferences: true,
  description: "ACM certificate for the staging distribution (manual DNS validation)",
  domainName: stagingConfiguration.domainName,
});

new StagingSiteStack(app, "ElemwaveStagingSiteStack", {
  env: { account, region: stagingConfiguration.primaryRegion },
  crossRegionReferences: true,
  description: "Staging origin bucket and CloudFront distribution for the marketing site",
  domainName: stagingConfiguration.domainName,
  siteBucketName,
  certificate: certificateStack.certificate,
  basicAuth: readBasicAuthCredentials(),
});
