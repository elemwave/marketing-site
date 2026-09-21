import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PartnershipsHero } from "./PartnershipsHero";
import { PartnerMarquee } from "./PartnerMarquee";
import { PartnershipsNarrative } from "./PartnershipsNarrative";
import { BecomePartner } from "./BecomePartner";
import { BookingModalProvider } from "../booking/BookingModalProvider";
import { PARTNER_LOGOS, partnerAccessibleName } from "@/lib/site-content";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function withBooking(node: React.ReactNode) {
  return <BookingModalProvider calendlyUrl="https://calendly.test/x">{node}</BookingModalProvider>;
}

function expectPublishedPartnerMarks() {
  for (const logo of PARTNER_LOGOS) {
    expect(
      screen.getByRole("img", { name: partnerAccessibleName(logo) }),
    ).toBeInTheDocument();
  }
}

describe("the partnerships sections render", () => {
  it("PartnershipsHero states the page title", () => {
    render(<PartnershipsHero />);

    expect(
      screen.getByRole("heading", { level: 1, name: /partnerships built on technical trust/i }),
    ).toBeInTheDocument();
  });

  it("PartnerMarquee names every partner", () => {
    render(<PartnerMarquee />);

    expectPublishedPartnerMarks();
  });

  it("PartnerMarquee announces each partner once despite the duplicated strip", () => {
    const { container } = render(<PartnerMarquee />);

    // Both copies render, so the strip can loop without a seam.
    expect(container.querySelectorAll("img")).toHaveLength(PARTNER_LOGOS.length * 2);
    // Only one of them is reachable by name.
    expect(screen.getAllByRole("img")).toHaveLength(PARTNER_LOGOS.length);
  });

  it("defers partner marks in the first document", () => {
    const html = renderToStaticMarkup(<PartnerMarquee />);

    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain('loading="eager"');
  });

  it("promotes partner marks to ordinary fetching after mount", () => {
    const { container } = render(<PartnerMarquee />);
    const images = container.querySelectorAll("img");

    expect(images).toHaveLength(PARTNER_LOGOS.length * 2);
    for (const image of images) {
      expect(image).toHaveAttribute("loading", "eager");
    }
  });

  it("PartnershipsNarrative shows its heading", () => {
    render(<PartnershipsNarrative />);

    expect(
      screen.getByRole("heading", { name: /collaborations that shape our work/i }),
    ).toBeInTheDocument();
  });

  it("BecomePartner offers the booking call to action", () => {
    render(withBooking(<BecomePartner />));

    expect(screen.getByRole("heading", { name: /become a partner/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Schedule a Call" })).toBeInTheDocument();
  });
});
