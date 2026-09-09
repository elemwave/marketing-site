import { expect, test } from "vitest";
import { evaluateBudgets, formatResult } from "./check-performance-budget.mjs";

test("a metric at its limit is within budget", () => {
  const [result] = evaluateBudgets({ a: { limit: 100 } }, { a: 100 });
  expect_equal(result.withinBudget, true);
});

test("a metric one byte over its limit is not", () => {
  const [result] = evaluateBudgets({ a: { limit: 100 } }, { a: 101 });
  expect_equal(result.withinBudget, false);
});

test("every budget is evaluated, not only the first breach", () => {
  const results = evaluateBudgets({ a: { limit: 1 }, b: { limit: 1 } }, { a: 2, b: 2 });
  expect_deep(results.map((r) => r.withinBudget), [false, false]);
});

test("a breach is marked FAIL and a pass is not", () => {
  expect_match(formatResult({ metric: "a", measured: 2, limit: 1, withinBudget: false }), /^FAIL/);
  expect_match(formatResult({ metric: "a", measured: 1, limit: 2, withinBudget: true }), /^ok/);
});

function expect_equal(actual, expected) { expect(actual).toBe(expected); }
function expect_deep(actual, expected) { expect(actual).toEqual(expected); }
function expect_match(actual, pattern) { expect(actual).toMatch(pattern); }
