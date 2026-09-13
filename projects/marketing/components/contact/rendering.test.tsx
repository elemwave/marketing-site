import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContactSection } from "./ContactSection";
import { BookingModalProvider } from "../booking/BookingModalProvider";
import {
  ADDRESS_LINES,
  CONTACT_EMAIL,
  CONTACT_PHONE,
} from "@/lib/site-content";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function withBooking(node: React.ReactNode) {
  return <BookingModalProvider calendlyUrl="https://calendly.test/x">{node}</BookingModalProvider>;
}

describe("the contact section", () => {
  it("offers the email address as a mail link", () => {
    render(withBooking(<ContactSection />));
    expect(screen.getByRole("link", { name: CONTACT_EMAIL })).toHaveAttribute(
      "href",
      `mailto:${CONTACT_EMAIL}`,
    );
  });

  it("offers the telephone number as a dial link", () => {
    render(withBooking(<ContactSection />));
    expect(
      screen.getByRole("link", { name: CONTACT_PHONE.display }),
    ).toHaveAttribute("href", CONTACT_PHONE.href);
  });

  it("states the postal address", () => {
    render(withBooking(<ContactSection />));
    for (const line of ADDRESS_LINES) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });

  it("labels each detail it lists", () => {
    render(withBooking(<ContactSection />));
    for (const label of ["Address", "Phone", "Email"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("offers the booking call to action", () => {
    render(withBooking(<ContactSection />));
    expect(
      screen.getByRole("button", { name: "Schedule a call" }),
    ).toBeInTheDocument();
  });
});
