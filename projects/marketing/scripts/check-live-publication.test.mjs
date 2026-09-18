import http from "node:http";
import { expect, test } from "vitest";
import {
  collectPublicationObservations,
  fetchLive as defaultFetchLive,
  homePageFromBrowserResult,
  openLiveHomePage,
  runPublicationCheck,
} from "./check-live-publication.mjs";

const MARKETING_HEADLINE =
  "INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS";
const INTENDED_REVISION = "bed2859abc123";
const PUBLIC_ORIGIN = "https://www.elemwave.com";
const PRE_PRODUCTION_ORIGIN = "https://staging.elemwave.com";
const CREDENTIALS = { username: "reviewer", password: "secret" };

function passingHomePage(overrides = {}) {
  return {
    heading: MARKETING_HEADLINE,
    headers: {
      "content-security-policy": "default-src 'self'; script-src 'self'",
      ...overrides.headers,
    },
    refusals: [],
    ...overrides,
  };
}

function passingBodies() {
  return {
    "/version.json": { status: 200, body: JSON.stringify({ revision: INTENDED_REVISION }) },
    "/": { status: 200, body: `<h1>${MARKETING_HEADLINE}</h1>` },
    "/partnerships": { status: 200, body: "<h1>Partnerships Built On Technical Trust</h1>" },
    "/this-path-has-no-page": { status: 404, body: "<h1>Page not found</h1>" },
  };
}

async function collectWithRecorder(input, { homePage, httpResponses, insecure } = {}) {
  const fetchCalls = [];
  const homeCalls = [];
  const fetchLive = async (url, options = {}) => {
    fetchCalls.push({ url, options });
    const parsed = new URL(url);
    if (parsed.protocol === "http:" && parsed.pathname === "/") {
      return insecure ?? {
        status: 301,
        headers: { location: `${input.origin.replace(/\/$/, "")}/` },
        body: "",
      };
    }
    const response = httpResponses?.[parsed.pathname] ?? passingBodies()[parsed.pathname];
    if (!response) {
      return { status: 500, headers: {}, body: `unhandled ${parsed.pathname}` };
    }
    return { status: response.status, headers: response.headers ?? {}, body: response.body };
  };
  const openLiveHomePage = async (args) => {
    homeCalls.push(args);
    return homePage ?? passingHomePage();
  };
  const collected = await collectPublicationObservations(input, { fetchLive, openLiveHomePage });
  return { collected, fetchCalls, homeCalls };
}

function publicInput() {
  return {
    origin: PUBLIC_ORIGIN,
    intendedRevision: INTENDED_REVISION,
    environmentKind: "public",
  };
}

function preProductionInput() {
  return {
    origin: PRE_PRODUCTION_ORIGIN,
    intendedRevision: INTENDED_REVISION,
    environmentKind: "pre-production",
    credentials: CREDENTIALS,
  };
}

test("the collector requests the live paths and the http origin without following redirects", async () => {
  const { fetchCalls, homeCalls } = await collectWithRecorder(publicInput());
  const paths = fetchCalls.map((call) => new URL(call.url).pathname);
  expect(paths).toContain("/version.json");
  expect(paths).toContain("/");
  expect(paths).toContain("/partnerships");
  expect(paths).toContain("/this-path-has-no-page");
  const insecureOrigin = PUBLIC_ORIGIN.replace(/^https:/, "http:");
  const insecure = fetchCalls.find((call) => call.url.startsWith(insecureOrigin));
  expect(insecure).toBeTruthy();
  expect(insecure.options.followRedirects).toBe(false);
  expect(homeCalls).toHaveLength(1);
  expect(homeCalls[0].origin).toBe(PUBLIC_ORIGIN);
});

test("pre-production authenticated requests send the shared credentials and the unauthorised probe sends none", async () => {
  const { fetchCalls, homeCalls } = await collectWithRecorder(preProductionInput(), {
    homePage: passingHomePage({ headers: { "x-robots-tag": "noindex, nofollow" } }),
  });
  const withAuth = (pathname) =>
    fetchCalls.find((call) => new URL(call.url).pathname === pathname && call.url.startsWith("https:"));
  expect(withAuth("/version.json").options.credentials).toEqual(CREDENTIALS);
  expect(withAuth("/partnerships").options.credentials).toEqual(CREDENTIALS);
  expect(withAuth("/this-path-has-no-page").options.credentials).toEqual(CREDENTIALS);
  const unauthorised = fetchCalls.find(
    (call) => call.url === `${PRE_PRODUCTION_ORIGIN}/` && !call.options.credentials,
  );
  expect(unauthorised).toBeTruthy();
  expect(homeCalls[0].credentials).toEqual(CREDENTIALS);
});

test("public-site requests send no credentials", async () => {
  const { fetchCalls, homeCalls } = await collectWithRecorder(publicInput());
  expect(fetchCalls.every((call) => !call.options.credentials)).toBe(true);
  expect(homeCalls[0].credentials).toBeUndefined();
});

test("a mock that returns the passing fixtures yields a successful CLI exit", async () => {
  const { exitCode, lines } = await runWithRecorder(publicInput(), {});
  expect(exitCode).toBe(0);
  expect(lines).toEqual([]);
});

