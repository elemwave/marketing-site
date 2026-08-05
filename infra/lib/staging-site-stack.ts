import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
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
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { BasicAuthCredentials, renderViewerRequestFunction } from "./basic-auth";

export interface StagingSiteStackProps extends StackProps {
  readonly domainName: string;
  readonly siteBucketName: string;
  readonly certificate: ICertificate;
  readonly basicAuth: BasicAuthCredentials;
}

const NOT_FOUND_DOCUMENT = "/404.html";

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

    const siteBucket = new Bucket(this, "SiteBucket", {
      bucketName: props.siteBucketName,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      // Staging holds no state worth keeping: every deployment republishes it.
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const viewerRequest = new CloudFrontFunction(this, "ViewerRequest", {
      code: FunctionCode.fromInline(renderViewerRequestFunction(props.basicAuth)),
      runtime: FunctionRuntime.JS_2_0,
      comment: "Staging basic auth and static path resolution",
    });

    const responseHeaders = new ResponseHeadersPolicy(this, "ResponseHeaders", {
      comment: "Staging security headers and search engine exclusion",
      customHeadersBehavior: {
        customHeaders: [
          { header: "X-Robots-Tag", value: "noindex, nofollow", override: true },
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

    const distribution = new Distribution(this, "Distribution", {
      comment: `Elemwave staging (${props.domainName})`,
      domainNames: [props.domainName],
      certificate: props.certificate,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultRootObject: "index.html",
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
      // A private origin answers unknown keys with 403, so both statuses mean
      // "no such page" here.
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 404, responsePagePath: NOT_FOUND_DOCUMENT, ttl: Duration.minutes(5) },
        { httpStatus: 404, responseHttpStatus: 404, responsePagePath: NOT_FOUND_DOCUMENT, ttl: Duration.minutes(5) },
      ],
    });

    new CfnOutput(this, "SiteBucketName", {
      value: siteBucket.bucketName,
      description: "Bucket the deployment workflow syncs the exported site into",
    });

    new CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
      description: "Distribution the deployment workflow invalidates",
    });

    new CfnOutput(this, "StagingUrl", {
      value: `https://${props.domainName}`,
      description: "Staging entry point",
    });
  }
}
