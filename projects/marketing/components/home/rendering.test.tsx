import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BookMeeting } from "./BookMeeting";
import { Footer } from "../site/Footer";
import { Header } from "../site/Header";
import { Hero } from "./Hero";
import { PillButton } from "../site/PillButton";
import { ScienceSection } from "./ScienceSection";
import { SectionHeading } from "./SectionHeading";
import { SLIDES } from "@/lib/home-content";
import {
  expectNoMotionPauseControl,
  stubLivePrefersReducedMotion,
  stubPrefersReducedMotion,
} from "@/test/prefersReducedMotion";
import { withBooking } from "@/test/withBooking";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

describe("the page sections render", () => {
  it("Hero shows the product name", () => {
    render(withBooking(<Hero />));
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  describe("Hero cycling", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("omits the hidden solver layer from the first document", () => {
      const html = renderToStaticMarkup(withBooking(<Hero />));

      expect(html).toContain('alt="A320 CAD model"');
      expect(html).toContain('alt="A320 textured render"');
      expect(html).not.toContain('alt="A320 solver field view"');
    });

    it("keeps the current hero picture as a prompt fetch", () => {
      render(withBooking(<Hero />));

      expect(screen.getByAltText("A320 CAD model")).not.toHaveAttribute(
        "loading",
        "lazy",
      );
      expect(screen.getByAltText("A320 textured render")).not.toHaveAttribute(
        "loading",
        "lazy",
      );
    });

    it("admits the solver overlay when the hero rotates", () => {
      render(withBooking(<Hero />));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.getByAltText("A320 solver field view")).toBeInTheDocument();
    });

    it("advances the overlay, freezes it while paused, and resumes after the interval", () => {
      render(withBooking(<Hero />));

      const solver = screen.getByAltText("A320 solver field view");
      const textured = screen.getByAltText("A320 textured render");
      const cad = screen.getByAltText("A320 CAD model");

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(solver).toHaveStyle({ opacity: "1" });
      expect(textured).toHaveStyle({ opacity: "0" });

      fireEvent.click(screen.getByRole("button", { name: "Pause hero pictures" }));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(solver).toHaveStyle({ opacity: "1" });
      expect(textured).toHaveStyle({ opacity: "0" });

      fireEvent.click(screen.getByRole("button", { name: "Resume hero pictures" }));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(solver).toHaveStyle({ opacity: "0" });
      expect(textured).toHaveStyle({ opacity: "0" });
      expect(cad).toBeInTheDocument();
    });

    it("omits the pause control and stays still under reduced motion", () => {
      const restore = stubPrefersReducedMotion(true);

      try {
        render(withBooking(<Hero />));

        expectNoMotionPauseControl("Pause hero pictures", "Resume hero pictures");

        const textured = screen.getByAltText("A320 textured render");

        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(
          screen.queryByAltText("A320 solver field view"),
        ).not.toBeInTheDocument();
        expect(textured).toHaveStyle({ opacity: "1" });
      } finally {
        restore();
      }
    });

    it("stops cycling when reduced motion is enabled after the pictures have started", () => {
      const { restore, enable } = stubLivePrefersReducedMotion();

      try {
        render(withBooking(<Hero />));

        const solver = screen.getByAltText("A320 solver field view");
        const textured = screen.getByAltText("A320 textured render");

        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(solver).toHaveStyle({ opacity: "1" });
        expect(textured).toHaveStyle({ opacity: "0" });
        expect(
          screen.getByRole("button", { name: "Pause hero pictures" }),
        ).toBeInTheDocument();

        act(() => {
          enable();
        });

        expectNoMotionPauseControl("Pause hero pictures", "Resume hero pictures");

        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(solver).toHaveStyle({ opacity: "1" });
        expect(textured).toHaveStyle({ opacity: "0" });
      } finally {
        restore();
      }
    });
  });

  it("ScienceSection shows its heading", () => {
    render(<ScienceSection />);
    expect(screen.getAllByRole("heading").length).toBeGreaterThan(0);
  });

  it("defers science-section organisation marks without dropping stacked slides", () => {
    render(<ScienceSection />);

    const marks = screen.getAllByAltText("Partner logo");
    const expected = SLIDES.reduce((count, slide) => count + slide.logos.length, 0);

    expect(marks).toHaveLength(expected);
    for (const mark of marks) {
      expect(mark).toHaveAttribute("loading", "lazy");
    }
  });

  it("Header shows the logo", () => {
    render(withBooking(<Header currentPath="/" />));
    expect(screen.getByAltText("Elemwave")).toBeInTheDocument();
  });

  it("Footer shows the logo", () => {
    render(withBooking(<Footer />));
    expect(screen.getAllByAltText("Elemwave").length).toBeGreaterThan(0);
  });

  it("Footer copyright runs to the current year", () => {
    render(withBooking(<Footer />));
    const thisYear = new Date().getFullYear();
    expect(
      screen.getByText(`© 2021-${thisYear} Elemwave - CEM and EMC solutions`),
    ).toBeInTheDocument();
  });

  it("BookMeeting offers the booking call to action", () => {
    render(withBooking(<BookMeeting />));
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("PillButton renders a link to its destination", () => {
    render(<PillButton href="/contact">Contact</PillButton>);
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });

  it("SectionHeading shows its title and description", () => {
    render(<SectionHeading title="A title" description="A description" />);
    expect(screen.getByText("A title")).toBeInTheDocument();
    expect(screen.getByText("A description")).toBeInTheDocument();
  });
});
