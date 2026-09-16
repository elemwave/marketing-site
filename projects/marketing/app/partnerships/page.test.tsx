import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import {
  expectNavyParentDoesNotClipOverflow,
  expectSingleMainLandmark,
} from "@/test/page-landmarks";
import { organisationRecord } from "@/lib/organisation-record";
import { expectOrganisationRecordScript } from "@/test/expect-organisation-record";
import Partnerships, { metadata } from "./page";

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

    const main = expectSingleMainLandmark();
    expect(within(main).getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(within(main).getByRole("region", { name: "Partners" })).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "Collaborations That Shape Our Work" }),
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "Become a Partner" }),
    ).toBeInTheDocument();
  });

  it("does not clip overflow on the navy parent that holds the landmark", () => {
    renderPartnerships();
    const navyParent = screen.getByRole("banner").parentElement;
    expect(navyParent).toContainElement(screen.getByRole("main"));
    expectNavyParentDoesNotClipOverflow();
  });

  it("publishes the shared organisation record", () => {
    renderPartnerships();
    expect(expectOrganisationRecordScript()).toEqual(organisationRecord());
  });

  it("publishes its own identity", () => {
    expect(metadata.title).toBe("Partnerships");
    expect(metadata.description).toBe(
      "The aerospace and research collaborations behind Elemwave's computational electromagnetics work, and how to start one.",
    );
    expect(metadata.alternates?.canonical).toBe("https://www.elemwave.com/partnerships");
    expect(metadata.openGraph?.title).toBe("Partnerships | Elemwave");
    expect(metadata.openGraph?.description).toBe(
      "The aerospace and research collaborations behind Elemwave's computational electromagnetics work, and how to start one.",
    );
    expect(metadata.openGraph?.url).toBe("https://www.elemwave.com/partnerships");
  });

  it("marks only the Partnerships primary-navigation entry as current", () => {
    renderPartnerships();

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const current = within(navigation)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName("Partnerships");
  });
});