test("a mock that returns a different revision yields a non-zero exit and prints that failure", async () => {
  const { exitCode, lines } = await runWithRecorder(publicInput(), {
    httpResponses: {
      ...passingBodies(),
      "/version.json": { status: 200, body: JSON.stringify({ revision: "deadbeef" }) },
    },
  });
  expect(exitCode).not.toBe(0);
  expect(lines.some((line) => line.includes("revision") && line.includes("deadbeef"))).toBe(true);
});

test("every failure is printed when several fail together", async () => {
  const { exitCode, lines } = await runWithRecorder(publicInput(), {
    httpResponses: {
      ...passingBodies(),
      "/version.json": { status: 200, body: JSON.stringify({ revision: "deadbeef" }) },
      "/partnerships": { status: 200, body: "<h1>Wrong page</h1>" },
    },
  });
  expect(exitCode).not.toBe(0);
  expect(lines.some((line) => line.includes("revision"))).toBe(true);
  expect(lines.some((line) => line.includes("nested-path"))).toBe(true);
});

test("the home-page observation uses the injected page result rather than launching a browser", async () => {
  const { exitCode, lines } = await runWithRecorder(publicInput(), {
    homePage: passingHomePage({ heading: "Page not found" }),
  });
  expect(exitCode).not.toBe(0);
  expect(lines.some((line) => line.includes("home-page") && line.includes("Page not found"))).toBe(true);
});

test("default fetchLive talks to a local mock and does not follow the insecure redirect", async () => {
  const requests = [];
  const { origin, close } = await listen((req, res) => {
    requests.push({ url: req.url, authorization: req.headers.authorization ?? null });
    if (req.url === "/") {
      res.writeHead(301, { location: "https://www.elemwave.com/" });
      res.end();
      return;
    }
    res.writeHead(404);
    res.end("not used");
  });
  try {
    const result = await defaultFetchLive(`${origin}/`, { followRedirects: false });
    expect(result.status).toBe(301);
    expect(result.headers.location).toBe("https://www.elemwave.com/");
    expect(requests).toEqual([{ url: "/", authorization: null }]);
  } finally {
    await close();
  }
});

test("default fetchLive sends basic credentials when they are provided", async () => {
  const requests = [];
  const { origin, close } = await listen((req, res) => {
    requests.push(req.headers.authorization ?? null);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ revision: INTENDED_REVISION }));
  });
  try {
    const result = await defaultFetchLive(`${origin}/version.json`, { credentials: CREDENTIALS });
    expect(result.status).toBe(200);
    expect(JSON.parse(result.body).revision).toBe(INTENDED_REVISION);
    const encoded = Buffer.from(`${CREDENTIALS.username}:${CREDENTIALS.password}`).toString("base64");
    expect(requests).toEqual([`Basic ${encoded}`]);
  } finally {
    await close();
  }
});

test("homePageFromBrowserResult keeps the heading and only CSP refusal messages", () => {
  const result = homePageFromBrowserResult({
    headers: { "content-security-policy": "default-src 'self'" },
    heading: `  ${MARKETING_HEADLINE}  `,
    consoleMessages: [
      "hello",
      "Refused to execute inline script because it violates the following Content Security Policy directive",
    ],
  });
  expect(result.heading).toBe(MARKETING_HEADLINE);
  expect(result.refusals).toEqual([
    "Refused to execute inline script because it violates the following Content Security Policy directive",
  ]);
});

test("openLiveHomePage fails clearly when Chromium is missing", async () => {
  await expect(
    openLiveHomePage(
      { origin: PUBLIC_ORIGIN },
      {
        importPlaywright: async () => ({
          chromium: {
            launch: async () => {
              throw new Error("browserType.launch: Executable doesn't exist");
            },
          },
        }),
      },
    ),
  ).rejects.toThrow(/Chromium is not installed/);
});

async function runWithRecorder(input, options) {
  const lines = [];
  const { fetchLive, openLiveHomePage } = portsFromRecorder(input, options);
  const exitCode = await runPublicationCheck(input, {
    fetchLive,
    openLiveHomePage,
    log: (line) => lines.push(line),
  });
  return { exitCode, lines };
}

function portsFromRecorder(input, options) {
  const fetchCalls = [];
  const fetchLive = async (url, requestOptions = {}) => {
    fetchCalls.push({ url, options: requestOptions });
    const parsed = new URL(url);
    if (parsed.protocol === "http:" && parsed.pathname === "/") {
      return {
        status: 301,
        headers: { location: `${input.origin.replace(/\/$/, "")}/` },
        body: "",
      };
    }
    const response = options.httpResponses?.[parsed.pathname] ?? passingBodies()[parsed.pathname];
    return { status: response.status, headers: response.headers ?? {}, body: response.body };
  };
  const openLiveHomePage = async () => options.homePage ?? passingHomePage();
  return { fetchLive, openLiveHomePage, fetchCalls };
}

function listen(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        origin: `http://127.0.0.1:${port}`,
        close: () => new Promise((closed) => server.close(closed)),
      });
    });
  });
}
