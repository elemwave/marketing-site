import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("the sitemap", () => {
  it("should list every page the site serves at its public address", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toEqual([
      "https://www.elemwave.com/",
      "https://www.elemwave.com/partnerships",
      "https://www.elemwave.com/contact",
      "https://www.elemwave.com/integrated-policy",
      "https://www.elemwave.com/privacy-policy",
    ]);
  });
});
