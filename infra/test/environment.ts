// index.ts builds the CDK app as soon as it is imported, so the credentials it
// reads have to exist before any test module is loaded.
process.env.STAGING_BASIC_AUTH_USER = process.env.STAGING_BASIC_AUTH_USER || 'elemwave';
process.env.STAGING_BASIC_AUTH_PASSWORD = process.env.STAGING_BASIC_AUTH_PASSWORD || 'let-me-in';
