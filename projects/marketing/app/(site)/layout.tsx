import { OrganisationRecord } from "@/components/site/OrganisationRecord";

/**
 * Wraps every page the sitemap lists with the shared organisation record.
 * The not-found page (`app/not-found.tsx`) stays outside this group, so it
 * inherits the root layout's chrome but publishes no record — the group
 * boundary excludes it structurally, rather than a runtime route check.
 */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <OrganisationRecord />
      {children}
    </>
  );
}
