import {
  ADDRESS,
  COMPANY_REGISTRATION,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  LOGO_PATH,
  SITE_URL,
  TRADING_NAME,
} from "./site-content";

export interface OrganisationRecord {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  legalName: string;
  taxID: string;
  url: string;
  logo: string;
  email: string;
  telephone: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    postalCode: string;
    addressLocality: string;
    addressCountry: string;
  };
}

/** The company behind the site, as a single record search engines can read. */
export function organisationRecord(): OrganisationRecord {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: TRADING_NAME,
    legalName: COMPANY_REGISTRATION.legalName,
    taxID: COMPANY_REGISTRATION.taxId,
    url: SITE_URL,
    logo: new URL(LOGO_PATH, SITE_URL).toString(),
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE.display,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.streetAddress,
      postalCode: ADDRESS.postalCode,
      addressLocality: ADDRESS.addressLocality,
      addressCountry: ADDRESS.addressCountry,
    },
  };
}
