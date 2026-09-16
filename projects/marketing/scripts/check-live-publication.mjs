import { fileURLToPath } from "node:url";
import { evaluateLivePublication } from "./evaluate-live-publication.mjs";

export async function collectPublicationObservations(input, { fetchLive, openLiveHomePage }) {
  const origin = input.origin.replace(/\/$/, "");
  const credentials = input.credentials;
  const insecureOrigin = origin.replace(/^https:/, "http:");

  const versionResponse = await fetchLive(`${origin}/version.json`, {
    credentials,
    followRedirects: true,
  });

  const insecure = await fetchLive(`${insecureOrigin}/`, { followRedirects: false });
  const nestedPath = await fetchLive(`${origin}/partnerships`, {
    credentials,
    followRedirects: true,
  });
  const notFound = await fetchLive(`${origin}/this-path-has-no-page`, {
    credentials,
    followRedirects: true,
  });
  const unauthorised = await fetchLive(`${origin}/`, { followRedirects: true });
  const homePage = await openLiveHomePage({ origin, credentials });

  return {
    revision: { revision: readRevision(versionResponse.body) },
    homePage,
    insecure,
    nestedPath,
    notFound,
    unauthorised,
    searchExclusion: { headers: homePage.headers ?? {} },
  };
}

export async function runPublicationCheck(input, ports) {
  const collected = await collectPublicationObservations(input, ports);
  const results = evaluateLivePublication(input, collected);
  const failures = results.filter((result) => !result.passed);
  for (const failure of failures) {
    ports.log(`FAIL  ${failure.name}: ${failure.reason}`);
  }
  return failures.length === 0 ? 0 : 1;
}

export async function fetchLive(url, { credentials, followRedirects } = {}) {
  const headers = {};
  if (credentials?.username && credentials?.password) {
    const encoded = Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64");
    headers.Authorization = `Basic ${encoded}`;
  }

  const response = await fetch(url, {
    redirect: followRedirects === false ? "manual" : "follow",
    headers,
  });

  const responseHeaders = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    status: response.status,
    headers: responseHeaders,
    body: await response.text(),
  };
}

const CSP_REFUSAL = /Content Security Policy|Refused to/i;

export function homePageFromBrowserResult({ headers = {}, heading, consoleMessages = [] } = {}) {
  return {
    headers,
    heading: (heading ?? "").trim(),
    refusals: consoleMessages.filter((text) => CSP_REFUSAL.test(text)),
  };
}

export async function openLiveHomePage({ origin, credentials } = {}, { importPlaywright } = {}) {
  let chromium;
  try {
    ({ chromium } = await (importPlaywright ?? (() => import("playwright")))());
  } catch {
    throw chromiumMissing();
  }

  let browser;
  try {
    browser = await chromium.launch();
  } catch {
    throw chromiumMissing();
  }

  try {
    const context = await browser.newContext({
      httpCredentials: credentials
        ? { username: credentials.username, password: credentials.password }
        : undefined,
    });
    const page = await context.newPage();
    const consoleMessages = [];
    page.on("console", (message) => {
      consoleMessages.push(message.text());
    });
    const response = await page.goto(new URL("/", origin).href, { waitUntil: "load" });
    const heading = await page.locator("h1").first().textContent();
    return homePageFromBrowserResult({
      headers: response?.headers() ?? {},
      heading,
      consoleMessages,
    });
  } finally {
    await browser.close();
  }
}

function chromiumMissing() {
  return new Error(
    "Chromium is not installed. Run npx playwright install --with-deps chromium from projects/marketing.",
  );
}

export function readInputFromEnv(env = process.env) {
  const origin = env.SITE_URL;
  const intendedRevision = env.RELEASE_SHA;
  const environment = env.ENVIRONMENT;
  if (!origin || !intendedRevision || !environment) {
    throw new Error("SITE_URL, RELEASE_SHA and ENVIRONMENT are required");
  }

  const environmentKind = environment === "staging" ? "pre-production" : "public";
  const credentials =
    environmentKind === "pre-production"
      ? {
          username: env.STAGING_BASIC_AUTH_USER,
          password: env.STAGING_BASIC_AUTH_PASSWORD,
        }
      : undefined;

  if (environmentKind === "pre-production" && (!credentials.username || !credentials.password)) {
    throw new Error("STAGING_BASIC_AUTH_USER and STAGING_BASIC_AUTH_PASSWORD are required for staging");
  }

  return { origin, intendedRevision, environmentKind, credentials };
}

export async function main({
  env = process.env,
  fetchLive: fetchLivePort = fetchLive,
  openLiveHomePage: openLiveHomePagePort = openLiveHomePage,
  log = console.error,
} = {}) {
  const input = readInputFromEnv(env);
  return runPublicationCheck(input, {
    fetchLive: fetchLivePort,
    openLiveHomePage: openLiveHomePagePort,
    log,
  });
}

function readRevision(body) {
  try {
    return JSON.parse(body).revision;
  } catch {
    return undefined;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .then((code) => process.exit(code))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(2);
    });
}
