import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { organisationRecord } from "@/lib/organisation-record";
import { expectOrganisationRecordScript } from "@/test/expect-organisation-record";
import { expectSingleMainLandmark } from "@/test/page-landmarks";
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
  it("exposes unique content as a single primary-content landmark", () => {
    renderTeam();

    const main = expectSingleMainLandmark();
    expect(
      within(main).getByRole("heading", {
        level: 1,
        name: "The people behind Elemwave",
      }),
    ).toBeInTheDocument();
    expect(within(main).getAllByRole("article")).toHaveLength(5);
  });

  it("publishes the shared organisation record", () => {
    renderTeam();
    expect(expectOrganisationRecordScript()).toEqual(organisationRecord());
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

  it("marks only the Our Team primary-navigation entry as current", () => {
    renderTeam();

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const current = within(navigation)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName("Our Team");
  });
});
