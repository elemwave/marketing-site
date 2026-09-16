import type { Metadata } from "next";
import { SITE_URL, TRADING_NAME } from "./site-content";

/** Resolved against the root layout's `metadataBase`, so previews get an absolute address. */
const PREVIEW_IMAGE = {
  url: "/images/opengraph-elemwave.jpg",
  width: 1200,
  height: 630,
  alt: "The Elemwave logo above an A320 aircraft coloured by a simulated electromagnetic field",
};

interface PageMetadataInput {
  title: string;
  description: string;
  /** The page's route, e.g. "/contact". */
  path: string;
  /**
   * The title already names the brand (the home page), so link previews use it
   * as it stands instead of appending the brand again.
   */
  isBrandTitle?: boolean;
}

/**
 * A page's title, description, canonical address and link-preview tags.
 *
 * Link previews need their own title: Next applies the root layout's title
 * template to the browser tab only, and a page that sets no `openGraph` would
 * inherit the root's, so every shared link would carry the home page's title.
 * The preview image is named here rather than through Next's
 * `opengraph-image` file convention: a page that sets its own `openGraph`
 * loses the file-based image, and the convention publishes the file twice.
 */
export function pageMetadata({
  title,
  description,
  path,
  isBrandTitle = false,
}: PageMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();

  return {
    // A brand title bypasses the root layout's "%s | Elemwave" template.
    title: isBrandTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: TRADING_NAME,
      locale: "en_GB",
      title: isBrandTitle ? title : `${title} | ${TRADING_NAME}`,
      description,
      url,
      images: [PREVIEW_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      images: [PREVIEW_IMAGE.url],
    },
  };
}
