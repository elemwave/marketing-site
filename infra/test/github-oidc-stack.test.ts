import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { GithubOidcStack } from "../lib/github-oidc-stack";

const account = "123456789012";

function synthesise(): Template {
  const app = new App();
  const stack = new GithubOidcStack(app, "ElemwaveGithubOidcStack", {
    env: { account, region: "eu-west-1" },
    repository: "elemwave/website",
    deploymentBranch: "staging",
    siteBucketName: `elemwave-staging-site-${account}`,
  });

  return Template.fromStack(stack);
}

describe("GithubOidcStack", () => {
  const template = synthesise();

  it("trusts only the staging branch of this repository", () => {
    template.hasResourceProperties("AWS::IAM::Role", {
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "sts:AssumeRoleWithWebIdentity",
            Condition: Match.objectLike({
              StringEquals: Match.objectLike({
                "token.actions.githubusercontent.com:sub": "repo:elemwave/website:ref:refs/heads/staging",
                "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
              }),
            }),
          }),
        ]),
      }),
    });
  });

  it("can assume the CDK deployment roles of this account", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: "sts:AssumeRole",
            Resource: Match.arrayWith([`arn:aws:iam::${account}:role/cdk-hnb659fds-deploy-role-${account}-eu-west-1`]),
          }),
        ]),
      }),
    });
  });

  it("can publish the site to the staging bucket", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Resource: Match.arrayWith([
              `arn:aws:s3:::elemwave-staging-site-${account}`,
              `arn:aws:s3:::elemwave-staging-site-${account}/*`,
            ]),
          }),
        ]),
      }),
    });
  });

  it("can refresh the CloudFront cache", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({ Action: Match.arrayWith(["cloudfront:CreateInvalidation"]) }),
        ]),
      }),
    });
  });

  it("publishes the role ARN for the workflow secret", () => {
    expect(Object.keys(template.findOutputs("*"))).toContain("DeployRoleArn");
  });
});
