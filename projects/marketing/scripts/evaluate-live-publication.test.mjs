import { expect, test } from "vitest";
import { evaluateLivePublication } from "./evaluate-live-publication.mjs";

const MARKETING_HEADLINE =
  "INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS";
const INTENDED_REVISION = "bed2859abc123";
const PUBLIC_ORIGIN = "https://www.elemwave.com";
const PRE_PRODUCTION_ORIGIN = "https://staging.elemwave.com";

function passingHomePage(overrides = {}) {
  return {
    heading: MARKETING_HEADLINE,
    headers: {
      "content-security-policy": "default-src 'self'; script-src 'self'",
    },
    refusals: [],
    ...overrides,
  };
}

function passingPublicCollected(overrides = {}) {
  return {
    revision: { revision: INTENDED_REVISION },
    homePage: passingHomePage(),
    insecure: {
      status: 301,
      headers: { location: `${PUBLIC_ORIGIN}/` },
    },
    nestedPath: {
      status: 200,
      body: "<h1>Partnerships Built On Technical Trust</h1>",
    },
    notFound: {
      status: 404,
      body: "<h1>Page not found</h1>",
    },
    searchExclusion: { headers: {} },
    ...overrides,
  };
}

function passingPreProductionCollected(overrides = {}) {
  return {
    ...passingPublicCollected({
      insecure: {
        status: 301,
        headers: { location: `${PRE_PRODUCTION_ORIGIN}/` },
      },
      searchExclusion: { headers: { "x-robots-tag": "noindex, nofollow" } },
    }),
    unauthorised: {
      status: 401,
      headers: { "www-authenticate": 'Basic realm="Elemwave staging"' },
    },
    ...overrides,
  };
}

function observation(results, name) {
  return results.find((result) => result.name === name);
}

