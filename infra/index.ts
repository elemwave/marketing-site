import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Construct } from 'constructs';
import * as securityHeaders from '../config/security-headers.json';
import { applyHashes, collectHashes } from '../tools/inline-script-hashes';
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

const NOT_FOUND_DOCUMENT = '/404.html';
const BASIC_AUTH_USERNAME_VARIABLE = 'STAGING_BASIC_AUTH_USER';
const BASIC_AUTH_PASSWORD_VARIABLE = 'STAGING_BASIC_AUTH_PASSWORD';
const EXPECTED_AUTHORISATION_PLACEHOLDER = '__EXPECTED_AUTHORISATION__';
// Where the deployment workflow downloads the page documents already published,
// so the new policy keeps admitting their scripts until they are replaced.
const PUBLISHED_EXPORT_VARIABLE = 'PUBLISHED_EXPORT_DIRECTORY';

export interface BasicAuthCredentials {
    readonly username: string;
    readonly password: string;
}

export type SiteAccess =
    | { readonly kind: 'public' }
    | { readonly kind: 'shared-credentials'; readonly credentials: BasicAuthCredentials };

export interface SiteEnvironment {
    readonly name: string;
    readonly domainName: string;
    readonly access: SiteAccess;
    readonly searchIndexing: 'allowed' | 'excluded';
}

/**
 * The staging credentials never live in the repository: they come from the
 * environment (Parameter Store in CI, an exported shell variable locally).
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

/**
 * What distinguishes the environments the site is published to. Staging is a
 * private review copy; production is the public site search engines index.
 */
export function siteEnvironment(name: string, variables: NodeJS.ProcessEnv = process.env): SiteEnvironment {
    switch (name) {
        case 'staging':
            return {
                name,
                domainName: 'staging.elemwave.com',
                access: { kind: 'shared-credentials', credentials: readBasicAuthCredentials(variables) },
                searchIndexing: 'excluded',
            };
        case 'production':
            return {
                name,
                domainName: 'www.elemwave.com',
                access: { kind: 'public' },
                searchIndexing: 'allowed',
            };
        default:
            throw new Error(`Unknown ENVIRONMENT "${name}": expected staging or production.`);
    }
}

export function renderViewerRequestFunction(access: SiteAccess): string {
    const template = readFileSync(join(__dirname, 'functions', 'viewer-request.js'), 'utf-8');

    return template.split(EXPECTED_AUTHORISATION_PLACEHOLDER).join(expectedAuthorisation(access));
}

function expectedAuthorisation(access: SiteAccess): string {
    if (access.kind === 'public') {
        return 'null';
    }

    const { username, password } = access.credentials;

    return JSON.stringify(`Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`);
}

export function siteBucketName(environmentName: string, account: string): string {
    return `${APP_NAME}-${environmentName}-site-${account}`;
}

/**
 * A deployment switches the content policy before it uploads the new page
 * documents and refreshes the cache, so for a while visitors still receive the
 * documents already published. Admitting their inline scripts as well keeps
 * those pages working until they are replaced; the next deployment drops them.
 */
export function withPublishedHashes(built: readonly string[], publishedDirectory: string | undefined): string[] {
    if (publishedDirectory === undefined) {
        return [...built];
    }

    if (!existsSync(publishedDirectory)) {
        throw new Error(`No published page documents at ${publishedDirectory}, where ${PUBLISHED_EXPORT_VARIABLE} points.`);
    }

    return [...new Set([...built, ...collectHashes(publishedDirectory)])].sort();
}

export interface SiteCertificateStackProps extends StackProps {
    readonly domainName: string;
}

/**
 * An environment's certificate, isolated in us-east-1 because CloudFront
 * accepts no other region.
 *
 * The elemwave.com zone is not hosted in Route 53, so nothing here can write the
 * validation record: deploying this stack stops at CREATE_IN_PROGRESS until an
 * operator copies the CNAME that ACM asks for into the external DNS zone.
 * Keeping it in its own stack means that one-off wait never blocks the
 * deployment pipeline, which only ever deploys the site stack.
 */
export class SiteCertificateStack extends Stack {
    public readonly certificate: ICertificate;

    constructor(scope: Construct, id: string, props: SiteCertificateStackProps) {
        super(scope, id, props);

        this.certificate = new Certificate(this, 'Certificate', {
            domainName: props.domainName,
            validation: CertificateValidation.fromDns(),
        });

        new CfnOutput(this, 'CertificateArn', {
            value: this.certificate.certificateArn,
            description: `ACM certificate served by the ${props.domainName} distribution`,
        });
    }
}

