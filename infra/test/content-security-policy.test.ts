import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { synthesise } from './synthesise';
import { withPublishedHashes } from '../index';
import { applyHashes, hashesForHtml } from '../../tools/inline-script-hashes';

/** A directory holding the page documents a deployment finds already published. */
function publishedExport(documents: Record<string, string>): string {
    const directory = mkdtempSync(join(tmpdir(), 'published-export-'));

    for (const [path, html] of Object.entries(documents)) {
        mkdirSync(join(directory, path, '..'), { recursive: true });
        writeFileSync(join(directory, path), html);
    }

    return directory;
}

describe('hashes admitted while a deployment replaces the published pages', () => {
    const [previousHash] = hashesForHtml('<script>previous()</script>');
    const [currentHash] = hashesForHtml('<script>current()</script>');

    it("admits only the new build's hashes when nothing has been published", () => {
        expect(withPublishedHashes([currentHash], undefined)).toEqual([currentHash]);
    });

    it('also admits the hashes of the pages still published, so they keep running until replaced', () => {
        const published = publishedExport({
            'index.html': '<script>previous()</script>',
            'legal/privacy.html': '<script>current()</script>',
        });

        expect(withPublishedHashes([currentHash], published)).toEqual([currentHash, previousHash].sort());
    });

    it('fails when the published pages it was pointed at are missing', () => {
        expect(() => withPublishedHashes([currentHash], join(tmpdir(), 'no-such-published-export'))).toThrow(
            /no-such-published-export/,
        );
    });
});



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
