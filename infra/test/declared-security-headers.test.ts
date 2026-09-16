import * as declaredSecurityHeaders from '../../config/security-headers.json';
import { sniffingAndTransportFromDeclaration } from '../declared-security-headers';

describe('sniffingAndTransportFromDeclaration', () => {
    it('maps the live declaration to today\'s sniffing and transport values', () => {
        expect(sniffingAndTransportFromDeclaration(declaredSecurityHeaders)).toEqual({
            accessControlMaxAgeSec: 31536000,
            includeSubdomains: true,
            preload: false,
        });
    });

    it('reads max-age as seconds', () => {
        expect(
            sniffingAndTransportFromDeclaration({
                contentTypeOptions: 'nosniff',
                strictTransportSecurity: 'max-age=1',
            }),
        ).toEqual({
            accessControlMaxAgeSec: 1,
            includeSubdomains: false,
            preload: false,
        });
    });

    it('treats a missing includeSubDomains directive as false', () => {
        expect(
            sniffingAndTransportFromDeclaration({
                contentTypeOptions: 'nosniff',
                strictTransportSecurity: 'max-age=31536000',
            }).includeSubdomains,
        ).toBe(false);
    });

    it('treats a preload directive as true', () => {
        expect(
            sniffingAndTransportFromDeclaration({
                contentTypeOptions: 'nosniff',
                strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
            }).preload,
        ).toBe(true);
    });

    it('rejects a sniffing value that is not exactly nosniff', () => {
        expect(() =>
            sniffingAndTransportFromDeclaration({
                contentTypeOptions: 'x-nosniff',
                strictTransportSecurity: 'max-age=31536000; includeSubDomains',
            }),
        ).toThrow();
    });

    it('rejects a transport string with no max-age', () => {
        expect(() =>
            sniffingAndTransportFromDeclaration({
                contentTypeOptions: 'nosniff',
                strictTransportSecurity: 'includeSubDomains',
            }),
        ).toThrow();
    });
});
