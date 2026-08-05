// index.ts builds the CDK app as soon as it is imported, so the variables it
// reads have to exist before any test module is loaded.
process.env.CDK_DEPLOY_ACCOUNT = process.env.CDK_DEPLOY_ACCOUNT || '123456789012';
process.env.STAGING_BASIC_AUTH_USER = process.env.STAGING_BASIC_AUTH_USER || 'elemwave';
process.env.STAGING_BASIC_AUTH_PASSWORD = process.env.STAGING_BASIC_AUTH_PASSWORD || 'let-me-in';
