import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BookMeeting } from "./BookMeeting";
import { Footer } from "../site/Footer";
import { Header } from "../site/Header";
import { Hero } from "./Hero";
import { PillButton } from "../site/PillButton";
import { ScienceSection } from "./ScienceSection";
import { SectionHeading } from "./SectionHeading";
import { SLIDES } from "@/lib/home-content";
import { partnerAccessibleName, partnerBySrc } from "@/lib/site-content";
import { BookingModalProvider } from "../booking/BookingModalProvider";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function withBooking(node: React.ReactNode) {
  return <BookingModalProvider calendlyUrl="https://calendly.test/x">{node}</BookingModalProvider>;
}

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

  it("admits the solver overlay once the hero renders on the client", () => {
    render(withBooking(<Hero />));

    expect(screen.getByAltText("A320 solver field view")).toBeInTheDocument();
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
