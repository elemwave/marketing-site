import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IntegratedPolicy, { metadata as integratedMetadata } from "./integrated-policy/page";
import PrivacyPolicy, { metadata as privacyMetadata } from "./privacy-policy/page";
import { CONTACT_EMAIL } from "@/lib/site-content";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

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

describe("the legal page identity", () => {
  it("publishes the privacy policy's own description and canonical address", () => {
    expect(privacyMetadata.description).toBe(
      "How Elemwave processes personal data under the GDPR and Spain's Organic Law 3/2018, and the rights you can exercise.",
    );
    expect(privacyMetadata.alternates?.canonical).toBe(
      "https://www.elemwave.com/privacy-policy",
    );
    expect(privacyMetadata.openGraph?.title).toBe("Privacy policy | Elemwave");
    expect(privacyMetadata.openGraph?.description).toBe(
      "How Elemwave processes personal data under the GDPR and Spain's Organic Law 3/2018, and the rights you can exercise.",
    );
    expect(privacyMetadata.openGraph?.url).toBe("https://www.elemwave.com/privacy-policy");
  });

  it("publishes the integrated policy's own description and canonical address", () => {
    expect(integratedMetadata.description).toBe(
      "The AIRCURY group's Integrated Management Policy: quality, the environment, IT service management and information security.",
    );
    expect(integratedMetadata.alternates?.canonical).toBe(
      "https://www.elemwave.com/integrated-policy",
    );
    expect(integratedMetadata.openGraph?.title).toBe("Integrated policy | Elemwave");
    expect(integratedMetadata.openGraph?.description).toBe(
      "The AIRCURY group's Integrated Management Policy: quality, the environment, IT service management and information security.",
    );
    expect(integratedMetadata.openGraph?.url).toBe("https://www.elemwave.com/integrated-policy");
  });
});
