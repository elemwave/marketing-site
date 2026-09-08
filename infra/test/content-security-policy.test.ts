import { account, domainName, synthesise } from './synthesise';
import { Template } from 'aws-cdk-lib/assertions';
import { applyHashes, hashesForHtml } from '../../tools/inline-script-hashes';



describe('content security policy', () => {
    const template = synthesise();

    it('sends an enforcing policy, never report-only', () => {
        const policies = template.findResources('AWS::CloudFront::ResponseHeadersPolicy');
        const configs = Object.values(policies).map(
            (policy) => policy.Properties.ResponseHeadersPolicyConfig.SecurityHeadersConfig,
        );

        expect(configs.some((config) => config?.ContentSecurityPolicy)).toBe(true);
        for (const config of configs) {
            expect(config?.ContentSecurityPolicy?.Override).toBe(true);
        }
    });

    it('carries the inline script hashes it was given and no unsafe-inline', () => {
        const policies = template.findResources('AWS::CloudFront::ResponseHeadersPolicy');
        const policy = Object.values(policies)
            .map((r) => r.Properties.ResponseHeadersPolicyConfig.SecurityHeadersConfig?.ContentSecurityPolicy)
            .find((c) => c)?.ContentSecurityPolicy as string;

        expect(policy).toContain("'sha256-AAAA'");
        expect(policy).toContain("'sha256-BBBB'");
        const scriptSrc = policy.split(';').find((d) => d.trim().startsWith('script-src')) as string;
        expect(scriptSrc).not.toContain("'unsafe-inline'");
        expect(scriptSrc).not.toContain("'unsafe-eval'");
        expect(policy).toContain('upgrade-insecure-requests');
    });

    it('permits the Calendly asset host the booking dialog loads its icon from', () => {
        const policies = template.findResources('AWS::CloudFront::ResponseHeadersPolicy');
        const policy = Object.values(policies)
            .map((r) => r.Properties.ResponseHeadersPolicyConfig.SecurityHeadersConfig?.ContentSecurityPolicy)
            .find((c) => c)?.ContentSecurityPolicy as string;

        const imgSrc = policy.split(';').find((directive) => directive.trim().startsWith('img-src')) as string;
        expect(imgSrc).toContain('https://assets.calendly.com');
    });

    it('hashes only scripts without a src', () => {
        const html = '<script src="/a.js"></script><script>alert(1)</script>';
        expect(hashesForHtml(html)).toHaveLength(1);
    });

    it('adds the hashes to script-src and leaves other directives alone', () => {
        const applied = applyHashes("default-src 'self'; script-src 'self'; img-src 'self'", ['sha256-X']);
        expect(applied).toContain("script-src 'self' 'sha256-X'");
        expect(applied).toContain("default-src 'self'");
        expect(applied).toContain("img-src 'self'");
    });
});
