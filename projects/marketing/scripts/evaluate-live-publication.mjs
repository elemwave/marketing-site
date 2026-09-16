const MARKETING_HEADLINE =
  "INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS";
const PARTNERSHIPS_HEADING = "Partnerships Built On Technical Trust";
const NOT_FOUND_HEADING = "Page not found";
const SEARCH_EXCLUSION = "noindex, nofollow";

export function evaluateLivePublication(input, collected) {
  const results = [
    evaluateRevision(input.intendedRevision, collected.revision),
    evaluateHomePage(collected.homePage),
    evaluateContentPolicy(collected.homePage),
    evaluateInsecureRedirect(input.origin, collected.insecure),
    evaluateNestedPath(collected.nestedPath),
    evaluateNotFound(collected.notFound),
  ];

  if (input.environmentKind === "pre-production") {
    results.push(evaluateUnauthorised(collected.unauthorised));
    results.push(evaluateSearchExclusion(collected.searchExclusion, { required: true }));
  } else {
    results.push(evaluateSearchExclusion(collected.searchExclusion, { required: false }));
  }

  return results;
}

function evaluateRevision(intended, observed = {}) {
  const live = observed.revision;
  if (live === intended && live) {
    return pass("revision");
  }
  return fail(
    "revision",
    `expected ${intended}, live copy serves ${live === undefined || live === "" ? "nothing" : live}`,
  );
}

function evaluateHomePage(observed = {}) {
  const heading = (observed.heading ?? "").trim();
  if (heading === MARKETING_HEADLINE) {
    return pass("home-page");
  }
  if (!heading) {
    return fail("home-page", "missing heading");
  }
  return fail(
    "home-page",
    `heading was ${JSON.stringify(heading)}, not the marketing headline`,
  );
}

function evaluateContentPolicy(observed = {}) {
  const headers = observed.headers ?? {};
  const enforcing = header(headers, "content-security-policy");
  const reportOnly = header(headers, "content-security-policy-report-only");
  const refusals = observed.refusals ?? [];

  if (reportOnly) {
    return fail("content-policy", "report-only content policy is present");
  }
  if (!enforcing) {
    return fail("content-policy", "missing enforcing content policy");
  }
  if (refusals.length > 0) {
    return fail("content-policy", refusals[0]);
  }
  return pass("content-policy");
}

function evaluateInsecureRedirect(origin, observed = {}) {
  const status = observed.status;
  const location = header(observed.headers ?? {}, "location");
  if (isRedirect(status) && isEquivalentHttpsLocation(origin, location)) {
    return pass("insecure-redirect");
  }
  return fail(
    "insecure-redirect",
    `insecure request returned ${status}${location ? ` to ${location}` : ""}`,
  );
}

function evaluateNestedPath(observed = {}) {
  const body = observed.body ?? "";
  if (observed.status === 200 && body.includes(PARTNERSHIPS_HEADING)) {
    return pass("nested-path");
  }
  return fail(
    "nested-path",
    `nested path returned ${observed.status} without ${JSON.stringify(PARTNERSHIPS_HEADING)}`,
  );
}

function evaluateNotFound(observed = {}) {
  const body = observed.body ?? "";
  if (observed.status === 404 && body.includes(NOT_FOUND_HEADING)) {
    return pass("not-found");
  }
  return fail(
    "not-found",
    `unknown path returned ${observed.status} ${body.includes(NOT_FOUND_HEADING) ? "with the not-found page" : "without the not-found page"}`,
  );
}

function evaluateUnauthorised(observed = {}) {
  const authenticate = header(observed.headers ?? {}, "www-authenticate") ?? "";
  if (observed.status === 401 && authenticate.startsWith("Basic")) {
    return pass("unauthorised");
  }
  return fail(
    "unauthorised",
    `credential-gate probe returned ${observed.status}`,
  );
}

function evaluateSearchExclusion(observed = {}, { required }) {
  const robots = (header(observed.headers ?? {}, "x-robots-tag") ?? "").trim().toLowerCase();
  const present = robots === SEARCH_EXCLUSION;
  if (required) {
    return present
      ? pass("search-exclusion")
      : fail("search-exclusion", "missing noindex, nofollow instruction");
  }
  return present
    ? fail("search-exclusion", "public site carries noindex, nofollow")
    : pass("search-exclusion");
}

function header(headers, name) {
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) {
      return value;
    }
  }
  return undefined;
}

function isRedirect(status) {
  return status >= 300 && status < 400;
}

function isEquivalentHttpsLocation(origin, location) {
  if (!location) {
    return false;
  }
  try {
    const intended = new URL(origin);
    const actual = new URL(location, origin);
    return actual.protocol === "https:" && actual.host === intended.host;
  } catch {
    return false;
  }
}

function pass(name) {
  return { name, passed: true };
}

function fail(name, reason) {
  return { name, passed: false, reason };
}
