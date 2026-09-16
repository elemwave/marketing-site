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

  it("clips the decorative glow inside the header", () => {
    renderHeader();

    const clip = [...screen.getByRole("banner").querySelectorAll("[aria-hidden]")].find(
      (el) => el.className.split(/\s+/).includes("overflow-hidden"),
    );
    expect(clip).toBeDefined();
    expect(clip?.className.split(/\s+/)).toContain("-bottom-10");
  });
});
