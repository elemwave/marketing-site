import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { expectNoPageOwnedHeaderBand } from "@/test/page-landmarks";
import { organisationRecord } from "@/lib/organisation-record";
import { expectOrganisationRecordScript } from "@/test/expect-organisation-record";
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
  it("exposes unique content as a single primary-content landmark", () => {
    renderContact();

    const mains = screen.getAllByRole("main");
    expect(mains).toHaveLength(1);
    const main = mains[0];
    expect(main).toHaveAttribute("id", "main-content");

    expect(
      within(main).getByRole("heading", { level: 1, name: "Contact us" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("banner").closest("main")).toBeNull();
    expect(screen.getByRole("contentinfo").closest("main")).toBeNull();
  });

  it("publishes the shared organisation record", () => {
    renderContact();
    expect(expectOrganisationRecordScript()).toEqual(organisationRecord());
  });

  it("does not add a page-owned header styling wrapper", () => {
    renderContact();

    expectNoPageOwnedHeaderBand();
    expect(screen.getByRole("banner").className.split(/\s+/)).toContain(
      "bg-navy-950",
    );
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

  it("marks only the Contact primary-navigation entry as current", () => {
    renderContact();

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const current = within(navigation)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName("Contact");
  });
});
