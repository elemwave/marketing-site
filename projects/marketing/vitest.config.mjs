import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import thresholds from "../../config/coverage-thresholds.json" with { type: "json" };

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^.+\.(png|jpe?g|gif|webp|avif|svg)$/, replacement: path.resolve(rootDir, "test/image-stub.ts") },
      { find: "@", replacement: rootDir },
    ],
  },
  server: { fs: { allow: [path.resolve(rootDir, "..", "..")] } },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: [
      "{app,components,lib,scripts}/**/*.test.{ts,tsx,mjs}",
      "../../tools/**/*.test.{js,mjs}",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      reportsDirectory: "../../coverage",
      include: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts"],
      thresholds: {
        lines: thresholds.linesPercent,
        statements: thresholds.statementsPercent,
        functions: thresholds.functionsPercent,
        branches: thresholds.branchesPercent,
      },
    },
  },
});
