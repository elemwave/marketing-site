// Content shared by every page: the brand mark, the primary navigation, and the
// company's contact details. Page-specific content lives beside its page
// (see `home-content.ts`).

import logoElemwave from "@/public/images/logo-elemwave.png";

export const LOGO = logoElemwave;

/** The public trading name visitors already see in the header, titles, and previews. */
export const TRADING_NAME = "Elemwave";

/** The brand mark's stable public path; `LOGO.src` is not crawlable in tests or the hashed export. */
export const LOGO_PATH = "/images/logo-elemwave.png";

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Partnerships", href: "/partnerships" },
  { label: "Our Team", href: "/team" },
  { label: "Contact", href: "/contact" },
] as const;

/** Every primary route, derived from the nav so the two cannot drift. */
export type SitePath = (typeof NAV_ITEMS)[number]["href"];

/** Legal documents, reached from the footer rather than the primary nav. */
export const LEGAL_PAGES = [
  { label: "Integrated policy", href: "/integrated-policy" },
  { label: "Privacy policy", href: "/privacy-policy" },
] as const;

/** The production origin, which search engines are told to index. */
export const SITE_URL = "https://www.elemwave.com";

/** The registered company behind the site, as the mercantile registry records it. */
export const COMPANY_REGISTRATION = {
  legalName: "Elemwave S.L.",
  taxId: "B06913164",
  registry:
    "Registro Mercantil de Granada, Tomo 1768, Libro 0, Folio 205, Sección 8, Hoja GR 56182",
} as const;

export const CONTACT_EMAIL = "info@elemwave.com";

/** `display` and `href` are one fact in two notations; keep them in sync. */
export const CONTACT_PHONE = {
  display: "+44 203 289 1024",
  href: "tel:+442032891024",
} as const;

/**
 * Structured postal address. Visitor-facing lines are a projection of this, so
 * the footer, contact panel, and organisation record cannot disagree.
 */
export const ADDRESS = {
  streetAddress: "Recogidas 35 1A",
  postalCode: "18005",
  addressLocality: "Granada",
  addressCountry: "Spain",
} as const;

/**
 * The contact panel renders these as separate lines; the footer joins them with
 * a comma. One source, so the two renderings cannot disagree.
 */
export const ADDRESS_LINES = [
  ADDRESS.streetAddress,
  `${ADDRESS.postalCode} ${ADDRESS.addressLocality}, ${ADDRESS.addressCountry}`,
] as const;

export interface PartnerLogo {
  src: string;
  name: string;
}

/**
 * Partner logos, every `logo-*` file in `public/images/` except our own mark.
 *
 * `name` is the organisation name published as alternative text by every
 * partner-logo surface. Both public surfaces take that published name from this
 * catalogue so they cannot drift.
 */
export const PARTNER_LOGOS: PartnerLogo[] = [
  { src: "/images/logo-airbus.png", name: "Airbus" },
  { src: "/images/logo-ugr.png", name: "Universidad de Granada" },
  {
    src: "/images/logo-university-of-manchester.png",
    name: "The University of Manchester",
  },
  { src: "/images/logo-york-university.webp", name: "University of York" },
  { src: "/images/logo-amasya-university.png", name: "Amasya Üniversitesi" },
  {
    src: "/images/logo-politecnica-marche.png",
    name: "Università Politecnica delle Marche",
  },
  { src: "/images/logo-uca.png", name: "Universidad de Cádiz" },
  {
    src: "/images/logo-upc.png",
    name: "Universitat Politècnica de Catalunya",
  },
  { src: "/images/logo-uv.png", name: "Universitat de València" },
  { src: "/images/logo-hartree-centre.png", name: "Hartree Centre" },
  { src: "/images/logo-wavecore.png", name: "Wavecore" },
  {
    src: "/images/logo-msca.webp",
    name: "Marie Skłodowska-Curie Actions",
  },
  { src: "/images/logo-cost.webp", name: "COST" },
  {
    src: "/images/logo-aei.png",
    name: "Agencia Estatal de Investigación",
  },
  { src: "/images/logo-european-union.webp", name: "European Union" },
];

/** Published alternative text for a catalogue entry. */
export const partnerAccessibleName = (entry: PartnerLogo): string => entry.name;

/** The catalogue entry for a science-slide path. A miss is a content error. */
export const partnerBySrc = (src: string): PartnerLogo => {
  const matches = PARTNER_LOGOS.filter((logo) => logo.src === src);
  if (matches.length !== 1) {
    throw new Error(
      `Science-slide path ${src} does not resolve to exactly one partner catalogue entry`,
    );
  }
  return matches[0];
};
