import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import Home, { metadata } from "./page";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function renderHome() {
  render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <Home />
    </BookingModalProvider>,
  );
}

describe("the home page", () => {
  it("presents its own content", () => {
    renderHome();

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(document.querySelector("#software")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "The Science Behind Us" }),
    ).toBeInTheDocument();
    expect(document.querySelector("#book")).not.toBeNull();
  });

  it("keeps the hero on its own navy surface", () => {
    renderHome();

    const heroSurfaceClasses = within(document.body)
      .getByRole("heading", { level: 1 })
      .closest("section")
      ?.className.split(/\s+/);
    expect(heroSurfaceClasses).toContain("bg-navy-950");
    expect(heroSurfaceClasses).not.toContain("max-w-[1440px]");
  });

  it("publishes its own identity as the brand title", () => {
    expect(metadata.title).toEqual({
      absolute: "Elemwave - Advanced electromagnetics simulations",
    });
    expect(metadata.description).toBe(
      "Innovative solutions for advanced electromagnetics simulations.",
    );
    expect(metadata.alternates?.canonical).toBe("https://www.elemwave.com/");
    expect(metadata.openGraph?.title).toBe("Elemwave - Advanced electromagnetics simulations");
    expect(metadata.openGraph?.description).toBe(
      "Innovative solutions for advanced electromagnetics simulations.",
    );
    expect(metadata.openGraph?.url).toBe("https://www.elemwave.com/");
  });
});
