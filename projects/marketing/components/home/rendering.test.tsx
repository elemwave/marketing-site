import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BookMeeting } from "./BookMeeting";
import { Footer } from "../site/Footer";
import { Header } from "../site/Header";
import { Hero } from "./Hero";
import { PillButton } from "../site/PillButton";
import { ScienceSection } from "./ScienceSection";
import { SectionHeading } from "./SectionHeading";
import { BookingModalProvider } from "../booking/BookingModalProvider";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function withBooking(node: React.ReactNode) {
  return <BookingModalProvider calendlyUrl="https://calendly.test/x">{node}</BookingModalProvider>;
}

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
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })) as typeof window.matchMedia;

      try {
        render(withBooking(<Hero />));

        expect(
          screen.queryByRole("button", { name: "Pause hero pictures" }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "Resume hero pictures" }),
        ).not.toBeInTheDocument();

        const solver = screen.getByAltText("A320 solver field view");
        const textured = screen.getByAltText("A320 textured render");

        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(solver).toHaveStyle({ opacity: "0" });
        expect(textured).toHaveStyle({ opacity: "1" });
      } finally {
        window.matchMedia = originalMatchMedia;
      }
    });
  });

  it("ScienceSection shows its heading", () => {
    render(<ScienceSection />);
    expect(screen.getAllByRole("heading").length).toBeGreaterThan(0);
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
