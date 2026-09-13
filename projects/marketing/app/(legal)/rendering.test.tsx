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

  it("marks no navigation entry as current, since legal pages have none", () => {
    render(withBooking(<LegalLayout>legal text</LegalLayout>));

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    for (const link of within(navigation).getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });
});

describe("the privacy policy", () => {
  it("publishes the Spanish original under its title", () => {
    render(<PrivacyPolicy />);

    const title = screen.getByRole("heading", { level: 1, name: "Política de privacidad" });
    expect(title.closest("[lang]")).toHaveAttribute("lang", "es");
  });

  it("gives the company's own address for exercising data rights", () => {
    render(<PrivacyPolicy />);

    const mailLinks = screen.getAllByRole("link", { name: CONTACT_EMAIL });
    expect(mailLinks.length).toBeGreaterThan(0);
    for (const link of mailLinks) {
      expect(link).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);
    }
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
  it("publishes the Spanish original under its title", () => {
    render(<IntegratedPolicy />);

    const title = screen.getByRole("heading", { level: 1, name: "Política integrada" });
    expect(title.closest("[lang]")).toHaveAttribute("lang", "es");
  });

  it("covers every area of the management system", () => {
    render(<IntegratedPolicy />);

    for (const area of [
      "Dirección",
      "Calidad",
      "Medio ambiente",
      "Servicios de IT",
      "Seguridad de la información",
      "Equipo humano",
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
