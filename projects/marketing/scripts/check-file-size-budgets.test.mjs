import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

/**
 * The file-size report's growth account.
 *
 * The report once diffed directories this repository does not have, so every
 * file's change read as zero and nothing said so. Hence a real git repository,
 * a measured file that grows, and the report's own output.
 */
const script = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../scripts/check-file-size-budgets.sh",
);

const git = (cwd, ...args) =>
  execFileSync(
    "git",
    ["-c", "user.name=Test", "-c", "user.email=test@example.com", ...args],
    { cwd, stdio: "pipe" },
  );

const lines = (count) => `${Array.from({ length: count }, (_, i) => `// ${i}`).join("\n")}\n`;

// The Node image the test gate runs in carries neither bash nor git, and the
// script is a host-side gate (`make file-size-budgets`) rather than a container one.
const hasTools = ["bash", "git"].every((tool) => {
  try {
    execFileSync(tool, ["--version"], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
});

let root;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
});

describe.skipIf(!hasTools)("check-file-size-budgets.sh --report", () => {
  it.each(["projects/marketing/lib", "infra/lib"])(
    "reports the growth of a measured file under %s since the last commit",
    (dir) => {
      root = mkdtempSync(path.join(tmpdir(), "file-size-"));
      mkdirSync(path.join(root, dir), { recursive: true });
      writeFileSync(path.join(root, "file-size-budgets.txt"), "");
      writeFileSync(path.join(root, dir, "grown.ts"), lines(10));
      git(root, "init", "-q");
      git(root, "add", "-A");
      git(root, "commit", "-q", "-m", "start");

      writeFileSync(path.join(root, dir, "grown.ts"), lines(130));

      const output = execFileSync("bash", [script, "--root", root, "--report"], {
        encoding: "utf8",
      });

      expect(output).toContain("1 changed size for a net +120 lines");
      expect(output).toContain(`${dir}/grown.ts  130 lines (+120)`);
    },
  );
});
