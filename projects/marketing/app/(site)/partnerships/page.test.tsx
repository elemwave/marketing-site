import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import Partnerships, { metadata } from "./page";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function renderPartnerships() {
  render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <Partnerships />
    </BookingModalProvider>,
  );
}

describe("the partnerships page", () => {
  it("presents its own content", () => {
    renderPartnerships();

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Partners" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Collaborations That Shape Our Work" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Become a Partner" }),
    ).toBeInTheDocument();
  });

  it("keeps the hero on its own navy surface", () => {
    renderPartnerships();

    const heroSurfaceClasses = within(document.body)
      .getByRole("heading", { level: 1 })
      .closest("section")
      ?.className.split(/\s+/);
    expect(heroSurfaceClasses).toContain("bg-navy-950");
    expect(heroSurfaceClasses).not.toContain("max-w-[1100px]");
  });

  it("publishes its own identity", () => {
    expect(metadata.title).toBe("Partnerships");
    expect(metadata.description).toBe(
      "The aerospace and research collaborations behind Elemwave's computational electromagnetics work, and how to start one.",
    );
    expect(metadata.alternates?.canonical).toBe("https://www.elemwave.com/partnerships");
    expect(metadata.openGraph?.title).toBe("Partnerships | Elemwave");
    expect(metadata.openGraph?.description).toBe(
      "The aerospace and research collaborations behind Elemwave's computational electromagnetics work, and how to start one.",
    );
    expect(metadata.openGraph?.url).toBe("https://www.elemwave.com/partnerships");
  });
});
