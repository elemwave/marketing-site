import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavToggle } from "./NavToggle";
import { BookingModalProvider } from "../booking/BookingModalProvider";
import { NAV_ITEMS, type SitePath } from "@/lib/site-content";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

afterEach(() => {
  document.body.style.overflow = "";
});

function renderToggle(currentPath?: SitePath) {
  return render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <NavToggle currentPath={currentPath} />
    </BookingModalProvider>,
  );
}

function openDrawer() {
  fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
}

describe("NavToggle", () => {
  it("keeps the entries out of the document until asked", () => {
    renderToggle();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("reveals every navigation entry once opened", () => {
    renderToggle();

    openDrawer();

    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
    for (const item of NAV_ITEMS) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    }
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("marks the current page among the entries", () => {
    renderToggle("/partnerships");

    openDrawer();

    expect(screen.getByRole("link", { name: "Partnerships" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Our Team as current in the narrow menu", () => {
    renderToggle("/team");

    openDrawer();

    expect(screen.getByRole("link", { name: "Our Team" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "Contact" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks no entry on a page the navigation does not list", () => {
    renderToggle();

    openDrawer();

    for (const item of NAV_ITEMS) {
      expect(screen.getByRole("link", { name: item.label })).not.toHaveAttribute(
        "aria-current",
      );
    }
  });

  it("closes on Escape and hands focus back to the control", () => {
    renderToggle();
    const control = screen.getByRole("button", { name: "Open menu" });

    openDrawer();
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(control).toHaveFocus();
  });

  it("ignores other keys while open", () => {
    renderToggle();

    openDrawer();
    fireEvent.keyDown(window, { key: "Enter" });

    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
  });

  it("closes from its own close control", () => {
    renderToggle();

    openDrawer();
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when an entry is followed", () => {
    renderToggle();

    openDrawer();
    fireEvent.click(screen.getByRole("link", { name: "Contact" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("locks the page behind the drawer and releases it on close", () => {
    renderToggle();

    openDrawer();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.body.style.overflow).toBe("");
  });

  it("offers the booking action inside the drawer", () => {
    renderToggle();

    openDrawer();

    expect(
      screen.getByRole("button", { name: "Schedule a call" }),
    ).toBeInTheDocument();
  });
});
