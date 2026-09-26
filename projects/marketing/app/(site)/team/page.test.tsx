import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import Team, { metadata } from "./page";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function renderTeam() {
  render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <Team />
    </BookingModalProvider>,
  );
}

describe("the team page", () => {
  it("presents its own content", () => {
    renderTeam();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "The people behind Elemwave",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(5);
  });

  it("publishes its own identity", () => {
    expect(metadata.title).toBe("Our Team");
    expect(metadata.description).toBe(
      "Meet the engineers and researchers behind Elemwave's computational electromagnetics, EMC, RF, and engineering software work.",
    );
    expect(metadata.alternates?.canonical).toBe("https://www.elemwave.com/team");
    expect(metadata.openGraph?.title).toBe("Our Team | Elemwave");
    expect(metadata.openGraph?.description).toBe(
      "Meet the engineers and researchers behind Elemwave's computational electromagnetics, EMC, RF, and engineering software work.",
    );
    expect(metadata.openGraph?.url).toBe("https://www.elemwave.com/team");
  });
});