export interface SiteStackProps extends StackProps {
    readonly environment: SiteEnvironment;
    readonly siteBucketName: string;
    readonly certificate: ICertificate;
    readonly inlineScriptHashes: readonly string[];
}

/**
 * Where the exported marketing site is served from: a private bucket that only
 * CloudFront can read, behind a distribution that resolves static paths at the
 * edge and, for an environment behind shared credentials, authenticates visitors.
 *
 * The stack owns the infrastructure only. The site files are uploaded by the
 * deployment workflow, which can then set cache headers per prefix and
 * invalidate the distribution itself.
 */
export class SiteStack extends Stack {
    constructor(scope: Construct, id: string, props: SiteStackProps) {
        super(scope, id, props);

        const { environment } = props;

        const siteBucket = new Bucket(this, 'SiteBucket', {
            bucketName: props.siteBucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            // The bucket holds no state worth keeping: every deployment republishes it.
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const viewerRequest = new CloudFrontFunction(this, 'ViewerRequest', {
            functionName: `${APP_NAME}-${environment.name}-viewer-request`,
            code: FunctionCode.fromInline(renderViewerRequestFunction(environment.access)),
            runtime: FunctionRuntime.JS_2_0,
            comment: environment.access.kind === 'public'
                ? 'Static path resolution'
                : 'Shared basic auth and static path resolution',
        });

        const responseHeaders = new ResponseHeadersPolicy(this, 'ResponseHeaders', {
            responseHeadersPolicyName: `${APP_NAME}-${environment.name}-response-headers`,
            comment: environment.searchIndexing === 'excluded'
                ? 'Security headers and search engine exclusion'
                : 'Security headers',
            customHeadersBehavior: environment.searchIndexing === 'excluded'
                ? { customHeaders: [{ header: 'X-Robots-Tag', value: 'noindex, nofollow', override: true }] }
                : undefined,
            securityHeadersBehavior: {
                contentSecurityPolicy: {
                    contentSecurityPolicy: `${applyHashes(securityHeaders.documentContentSecurityPolicy, [...props.inlineScriptHashes])}; ${securityHeaders.secureTransportDirectives}`,
                    override: true,
                },
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
            comment: `${APP_NAME}-${environment.name} (${environment.domainName})`,
            domainNames: [environment.domainName],
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

        new CfnOutput(this, 'SiteUrl', {
            value: `https://${environment.domainName}`,
            description: 'Entry point of the published site',
        });
    }
}

function marketingExportHashes(): string[] {
    const exportDirectory = join(__dirname, '..', 'projects', 'marketing', 'out');
    const synthesising = Boolean(process.env.CDK_OUTDIR);

    if (!existsSync(exportDirectory)) {
        if (synthesising) {
            throw new Error(
                `No export at ${exportDirectory}. Build the site before synthesising: a policy ` +
                    'with no script hashes refuses every inline script the site has.',
            );
        }
        return [];
    }

    const built = collectHashes(exportDirectory);

    if (synthesising && built.length === 0) {
        throw new Error(`No inline scripts found in ${exportDirectory}; refusing to deploy an empty script-src.`);
    }

    return built;
}

const app = new App();
const environment = siteEnvironment(ENVIRONMENT);
const title = environment.name.charAt(0).toUpperCase() + environment.name.slice(1);

// The IAM role GitHub Actions assumes is maintained by hand in the AWS account,
// so it is deliberately absent from this app. See README.md.
const certificateStack = new SiteCertificateStack(app, `${APP_NAME}-${environment.name}-certificate`, {
    env: { account: AWS_ACCOUNT, region: CERTIFICATE_REGION },
    crossRegionReferences: true,
    description: `ACM certificate for the ${environment.name} distribution (manual DNS validation)`,
    domainName: environment.domainName,
});

new SiteStack(app, `${APP_NAME}-${environment.name}`, {
    env: { account: AWS_ACCOUNT, region: AWS_REGION },
    crossRegionReferences: true,
    description: `${title} origin bucket and CloudFront distribution for the marketing site`,
    environment,
    siteBucketName: siteBucketName(environment.name, AWS_ACCOUNT),
    certificate: certificateStack.certificate,
    inlineScriptHashes: withPublishedHashes(marketingExportHashes(), process.env[PUBLISHED_EXPORT_VARIABLE]),
});
