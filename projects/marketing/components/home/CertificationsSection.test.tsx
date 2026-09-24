import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CertificationsSection } from "./CertificationsSection";
import { CERTIFICATIONS } from "@/lib/home-content";

describe("CertificationsSection", () => {
  it("shows the Certifications heading", () => {
    render(<CertificationsSection />);
    expect(
      screen.getByRole("heading", { name: "Certifications" }),
    ).toBeInTheDocument();
  });

  it("renders exactly one card per certification, however many there are", () => {
    render(<CertificationsSection />);
    expect(screen.getAllByRole("article")).toHaveLength(CERTIFICATIONS.length);
  });

  it("uses the design's own dark-band-light width, wider than the Book a Meeting panel", () => {
    render(<CertificationsSection />);
    const grid = screen.getAllByRole("article")[0]!.closest("[class*='max-w-']");
    expect(grid?.className.split(/\s+/)).toContain("max-w-[1220px]");
  });

  for (const certification of CERTIFICATIONS) {
    it(`gives ${certification.name} its own seal, certificate and annex links`, () => {
      render(<CertificationsSection />);
      const card = screen
        .getByRole("heading", { name: certification.name })
        .closest("article")!;

      expect(
        within(card).getByAltText(`${certification.name} seal`),
      ).toBeInTheDocument();

      const certificateLink = within(card).getByRole("link", {
        name: "Certificate",
      });
      expect(certificateLink).toHaveAttribute("href", certification.certificateUrl);
      expect(certificateLink).toHaveAttribute("target", "_blank");
      expect(certificateLink).toHaveAttribute("rel", "noreferrer");
      expect(certificateLink).toHaveClass(
        "bg-navy-800",
        "text-white",
        "hover:-translate-y-px",
        "hover:shadow-[0_6px_16px_rgba(42,100,184,0.35)]",
      );
      expect(certificateLink.className).not.toMatch(/hover:bg-|hover:text-/);

      const annexLink = within(card).getByRole("link", { name: "Annex" });
      expect(annexLink).toHaveAttribute("href", certification.annexUrl);
      expect(annexLink).toHaveAttribute("target", "_blank");
      expect(annexLink).toHaveAttribute("rel", "noreferrer");
      expect(annexLink).toHaveClass(
        "border-navy-800",
        "bg-transparent",
        "text-navy-800",
        "hover:-translate-y-px",
        "hover:shadow-[0_6px_16px_rgba(42,100,184,0.35)]",
      );
      expect(annexLink.className).not.toMatch(/hover:bg-navy|hover:text-white/);
    });
  }

  it("never lets one certification's links point at another's documents", () => {
    render(<CertificationsSection />);
    const certificateHrefs = screen
      .getAllByRole("link", { name: "Certificate" })
      .map((link) => link.getAttribute("href"));
    const annexHrefs = screen
      .getAllByRole("link", { name: "Annex" })
      .map((link) => link.getAttribute("href"));

    expect(certificateHrefs).toEqual(CERTIFICATIONS.map((c) => c.certificateUrl));
    expect(annexHrefs).toEqual(CERTIFICATIONS.map((c) => c.annexUrl));
  });
});
