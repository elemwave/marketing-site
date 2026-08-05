/**
 * Single source of truth for the names and locations the staging environment
 * depends on. The bucket name is deterministic so that the deploy role can be
 * granted access to it without coupling the OIDC stack to the site stack.
 */
export const stagingConfiguration = {
  primaryRegion: "eu-west-1",
  /** CloudFront only accepts ACM certificates issued in us-east-1. */
  certificateRegion: "us-east-1",
  domainName: "staging.elemwave.com",
  repository: "elemwave/website",
  deploymentBranch: "staging",
} as const;

export function siteBucketNameFor(account: string): string {
  return `elemwave-staging-site-${account}`;
}
