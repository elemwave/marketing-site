import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SiteCertificateStack, SiteEnvironment, SiteStack, siteBucketName, siteEnvironment } from '../index';

export const account = '123456789012';
export const inlineScriptHashes = ['sha256-AAAA', 'sha256-BBBB'];
export const credentials = { username: 'elemwave', password: 'let-me-in' };

export const staging = siteEnvironment('staging', {
    STAGING_BASIC_AUTH_USER: credentials.username,
    STAGING_BASIC_AUTH_PASSWORD: credentials.password,
});
export const production = siteEnvironment('production', {});

export function synthesise(environment: SiteEnvironment = staging): Template {
    const app = new App();
    const certificateStack = new SiteCertificateStack(app, `elemwave-website-${environment.name}-certificate`, {
        env: { account, region: 'us-east-1' },
        crossRegionReferences: true,
        domainName: environment.domainName,
    });
    const stack = new SiteStack(app, `elemwave-website-${environment.name}`, {
        env: { account, region: 'eu-west-1' },
        crossRegionReferences: true,
        environment,
        siteBucketName: siteBucketName(environment.name, account),
        certificate: certificateStack.certificate,
        inlineScriptHashes,
    });

    return Template.fromStack(stack);
}
