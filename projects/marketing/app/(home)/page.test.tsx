import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import {
  expectNavyParentDoesNotClipOverflow,
  expectSingleMainLandmark,
} from "@/test/page-landmarks";
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

    const main = expectSingleMainLandmark();
    expect(within(main).getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(main.querySelector("#software")).not.toBeNull();
    expect(
      within(main).getByRole("heading", { name: "The Science Behind Us" }),
    ).toBeInTheDocument();
    expect(main.querySelector("#book")).not.toBeNull();
  });

  it("does not clip overflow on the navy parent that holds the landmark", () => {
    renderHome();
    expectNavyParentDoesNotClipOverflow();
  });
});
