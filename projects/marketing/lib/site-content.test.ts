import { describe, expect, it } from "vitest";
import { SLIDES } from "./home-content";
import {
  ADDRESS_LINES,
  LOGO_PATH,
  PARTNER_LOGOS,
  TRADING_NAME,
  partnerAccessibleName,
  partnerBySrc,
} from "./site-content";

describe("the shared organisation facts", () => {
  it("should publish the trading name visitors already see", () => {
    expect(TRADING_NAME).toBe("Elemwave");
  });

  it("should keep the visitor-facing address lines exactly as they are", () => {
    expect(ADDRESS_LINES).toEqual(["Recogidas 35 1A", "18005 Granada, Spain"]);
  });

  it("should name the public path of the brand mark", () => {
    expect(LOGO_PATH).toBe("/images/logo-elemwave.png");
  });
});

describe("the partner catalogue's published names", () => {
  it("publishes the organisation name for every entry", () => {
    for (const logo of PARTNER_LOGOS) {
      expect(partnerAccessibleName(logo)).toBe(logo.name);
    }
  });

  it("keeps organisation names unique", () => {
    const names = PARTNER_LOGOS.map((logo) => logo.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it("resolves every science-slide path to exactly one catalogue entry", () => {
    const paths = SLIDES.flatMap((slide) => slide.logos.map((mark) => mark.src));

    for (const src of paths) {
      const matches = PARTNER_LOGOS.filter((logo) => logo.src === src);

      expect(matches).toHaveLength(1);
      expect(partnerBySrc(src)).toEqual(matches[0]);
    }
  });
});
