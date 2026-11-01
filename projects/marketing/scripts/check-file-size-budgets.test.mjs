import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

// The executable's own path, found by walking PATH, so nothing is run by bare name.
const findExecutable = (name) =>
  (process.env.PATH ?? "")
    .split(path.delimiter)
    .filter(Boolean)
    .map((dir) => path.join(dir, name))
    .find((candidate) => existsSync(candidate));

// The Node image the test gate runs in carries neither bash nor git, and the
// script is a host-side gate (`make file-size-budgets`) rather than a container one.
const bashPath = findExecutable("bash");
const gitPath = findExecutable("git");
const hasTools = Boolean(bashPath && gitPath);

const git = (cwd, ...args) =>
  execFileSync(
    gitPath,
    ["-c", "user.name=Test", "-c", "user.email=test@example.com", ...args],
    { cwd, stdio: "pipe" },
  );

const lines = (count) => Array.from({ length: count }, (_, i) => `// ${i}\n`).join("");

const repoRoot = path.resolve(path.dirname(script), "..");

let root;

const runReport = () =>
  execFileSync(bashPath, [script, "--root", root, "--report"], { encoding: "utf8" });

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

      const output = runReport();

      expect(output).toContain("1 changed size for a net +120 lines");
      expect(output).toContain(`${dir}/grown.ts  130 lines (+120)`);
    },
  );

  // Git pairs a rename by default, and its plain numstat names the pair as
  // `dir/{old.ts => renamed.ts}`, a path nothing measured carries.
  it("reports the growth of a measured file renamed since the last commit", () => {
    const dir = "projects/marketing/lib";
    root = mkdtempSync(path.join(tmpdir(), "file-size-"));
    mkdirSync(path.join(root, dir), { recursive: true });
    writeFileSync(path.join(root, "file-size-budgets.txt"), "");
    writeFileSync(path.join(root, dir, "old.ts"), lines(200));
    git(root, "init", "-q");
    git(root, "add", "-A");
    git(root, "commit", "-q", "-m", "start");

    git(root, "mv", `${dir}/old.ts`, `${dir}/renamed.ts`);
    writeFileSync(path.join(root, dir, "renamed.ts"), lines(260));

    const output = runReport();

    expect(output).toContain("1 changed size for a net +60 lines");
    expect(output).toContain(`${dir}/renamed.ts  260 lines (+60)`);
  });
});

/**
 * These run in the test gate's Node image, which has neither bash nor git, so
 * they read the script rather than run it: the regression was a hard-coded list
 * of directories the repository does not have.
 */
describe("check-file-size-budgets.sh measured directories", () => {
  const source = readFileSync(script, "utf8");
  const declared = /^readonly MEASURED_DIRS=\((.*)\)$/m.exec(source)?.[1].split(/\s+/) ?? [];

  it("names only directories that exist in this repository", () => {
    expect(declared.length).toBeGreaterThan(0);
    for (const dir of declared) {
      expect(existsSync(path.join(repoRoot, dir)), dir).toBe(true);
    }
  });

  it("diffs the same list it measures, without a list of its own", () => {
    expect(source).toMatch(/for dir in "\$\{MEASURED_DIRS\[@\]\}"; do/);
    expect(source).toMatch(/diff --numstat[^"\n]* "\$base" -- \\\n\s+"\$\{MEASURED_DIRS\[@\]\}"/);
  });
});
