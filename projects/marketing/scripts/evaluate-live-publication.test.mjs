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

test("a matching revision passes", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected(),
  );
  expect(observation(results, "revision").passed).toBe(true);
});

test("a different SHA fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({ revision: { revision: "ffffffffffff" } }),
  );
  expect(observation(results, "revision").passed).toBe(false);
  expect(observation(results, "revision").reason).toMatch(/ffffffffffff/);
});

test("an empty revision fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({ revision: { revision: "" } }),
  );
  expect(observation(results, "revision").passed).toBe(false);
});

test("a missing revision fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({ revision: {} }),
  );
  expect(observation(results, "revision").passed).toBe(false);
});

test("the marketing home-page heading with no content-policy refusals passes", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected(),
  );
  expect(observation(results, "home-page").passed).toBe(true);
  expect(observation(results, "content-policy").passed).toBe(true);
});

test("a missing heading fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({ homePage: passingHomePage({ heading: "" }) }),
  );
  expect(observation(results, "home-page").passed).toBe(false);
});

test("a heading of Page not found fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({ homePage: passingHomePage({ heading: "Page not found" }) }),
  );
  expect(observation(results, "home-page").passed).toBe(false);
  expect(observation(results, "home-page").reason).toMatch(/Page not found/);
});

test("a report-only content policy fails even when an enforcing policy is also present", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({
      homePage: passingHomePage({
        headers: {
          "content-security-policy": "default-src 'self'",
          "content-security-policy-report-only": "default-src 'none'",
        },
      }),
    }),
  );
  expect(observation(results, "content-policy").passed).toBe(false);
  expect(observation(results, "content-policy").reason).toMatch(/report-only/i);
});

test("a missing enforcing content policy fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({
      homePage: passingHomePage({ headers: {} }),
    }),
  );
  expect(observation(results, "content-policy").passed).toBe(false);
});

test("a content-policy refusal message fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({
      homePage: passingHomePage({
        refusals: ["Refused to execute inline script because it violates the following Content Security Policy directive"],
      }),
    }),
  );
  expect(observation(results, "content-policy").passed).toBe(false);
  expect(observation(results, "content-policy").reason).toMatch(/Refused to execute/);
});

test("an insecure request with a 3xx Location to the equivalent https origin passes", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected(),
  );
  expect(observation(results, "insecure-redirect").passed).toBe(true);
});

test("a 200 on the insecure address fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({
      insecure: { status: 200, headers: { location: `${PUBLIC_ORIGIN}/` } },
    }),
  );
  expect(observation(results, "insecure-redirect").passed).toBe(false);
  expect(observation(results, "insecure-redirect").reason).toMatch(/200/);
});

test("nested /partnerships 200 whose body includes the partnerships heading passes", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected(),
  );
  expect(observation(results, "nested-path").passed).toBe(true);
});

test("nested /partnerships with a different body fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({
      nestedPath: { status: 200, body: "<h1>Something else</h1>" },
    }),
  );
  expect(observation(results, "nested-path").passed).toBe(false);
});

test("an unknown path with status 404 and the not-found page passes", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected(),
  );
  expect(observation(results, "not-found").passed).toBe(true);
});

test("an unknown path with status 200 and the not-found body fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({
      notFound: { status: 200, body: "<h1>Page not found</h1>" },
    }),
  );
  expect(observation(results, "not-found").passed).toBe(false);
  expect(observation(results, "not-found").reason).toMatch(/200/);
});

test("an unknown path with status 404 and a different body fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({
      notFound: { status: 404, body: "<h1>Missing</h1>" },
    }),
  );
  expect(observation(results, "not-found").passed).toBe(false);
});

test("a pre-production request without credentials returning 401 and Basic WWW-Authenticate passes", () => {
  const results = evaluateLivePublication(
    {
      origin: PRE_PRODUCTION_ORIGIN,
      intendedRevision: INTENDED_REVISION,
      environmentKind: "pre-production",
    },
    passingPreProductionCollected(),
  );
  expect(observation(results, "unauthorised").passed).toBe(true);
});

test("a 403 for the credential-gate probe fails", () => {
  const results = evaluateLivePublication(
    {
      origin: PRE_PRODUCTION_ORIGIN,
      intendedRevision: INTENDED_REVISION,
      environmentKind: "pre-production",
    },
    passingPreProductionCollected({
      unauthorised: {
        status: 403,
        headers: { "www-authenticate": 'Basic realm="Elemwave staging"' },
      },
    }),
  );
  expect(observation(results, "unauthorised").passed).toBe(false);
  expect(observation(results, "unauthorised").reason).toMatch(/403/);
});

test("successful pre-production home-page headers with x-robots-tag noindex, nofollow pass", () => {
  const results = evaluateLivePublication(
    {
      origin: PRE_PRODUCTION_ORIGIN,
      intendedRevision: INTENDED_REVISION,
      environmentKind: "pre-production",
    },
    passingPreProductionCollected(),
  );
  expect(observation(results, "search-exclusion").passed).toBe(true);
});

test("successful pre-production home-page headers without the search-exclusion instruction fail", () => {
  const results = evaluateLivePublication(
    {
      origin: PRE_PRODUCTION_ORIGIN,
      intendedRevision: INTENDED_REVISION,
      environmentKind: "pre-production",
    },
    passingPreProductionCollected({ searchExclusion: { headers: {} } }),
  );
  expect(observation(results, "search-exclusion").passed).toBe(false);
});

test("successful public-site home-page headers with the search-exclusion instruction fail", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({
      searchExclusion: { headers: { "x-robots-tag": "noindex, nofollow" } },
    }),
  );
  expect(observation(results, "search-exclusion").passed).toBe(false);
});

test("successful public-site home-page headers without the search-exclusion instruction pass", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected(),
  );
  expect(observation(results, "search-exclusion").passed).toBe(true);
});

test("every required observation is evaluated when the first one fails", () => {
  const results = evaluateLivePublication(
    { origin: PUBLIC_ORIGIN, intendedRevision: INTENDED_REVISION, environmentKind: "public" },
    passingPublicCollected({
      revision: { revision: "deadbeef" },
      nestedPath: { status: 200, body: "<h1>Wrong</h1>" },
    }),
  );
  expect(observation(results, "revision").passed).toBe(false);
  expect(observation(results, "nested-path").passed).toBe(false);
  expect(results.every((result) => typeof result.passed === "boolean")).toBe(true);
});
