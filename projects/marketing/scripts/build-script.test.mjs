import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const { scripts } = JSON.parse(readFileSync(join(import.meta.dirname, "..", "package.json"), "utf8"));

test("the build joins the export's page-data scripts after next build, so the content policy stays short", () => {
  expect(scripts.build.split("&&").map((step) => step.trim())).toEqual([
    "next build",
    "node scripts/coalesce-flight-scripts.mjs",
  ]);
});
