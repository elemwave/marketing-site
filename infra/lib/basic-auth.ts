import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface BasicAuthCredentials {
  readonly username: string;
  readonly password: string;
}

const USERNAME_VARIABLE = "STAGING_BASIC_AUTH_USER";
const PASSWORD_VARIABLE = "STAGING_BASIC_AUTH_PASSWORD";
const CREDENTIALS_PLACEHOLDER = "__BASIC_AUTH_CREDENTIALS__";

/**
 * The staging credentials never live in the repository: they come from the
 * environment (repository secrets in CI, an exported shell variable locally).
 * Missing credentials fail the synthesis rather than publishing an open site.
 */
export function readBasicAuthCredentials(environment: NodeJS.ProcessEnv = process.env): BasicAuthCredentials {
  const missing = [USERNAME_VARIABLE, PASSWORD_VARIABLE].filter((variable) => !environment[variable]);

  if (missing.length > 0) {
    throw new Error(
      `Staging basic auth is not configured: set ${missing.join(" and ")} before running any cdk command.`,
    );
  }

  return {
    username: environment[USERNAME_VARIABLE] as string,
    password: environment[PASSWORD_VARIABLE] as string,
  };
}

export function renderViewerRequestFunction(credentials: BasicAuthCredentials): string {
  const encodedCredentials = Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64");
  const template = readFileSync(join(__dirname, "functions", "viewer-request.js"), "utf-8");

  return template.replaceAll(CREDENTIALS_PLACEHOLDER, encodedCredentials);
}
