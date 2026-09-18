import { organisationRecord } from "@/lib/organisation-record";

/**
 * Machine-readable organisation record for search engines. Invisible to visitors.
 *
 * Listed pages include this; the not-found page must not, because it is not in
 * the sitemap. The JSON-LD script follows Next's documented pattern: stringify
 * the record and escape `<` so a future fact cannot break out of the script.
 */
export function OrganisationRecord() {
  const jsonLd = JSON.stringify(organisationRecord()).replace(/</g, "\\u003c");

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
  );
}
