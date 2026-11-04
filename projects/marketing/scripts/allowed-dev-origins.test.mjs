import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("development preview origins", () => {
  it("allows local and Overboards preview hosts by default", () => {
    expect(nextConfig.allowedDevOrigins).toEqual([
      "test.localhost.elemwave.com",
      "*.overboards.aircury.net",
    ]);
  });
});
