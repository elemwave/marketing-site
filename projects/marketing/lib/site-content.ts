// Content shared by every page: the brand mark, the primary navigation, and the
// company's contact details. Page-specific content lives beside its page
// (see `home-content.ts`).

import logoElemwave from "@/public/images/logo-elemwave.png";

export const LOGO = logoElemwave;

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
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
