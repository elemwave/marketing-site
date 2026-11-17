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
import { HERO_IMAGES, SLIDES } from "@/lib/home-content";
import { DEMO_REQUEST_FORM_URL, partnerAccessibleName, partnerBySrc } from "@/lib/site-content";
import { stubPrefersReducedMotion } from "@/test/prefersReducedMotion";
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

  describe("Hero picture", () => {
    const heroHeading = "INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS";

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("renders only the CAD picture in the first document", () => {
      const html = renderToStaticMarkup(withBooking(<Hero />));

      expect(html).toContain('data-layer="cad"');
      expect(html).toContain("hero-a320-cad.webp");
      expect(html).not.toContain('data-layer="solver"');
      expect(html).not.toContain('data-layer="texture"');
      expect(html).not.toContain("hero-a320-solver");
      expect(html).not.toContain("hero-a320-texture");
      expect(html).not.toContain("A320 solver field view");
      expect(html).not.toContain("A320 textured render");
    });

    it("holds no img element in the first document, so a failed load before any script runs draws no broken-image symbol or alt text", () => {
      const html = renderToStaticMarkup(withBooking(<Hero />));

      expect(html).not.toContain("<img");
      expect(html).toContain('role="img"');
      expect(html).toContain('aria-label="A320 CAD model"');
    });

    it("shows the CAD picture straight away, in a steady box beside the heading", () => {
      render(withBooking(<Hero />));

      const cad = document.querySelector('[data-layer="cad"]');

      expect(cad).toBeInTheDocument();
      expect(cad?.getAttribute("style")).toContain(HERO_IMAGES.cad);
      expect(cad?.parentElement?.className).toContain("aspect-[1024/572]");
      expect(screen.getByRole("heading", { level: 1, name: heroHeading })).toBeInTheDocument();
    });

    it("never admits another picture however long the visitor waits", () => {
      render(withBooking(<Hero />));

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(screen.getAllByRole("img")).toHaveLength(1);
      expect(document.querySelector('[data-layer="solver"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-layer="texture"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-layer="cad"]')).toBeInTheDocument();
    });

    it("holds no img element, so a picture that cannot load never draws a broken-image symbol", () => {
      render(withBooking(<Hero />));

      expect(document.querySelectorAll("img")).toHaveLength(0);
      expect(document.querySelector('[data-layer="cad"]')?.parentElement?.className).toContain(
        "aspect-[1024/572]",
      );
      expect(screen.getByRole("heading", { level: 1, name: heroHeading })).toBeInTheDocument();
    });

    it("offers no pause or resume control, because nothing in the hero moves", () => {
      render(withBooking(<Hero />));

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /hero pictures$/ })).not.toBeInTheDocument();
    });

    it("keeps the picture unchanged when it is activated repeatedly", () => {
      render(withBooking(<Hero />));

      const cad = document.querySelector('[data-layer="cad"]');

      for (let i = 0; i < 4; i += 1) {
        fireEvent.click(cad as Element);
      }

      expect(screen.getAllByRole("img")).toHaveLength(1);
      expect(document.querySelector('[data-layer="cad"]')).toBe(cad);
    });

    it("shows the same single picture after leaving and returning to the hero", () => {
      const first = render(withBooking(<Hero />));
      first.unmount();

      render(withBooking(<Hero />));

      expect(screen.getAllByRole("img")).toHaveLength(1);
      expect(document.querySelector('[data-layer="cad"]')).toBeInTheDocument();
    });

    it("names the CAD picture for assistive technology whatever the motion preference", () => {
      for (const reduced of [false, true]) {
        const restore = stubPrefersReducedMotion(reduced);

        try {
          const view = render(withBooking(<Hero />));

          expect(screen.getByRole("img", { name: "A320 CAD model" })).toBeInTheDocument();
          expect(screen.queryByRole("img", { name: "A320 solver field view" })).not.toBeInTheDocument();
          expect(screen.queryByRole("img", { name: "A320 textured render" })).not.toBeInTheDocument();
          view.unmount();
        } finally {
          restore();
        }
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
