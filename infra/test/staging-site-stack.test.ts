import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { StagingCertificateStack, StagingSiteStack, siteBucketName } from '../index';

const account = '123456789012';
const domainName = 'staging.elemwave.com';

function synthesise(): Template {
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
    });

    return Template.fromStack(stack);
}

describe('StagingSiteStack', () => {
    const template = synthesise();

    describe('origin bucket', () => {
        it('blocks every form of public access', () => {
            template.hasResourceProperties('AWS::S3::Bucket', {
                BucketName: `elemwave-website-staging-site-${account}`,
                PublicAccessBlockConfiguration: {
                    BlockPublicAcls: true,
                    BlockPublicPolicy: true,
                    IgnorePublicAcls: true,
                    RestrictPublicBuckets: true,
                },
            });
        });

        it('grants read access to CloudFront only', () => {
            template.hasResourceProperties('AWS::S3::BucketPolicy', {
                PolicyDocument: {
                    Statement: Match.arrayWith([
                        Match.objectLike({
                            Action: 's3:GetObject',
                            Principal: { Service: 'cloudfront.amazonaws.com' },
                        }),
                    ]),
                },
            });
        });

        it('reaches the origin through an Origin Access Control', () => {
            template.resourceCountIs('AWS::CloudFront::OriginAccessControl', 1);
        });
    });

    describe('distribution', () => {
        it('serves the staging domain over HTTPS with the supplied certificate', () => {
            template.hasResourceProperties('AWS::CloudFront::Distribution', {
                DistributionConfig: Match.objectLike({
                    Aliases: [domainName],
                    DefaultRootObject: 'index.html',
                    ViewerCertificate: Match.objectLike({
                        AcmCertificateArn: Match.anyValue(),
                        MinimumProtocolVersion: 'TLSv1.2_2021',
                    }),
                    DefaultCacheBehavior: Match.objectLike({
                        ViewerProtocolPolicy: 'redirect-to-https',
                    }),
                }),
            });
        });

        it('runs the viewer-request function on every request', () => {
            template.hasResourceProperties('AWS::CloudFront::Distribution', {
                DistributionConfig: Match.objectLike({
                    DefaultCacheBehavior: Match.objectLike({
                        FunctionAssociations: [Match.objectLike({ EventType: 'viewer-request' })],
                    }),
                }),
            });
        });

        it('answers missing documents with the not-found page', () => {
            template.hasResourceProperties('AWS::CloudFront::Distribution', {
                DistributionConfig: Match.objectLike({
                    CustomErrorResponses: Match.arrayWith([
                        Match.objectLike({ ErrorCode: 403, ResponseCode: 404, ResponsePagePath: '/404.html' }),
                        Match.objectLike({ ErrorCode: 404, ResponseCode: 404, ResponsePagePath: '/404.html' }),
                    ]),
                }),
            });
        });
    });

    describe('edge behaviour', () => {
        it('ships the basic auth credentials inside the function code', () => {
            const encoded = Buffer.from('elemwave:let-me-in').toString('base64');

            template.hasResourceProperties('AWS::CloudFront::Function', {
                FunctionCode: Match.stringLikeRegexp(encoded),
            });
        });

        it('keeps staging out of search indexes', () => {
            template.hasResourceProperties('AWS::CloudFront::ResponseHeadersPolicy', {
                ResponseHeadersPolicyConfig: Match.objectLike({
                    CustomHeadersConfig: {
                        Items: Match.arrayWith([
                            Match.objectLike({ Header: 'X-Robots-Tag', Value: 'noindex, nofollow' }),
                        ]),
                    },
                }),
            });
        });
    });

    describe('outputs', () => {
        it('publishes what the deployment pipeline needs', () => {
            const outputs = template.findOutputs('*');

            expect(Object.keys(outputs)).toEqual(
                expect.arrayContaining(['SiteBucketName', 'DistributionId', 'StagingUrl']),
            );
        });
    });
});
