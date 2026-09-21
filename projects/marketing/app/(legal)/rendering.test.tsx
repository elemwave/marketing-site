import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LegalLayout from "./layout";
import IntegratedPolicy, { metadata as integratedMetadata } from "./integrated-policy/page";
import PrivacyPolicy, { metadata as privacyMetadata } from "./privacy-policy/page";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { CONTACT_EMAIL } from "@/lib/site-content";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function withBooking(node: React.ReactNode) {
  return <BookingModalProvider calendlyUrl="https://calendly.test/x">{node}</BookingModalProvider>;
}

describe("the legal layout", () => {
  it("wraps the page in the shared header and footer", () => {
    render(withBooking(<LegalLayout>legal text</LegalLayout>));

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("legal text");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("exposes the unique content as the primary-content landmark", () => {
    render(withBooking(<LegalLayout>legal text</LegalLayout>));

    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("lets Header own the legal page navy surface and glow clipping", () => {
    render(withBooking(<LegalLayout>legal text</LegalLayout>));

    const bannerParentClasses = screen
      .getByRole("banner")
      .parentElement?.className.split(/\s+/)
      .filter(Boolean);

    expect(bannerParentClasses).not.toContain("bg-navy-950");
    expect(bannerParentClasses).not.toContain("overflow-hidden");
    expect(bannerParentClasses).not.toContain("relative");
  });

  it("marks no navigation entry as current, since legal pages have none", () => {
    render(withBooking(<LegalLayout>legal text</LegalLayout>));

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    for (const link of within(navigation).getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("links to both policies from the footer in the site's own language", () => {
    render(withBooking(<LegalLayout>legal text</LegalLayout>));

    const footer = screen.getByRole("contentinfo");
    for (const [name, href] of [
      ["Integrated policy", "/integrated-policy"],
      ["Privacy policy", "/privacy-policy"],
    ]) {
      const link = within(footer).getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link.closest("[lang]")).toBeNull();
    }
  });
});

describe("the privacy policy", () => {
  it("publishes the policy in English under its title", () => {
    render(<PrivacyPolicy />);

    const title = screen.getByRole("heading", { level: 1, name: "Privacy policy" });
    expect(title.closest("[lang]")).toBeNull();
  });

  it("gives the company's own address for exercising data rights", () => {
    render(<PrivacyPolicy />);

    const mailLinks = screen.getAllByRole("link", { name: CONTACT_EMAIL });
    expect(mailLinks.length).toBeGreaterThan(0);
    for (const link of mailLinks) {
      expect(link).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);
    }
  });

  it("should explain that meetings are booked through Calendly, which sets its own cookies", () => {
    render(<PrivacyPolicy />);

    const heading = screen.getByRole("heading", { level: 2, name: "Scheduling a meeting" });
    const section = heading.nextElementSibling;
    expect(section).toHaveTextContent(/Calendly/);
    expect(section).toHaveTextContent(/cookies/);
  });

  it("should link to Calendly's own privacy notice, which covers its cookies", () => {
    render(<PrivacyPolicy />);

    const href = "https://calendly.com/legal/privacy-notice";
    expect(screen.getByRole("link", { name: href })).toHaveAttribute("href", href);
  });

  it("opens third-party policies in a new tab without passing the referrer", () => {
    render(<PrivacyPolicy />);

    const external = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("https://"));
    expect(external.length).toBeGreaterThan(0);
    for (const link of external) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }
  });
});

describe("the integrated policy", () => {
  it("publishes the policy in English under its title", () => {
    render(<IntegratedPolicy />);

    const title = screen.getByRole("heading", { level: 1, name: "Integrated policy" });
    expect(title.closest("[lang]")).toBeNull();
  });

  it("covers every area of the management system", () => {
    render(<IntegratedPolicy />);

    for (const area of [
      "Management",
      "Quality",
      "Environment",
      "IT services",
      "Information security",
      "People",
      "Compliance",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name: area })).toBeInTheDocument();
    }
  });
});

describe("the legal page titles", () => {
  // The root layout's template appends "| Elemwave"; naming the brand here too
  // would print it twice in the browser tab.
  it.each([
    ["privacy policy", privacyMetadata],
    ["integrated policy", integratedMetadata],
  ])("the %s title leaves the brand to the template", (_, metadata) => {
    expect(metadata.title).not.toMatch(/Elemwave/);
  });
});
