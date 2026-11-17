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

/**
 * Cards in each half of the strip's row: the list repeated until the half holds
 * fifteen, the length the 60-second pace was tuned against. Five partners repeat
 * three times a half.
 */
const CARDS_PER_HALF = 15;
/** Every card of both halves; only the first copy of the list is announced. */
const CARDS_IN_ROW = CARDS_PER_HALF * 2;
const DUPLICATE_CARDS = CARDS_IN_ROW - PARTNER_LOGOS.length;

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

    // Both halves render, so the strip can loop without a seam.
    expect(container.querySelectorAll("img")).toHaveLength(CARDS_IN_ROW);
    // Only the first copy of the list is reachable by name.
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

    expect(images).toHaveLength(CARDS_IN_ROW);
    for (const image of images) {
      expect(image).toHaveAttribute("loading", "eager");
    }
  });

  it("announces the five partners by name in order, once", () => {
    render(<PartnerMarquee />);

    expect(screen.getAllByRole("img").map((image) => image.getAttribute("alt"))).toEqual(
      PARTNER_LOGOS.map(partnerAccessibleName),
    );
  });

  it("renders the same cards in both halves of the row", () => {
    const { container } = render(<PartnerMarquee />);
    const sources = [...container.querySelectorAll("img")].map((image) => image.getAttribute("src"));

    expect(sources.slice(0, CARDS_PER_HALF)).toEqual(sources.slice(CARDS_PER_HALF));
  });

  it("sets the strip's duration from the cards in a half", () => {
    const { container } = render(<PartnerMarquee />);
    const row = container.querySelector<HTMLElement>(".animate-logo-scroll");

    expect(row?.style.animationDuration).toBe("60s");
  });

  it("keeps every partner mark named and present under reduced motion", () => {
    const restore = stubPrefersReducedMotion(true);

    try {
      render(<PartnerMarquee />);

      expectPublishedPartnerMarks();
    } finally {
      restore();
    }
  });

  it("keeps the fixed picture box on every mark so the strip's height does not depend on the pictures", () => {
    const { container } = render(<PartnerMarquee />);

    for (const image of container.querySelectorAll("img")) {
      expect(image).toHaveClass("h-[clamp(48px,7vw,76px)]", "w-[clamp(110px,14vw,170px)]");
    }
  });

  it("returns to moving when the page is reloaded after a pause", () => {
    const first = render(<PartnerMarquee />);
    fireEvent.click(screen.getByRole("button", { name: "Pause partner marks" }));
    expect(first.container.querySelector(".animate-logo-scroll")).toHaveClass("is-paused");
    first.unmount();

    const { container } = render(<PartnerMarquee />);

    expect(container.querySelector(".animate-logo-scroll")).not.toHaveClass("is-paused");
    expect(screen.getByRole("button", { name: "Pause partner marks" })).toBeInTheDocument();
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
    expect(hiddenElements).toHaveLength(DUPLICATE_CARDS);
    expect(control.className).toContain("cursor-pointer");

    fireEvent.click(control);

    const pausedControl = screen.getByRole("button", { name: "Resume partner marks" });
    expect(pausedControl.querySelectorAll('[aria-hidden="true"]')).toHaveLength(
      DUPLICATE_CARDS,
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
