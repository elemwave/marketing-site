import path from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

/**
 * A guard that the plugins bundled by `eslint-config-next` still report under
 * the installed ESLint major (EWM-30).
 *
 * `eslint-plugin-react`, `eslint-plugin-import` and `eslint-plugin-jsx-a11y`
 * declare no ESLint 10 peer, so npm installs them with the peer overridden. A
 * plugin that crashes on a removed rule-context member, or loads and goes
 * silent, would leave `npm run lint` green while checking nothing; each case
 * here fails if its rule stops reporting.
 */
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/**
 * The first case builds the whole ESLint configuration cold: about 3 s on an
 * idle machine, past vitest's 5 s default when the gate runs the app and
 * infrastructure suites side by side (EWM-128). Every case carries the
 * allowance because whichever runs first pays that cost.
 */
const LINT_LOAD_TIMEOUT_MS = 15_000;

const eslint = new ESLint({ cwd: projectRoot });

async function ruleIdsFor(filePath, source) {
  const [result] = await eslint.lintText(source, {
    filePath: path.join(projectRoot, filePath),
  });
  return result.messages.map((message) => message.ruleId);
}

describe("eslint-config-next plugins under the installed ESLint", () => {
  it("reports react/jsx-key for a list item without a key", async () => {
    const ids = await ruleIdsFor(
      "components/probe.tsx",
      "export const Probe = () => <ul>{[1, 2].map((n) => <li>{n}</li>)}</ul>;\n",
    );
    expect(ids).toContain("react/jsx-key");
  }, LINT_LOAD_TIMEOUT_MS);

  it("reports jsx-a11y/alt-text for an image without alt text", async () => {
    const ids = await ruleIdsFor(
      "components/probe.tsx",
      'export const Probe = () => <img src="/x.png" />;\n',
    );
    expect(ids).toContain("jsx-a11y/alt-text");
  }, LINT_LOAD_TIMEOUT_MS);

  it("reports import/no-anonymous-default-export for an anonymous default", async () => {
    const ids = await ruleIdsFor(
      "components/probe.tsx",
      "export default () => null;\n",
    );
    expect(ids).toContain("import/no-anonymous-default-export");
  }, LINT_LOAD_TIMEOUT_MS);
});
