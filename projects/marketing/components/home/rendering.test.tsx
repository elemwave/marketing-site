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

  describe("Hero", () => {
    const heroHeading = "What does your platform emit, withstand and reflect?";
    const heroSubheading =
      "Elemwave predicts it even before a prototype exists, with open-source, peer-reviewed simulations that you can verify.";

    const heroSection = () =>
      screen.getByRole("heading", { level: 1, name: heroHeading }).closest("section") as HTMLElement;

    const heroSubheadingElement = () => within(heroSection()).getByText(heroSubheading);

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("renders the heading and the subheading in the first document", () => {
      const html = renderToStaticMarkup(withBooking(<Hero />));

      expect(html).toContain(heroHeading);
      expect(html).toContain(heroSubheading);
      expect(html).not.toContain('role="img"');
      expect(html).not.toContain("data-layer");
      expect(html).not.toContain("A320");
      expect(html).not.toContain("hero-a320");
      expect(html).not.toContain("<img");
    });

    it("shows the heading and subheading on the dark band", () => {
      render(withBooking(<Hero />));

      expect(screen.getByRole("heading", { level: 1, name: heroHeading })).toBeInTheDocument();
      expect(heroSubheadingElement()).toBeInTheDocument();
      expect(heroSection().className.split(/\s+/)).toContain("bg-navy-950");
    });

    it("holds no placeholder, empty box or loading mark beside the heading and subheading", () => {
      render(withBooking(<Hero />));

      const heading = screen.getByRole("heading", { level: 1, name: heroHeading });
      const subheading = heroSubheadingElement();
      const section = heroSection();
      const strays = Array.from(section.querySelectorAll("*")).filter(
        (element) =>
          element !== heading &&
          element !== subheading &&
          !element.contains(heading) &&
          !element.contains(subheading),
      );

      expect(strays).toEqual([]);
      expect(section.textContent).toBe(`${heading.textContent}${subheading.textContent}`);
    });

    it("has one heading, and the former headline's words appear nowhere in the hero", () => {
      render(withBooking(<Hero />));

      const section = heroSection();
      expect(within(section).getAllByRole("heading")).toHaveLength(1);
      expect(section.textContent).not.toMatch(/innovative solutions/i);
      expect(section.textContent).not.toMatch(/advanced electromagnetics simulations/i);
    });

    it("presents the subheading as a paragraph after the heading, not as a heading", () => {
      render(withBooking(<Hero />));

      const heading = screen.getByRole("heading", { level: 1, name: heroHeading });
      const subheading = heroSubheadingElement();

      expect(subheading.tagName).toBe("P");
      expect(heading.nextElementSibling).toBe(subheading);
      expect(within(heroSection()).queryAllByRole("heading")).toEqual([heading]);
    });

    it("presents no image to assistive technology with motion allowed", () => {
      const restore = stubPrefersReducedMotion(false);

      try {
        render(withBooking(<Hero />));
        expect(screen.queryAllByRole("img")).toHaveLength(0);
      } finally {
        restore();
      }
    });

    it("presents no image to assistive technology with reduced motion", () => {
      const restore = stubPrefersReducedMotion(true);

      try {
        render(withBooking(<Hero />));
        expect(screen.queryAllByRole("img")).toHaveLength(0);
      } finally {
        restore();
      }
    });

    it("shows the heading and subheading after the visitor waits", () => {
      render(withBooking(<Hero />));

      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(screen.queryAllByRole("img")).toHaveLength(0);
      expect(screen.getByRole("heading", { level: 1, name: heroHeading })).toBeInTheDocument();
      expect(heroSubheadingElement()).toBeInTheDocument();
    });

    it("shows the heading and subheading after the visitor repeatedly activates the hero", () => {
      render(withBooking(<Hero />));

      const heading = screen.getByRole("heading", { level: 1, name: heroHeading });
      const subheading = heroSubheadingElement();
      for (let i = 0; i < 4; i += 1) {
        fireEvent.click(heading);
        fireEvent.click(subheading);
      }

      expect(screen.queryAllByRole("img")).toHaveLength(0);
      expect(screen.getByRole("heading", { level: 1, name: heroHeading })).toBe(heading);
      expect(heroSubheadingElement()).toBe(subheading);
    });

    it("shows the heading and subheading after leaving and returning to the hero", () => {
      const first = render(withBooking(<Hero />));
      first.unmount();

      render(withBooking(<Hero />));

      expect(screen.queryAllByRole("img")).toHaveLength(0);
      expect(screen.getByRole("heading", { level: 1, name: heroHeading })).toBeInTheDocument();
      expect(heroSubheadingElement()).toBeInTheDocument();
    });

    it("offers no pause or resume control, because nothing in the hero moves", () => {
      render(withBooking(<Hero />));

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /hero pictures$/ })).not.toBeInTheDocument();
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
