import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { Header } from "./Header";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

function renderHeader() {
  render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <Header />
    </BookingModalProvider>,
  );
}

describe("Header", () => {
  it("places the skip-to-content control as the first focusable link", () => {
    renderHeader();

    const firstLink = screen.getAllByRole("link")[0];
    expect(firstLink).toHaveAccessibleName("Skip to content");
    expect(firstLink).toHaveAttribute("href", "#main-content");
  });

  it("clips the decorative glow to the header's own bounds", () => {
    renderHeader();

    const clip = [...screen.getByRole("banner").querySelectorAll("[aria-hidden]")].find(
      (el) => el.className.split(/\s+/).includes("overflow-hidden"),
    );
    expect(clip).toBeDefined();
    const clipClasses = clip?.className.split(/\s+/);
    expect(clipClasses).toContain("inset-0");
    expect(clipClasses).not.toContain("-bottom-10");
  });

  it("owns the navy surface on the header root", () => {
    renderHeader();

    expect(screen.getByRole("banner").className.split(/\s+/)).toContain(
      "bg-navy-950",
    );
  });

  it("marks the current entry and scrolls the logo to the top on the home route", () => {
    usePathname.mockReturnValue("/");
    renderHeader();

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    expect(within(navigation).getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    for (const other of ["Partnerships", "Our Team", "Contact"]) {
      expect(within(navigation).getByRole("link", { name: other })).not.toHaveAttribute(
        "aria-current",
      );
    }
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "#main-content");
    const logoLink = screen.getAllByRole("link").find((link) => link.getAttribute("href") === "#top");
    expect(logoLink).toBeDefined();
  });

  it("marks the current entry and links the logo home on another route", () => {
    usePathname.mockReturnValue("/contact");
    renderHeader();

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    expect(within(navigation).getByRole("link", { name: "Contact" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    for (const other of ["Home", "Partnerships", "Our Team"]) {
      expect(within(navigation).getByRole("link", { name: other })).not.toHaveAttribute(
        "aria-current",
      );
    }
    const logoLink = screen.getAllByRole("link").find((link) => link.getAttribute("href") === "/");
    expect(logoLink).toBeDefined();
  });

  it("marks no navigation entry as current on a route outside the navigation", () => {
    usePathname.mockReturnValue("/privacy-policy");
    renderHeader();

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    for (const link of within(navigation).getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });
});
