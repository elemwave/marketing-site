import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-content";

// The static export writes this out as robots.txt at build time. Staging stays
// out of search results through its `X-Robots-Tag` header, not this file.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
