import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PartnershipsHero } from "./PartnershipsHero";
import { PartnerMarquee } from "./PartnerMarquee";
import { PartnershipsNarrative } from "./PartnershipsNarrative";
import { BecomePartner } from "./BecomePartner";
import { PARTNER_LOGOS } from "@/lib/site-content";
import {
  expectNoMotionPauseControl,
  stubPrefersReducedMotion,
} from "@/test/prefersReducedMotion";
import { withBooking } from "@/test/withBooking";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

describe("the partnerships sections render", () => {
  it("PartnershipsHero states the page title", () => {
    render(<PartnershipsHero />);

    expect(
      screen.getByRole("heading", { level: 1, name: /partnerships built on technical trust/i }),
    ).toBeInTheDocument();
  });

  it("PartnerMarquee names every partner", () => {
    render(<PartnerMarquee />);

    for (const logo of PARTNER_LOGOS) {
      expect(screen.getByRole("img", { name: logo.name })).toBeInTheDocument();
    }
  });

  it("PartnerMarquee announces each partner once despite the duplicated strip", () => {
    const { container } = render(<PartnerMarquee />);

    // Both copies render, so the strip can loop without a seam.
    expect(container.querySelectorAll("img")).toHaveLength(PARTNER_LOGOS.length * 2);
    // Only one of them is reachable by name.
    expect(screen.getAllByRole("img")).toHaveLength(PARTNER_LOGOS.length);
  });

  it("pauses the scrolling row without hiding the partner marks", () => {
    const { container } = render(<PartnerMarquee />);
    const row = container.querySelector(".animate-logo-scroll");

    fireEvent.click(screen.getByRole("button", { name: "Pause partner marks" }));

    expect(row).toHaveClass("is-paused");
    for (const logo of PARTNER_LOGOS) {
      expect(screen.getByRole("img", { name: logo.name })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("button", { name: "Resume partner marks" }));

    expect(row).not.toHaveClass("is-paused");
  });

  it("omits the pause control under reduced motion", () => {
    const restore = stubPrefersReducedMotion(true);

    try {
      const { container } = render(<PartnerMarquee />);

      expectNoMotionPauseControl("Pause partner marks", "Resume partner marks");
      expect(container.querySelector(".animate-logo-scroll")).not.toHaveClass("is-paused");
    } finally {
      restore();
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
