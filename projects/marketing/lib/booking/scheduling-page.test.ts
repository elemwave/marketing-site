import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const BUILD_CONFIGURATION = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.env",
);

function calendlyUrlLine(): string | undefined {
  return readFileSync(BUILD_CONFIGURATION, "utf8")
    .split(/\r?\n/)
    .find((line) => line.startsWith("CALENDLY_URL="));
}

describe("the scheduling page in the build configuration", () => {
  it("points the booking dialog at Jose Diaz's 30-minute meeting page", () => {
    expect(calendlyUrlLine()).toBe("CALENDLY_URL=https://calendly.com/jose-aircury/30min");
  });
});
