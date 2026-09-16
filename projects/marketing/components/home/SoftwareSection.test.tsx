import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TABS } from "@/lib/home-content";
import { SoftwareSection } from "./SoftwareSection";

function labelOf(tab: HTMLElement) {
  return within(tab).getByText(/\w/, { selector: "span:last-of-type, span" });
}

describe("SoftwareSection", () => {
  it("opens on its first tab", () => {
    render(<SoftwareSection />);
    const [first, second] = screen.getAllByRole("button");

    expect(labelOf(first).className).toContain("font-semibold");
    expect(labelOf(second).className).toContain("font-normal");
  });

  it("moves the emphasis when another tab is chosen", () => {
    render(<SoftwareSection />);
    const [first, second] = screen.getAllByRole("button");

    fireEvent.click(second);

    expect(labelOf(second).className).toContain("font-semibold");
    expect(labelOf(first).className).toContain("font-normal");
  });

  it("exposes the first capability as pressed and shows its card", () => {
    render(<SoftwareSection />);

    expect(
      screen.getByRole("button", { name: TABS[0].label }),
    ).toHaveAttribute("aria-pressed", "true");
    for (const tab of TABS.slice(1)) {
      expect(screen.getByRole("button", { name: tab.label })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    }
    expect(
      screen.getByRole("heading", { name: TABS[0].title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: `${TABS[0].title} screenshot` }),
    ).toBeInTheDocument();
  });

  it("moves pressed state when another capability is chosen", () => {
    render(<SoftwareSection />);

    fireEvent.click(screen.getByRole("button", { name: TABS[1].label }));

    expect(
      screen.getByRole("button", { name: TABS[1].label }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: TABS[0].label }),
    ).toHaveAttribute("aria-pressed", "false");
    for (const tab of TABS.slice(2)) {
      expect(screen.getByRole("button", { name: tab.label })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    }
    expect(
      screen.getByRole("heading", { name: TABS[1].title }),
    ).toBeInTheDocument();
  });

  it("does not announce the first capability on first view", () => {
    render(<SoftwareSection />);

    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("announces the newly shown heading when a different capability is chosen", () => {
    render(<SoftwareSection />);

    fireEvent.click(screen.getByRole("button", { name: TABS[1].label }));

    expect(screen.getByRole("status")).toHaveTextContent(TABS[1].title);
  });

  it("does not announce when the already pressed capability is chosen again", () => {
    render(<SoftwareSection />);

    fireEvent.click(screen.getByRole("button", { name: TABS[0].label }));

    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});
