import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import Contact, { metadata } from "./page";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function renderContact() {
  render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <Contact />
    </BookingModalProvider>,
  );
}

describe("the contact page", () => {
  it("presents its own content", () => {
    renderContact();

    expect(
      screen.getByRole("heading", { level: 1, name: "Contact us" }),
    ).toBeInTheDocument();
  });

  it("publishes its own identity", () => {
    expect(metadata.title).toBe("Contact");
    expect(metadata.description).toBe(
      "Contact Elemwave in Granada, Spain about electromagnetic simulation, EMC, RF, and engineering software projects.",
    );
    expect(metadata.alternates?.canonical).toBe("https://www.elemwave.com/contact");
    expect(metadata.openGraph?.title).toBe("Contact | Elemwave");
    expect(metadata.openGraph?.description).toBe(
      "Contact Elemwave in Granada, Spain about electromagnetic simulation, EMC, RF, and engineering software projects.",
    );
    expect(metadata.openGraph?.url).toBe("https://www.elemwave.com/contact");
  });
});
