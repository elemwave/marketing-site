export type DeclaredSniffingAndTransport = {
    readonly contentTypeOptions?: unknown;
    readonly strictTransportSecurity?: unknown;
};

export type SniffingAndTransport = {
    readonly accessControlMaxAgeSec: number;
    readonly includeSubdomains: boolean;
    readonly preload: boolean;
};

const FORBID_SNIFFING = 'nosniff';

export function sniffingAndTransportFromDeclaration(
    declaration: DeclaredSniffingAndTransport,
): SniffingAndTransport {
    if (declaration.contentTypeOptions !== FORBID_SNIFFING) {
        throw new Error(
            `Declared contentTypeOptions must be exactly "${FORBID_SNIFFING}", got ${JSON.stringify(declaration.contentTypeOptions)}.`,
        );
    }

    if (typeof declaration.strictTransportSecurity !== 'string') {
        throw new Error(
            `Declared strictTransportSecurity must be an RFC 6797 transport string, got ${JSON.stringify(declaration.strictTransportSecurity)}.`,
        );
    }

    return parseStrictTransportSecurity(declaration.strictTransportSecurity);
}

function parseStrictTransportSecurity(value: string): SniffingAndTransport {
    let accessControlMaxAgeSec: number | undefined;
    let includeSubdomains = false;
    let preload = false;

    for (const rawDirective of value.split(';')) {
        const directive = rawDirective.trim();
        if (directive === '') {
            continue;
        }

        const separator = directive.indexOf('=');
        const name = (separator === -1 ? directive : directive.slice(0, separator)).trim().toLowerCase();
        const directiveValue = separator === -1 ? undefined : directive.slice(separator + 1).trim();

        if (name === 'max-age') {
            if (accessControlMaxAgeSec !== undefined) {
                throw new Error('Declared strictTransportSecurity has more than one max-age directive.');
            }
            if (directiveValue === undefined || !/^\d+$/.test(directiveValue)) {
                throw new Error(
                    `Declared strictTransportSecurity max-age must be a non-negative integer, got ${JSON.stringify(directiveValue)}.`,
                );
            }
            accessControlMaxAgeSec = Number.parseInt(directiveValue, 10);
            continue;
        }

        if (name === 'includesubdomains') {
            if (directiveValue !== undefined) {
                throw new Error('Declared strictTransportSecurity includeSubDomains must not take a value.');
            }
            if (includeSubdomains) {
                throw new Error('Declared strictTransportSecurity has more than one includeSubDomains directive.');
            }
            includeSubdomains = true;
            continue;
        }

        if (name === 'preload') {
            if (directiveValue !== undefined) {
                throw new Error('Declared strictTransportSecurity preload must not take a value.');
            }
            if (preload) {
                throw new Error('Declared strictTransportSecurity has more than one preload directive.');
            }
            preload = true;
            continue;
        }

        throw new Error(`Declared strictTransportSecurity has unknown directive ${JSON.stringify(name)}.`);
    }

    if (accessControlMaxAgeSec === undefined) {
        throw new Error('Declared strictTransportSecurity must include a max-age directive.');
    }

    return { accessControlMaxAgeSec, includeSubdomains, preload };
}
