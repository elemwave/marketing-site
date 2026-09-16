import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
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

    const mains = screen.getAllByRole("main");
    expect(mains).toHaveLength(1);
    const main = mains[0];
    expect(main).toHaveAttribute("id", "main-content");

    expect(within(main).getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(within(main).getByRole("region", { name: "Partners" })).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "Collaborations That Shape Our Work" }),
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "Become a Partner" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("banner").closest("main")).toBeNull();
    expect(screen.getByRole("contentinfo").closest("main")).toBeNull();
  });
});