const PUBLIC_INPUT = { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" };
const PRE_PRODUCTION_INPUT = {
  origin: PRE_PRODUCTION_ORIGIN,
  intendedRevision: INTENDED_REVISION,
  environmentKind: "pre-production",
};

test.each([
  { label: "a matching revision passes", revision: { revision: INTENDED_REVISION }, passed: true },
  {
    label: "a different SHA fails",
    revision: { revision: "ffffffffffff" },
    passed: false,
    reasonMatch: /ffffffffffff/,
  },
  { label: "an empty revision fails", revision: { revision: "" }, passed: false },
  { label: "a missing revision fails", revision: {}, passed: false },
])("$label", ({ revision, passed, reasonMatch }) => {
  const results = evaluateLivePublication(PUBLIC_INPUT, passingPublicCollected({ revision }));
  expect(observation(results, "revision").passed).toBe(passed);
  if (reasonMatch) {
    expect(observation(results, "revision").reason).toMatch(reasonMatch);
  }
});

test("the marketing home-page heading with no content-policy refusals passes", () => {
  const results = evaluateLivePublication(PUBLIC_INPUT, passingPublicCollected());
  expect(observation(results, "home-page").passed).toBe(true);
  expect(observation(results, "content-policy").passed).toBe(true);
});

test.each([
  {
    label: "a missing heading fails",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected({ homePage: passingHomePage({ heading: "" }) }),
    name: "home-page",
    passed: false,
  },
  {
    label: "a heading of Page not found fails",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected({ homePage: passingHomePage({ heading: "Page not found" }) }),
    name: "home-page",
    passed: false,
    reasonMatch: /Page not found/,
  },
  {
    label: "a report-only content policy fails even when an enforcing policy is also present",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected({
      homePage: passingHomePage({
        headers: {
          "content-security-policy": "default-src 'self'",
          "content-security-policy-report-only": "default-src 'none'",
        },
      }),
    }),
    name: "content-policy",
    passed: false,
    reasonMatch: /report-only/i,
  },
  {
    label: "a missing enforcing content policy fails",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected({ homePage: passingHomePage({ headers: {} }) }),
    name: "content-policy",
    passed: false,
  },
  {
    label: "a content-policy refusal message fails",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected({
      homePage: passingHomePage({
        refusals: ["Refused to execute inline script because it violates the following Content Security Policy directive"],
      }),
    }),
    name: "content-policy",
    passed: false,
    reasonMatch: /Refused to execute/,
  },
  {
    label: "an insecure request with a 3xx Location to the equivalent https origin passes",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected(),
    name: "insecure-redirect",
    passed: true,
  },
  {
    label: "a 200 on the insecure address fails",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected({
      insecure: { status: 200, headers: { location: `${PUBLIC_ORIGIN}/` } },
    }),
    name: "insecure-redirect",
    passed: false,
    reasonMatch: /200/,
  },
  {
    label: "nested /partnerships 200 whose body includes the partnerships heading passes",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected(),
    name: "nested-path",
    passed: true,
  },
  {
    label: "nested /partnerships with a different body fails",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected({
      nestedPath: { status: 200, body: "<h1>Something else</h1>" },
    }),
    name: "nested-path",
    passed: false,
  },
  {
    label: "an unknown path with status 404 and the not-found page passes",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected(),
    name: "not-found",
    passed: true,
  },
  {
    label: "an unknown path with status 200 and the not-found body fails",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected({
      notFound: { status: 200, body: "<h1>Page not found</h1>" },
    }),
    name: "not-found",
    passed: false,
    reasonMatch: /200/,
  },
  {
    label: "an unknown path with status 404 and a different body fails",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected({
      notFound: { status: 404, body: "<h1>Missing</h1>" },
    }),
    name: "not-found",
    passed: false,
  },
  {
    label: "a pre-production request without credentials returning 401 and Basic WWW-Authenticate passes",
    input: PRE_PRODUCTION_INPUT,
    collected: passingPreProductionCollected(),
    name: "unauthorised",
    passed: true,
  },
  {
    label: "a 403 for the credential-gate probe fails",
    input: PRE_PRODUCTION_INPUT,
    collected: passingPreProductionCollected({
      unauthorised: {
        status: 403,
        headers: { "www-authenticate": 'Basic realm="Elemwave staging"' },
      },
    }),
    name: "unauthorised",
    passed: false,
    reasonMatch: /403/,
  },
  {
    label: "successful pre-production home-page headers with x-robots-tag noindex, nofollow pass",
    input: PRE_PRODUCTION_INPUT,
    collected: passingPreProductionCollected(),
    name: "search-exclusion",
    passed: true,
  },
  {
    label: "successful pre-production home-page headers without the search-exclusion instruction fail",
    input: PRE_PRODUCTION_INPUT,
    collected: passingPreProductionCollected({ searchExclusion: { headers: {} } }),
    name: "search-exclusion",
    passed: false,
  },
  {
    label: "successful public-site home-page headers with the search-exclusion instruction fail",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected({
      searchExclusion: { headers: { "x-robots-tag": "noindex, nofollow" } },
    }),
    name: "search-exclusion",
    passed: false,
  },
  {
    label: "successful public-site home-page headers without the search-exclusion instruction pass",
    input: PUBLIC_INPUT,
    collected: passingPublicCollected(),
    name: "search-exclusion",
    passed: true,
  },
])("$label", ({ input, collected, name, passed, reasonMatch }) => {
  const results = evaluateLivePublication(input, collected);
  expect(observation(results, name).passed).toBe(passed);
  if (reasonMatch) {
    expect(observation(results, name).reason).toMatch(reasonMatch);
  }
});

test("every required observation is evaluated when the first one fails", () => {
  const results = evaluateLivePublication(
    PUBLIC_INPUT,
    passingPublicCollected({
      revision: { revision: "deadbeef" },
      nestedPath: { status: 200, body: "<h1>Wrong</h1>" },
    }),
  );
  expect(observation(results, "revision").passed).toBe(false);
  expect(observation(results, "nested-path").passed).toBe(false);
  expect(results.every((result) => typeof result.passed === "boolean")).toBe(true);
});
