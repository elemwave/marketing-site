import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
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
  it("should keep the site header and footer so the visitor can navigate onwards", () => {
    renderNotFound();

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("should tell the visitor the page does not exist", () => {
    renderNotFound();

    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeInTheDocument();
  });

  it("should offer a way back to the home page", () => {
    renderNotFound();

    const main = screen.getByRole("main");
    expect(within(main).getByRole("link", { name: "Back to the home page" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("should name the page once in the browser tab, leaving the brand to the template", () => {
    expect(metadata.title).toBe("Page not found");
  });
});
