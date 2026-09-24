import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavToggle } from "./NavToggle";
import { BookingModalProvider } from "../booking/BookingModalProvider";
import { NAV_ITEMS, type SitePath } from "@/lib/site-content";

vi.mock("react-calendly", () => ({
  PopupModal: ({ onModalClose }: { onModalClose: () => void }) => (
    <div data-testid="calendly">
      <button onClick={onModalClose}>Close calendly</button>
    </div>
  ),
}));

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

afterEach(() => {
  document.body.style.overflow = "";
  usePathname.mockReset();
});

function renderToggle(currentPath?: SitePath) {
  usePathname.mockReturnValue(currentPath);
  return render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <NavToggle />
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

  it("syncs its own state and hands focus back to the control when the browser closes the dialog natively (Escape)", () => {
    renderToggle();
    const control = screen.getByRole("button", { name: "Open menu" });

    openDrawer();
    const dialog = screen.getByRole("dialog", { name: "Menu" }) as HTMLDialogElement;
    // Escape on a modal <dialog> is the browser's own cancel/close
    // algorithm calling close() with no listener of this component's own —
    // jsdom has neither the algorithm nor the method (see test/setup.ts),
    // so this calls the polyfilled close() the same way, rather than a
    // keydown this component no longer listens for. Real Tab-key and
    // Escape behaviour is proved in the Playwright suite (T13).
    act(() => {
      dialog.close();
    });

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

    const dialog = screen.getByRole("dialog", { name: "Menu" }) as HTMLDialogElement;
    act(() => {
      dialog.close();
    });
    expect(document.body.style.overflow).toBe("");
  });

  it("offers the booking action inside the drawer", () => {
    renderToggle();

    openDrawer();

    expect(
      screen.getByRole("button", { name: "Schedule a call" }),
    ).toBeInTheDocument();
  });

  it("presents the open menu as a modal dialog named Menu", () => {
    renderToggle();

    openDrawer();

    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("calls the native showModal() when it opens", () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    renderToggle();

    openDrawer();

    expect(showModal).toHaveBeenCalledOnce();
    showModal.mockRestore();
  });

  it("closes the menu and shows the booking surface when Schedule a call is chosen inside it", () => {
    renderToggle();

    openDrawer();
    fireEvent.click(screen.getByRole("button", { name: "Schedule a call" }));

    expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument();
    expect(screen.getByTestId("calendly")).toBeInTheDocument();
  });

  it("returns focus to Open menu once the booking dialog it opened is itself closed", () => {
    renderToggle();
    const control = screen.getByRole("button", { name: "Open menu" });

    openDrawer();
    fireEvent.click(screen.getByRole("button", { name: "Schedule a call" }));
    fireEvent.click(screen.getByRole("button", { name: "Close calendly" }));

    expect(control).toHaveFocus();
  });
});
