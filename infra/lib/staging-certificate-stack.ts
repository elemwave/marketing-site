import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Certificate, CertificateValidation, ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";

export interface StagingCertificateStackProps extends StackProps {
  readonly domainName: string;
}

/**
 * The staging certificate, isolated in us-east-1 because CloudFront accepts no
 * other region.
 *
 * The `elemwave.com` zone is not hosted in Route 53, so nothing here can write
 * the validation record: deploying this stack stops at CREATE_IN_PROGRESS until
 * an operator copies the CNAME that ACM asks for into the external DNS zone.
 * Keeping it in its own stack means that one-off wait never blocks the
 * deployment pipeline, which only ever deploys the site stack.
 */
export class StagingCertificateStack extends Stack {
  public readonly certificate: ICertificate;

  constructor(scope: Construct, id: string, props: StagingCertificateStackProps) {
    super(scope, id, props);

    this.certificate = new Certificate(this, "Certificate", {
      domainName: props.domainName,
      validation: CertificateValidation.fromDns(),
    });

    new CfnOutput(this, "CertificateArn", {
      value: this.certificate.certificateArn,
      description: "ACM certificate served by the staging distribution",
    });
  }
}
