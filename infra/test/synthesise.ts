import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { StagingCertificateStack, StagingSiteStack, siteBucketName } from '../index';

export const account = '123456789012';
export const domainName = 'staging.elemwave.com';
export const inlineScriptHashes = ['sha256-AAAA', 'sha256-BBBB'];

export function synthesise(): Template {
    const app = new App();
    const certificateStack = new StagingCertificateStack(app, 'elemwave-website-staging-certificate', {
        env: { account, region: 'us-east-1' },
        crossRegionReferences: true,
        domainName,
    });
    const stack = new StagingSiteStack(app, 'elemwave-website-staging', {
        env: { account, region: 'eu-west-1' },
        crossRegionReferences: true,
        domainName,
        siteBucketName: siteBucketName(account),
        certificate: certificateStack.certificate,
        basicAuth: { username: 'elemwave', password: 'let-me-in' },
        inlineScriptHashes,
    });

    return Template.fromStack(stack);
}
