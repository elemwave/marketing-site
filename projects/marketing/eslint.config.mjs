import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const FORBIDDEN_CHROME_IMPORTS = [
  {
    name: "@/components/site/Header",
    message: "A page contributes only its own content. Header is composed once, by app/layout.tsx.",
  },
  {
    name: "@/components/site/Footer",
    message: "A page contributes only its own content. Footer is composed once, by app/layout.tsx.",
  },
  {
    name: "@/components/site/OrganisationRecord",
    message:
      "A page contributes only its own content. OrganisationRecord is composed once, by app/(site)/layout.tsx.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["app/**/page.tsx", "app/not-found.tsx"],
    rules: {
      "no-restricted-imports": ["error", { paths: FORBIDDEN_CHROME_IMPORTS }],
    },
  },
]);

export default eslintConfig;
