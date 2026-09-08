/**
 * Code-shape rules for the frontend, run as a second ESLint pass.
 *
 * Deliberately NOT merged into `eslint.config.mjs`. That config's job is to
 * fail on zero findings — it is the gate a contributor expects to be green — and
 * these rules currently have 255 findings across 102 files, all of them
 * pre-existing. Folding them in would either turn the main lint stage red for
 * everybody or require 255 inline suppressions in product code, and this change
 * promises no application-code edits. Instead the findings are held against
 * `shape-lint-baseline.json`, counted per file per rule, and only *new* ones
 * fail. See specs/decisions/code-shape-verification.md.
 *
 * `eslint-plugin-sonarjs` is LGPL-3.0-only, unlike everything else in this
 * project's dependency tree. It is a development-time analyser: it is not
 * imported by application code, not bundled, and not distributed. Nothing here
 * links against it in the sense the licence is concerned with.
 *
 * The plugin bundles rules from `react-hooks` and `@next/next` as part of its
 * React support, and `eslint.config.mjs` already enables those. Six of them
 * fired on this tree, so they are switched off below: one defect reported twice
 * by two gates teaches nobody anything, and it would let a contributor "fix" a
 * finding here that the other stage still reports.
 */
import tsParser from "@typescript-eslint/parser";
import sonarjs from "eslint-plugin-sonarjs";
import next from "@next/eslint-plugin-next";

/**
 * The immediacy rule's call-site half (`specs/features/immediate-actions`):
 * a write sent outside a `runBoardCommand` / `runCardEdit` request is
 * reported unless its site is on the reviewed exemption list. The writes
 * each `lib/api` export reaches are derived from the modules by
 * `scripts/api-write-operations.mjs`; the barrel re-exports every module,
 * so the map is collapsed to export names (and a collision refused) there.
 * The missing-directive report is a rule of its own so that its count is
 * ratcheted apart from the first rule's.
 */
const ALREADY_OWNED_ELSEWHERE = [
  "@next/next/no-img-element",
  "react-hooks/exhaustive-deps",
  "react-hooks/incompatible-library",
  "react-hooks/purity",
  "react-hooks/refs",
  "react-hooks/set-state-in-effect",
];

const recommended = sonarjs.configs.recommended.rules ?? {};

const isOff = (severity) =>
  severity === "off" ||
  severity === 0 ||
  (Array.isArray(severity) && (severity[0] === "off" || severity[0] === 0));

const shapeRules = Object.fromEntries(
  Object.entries(recommended)
    .filter(([, severity]) => !isOff(severity))
    .filter(([rule]) => !ALREADY_OWNED_ELSEWHERE.includes(rule)),
);

const eslintConfig = [
  {
    // `scripts/` as well as `src/`: the gate's own tooling is held to the
    // standard it measures. The backend counterpart of this is `tools/` being
    // added to the cs-fixer finder and PHPStan's paths when
    // `shape-baseline.php` was written — a file that no analyser analyses is
    // the gap these gates exist to close, and the gates are not exempt from
    // it.
    files: ["**/*.{ts,tsx,mjs}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: { sonarjs, "@next/next": next },
    linterOptions: { reportUnusedDisableDirectives: "off" },
    rules: shapeRules,
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "coverage/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
