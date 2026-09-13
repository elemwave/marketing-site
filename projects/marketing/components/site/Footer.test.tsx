import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { Footer } from "./Footer";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function renderFooter() {
  render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
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
