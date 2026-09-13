import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("the robots file", () => {
  it("should let every crawler index the site", () => {
    expect(robots().rules).toEqual({ userAgent: "*", allow: "/" });
  });

  it("should point crawlers at the sitemap", () => {
    expect(robots().sitemap).toBe("https://www.elemwave.com/sitemap.xml");
  });
});
