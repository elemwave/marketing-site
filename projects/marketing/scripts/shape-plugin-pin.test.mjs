import { describe, expect, it } from "vitest";

import { comparePin, readLockedVersion } from "./shape-plugin-pin.mjs";

/**
 * The coupling between the plugin version the shape baseline was measured with
 * and the version the lock file now resolves.
 *
 * `npm run lint` never loads `eslint-plugin-sonarjs`, so a bump of it passed the
 * check agents reached for (EWM-33, EWM-69). Recording the measured version
 * beside the baseline and failing when the lock moves past it makes that bump
 * impossible to call verified by the wrong check.
 */
const lock = (version) => ({
  packages: { "node_modules/eslint-plugin-sonarjs": { version } },
});

describe("readLockedVersion", () => {
  it("reads the version the lock file resolves for a package", () => {
    expect(readLockedVersion(lock("4.2.2"), "eslint-plugin-sonarjs")).toBe(
      "4.2.2",
    );
  });

  it("is undefined when the lock file has no entry for the package", () => {
    expect(
      readLockedVersion({ packages: {} }, "eslint-plugin-sonarjs"),
    ).toBeUndefined();
    expect(readLockedVersion({}, "eslint-plugin-sonarjs")).toBeUndefined();
  });
});

describe("comparePin", () => {
  it("passes when the recorded and locked versions are equal", () => {
    expect(comparePin("4.2.2", "4.2.2")).toEqual({ ok: true });
  });

  it("fails when the lock has moved past the record (EWM-69: 4.2.1 -> 4.2.2)", () => {
    const result = comparePin("4.2.1", "4.2.2");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("4.2.1");
    expect(result.message).toContain("4.2.2");
    expect(result.message).toContain("make shape-complexity");
    expect(result.message).toContain("make shape-complexity-update");
  });

  it("fails when the record is missing", () => {
    const result = comparePin(undefined, "4.2.2");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("make shape-complexity-update");
  });

  it("fails when the lock file has no entry", () => {
    const result = comparePin("4.2.2", undefined);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("eslint-plugin-sonarjs");
  });
});
