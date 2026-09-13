import { describe, expect, it } from "vitest";
import { pageMetadata } from "./page-metadata";

const contact = pageMetadata({
  title: "Contact",
  description: "Contact Elemwave.",
  path: "/contact",
});

describe("a page's metadata", () => {
  it("should keep the page's own title and description", () => {
    expect(contact.title).toBe("Contact");
    expect(contact.description).toBe("Contact Elemwave.");
  });

  it("should declare the page's production address as its canonical address", () => {
    expect(contact.alternates?.canonical).toBe("https://www.elemwave.com/contact");
  });

  it("should give link previews the page's title, description and address under the brand", () => {
    expect(contact.openGraph).toMatchObject({
      type: "website",
      siteName: "Elemwave",
      locale: "en_GB",
      title: "Contact | Elemwave",
      description: "Contact Elemwave.",
      url: "https://www.elemwave.com/contact",
    });
  });

  it("should give link previews the branded image, described and sized", () => {
    expect(contact.openGraph?.images).toEqual([
      {
        url: "/images/opengraph-elemwave.jpg",
        width: 1200,
        height: 630,
        alt: "The Elemwave logo above an A320 aircraft coloured by a simulated electromagnetic field",
      },
    ]);
  });

  it("should ask for a large image card where previews offer a choice of size", () => {
    expect(contact.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["/images/opengraph-elemwave.jpg"],
    });
  });

  it("should give the home page the brand's own title in link previews", () => {
    const home = pageMetadata({
      title: "Elemwave - Advanced electromagnetics simulations",
      description: "Innovative solutions for advanced electromagnetics simulations.",
      path: "/",
      isBrandTitle: true,
    });

    expect(home.title).toEqual({ absolute: "Elemwave - Advanced electromagnetics simulations" });
    expect(home.openGraph?.title).toBe("Elemwave - Advanced electromagnetics simulations");
    expect(home.alternates?.canonical).toBe("https://www.elemwave.com/");
  });
});
