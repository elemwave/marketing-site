import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { Header } from "./Header";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function renderHeader() {
  render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <Header />
    </BookingModalProvider>,
  );
}

describe("Header", () => {
  it("places the skip-to-content control as the first focusable link", () => {
    renderHeader();

    const firstLink = screen.getAllByRole("link")[0];
    expect(firstLink).toHaveAccessibleName("Skip to content");
    expect(firstLink).toHaveAttribute("href", "#main-content");
  });

  it("clips the decorative glow to the header's own bounds", () => {
    renderHeader();

    const clip = [...screen.getByRole("banner").querySelectorAll("[aria-hidden]")].find(
      (el) => el.className.split(/\s+/).includes("overflow-hidden"),
    );
    expect(clip).toBeDefined();
    const clipClasses = clip?.className.split(/\s+/);
    expect(clipClasses).toContain("inset-0");
    expect(clipClasses).not.toContain("-bottom-10");
  });

  it("owns the navy surface on the header root", () => {
    renderHeader();

    expect(screen.getByRole("banner").className.split(/\s+/)).toContain(
      "bg-navy-950",
    );
  });
});
