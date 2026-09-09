import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingTrigger } from "./BookingTrigger";
import { BookingModalProvider } from "./BookingModalProvider";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

describe("BookingTrigger", () => {
  it("opens the booking dialog when pressed", () => {
    render(
      <BookingModalProvider calendlyUrl="https://calendly.test/x">
        <BookingTrigger>Schedule a meeting</BookingTrigger>
      </BookingModalProvider>,
    );

    expect(screen.queryByTestId("calendly")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Schedule a meeting" }));

    expect(screen.getByTestId("calendly")).toBeInTheDocument();
  });
});
