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
import { partnerAccessibleName, partnerBySrc } from "@/lib/site-content";
import {
  expectNoMotionPauseControl,
  stubLivePrefersReducedMotion,
  stubPrefersReducedMotion,
} from "@/test/prefersReducedMotion";
import { withBooking } from "@/test/withBooking";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function sciencePartnerMarks() {
  const paths = SLIDES.flatMap((slide) => slide.logos.map((mark) => mark.src));
  const marks = screen.getAllByRole("img", { hidden: true }).filter((node) =>
    paths.includes(node.getAttribute("src") ?? ""),
  );

  return { marks, paths };
}

describe("the page sections render", () => {
  it("Hero shows the product name", () => {
    render(withBooking(<Hero />));
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("Hero no longer offers a link to the software section", () => {
    render(withBooking(<Hero />));
    expect(screen.queryAllByRole("link")).toHaveLength(0);
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

      expect(html).toContain('aria-label="Pause hero pictures"');
      expect(html).toContain('alt=""');
      expect(html).not.toContain('alt="A320 solver field view"');
    });

    it("keeps the current hero picture as a prompt fetch", () => {
      render(withBooking(<Hero />));

      const heroControl = screen.getByRole("button", {
        name: "Pause hero pictures",
      });
      const heroImages = heroControl.querySelectorAll("img");

      expect(heroImages[0]).not.toHaveAttribute(
        "loading",
        "lazy",
      );
      expect(heroImages[1]).not.toHaveAttribute(
        "loading",
        "lazy",
      );
    });

    it("admits the solver overlay when the hero rotates", () => {
      render(withBooking(<Hero />));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(
        screen
          .getByRole("button", { name: "Pause hero pictures" })
          .querySelector('[data-layer="solver"]'),
      ).toBeInTheDocument();
    });

    it("advances the overlay, freezes it while paused, and resumes after the interval", () => {
      render(withBooking(<Hero />));

      const control = screen.getByRole("button", { name: "Pause hero pictures" });
      const solver = control.querySelector('[data-layer="solver"]');
      const textured = control.querySelector('[data-layer="texture"]');
      const cad = control.querySelector('[data-layer="cad"]');

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(solver).toHaveStyle({ opacity: "1" });
      expect(textured).toHaveStyle({ opacity: "0" });

      expect(screen.queryByText("Pause hero pictures")).not.toBeInTheDocument();
      expect(screen.queryByText("Resume hero pictures")).not.toBeInTheDocument();

      fireEvent.click(control);

      const pausedControl = screen.getByRole("button", { name: "Resume hero pictures" });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(solver).toHaveStyle({ opacity: "1" });
      expect(textured).toHaveStyle({ opacity: "0" });
      expect(pausedControl).toHaveAttribute("aria-pressed", "true");

      fireEvent.click(pausedControl);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(solver).toHaveStyle({ opacity: "0" });
      expect(textured).toHaveStyle({ opacity: "0" });
      expect(cad).toBeInTheDocument();
    });

    it("renders no decorative icon on the pause control, running or paused", () => {
      render(withBooking(<Hero />));

      const control = screen.getByRole("button", { name: "Pause hero pictures" });

      expect(control.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
      expect(control.className).toContain("cursor-pointer");

      fireEvent.click(control);

      const pausedControl = screen.getByRole("button", { name: "Resume hero pictures" });

      expect(pausedControl.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    });

    it("omits the pause control and stays still under reduced motion", () => {
      const restore = stubPrefersReducedMotion(true);

      try {
        render(withBooking(<Hero />));

        expectNoMotionPauseControl("Pause hero pictures", "Resume hero pictures");

        const textured = document.querySelector('[data-layer="texture"]');

        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(
          document.querySelector('[data-layer="solver"]'),
        ).not.toBeInTheDocument();
        expect(textured).toHaveStyle({ opacity: "1" });
      } finally {
        restore();
      }
    });

    it("names the hero imagery for assistive technology under reduced motion", () => {
      const restore = stubPrefersReducedMotion(true);

      try {
        render(withBooking(<Hero />));

        expect(screen.getByAltText("A320 CAD model")).toBeInTheDocument();
        expect(screen.getByAltText("A320 textured render")).toBeInTheDocument();
      } finally {
        restore();
      }
    });

    it("keeps focus in the hero region when reduced motion removes the pause control", () => {
      const { restore, enable } = stubLivePrefersReducedMotion();

      try {
        render(withBooking(<Hero />));

        const control = screen.getByRole("button", { name: "Pause hero pictures" });
        const wrapper = document.querySelector('[tabindex="-1"]');
        control.focus();
        expect(control).toHaveFocus();

        act(() => {
          enable();
        });

        expectNoMotionPauseControl("Pause hero pictures", "Resume hero pictures");
        expect(document.activeElement).toBe(wrapper);
      } finally {
        restore();
      }
    });

    it("stops cycling when reduced motion is enabled after the pictures have started", () => {
      const { restore, enable } = stubLivePrefersReducedMotion();

      try {
        render(withBooking(<Hero />));

        const control = screen.getByRole("button", { name: "Pause hero pictures" });
        const solver = control.querySelector('[data-layer="solver"]');
        const textured = control.querySelector('[data-layer="texture"]');

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

  it("ScienceSection partner marks declare their picture-file size on every slide", () => {
    render(<ScienceSection />);
    const { marks, paths } = sciencePartnerMarks();
    expect(marks).toHaveLength(paths.length);

    for (const mark of marks) {
      expect(Number(mark.getAttribute("width"))).toBeGreaterThan(0);
      expect(Number(mark.getAttribute("height"))).toBeGreaterThan(0);
      expect(mark).toHaveClass(
        "max-h-[clamp(64px,16vw,205px)]",
        "w-auto",
        "max-w-full",
      );
    }
  });

  it("defers science-section organisation marks without dropping stacked slides", () => {
    render(<ScienceSection />);

    const { marks, paths } = sciencePartnerMarks();
    expect(marks).toHaveLength(paths.length);

    for (const mark of marks) {
      const src = mark.getAttribute("src");
      expect(src).toBeTruthy();
      const published = partnerAccessibleName(partnerBySrc(src!));

      expect(mark).toHaveAttribute("alt", published);
      expect(mark).toHaveAttribute("loading", "lazy");
    }
  });

  it("Header shows the logo", () => {
    render(withBooking(<Header />));
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
