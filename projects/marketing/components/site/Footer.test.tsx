import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { Footer } from "./Footer";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function renderFooter(preceding?: ReactNode) {
  render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      {preceding}
      <Footer />
    </BookingModalProvider>,
  );
}

describe("the footer's company registration", () => {
  it("should name the registered company and its tax identification number", () => {
    renderFooter();

    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "Elemwave S.L. · CIF B06913164",
    );
  });

  it("should give the company's entry in the mercantile registry", () => {
    renderFooter();

    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "Registro Mercantil de Granada, Tomo 1768, Libro 0, Folio 205, Sección 8, Hoja GR 56182",
    );
  });
});

const COLUMN_TITLES = ["Policies", "Quick Links", "Get In Touch"] as const;

describe("the footer's column titles", () => {
  it("should expose Policies, Quick Links and Get In Touch as rank-2 headings", () => {
    renderFooter();

    const footer = screen.getByRole("contentinfo");
    for (const name of COLUMN_TITLES) {
      expect(
        within(footer).getByRole("heading", { level: 2, name }),
      ).toBeInTheDocument();
      expect(
        within(footer).queryByRole("heading", { level: 6, name }),
      ).not.toBeInTheDocument();
    }
  });

  it("should follow a rank-1 page title without skipping a heading rank", () => {
    renderFooter(<h1>Contact</h1>);

    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(4);
    expect(headings[0]).toBe(
      screen.getByRole("heading", { level: 1, name: "Contact" }),
    );
    expect(headings[1]).toBe(
      screen.getByRole("heading", { level: 2, name: "Policies" }),
    );
    expect(headings[2]).toBe(
      screen.getByRole("heading", { level: 2, name: "Quick Links" }),
    );
    expect(headings[3]).toBe(
      screen.getByRole("heading", { level: 2, name: "Get In Touch" }),
    );
  });
});

describe("the footer's quick links", () => {
  it("should offer the team, contact, partnerships and booking destinations", () => {
    renderFooter();

    const quickLinks = screen
      .getByRole("heading", { level: 2, name: "Quick Links" })
      .closest("div");

    expect(quickLinks).not.toBeNull();
    expect(within(quickLinks!).getByRole("link", { name: "Our Team" })).toHaveAttribute(
      "href",
      "/team",
    );
    expect(within(quickLinks!).getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(
      within(quickLinks!).getByRole("link", { name: "Partnerships" }),
    ).toHaveAttribute("href", "/partnerships");
    expect(
      within(quickLinks!).getByRole("button", { name: "Schedule a meeting" }),
    ).toBeInTheDocument();
  });
});
