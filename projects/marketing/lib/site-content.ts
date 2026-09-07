// Content shared by every page: the brand mark, the primary navigation, and the
// company's contact details. Page-specific content lives beside its page
// (see `home-content.ts`).

import logoElemwave from "@/public/images/logo-elemwave.png";

export const LOGO = logoElemwave;

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Partnerships", href: "/partnerships" },
  { label: "Contact", href: "/contact" },
] as const;

/** Every route the site serves, derived from the nav so the two cannot drift. */
export type SitePath = (typeof NAV_ITEMS)[number]["href"];

export const CONTACT_EMAIL = "info@elemwave.com";

/** `display` and `href` are one fact in two notations; keep them in sync. */
export const CONTACT_PHONE = {
  display: "+44 203 289 1024",
  href: "tel:+442032891024",
} as const;

/**
 * The contact panel renders these as separate lines; the footer joins them with
 * a comma. One source, so the two renderings cannot disagree.
 */
export const ADDRESS_LINES = ["Recogidas 35 1A", "18005 Granada, Spain"] as const;

export interface PartnerLogo {
  src: string;
  name: string;
}

/**
 * Partner logos, every `logo-*` file in `public/images/` except our own mark.
 *
 * The name is the alternative text, which is the point of storing it: the
 * science carousel still labels every logo "Partner logo", so nothing there
 * distinguishes them.
 *
 * NAMES MARKED `?` ARE INFERRED FROM THE FILENAME and need checking against the
 * real partners. A confidently wrong name in alternative text is worse than a
 * generic one, because nobody looking at the page can see it is wrong.
 */
export const PARTNER_LOGOS: PartnerLogo[] = [
  { src: "/images/logo-airbus.png", name: "Airbus" },
  { src: "/images/logo-ugr.png", name: "Universidad de Granada" },
  { src: "/images/logo-university-of-manchester.png", name: "The University of Manchester" },
  { src: "/images/logo-york-university.webp", name: "University of York" },
  { src: "/images/logo-amasya-university.png", name: "Amasya Üniversitesi" },
  { src: "/images/logo-politecnica-marche.png", name: "Università Politecnica delle Marche" },
  { src: "/images/logo-uca.png", name: "Universidad de Cádiz" }, // ?
  { src: "/images/logo-upc.png", name: "Universitat Politècnica de Catalunya" }, // ?
  { src: "/images/logo-uv.png", name: "Universitat de València" }, // ?
  { src: "/images/logo-hartree-centre.png", name: "Hartree Centre" },
  { src: "/images/logo-wavecore.png", name: "Wavecore" }, // ?
  { src: "/images/logo-msca.webp", name: "Marie Skłodowska-Curie Actions" },
  { src: "/images/logo-cost.webp", name: "COST" },
  { src: "/images/logo-aei.png", name: "Agencia Estatal de Investigación" },
  { src: "/images/logo-european-union.webp", name: "European Union" },
];
