import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider, useBookingModal } from "./BookingModalProvider";

vi.mock("react-calendly", () => ({
  PopupModal: () => <div data-testid="calendly" />,
}));

function Trigger() {
  const { open } = useBookingModal();
  return <button onClick={open}>Schedule</button>;
}

describe("BookingModalProvider", () => {
  it("keeps the dialog closed until a descendant opens it", () => {
    render(
      <BookingModalProvider calendlyUrl="https://calendly.test/x">
        <Trigger />
      </BookingModalProvider>,
    );

    expect(screen.queryByTestId("calendly")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));

    expect(screen.getByTestId("calendly")).toBeInTheDocument();
  });

  it("refuses to be used outside a provider rather than failing silently", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Trigger />)).toThrow(/requires a BookingModalProvider/);

    consoleError.mockRestore();
  });
});
