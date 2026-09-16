import { describe, expect, it } from "vitest";
import {
  ADDRESS,
  COMPANY_REGISTRATION,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  LOGO_PATH,
  SITE_URL,
  TRADING_NAME,
} from "./site-content";
import { organisationRecord } from "./organisation-record";

describe("the organisation record", () => {
  it("should describe the company with the facts the site already publishes", () => {
    expect(organisationRecord()).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Elemwave",
      legalName: "Elemwave S.L.",
      taxID: "B06913164",
      url: "https://www.elemwave.com",
      logo: "https://www.elemwave.com/images/logo-elemwave.png",
      email: "info@elemwave.com",
      telephone: "+44 203 289 1024",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Recogidas 35 1A",
        postalCode: "18005",
        addressLocality: "Granada",
        addressCountry: "Spain",
      },
    });
  });

  it("should take those facts from the same source the visitor-facing chrome uses", () => {
    const record = organisationRecord();

    expect(record.name).toBe(TRADING_NAME);
    expect(record.legalName).toBe(COMPANY_REGISTRATION.legalName);
    expect(record.taxID).toBe(COMPANY_REGISTRATION.taxId);
    expect(record.address.streetAddress).toBe(ADDRESS.streetAddress);
    expect(record.address.postalCode).toBe(ADDRESS.postalCode);
    expect(record.address.addressLocality).toBe(ADDRESS.addressLocality);
    expect(record.address.addressCountry).toBe(ADDRESS.addressCountry);
    expect(record.telephone).toBe(CONTACT_PHONE.display);
    expect(record.email).toBe(CONTACT_EMAIL);
    expect(record.url).toBe(SITE_URL);
    expect(record.logo).toBe(new URL(LOGO_PATH, SITE_URL).toString());
  });

  it("should omit the mercantile-registry line and any social-profile field", () => {
    const record = organisationRecord();
    const keys = Object.keys(record);

    expect(JSON.stringify(record)).not.toContain(COMPANY_REGISTRATION.registry);
    expect(keys).not.toContain("sameAs");
    expect(keys).not.toContain("registry");
  });

  it("should return the same record on every call", () => {
    expect(organisationRecord()).toEqual(organisationRecord());
  });
});
