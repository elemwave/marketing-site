import { siteEnvironment } from '../index';

describe('site environments', () => {
    const credentialVariables = {
        STAGING_BASIC_AUTH_USER: 'elemwave',
        STAGING_BASIC_AUTH_PASSWORD: 'let-me-in',
    };

    it('serves staging on its subdomain, behind the shared credentials, out of search indexes', () => {
        expect(siteEnvironment('staging', credentialVariables)).toEqual({
            name: 'staging',
            domainName: 'staging.elemwave.com',
            access: { kind: 'shared-credentials', credentials: { username: 'elemwave', password: 'let-me-in' } },
            searchIndexing: 'excluded',
        });
    });

    it('refuses to describe staging without its credentials', () => {
        expect(() => siteEnvironment('staging', {})).toThrow(/STAGING_BASIC_AUTH_USER/);
    });

    it('serves production publicly on the www address and lets search engines index it', () => {
        expect(siteEnvironment('production', {})).toEqual({
            name: 'production',
            domainName: 'www.elemwave.com',
            access: { kind: 'public' },
            searchIndexing: 'allowed',
        });
    });

    it('ignores staging credentials when describing production', () => {
        expect(siteEnvironment('production', credentialVariables).access).toEqual({ kind: 'public' });
    });

    it('names the environments it knows when given another', () => {
        expect(() => siteEnvironment('preview', {})).toThrow(/"preview".*staging or production/);
    });
});
