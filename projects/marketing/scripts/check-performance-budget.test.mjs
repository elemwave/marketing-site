import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateBudgets, formatResult } from "./check-performance-budget.mjs";

test("a metric at its limit is within budget", () => {
  const [result] = evaluateBudgets({ a: { limit: 100 } }, { a: 100 });
  assert.equal(result.withinBudget, true);
});

test("a metric one byte over its limit is not", () => {
  const [result] = evaluateBudgets({ a: { limit: 100 } }, { a: 101 });
  assert.equal(result.withinBudget, false);
});

test("every budget is evaluated, not only the first breach", () => {
  const results = evaluateBudgets({ a: { limit: 1 }, b: { limit: 1 } }, { a: 2, b: 2 });
  assert.deepEqual(results.map((r) => r.withinBudget), [false, false]);
});

test("a breach is marked FAIL and a pass is not", () => {
  assert.match(formatResult({ metric: "a", measured: 2, limit: 1, withinBudget: false }), /^FAIL/);
  assert.match(formatResult({ metric: "a", measured: 1, limit: 2, withinBudget: true }), /^ok/);
});
