import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

  it("exposes the first tab as pressed and the others as not pressed", () => {
    render(<SoftwareSection />);
    const [first, second] = screen.getAllByRole("button");

    expect(first).toHaveAttribute("aria-pressed", "true");
    expect(second).toHaveAttribute("aria-pressed", "false");
  });

  it("moves the pressed state when another tab is chosen", () => {
    render(<SoftwareSection />);
    const [first, second] = screen.getAllByRole("button");

    fireEvent.click(second);

    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(first).toHaveAttribute("aria-pressed", "false");
  });

  it("announces nothing on first render", () => {
    render(<SoftwareSection />);
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("announces the newly shown capability when a different tab is chosen", () => {
    render(<SoftwareSection />);
    const [, second] = screen.getAllByRole("button");

    fireEvent.click(second);

    expect(screen.getByRole("status")).toHaveTextContent("BOUNDARIES");
  });

  it("does not repeat the announcement when the already-active tab is chosen again", () => {
    render(<SoftwareSection />);
    const [first] = screen.getAllByRole("button");

    fireEvent.click(first);

    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});
