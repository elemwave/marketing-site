import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Construct } from 'constructs';
import { App, CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Certificate, CertificateValidation, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
    AllowedMethods,
    CachePolicy,
    Distribution,
    Function as CloudFrontFunction,
    FunctionCode,
    FunctionEventType,
    FunctionRuntime,
    HeadersFrameOption,
    HeadersReferrerPolicy,
    HttpVersion,
    PriceClass,
    ResponseHeadersPolicy,
    SecurityPolicyProtocol,
    ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';

const ENVIRONMENT = process.env.ENVIRONMENT || 'staging';
const APP_NAME = process.env.APP_NAME || 'elemwave-website';

const AWS_ACCOUNT = '663038650422';
const AWS_REGION = 'eu-west-1';
// CloudFront only accepts ACM certificates issued in us-east-1.
const CERTIFICATE_REGION = 'us-east-1';

const DOMAIN_NAME = 'staging.elemwave.com';
const NOT_FOUND_DOCUMENT = '/404.html';
const BASIC_AUTH_USERNAME_VARIABLE = 'STAGING_BASIC_AUTH_USER';
const BASIC_AUTH_PASSWORD_VARIABLE = 'STAGING_BASIC_AUTH_PASSWORD';
const BASIC_AUTH_PLACEHOLDER = '__BASIC_AUTH_CREDENTIALS__';

export interface BasicAuthCredentials {
    readonly username: string;
    readonly password: string;
}

/**
 * The staging credentials never live in the repository: they come from the
 * environment (repository secrets in CI, an exported shell variable locally).
 * Missing credentials fail the synthesis rather than publishing an open site.
 */
export function readBasicAuthCredentials(environment: NodeJS.ProcessEnv = process.env): BasicAuthCredentials {
    const missing = [BASIC_AUTH_USERNAME_VARIABLE, BASIC_AUTH_PASSWORD_VARIABLE]
        .filter((variable) => !environment[variable]);

    if (missing.length > 0) {
        throw new Error(
            `Staging basic auth is not configured: set ${missing.join(' and ')} before running any cdk command.`,
        );
    }

    return {
        username: environment[BASIC_AUTH_USERNAME_VARIABLE] as string,
        password: environment[BASIC_AUTH_PASSWORD_VARIABLE] as string,
    };
}

export function renderViewerRequestFunction(credentials: BasicAuthCredentials): string {
    const encodedCredentials = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
    const template = readFileSync(join(__dirname, 'functions', 'viewer-request.js'), 'utf-8');

    return template.split(BASIC_AUTH_PLACEHOLDER).join(encodedCredentials);
}

export function siteBucketName(account: string): string {
    return `${APP_NAME}-${ENVIRONMENT}-site-${account}`;
}

export interface StagingCertificateStackProps extends StackProps {
    readonly domainName: string;
}

/**
 * The staging certificate, isolated in us-east-1 because CloudFront accepts no
 * other region.
 *
 * The elemwave.com zone is not hosted in Route 53, so nothing here can write the
 * validation record: deploying this stack stops at CREATE_IN_PROGRESS until an
 * operator copies the CNAME that ACM asks for into the external DNS zone.
 * Keeping it in its own stack means that one-off wait never blocks the
 * deployment pipeline, which only ever deploys the site stack.
 */
export class StagingCertificateStack extends Stack {
    public readonly certificate: ICertificate;

    constructor(scope: Construct, id: string, props: StagingCertificateStackProps) {
        super(scope, id, props);

        this.certificate = new Certificate(this, 'Certificate', {
            domainName: props.domainName,
            validation: CertificateValidation.fromDns(),
        });

        new CfnOutput(this, 'CertificateArn', {
            value: this.certificate.certificateArn,
            description: 'ACM certificate served by the staging distribution',
        });
    }
}

export interface StagingSiteStackProps extends StackProps {
    readonly domainName: string;
    readonly siteBucketName: string;
    readonly certificate: ICertificate;
    readonly basicAuth: BasicAuthCredentials;
}

/**
 * Where the exported marketing site is served from: a private bucket that only
 * CloudFront can read, behind a distribution that authenticates visitors and
 * resolves static paths at the edge.
 *
 * The stack owns the infrastructure only. The site files are uploaded by the
 * deployment workflow, which can then set cache headers per prefix and
 * invalidate the distribution itself.
 */
export class StagingSiteStack extends Stack {
    constructor(scope: Construct, id: string, props: StagingSiteStackProps) {
        super(scope, id, props);

        const siteBucket = new Bucket(this, 'SiteBucket', {
            bucketName: props.siteBucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            // Staging holds no state worth keeping: every deployment republishes it.
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const viewerRequest = new CloudFrontFunction(this, 'ViewerRequest', {
            functionName: `${APP_NAME}-${ENVIRONMENT}-viewer-request`,
            code: FunctionCode.fromInline(renderViewerRequestFunction(props.basicAuth)),
            runtime: FunctionRuntime.JS_2_0,
            comment: 'Staging basic auth and static path resolution',
        });

        const responseHeaders = new ResponseHeadersPolicy(this, 'ResponseHeaders', {
            responseHeadersPolicyName: `${APP_NAME}-${ENVIRONMENT}-response-headers`,
            comment: 'Staging security headers and search engine exclusion',
            customHeadersBehavior: {
                customHeaders: [
                    { header: 'X-Robots-Tag', value: 'noindex, nofollow', override: true },
                ],
            },
            securityHeadersBehavior: {
                contentTypeOptions: { override: true },
                frameOptions: { frameOption: HeadersFrameOption.DENY, override: true },
                referrerPolicy: {
                    referrerPolicy: HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
                    override: true,
                },
                strictTransportSecurity: {
                    accessControlMaxAge: Duration.days(365),
                    includeSubdomains: true,
                    override: true,
                },
            },
        });

        const distribution = new Distribution(this, 'Distribution', {
            comment: `${APP_NAME}-${ENVIRONMENT} (${props.domainName})`,
            domainNames: [props.domainName],
            certificate: props.certificate,
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            defaultRootObject: 'index.html',
            httpVersion: HttpVersion.HTTP2_AND_3,
            priceClass: PriceClass.PRICE_CLASS_100,
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessControl(siteBucket),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                cachePolicy: CachePolicy.CACHING_OPTIMIZED,
                responseHeadersPolicy: responseHeaders,
                compress: true,
                functionAssociations: [
                    { function: viewerRequest, eventType: FunctionEventType.VIEWER_REQUEST },
                ],
            },
            // A private origin answers unknown keys with 403, so both statuses
            // mean "no such page" here.
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 404,
                    responsePagePath: NOT_FOUND_DOCUMENT,
                    ttl: Duration.minutes(5),
                },
                {
                    httpStatus: 404,
                    responseHttpStatus: 404,
                    responsePagePath: NOT_FOUND_DOCUMENT,
                    ttl: Duration.minutes(5),
                },
            ],
        });

        new CfnOutput(this, 'SiteBucketName', {
            value: siteBucket.bucketName,
            description: 'Bucket the deployment workflow syncs the exported site into',
        });

        new CfnOutput(this, 'DistributionId', {
            value: distribution.distributionId,
            description: 'Distribution the deployment workflow invalidates',
        });

        new CfnOutput(this, 'StagingUrl', {
            value: `https://${props.domainName}`,
            description: 'Staging entry point',
        });
    }
}

const app = new App();

// The IAM role GitHub Actions assumes is maintained by hand in the AWS account,
// so it is deliberately absent from this app. See README.md.
const certificateStack = new StagingCertificateStack(app, `${APP_NAME}-${ENVIRONMENT}-certificate`, {
    env: { account: AWS_ACCOUNT, region: CERTIFICATE_REGION },
    crossRegionReferences: true,
    description: 'ACM certificate for the staging distribution (manual DNS validation)',
    domainName: DOMAIN_NAME,
});

new StagingSiteStack(app, `${APP_NAME}-${ENVIRONMENT}`, {
    env: { account: AWS_ACCOUNT, region: AWS_REGION },
    crossRegionReferences: true,
    description: 'Staging origin bucket and CloudFront distribution for the marketing site',
    domainName: DOMAIN_NAME,
    siteBucketName: siteBucketName(AWS_ACCOUNT),
    certificate: certificateStack.certificate,
    basicAuth: readBasicAuthCredentials(),
});
