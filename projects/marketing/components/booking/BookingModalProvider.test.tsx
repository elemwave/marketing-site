import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider, useBookingModal } from "./BookingModalProvider";
vi.mock("react-calendly", () =>
  import("@/test/calendly-mock").then((m) => m.calendlyPopupWithCloseButton()),
);

function Trigger() {
  const { open } = useBookingModal();
  return <button onClick={() => open()}>Schedule</button>;
}

function TriggerWithReturnFocus() {
  const { open } = useBookingModal();
  return (
    <>
      <button>Open menu</button>
      <button
        onClick={(event) => {
          const controlRef = event.currentTarget.previousElementSibling as HTMLElement;
          open({ returnFocusTo: controlRef });
        }}
      >
        Schedule a call
      </button>
    </>
  );
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

  it("opening with no argument moves focus nowhere in particular on close, as today", () => {
    render(
      <BookingModalProvider calendlyUrl="https://calendly.test/x">
        <Trigger />
      </BookingModalProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
    fireEvent.click(screen.getByRole("button", { name: "Close calendly" }));

    expect(screen.queryByTestId("calendly")).not.toBeInTheDocument();
    expect(document.body).toHaveFocus();
  });

  it("opening with a returnFocusTo target moves focus there once the dialog closes", () => {
    render(
      <BookingModalProvider calendlyUrl="https://calendly.test/x">
        <TriggerWithReturnFocus />
      </BookingModalProvider>,
    );
    const returnTarget = screen.getByRole("button", { name: "Open menu" });

    fireEvent.click(screen.getByRole("button", { name: "Schedule a call" }));
    fireEvent.click(screen.getByRole("button", { name: "Close calendly" }));

    expect(returnTarget).toHaveFocus();
  });
});
