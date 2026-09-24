import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PartnershipsHero } from "./PartnershipsHero";
import { PartnerMarquee } from "./PartnerMarquee";
import { PartnershipsNarrative } from "./PartnershipsNarrative";
import { BecomePartner } from "./BecomePartner";
import { PARTNER_LOGOS, partnerAccessibleName } from "@/lib/site-content";
import {
  expectNoMotionPauseControl,
  stubLivePrefersReducedMotion,
  stubPrefersReducedMotion,
} from "@/test/prefersReducedMotion";
import { withBooking } from "@/test/withBooking";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

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

  it("pauses the scrolling row without hiding the partner marks", () => {
    const { container } = render(<PartnerMarquee />);
    const control = screen.getByRole("button", { name: "Pause partner marks" });
    const row = control.querySelector(".animate-logo-scroll");

    expect(screen.queryByText("Pause partner marks")).not.toBeInTheDocument();
    expect(screen.queryByText("Resume partner marks")).not.toBeInTheDocument();

    fireEvent.click(control);

    expect(row).toHaveClass("is-paused");
    expectPublishedPartnerMarks();

    const pausedControl = screen.getByRole("button", { name: "Resume partner marks" });
    expect(pausedControl).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(pausedControl);

    expect(row).not.toHaveClass("is-paused");
    expect(container.querySelectorAll('button[aria-label="Pause partner marks"]')).toHaveLength(
      1,
    );
  });

  it("renders no decorative icon on the pause control, running or paused", () => {
    render(<PartnerMarquee />);

    const control = screen.getByRole("button", { name: "Pause partner marks" });
    // Every `aria-hidden` element inside the control is a duplicated logo
    // card, never a decorative icon — an icon would add one more.
    const hiddenElements = control.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenElements).toHaveLength(PARTNER_LOGOS.length);
    expect(control.className).toContain("cursor-pointer");

    fireEvent.click(control);

    const pausedControl = screen.getByRole("button", { name: "Resume partner marks" });
    expect(pausedControl.querySelectorAll('[aria-hidden="true"]')).toHaveLength(
      PARTNER_LOGOS.length,
    );
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

  it("keeps focus on the partnerships strip when reduced motion removes the pause control", () => {
    const { restore, enable } = stubLivePrefersReducedMotion();

    try {
      render(<PartnerMarquee />);

      const control = screen.getByRole("button", { name: "Pause partner marks" });
      const region = screen.getByRole("region", { name: "Partners" });
      control.focus();
      expect(control).toHaveFocus();

      act(() => {
        enable();
      });

      expectNoMotionPauseControl("Pause partner marks", "Resume partner marks");
      expect(document.activeElement).toBe(region);
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
