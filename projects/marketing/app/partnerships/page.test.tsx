import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import {
  expectNoPageOwnedHeaderBand,
  expectNavyParentDoesNotClipOverflow,
  expectSingleMainLandmark,
} from "@/test/page-landmarks";
import Partnerships from "./page";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function renderPartnerships() {
  render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <Partnerships />
    </BookingModalProvider>,
  );
}

describe("the partnerships page", () => {
  it("exposes unique content as a single primary-content landmark", () => {
    renderPartnerships();

    const main = expectSingleMainLandmark();
    expect(within(main).getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(within(main).getByRole("region", { name: "Partners" })).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "Collaborations That Shape Our Work" }),
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "Become a Partner" }),
    ).toBeInTheDocument();
  });

  it("does not clip overflow in page-owned landmark containers", () => {
    renderPartnerships();

    expect(screen.getByRole("main").className.split(/\s+/)).not.toContain("overflow-hidden");
    expectNavyParentDoesNotClipOverflow();
  });

  it("keeps visual surfaces out of the page wrapper", () => {
    renderPartnerships();

    expectNoPageOwnedHeaderBand();
    const heroSurfaceClasses = within(screen.getByRole("main"))
      .getByRole("heading", { level: 1 })
      .closest("section")
      ?.className.split(/\s+/);
    expect(heroSurfaceClasses).toContain("bg-navy-950");
    expect(heroSurfaceClasses).not.toContain("max-w-[1100px]");
    expect(screen.getByRole("main")).toContainElement(
      screen.getByRole("region", { name: "Partners" }),
    );
  });
});
