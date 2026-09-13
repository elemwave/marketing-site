import { SiteAccess, readBasicAuthCredentials, renderViewerRequestFunction } from '../index';
import { credentials, production, staging } from './synthesise';

type CloudFrontRequest = {
    uri: string;
    headers: Record<string, { value: string }>;
};

type CloudFrontResponse = {
    statusCode: number;
    statusDescription?: string;
    headers?: Record<string, { value: string }>;
};

/**
 * CloudFront Functions run a standalone `handler` in their own runtime, so the
 * rendered source is evaluated here the same way the edge would evaluate it.
 */
function loadHandler(
    access: SiteAccess,
): (event: { request: CloudFrontRequest }) => CloudFrontRequest | CloudFrontResponse {
    const source = renderViewerRequestFunction(access);

    return new Function(`${source}; return handler;`)();
}

function requestFor(uri: string, authorization?: string): { request: CloudFrontRequest } {
    const headers: Record<string, { value: string }> = {};

    if (authorization !== undefined) {
        headers.authorization = { value: authorization };
    }

    return { request: { uri, headers } };
}

function validAuthorizationHeader(): string {
    const encoded = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');

    return `Basic ${encoded}`;
}

describe('basic auth credentials', () => {
    it('reads the username and password from the environment', () => {
        const result = readBasicAuthCredentials({
            STAGING_BASIC_AUTH_USER: 'elemwave',
            STAGING_BASIC_AUTH_PASSWORD: 'let-me-in',
        });

        expect(result).toEqual(credentials);
    });

    it('fails with an actionable message when the credentials are missing', () => {
        expect(() => readBasicAuthCredentials({})).toThrow(/STAGING_BASIC_AUTH_USER/);
    });

    it('fails when only one half of the credentials is present', () => {
        expect(() => readBasicAuthCredentials({ STAGING_BASIC_AUTH_USER: 'elemwave' }))
            .toThrow(/STAGING_BASIC_AUTH_PASSWORD/);
    });

    it('renders the edge function with the encoded credentials and no placeholder left', () => {
        const source = renderViewerRequestFunction(staging.access);

        expect(source).toContain(Buffer.from('elemwave:let-me-in').toString('base64'));
        expect(source).not.toContain('__EXPECTED_AUTHORISATION__');
    });
});

describe('staging viewer-request function', () => {
    describe('access control', () => {
        it('challenges a request that carries no credentials', () => {
            const result = loadHandler(staging.access)(requestFor('/')) as CloudFrontResponse;

            expect(result.statusCode).toBe(401);
            expect(result.headers?.['www-authenticate'].value).toContain('Basic realm=');
        });

        it('challenges a request that carries the wrong credentials', () => {
            const wrong = `Basic ${Buffer.from('elemwave:wrong').toString('base64')}`;

            const result = loadHandler(staging.access)(requestFor('/', wrong)) as CloudFrontResponse;

            expect(result.statusCode).toBe(401);
        });

        it('lets a request with the shared credentials through', () => {
            const result = loadHandler(staging.access)(requestFor('/', validAuthorizationHeader())) as CloudFrontRequest;

            expect(result.uri).toBe('/index.html');
        });
    });

    // Next.js exports `/policies` as `policies.html`, not `policies/index.html`,
    // because the app does not set `trailingSlash`.
    describe('static path resolution', () => {
        const authorised = (uri: string) =>
            loadHandler(staging.access)(requestFor(uri, validAuthorizationHeader())) as CloudFrontRequest;

        it('resolves the site root to the home document', () => {
            expect(authorised('/').uri).toBe('/index.html');
        });

        it('resolves a trailing-slash path to its page document', () => {
            expect(authorised('/policies/').uri).toBe('/policies.html');
        });

        it('resolves an extension-less path to its page document', () => {
            expect(authorised('/policies').uri).toBe('/policies.html');
        });

        it('resolves a nested page path to its page document', () => {
            expect(authorised('/legal/privacy').uri).toBe('/legal/privacy.html');
        });

        it('leaves a file request untouched', () => {
            expect(authorised('/_next/static/chunk.js').uri).toBe('/_next/static/chunk.js');
        });

        it('leaves a dotted file in a nested directory untouched', () => {
            expect(authorised('/images/hero.webp').uri).toBe('/images/hero.webp');
        });
    });
});

describe('production viewer-request function', () => {
    it('renders with no placeholder left', () => {
        expect(renderViewerRequestFunction(production.access)).not.toContain('__EXPECTED_AUTHORISATION__');
    });

    it('lets a request without credentials through to its page document', () => {
        const result = loadHandler(production.access)(requestFor('/legal/privacy')) as CloudFrontRequest;

        expect(result.uri).toBe('/legal/privacy.html');
    });

    it('ignores whatever credentials a request happens to carry', () => {
        const result = loadHandler(production.access)(requestFor('/', 'Basic anything')) as CloudFrontRequest;

        expect(result.uri).toBe('/index.html');
    });
});
