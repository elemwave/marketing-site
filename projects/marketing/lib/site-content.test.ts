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

const GENERIC_PARTNER_MARK = "Partner logo";

const UNCONFIRMED_NAMES = [
  "Universidad de Cádiz",
  "Universitat Politècnica de Catalunya",
  "Universitat de València",
  "Wavecore",
] as const;

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
  it("publishes the organisation name for each confirmed entry", () => {
    const confirmed = PARTNER_LOGOS.filter((logo) => logo.confirmed);

    expect(confirmed).toHaveLength(11);
    for (const logo of confirmed) {
      expect(partnerAccessibleName(logo)).toBe(logo.name);
    }
  });

  it("publishes a generic partner-mark description for the four unconfirmed entries", () => {
    for (const name of UNCONFIRMED_NAMES) {
      const logo = PARTNER_LOGOS.find((entry) => entry.name === name);

      expect(logo).toBeDefined();
      expect(logo?.confirmed).toBe(false);
      expect(partnerAccessibleName(logo!)).toBe(GENERIC_PARTNER_MARK);
    }
  });

  it("keeps confirmed organisation names unique", () => {
    const confirmedNames = PARTNER_LOGOS.filter((logo) => logo.confirmed).map(
      (logo) => logo.name,
    );

    expect(new Set(confirmedNames).size).toBe(confirmedNames.length);
  });

  it("does not treat the generic partner-mark description as a confirmed name", () => {
    const confirmedNames = PARTNER_LOGOS.filter((logo) => logo.confirmed).map(
      (logo) => logo.name,
    );

    expect(confirmedNames).not.toContain(GENERIC_PARTNER_MARK);
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
