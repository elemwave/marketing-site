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
});
