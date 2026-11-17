import { describe, expect, it } from "vitest";
import { SLIDES } from "./home-content";
import {
  ADDRESS_LINES,
  DEMO_REQUEST_FORM_URL,
  AFFILIATION_ONLY_LOGOS,
  LOGO_PATH,
  NAV_ITEMS,
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

describe("the demo request form", () => {
  it("should point at Elemwave's hosted Google Form", () => {
    expect(DEMO_REQUEST_FORM_URL).toBe("https://forms.gle/nYArag8bmw7HwwAaA");
  });
});

describe("the shared primary navigation", () => {
  it("should list every primary public page in visitor-facing order", () => {
    expect(NAV_ITEMS).toEqual([
      { label: "Home", href: "/" },
      { label: "Partnerships", href: "/partnerships" },
      { label: "Our Team", href: "/team" },
      { label: "Contact", href: "/contact" },
    ]);
  });
});

/** Organisations the partnerships page no longer lists but a science slide still shows. */
const FORMER_PARTNERS_STILL_ON_A_SLIDE = [
  { src: "/images/logo-university-of-manchester.png", name: "The University of Manchester" },
  { src: "/images/logo-york-university.webp", name: "University of York" },
  { src: "/images/logo-amasya-university.png", name: "Amasya Üniversitesi" },
  { src: "/images/logo-politecnica-marche.png", name: "Università Politecnica delle Marche" },
  { src: "/images/logo-uca.png", name: "Universidad de Cádiz" },
  { src: "/images/logo-uv.png", name: "Universitat de València" },
  { src: "/images/logo-hartree-centre.png", name: "Hartree Centre" },
  { src: "/images/logo-wavecore.png", name: "Wavecore" },
  { src: "/images/logo-nlr.png", name: "Royal Netherlands Aerospace Centre" },
];

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
      const matches = [...PARTNER_LOGOS, ...AFFILIATION_ONLY_LOGOS].filter(
        (logo) => logo.src === src,
      );

      expect(matches).toHaveLength(1);
      expect(partnerBySrc(src)).toEqual(matches[0]);
    }
  });

  it("keeps our own mark out of the partner strip catalogue", () => {
    expect(PARTNER_LOGOS.map((logo) => logo.src)).not.toContain(
      "/images/logo-elemwave-affiliation.png",
    );
    expect(AFFILIATION_ONLY_LOGOS.map((logo) => logo.name)).toEqual([
      "Elemwave",
      ...FORMER_PARTNERS_STILL_ON_A_SLIDE.map((organisation) => organisation.name),
    ]);
  });

  it("labels the Royal Netherlands Aerospace Centre mark and keeps it out of the partner list", () => {
    expect(partnerAccessibleName(partnerBySrc("/images/logo-nlr.png"))).toBe(
      "Royal Netherlands Aerospace Centre",
    );
    expect(PARTNER_LOGOS.map((logo) => logo.src)).not.toContain("/images/logo-nlr.png");
    expect(AFFILIATION_ONLY_LOGOS.map((logo) => logo.src)).toContain("/images/logo-nlr.png");
  });

  it("lists exactly the four partners in the order Airbus, Universidad de Granada, Universitat Politècnica de Catalunya, Instituto Nacional de Técnica Aeroespacial", () => {
    expect(PARTNER_LOGOS.map((logo) => logo.name)).toEqual([
      "Airbus",
      "Universidad de Granada",
      "Universitat Politècnica de Catalunya",
      "Instituto Nacional de Técnica Aeroespacial",
    ]);
  });

  it("publishes INTA's mark as /images/logo-inta.png under its full organisation name", () => {
    const inta = PARTNER_LOGOS.find((logo) => logo.src === "/images/logo-inta.png");

    expect(inta?.name).toBe("Instituto Nacional de Técnica Aeroespacial");
    expect(partnerAccessibleName(partnerBySrc("/images/logo-inta.png"))).toBe(
      "Instituto Nacional de Técnica Aeroespacial",
    );
  });

  it("keeps every former partner that a science slide still shows out of the partner list and under its own published name", () => {
    for (const organisation of FORMER_PARTNERS_STILL_ON_A_SLIDE) {
      expect(PARTNER_LOGOS.map((logo) => logo.src)).not.toContain(organisation.src);
      expect(partnerAccessibleName(partnerBySrc(organisation.src))).toBe(organisation.name);
    }
  });

  it("lists no funder mark in either catalogue", () => {
    const published = [...PARTNER_LOGOS, ...AFFILIATION_ONLY_LOGOS].map((logo) => logo.src);

    for (const funder of [
      "/images/logo-european-union.webp",
      "/images/logo-msca.webp",
      "/images/logo-cost.webp",
      "/images/logo-aei.png",
    ]) {
      expect(published).not.toContain(funder);
    }
  });
});
