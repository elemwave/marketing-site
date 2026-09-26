import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { expectNoOrganisationRecordScript } from "@/test/expect-organisation-record";
import NotFound, { metadata } from "./not-found";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function renderNotFound() {
  render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <NotFound />
    </BookingModalProvider>,
  );
}

describe("the not-found page", () => {
  it("should tell the visitor the page does not exist", () => {
    renderNotFound();

    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeInTheDocument();
  });

  it("should expose unique content as its own section", () => {
    renderNotFound();

    const section = screen
      .getByRole("heading", { level: 1, name: "Page not found" })
      .closest("section");
    expect(section).not.toBeNull();
  });

  it("should offer a way back to the home page", () => {
    renderNotFound();

    const section = screen
      .getByRole("heading", { level: 1, name: "Page not found" })
      .closest("section")!;
    expect(within(section).getByRole("link", { name: "Back to the home page" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("should name the page once in the browser tab, leaving the brand to the template", () => {
    expect(metadata.title).toBe("Page not found");
  });

  it("should publish no organisation record", () => {
    renderNotFound();
    expect(expectNoOrganisationRecordScript()).toBe(0);
  });

  it("should declare no canonical address", () => {
    expect(metadata.alternates?.canonical).toBeUndefined();
  });

  it("renders no page-owned header band, since the root layout now supplies the header", () => {
    const { container } = render(<NotFound />);

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    const section = container.firstElementChild;
    expect(section?.tagName).toBe("SECTION");
    expect(section?.className.split(/\s+/)).toContain("bg-navy-950");
    expect(section?.className.split(/\s+/)).not.toContain("overflow-hidden");
  });

  it("keeps the dark band full width, matching the other hero sections, constraining only its own content", () => {
    const { container } = render(<NotFound />);

    const section = container.firstElementChild!;
    expect(section.className.split(/\s+/)).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^max-w-/)]),
    );

    const content = section.firstElementChild!;
    expect(content.className.split(/\s+/)).toContain("max-w-[760px]");
  });
});
