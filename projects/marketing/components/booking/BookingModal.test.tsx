import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BookingModal } from "./BookingModal";

vi.mock("react-calendly", () => ({
  PopupModal: ({ url, iframeTitle }: { url: string; iframeTitle: string }) => (
    <div data-testid="calendly" data-url={url} title={iframeTitle} />
  ),
}));

afterEach(() => {
  document.body.style.overflow = "";
});

describe("BookingModal", () => {
  it("renders nothing while closed, so no scheduler loads unasked", () => {
    render(<BookingModal calendlyUrl="https://calendly.test/x" isOpen={false} onClose={() => {}} />);

    expect(screen.queryByTestId("calendly")).not.toBeInTheDocument();
  });

  it("shows the scheduler for the given url when open", () => {
    render(<BookingModal calendlyUrl="https://calendly.test/x" isOpen onClose={() => {}} />);

    expect(screen.getByTestId("calendly")).toHaveAttribute("data-url", "https://calendly.test/x");
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<BookingModal calendlyUrl="https://calendly.test/x" isOpen onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignores other keys", () => {
    const onClose = vi.fn();
    render(<BookingModal calendlyUrl="https://calendly.test/x" isOpen onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("locks body scrolling while open and restores it on close", () => {
    const { rerender } = render(
      <BookingModal calendlyUrl="https://calendly.test/x" isOpen={false} onClose={() => {}} />,
    );
    document.body.style.overflow = "auto";

    rerender(<BookingModal calendlyUrl="https://calendly.test/x" isOpen onClose={() => {}} />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<BookingModal calendlyUrl="https://calendly.test/x" isOpen={false} onClose={() => {}} />);
    expect(document.body.style.overflow).toBe("auto");
  });

  it("stops listening for Escape once closed", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <BookingModal calendlyUrl="https://calendly.test/x" isOpen onClose={onClose} />,
    );

    rerender(<BookingModal calendlyUrl="https://calendly.test/x" isOpen={false} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });
});
