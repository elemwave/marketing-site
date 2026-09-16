import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const APP_ROOT = path.join(__dirname, "..");
const PUBLISHED_ASSETS_DIR = path.join(APP_ROOT, "public");
const README_PATH = path.join(APP_ROOT, "README.md");

const LEFTOVER_STARTER_GRAPHICS = [
  "file.svg",
  "globe.svg",
  "next.svg",
  "vercel.svg",
  "window.svg",
] as const;

describe("leftover starter files", () => {
  it.each(LEFTOVER_STARTER_GRAPHICS)(
    "should omit leftover starter graphic %s from the published-assets folder",
    (name) => {
      expect(existsSync(path.join(PUBLISHED_ASSETS_DIR, name))).toBe(false);
    },
  );

  it("should describe the current site in the in-app README", () => {
    const readme = readFileSync(README_PATH, "utf-8");

    expect(readme).toContain("app/(home)/page.tsx");
    expect(readme).toMatch(/\bMontserrat\b/);
    expect(readme).toMatch(/\bInter\b/);
    expect(readme).toContain("../../README.md");
    expect(readme).not.toMatch(/edit(?:ing)? the page by modifying `app\/page\.tsx`/);
    expect(readme).not.toContain("Geist");
    expect(readme).not.toMatch(/^## Deploy on Vercel\s*$/m);
    expect(readme).not.toContain("vercel.com/new");
  });
});
