import * as declaredSecurityHeaders from '../../config/security-headers.json';
import { sniffingAndTransportFromDeclaration } from '../declared-security-headers';
import { account, credentials, production, staging, synthesise } from './synthesise';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CachePolicy } from 'aws-cdk-lib/aws-cloudfront';

function responseHeadersConfig(template: Template): Record<string, unknown> {
    const [policy] = Object.values(template.findResources('AWS::CloudFront::ResponseHeadersPolicy'));

    return policy.Properties.ResponseHeadersPolicyConfig;
}

describe.each([staging, production])('SiteStack for $name', (environment) => {
    const template = synthesise(environment);

    describe('origin bucket', () => {
        it('blocks every form of public access', () => {
            template.hasResourceProperties('AWS::S3::Bucket', {
                BucketName: `elemwave-website-${environment.name}-site-${account}`,
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
        it("serves the environment's domain over HTTPS with the supplied certificate", () => {
            template.hasResourceProperties('AWS::CloudFront::Distribution', {
                DistributionConfig: Match.objectLike({
                    Aliases: [environment.domainName],
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

        it('honours origin freshness with the managed CachingOptimized policy', () => {
            template.hasResourceProperties('AWS::CloudFront::Distribution', {
                DistributionConfig: Match.objectLike({
                    DefaultCacheBehavior: Match.objectLike({
                        CachePolicyId: CachePolicy.CACHING_OPTIMIZED.cachePolicyId,
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

        it('names its edge resources after the environment', () => {
            template.hasResourceProperties('AWS::CloudFront::Function', {
                Name: `elemwave-website-${environment.name}-viewer-request`,
            });
        });
    });

    it('hardens content types, transport, framing and referrers on every response', () => {
        const sniffingAndTransport = sniffingAndTransportFromDeclaration(declaredSecurityHeaders);
        const config = responseHeadersConfig(template).SecurityHeadersConfig as Record<string, Record<string, unknown>>;

        expect(config.ContentTypeOptions).toEqual({ Override: true });
        expect(config.StrictTransportSecurity).toEqual({
            AccessControlMaxAgeSec: sniffingAndTransport.accessControlMaxAgeSec,
            IncludeSubdomains: sniffingAndTransport.includeSubdomains,
            Override: true,
            ...(sniffingAndTransport.preload ? { Preload: true } : {}),
        });
        expect(config.FrameOptions).toEqual({ FrameOption: 'DENY', Override: true });
        expect(config.ReferrerPolicy).toEqual({
            ReferrerPolicy: 'strict-origin-when-cross-origin',
            Override: true,
        });
    });

    it('publishes what the deployment pipeline needs', () => {
        expect(Object.keys(template.findOutputs('*'))).toEqual(
            expect.arrayContaining(['SiteBucketName', 'DistributionId', 'SiteUrl']),
        );
        template.hasOutput('SiteUrl', { Value: `https://${environment.domainName}` });
    });
});

describe('staging edge behaviour', () => {
    const template = synthesise(staging);

    it('ships the basic auth credentials inside the function code', () => {
        const encoded = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');

        template.hasResourceProperties('AWS::CloudFront::Function', {
            FunctionCode: Match.stringLikeRegexp(encoded),
        });
    });

    it('keeps staging out of search indexes', () => {
        expect(responseHeadersConfig(template).CustomHeadersConfig).toEqual({
            Items: [{ Header: 'X-Robots-Tag', Value: 'noindex, nofollow', Override: true }],
        });
    });
});

describe('production edge behaviour', () => {
    const template = synthesise(production);

    it('ships no credentials inside the function code', () => {
        template.hasResourceProperties('AWS::CloudFront::Function', {
            FunctionCode: Match.stringLikeRegexp('var expectedAuthorisation = null;'),
        });
    });

    it('sends no instruction keeping search engines away', () => {
        expect(responseHeadersConfig(template).CustomHeadersConfig).toBeUndefined();
    });
});

it('keeps today\'s declared sniffing and transport values', () => {
    expect(declaredSecurityHeaders.contentTypeOptions).toBe('nosniff');
    expect(declaredSecurityHeaders.strictTransportSecurity).toBe('max-age=31536000; includeSubDomains');
});
