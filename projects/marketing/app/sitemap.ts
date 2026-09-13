import type { MetadataRoute } from "next";
import { LEGAL_PAGES, NAV_ITEMS, SITE_URL } from "@/lib/site-content";

// The static export writes this out as sitemap.xml at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...NAV_ITEMS, ...LEGAL_PAGES].map(({ href }) => ({
    url: new URL(href, SITE_URL).toString(),
  }));
}
