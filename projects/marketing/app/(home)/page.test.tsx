import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import Home from "./page";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function renderHome() {
  render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <Home />
    </BookingModalProvider>,
  );
}

describe("the home page", () => {
  it("exposes unique content as a single primary-content landmark", () => {
    renderHome();

    const mains = screen.getAllByRole("main");
    expect(mains).toHaveLength(1);
    const main = mains[0];
    expect(main).toHaveAttribute("id", "main-content");

    expect(within(main).getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(main.querySelector("#software")).not.toBeNull();
    expect(
      within(main).getByRole("heading", { name: "The Science Behind Us" }),
    ).toBeInTheDocument();
    expect(main.querySelector("#book")).not.toBeNull();

    expect(screen.getByRole("banner").closest("main")).toBeNull();
    expect(screen.getByRole("contentinfo").closest("main")).toBeNull();
  });

  it("does not clip overflow on the navy parent that holds the landmark", () => {
    renderHome();

    const navyParent = screen.getByRole("banner").parentElement;
    expect(navyParent).not.toBeNull();
    expect(navyParent?.className.split(/\s+/)).not.toContain("overflow-hidden");
    expect(screen.getByRole("main").className.split(/\s+/)).not.toContain(
      "overflow-hidden",
    );
  });
});
