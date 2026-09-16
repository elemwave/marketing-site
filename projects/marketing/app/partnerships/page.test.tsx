import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import {
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

  it("does not clip overflow on the navy parent that holds the landmark", () => {
    renderPartnerships();
    expectNavyParentDoesNotClipOverflow();
  });
});
