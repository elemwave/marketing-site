import { act, fireEvent, render, screen, within } from "@testing-library/react";
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
import { DEMO_REQUEST_FORM_URL, partnerAccessibleName, partnerBySrc } from "@/lib/site-content";
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
  it("gives demo requests a separate peer panel alongside meeting bookings", () => {
    render(withBooking(<BookMeeting />));
    const meeting = screen.getByRole("region", { name: "Book a Meeting" });
    const demo = screen.getByRole("region", { name: "Download a Demo" });
    expect(meeting.parentElement).toBe(demo.parentElement);
    expect(within(meeting).getByRole("heading", { level: 2, name: "Book a Meeting" })).toBeInTheDocument();
    expect(within(demo).getByRole("heading", { level: 2, name: "Download a Demo" })).toBeInTheDocument();
    expect(within(meeting).getByRole("button", { name: "Schedule a Call" })).toBeInTheDocument();
    expect(within(meeting).queryByRole("link", { name: /^Download a Demo/ })).not.toBeInTheDocument();
    expect(within(demo).getByRole("link", { name: /^Download a Demo/ })).toBeInTheDocument();
    expect(within(demo).queryByRole("button", { name: "Schedule a Call" })).not.toBeInTheDocument();
    expect(within(demo).getByText(/Our team will email you a download link/)).toBeInTheDocument();
  });

  it("Download a Demo does not open the booking dialog", () => {
    render(withBooking(<BookMeeting />));
    fireEvent.click(screen.getByRole("link", { name: /^Download a Demo/ }));
    expect(screen.queryByTestId("calendly")).not.toBeInTheDocument();
  });

  it("Download a Demo is named as opening in a new tab while showing only its label", () => {
    render(withBooking(<BookMeeting />));
    const demo = screen.getByRole("link", { name: "Download a Demo (opens in a new tab)" });
    expect(demo).toHaveAccessibleName("Download a Demo (opens in a new tab)");
    expect(demo.querySelector(".sr-only")).toHaveTextContent("(opens in a new tab)");
  });

  it("Download a Demo leads to the demo request form in a new tab without passing the referrer", () => {
    render(withBooking(<BookMeeting />));
    const demo = screen.getByRole("link", { name: /^Download a Demo/ });
    expect(demo).toHaveAttribute("href", DEMO_REQUEST_FORM_URL);
    expect(demo).toHaveAttribute("target", "_blank");
    expect(demo).toHaveAttribute("rel", "noreferrer");
  });

  it("BookMeeting offers Download a Demo after Schedule a Call", () => {
    render(withBooking(<BookMeeting />));
    const booking = screen.getByRole("button", { name: "Schedule a Call" });
    const demo = screen.getByRole("link", { name: /^Download a Demo/ });
    expect(booking.compareDocumentPosition(demo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

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
      const cad = control.querySelector('[data-layer="cad"]');

      expect(control.querySelector('[data-layer="texture"]')).not.toBeInTheDocument();
      expect(cad).toBeInTheDocument();
      expect(solver).toHaveStyle({ opacity: "0" });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(solver).toHaveStyle({ opacity: "1" });

      expect(screen.queryByText("Pause hero pictures")).not.toBeInTheDocument();
      expect(screen.queryByText("Resume hero pictures")).not.toBeInTheDocument();

      fireEvent.click(control);

      const pausedControl = screen.getByRole("button", { name: "Resume hero pictures" });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(solver).toHaveStyle({ opacity: "1" });
      expect(pausedControl).toHaveAttribute("aria-pressed", "true");

      fireEvent.click(pausedControl);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(solver).toHaveStyle({ opacity: "0" });
      expect(cad).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(solver).toHaveStyle({ opacity: "1" });
      expect(control.querySelector('[data-layer="texture"]')).not.toBeInTheDocument();
    });

    it("alternates pause and resume on repeated activation without showing the textured render", () => {
      render(withBooking(<Hero />));

      for (const expectedName of [
        "Resume hero pictures",
        "Pause hero pictures",
        "Resume hero pictures",
        "Pause hero pictures",
      ]) {
        fireEvent.click(screen.getByRole("button", { name: /hero pictures$/ }));
        expect(screen.getByRole("button", { name: expectedName })).toBeInTheDocument();
        expect(document.querySelector('[data-layer="texture"]')).not.toBeInTheDocument();
        expect(screen.queryByAltText("A320 textured render")).not.toBeInTheDocument();
      }
    });

    it("shows no textured render after leaving and returning to the hero", () => {
      const first = render(withBooking(<Hero />));
      first.unmount();

      render(withBooking(<Hero />));

      expect(document.querySelector('[data-layer="texture"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-layer="cad"]')).toBeInTheDocument();
    });

    it("renders only the CAD and solver pictures", () => {
      const html = renderToStaticMarkup(withBooking(<Hero />));

      expect(html).toContain('data-layer="cad"');
      expect(html).not.toContain('data-layer="solver"');
      expect(html).not.toContain('data-layer="texture"');
      expect(html).not.toContain("hero-a320-texture");

      render(withBooking(<Hero />));

      const control = screen.getByRole("button", { name: "Pause hero pictures" });
      const layers = Array.from(control.querySelectorAll("img")).map((image) =>
        image.getAttribute("data-layer"),
      );
      const cad = control.querySelector('[data-layer="cad"]');

      expect(layers).toEqual(["cad", "solver"]);
      expect(cad).not.toHaveAttribute("loading", "lazy");
      expect(control.className).toContain("aspect-[1024/572]");
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS",
        }),
      ).toBeInTheDocument();
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

        expect(document.querySelector('[data-layer="texture"]')).not.toBeInTheDocument();

        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(
          document.querySelector('[data-layer="solver"]'),
        ).not.toBeInTheDocument();
        expect(document.querySelector('[data-layer="cad"]')).toBeInTheDocument();
      } finally {
        restore();
      }
    });

    it("names the hero imagery for assistive technology under reduced motion", () => {
      const restore = stubPrefersReducedMotion(true);

      try {
        render(withBooking(<Hero />));

        expect(screen.getByAltText("A320 CAD model")).toBeInTheDocument();
        expect(screen.queryByAltText("A320 textured render")).not.toBeInTheDocument();
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
        expect(control.querySelector('[data-layer="texture"]')).not.toBeInTheDocument();

        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(solver).toHaveStyle({ opacity: "1" });
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

        // Reduced motion remounts the stack, so read the live layers rather
        // than the detached nodes captured before the preference changed.
        expect(document.querySelector('[data-layer="solver"]')).toHaveStyle({
          opacity: "1",
        });
        expect(document.querySelector('[data-layer="texture"]')).not.toBeInTheDocument();
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

  it("SectionHeading's underline defaults to bg-ink, overridable via dividerClassName", () => {
    const { container, rerender } = render(<SectionHeading title="A title" />);
    expect(container.querySelector(".bg-ink")).toBeInTheDocument();

    rerender(<SectionHeading title="A title" dividerClassName="bg-white" />);
    expect(container.querySelector(".bg-ink")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-white")).toBeInTheDocument();
  });
});
