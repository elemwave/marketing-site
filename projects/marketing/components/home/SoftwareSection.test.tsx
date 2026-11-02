import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SoftwareSection } from "./SoftwareSection";

function labelOf(tab: HTMLElement) {
  return within(tab).getByText(/\w/, { selector: "span:last-of-type, span" });
}

/** The Cable solver tab links opensemba/tulip and ParaView to their own sites. */
function expectSoftwareLinks() {
  for (const link of screen.getAllByRole("link", { name: "opensemba/tulip" })) {
    expect(link).toHaveAttribute("href", "https://github.com/opensemba/tulip");
  }
  expect(screen.getByRole("link", { name: "ParaView" })).toHaveAttribute(
    "href",
    "https://www.paraview.org/",
  );
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

  it("shows the Our Solution heading and not the old one", () => {
    render(<SoftwareSection />);

    expect(screen.getByRole("heading", { name: "Our Solution" })).toBeInTheDocument();
    expect(screen.queryByText("What Our Software Can Do")).toBeNull();
  });

  it("labels and titles the first tab Cable solver", () => {
    render(<SoftwareSection />);
    const [first] = screen.getAllByRole("button");

    expect(first).toHaveTextContent("Cable solver");
    expect(screen.getByRole("heading", { level: 3, name: "Cable solver" })).toBeInTheDocument();
    expect(screen.queryByText(/^tulip$/i)).toBeNull();
  });

  it("states that the cable solver combines 3D simulation, Multiconductor Transmission Lines and SPICE", () => {
    const { container } = render(<SoftwareSection />);
    const text = container.textContent ?? "";

    expect(text).toMatch(/3D simulation/);
    expect(text).toMatch(/Multiconductor Transmission Lines solver/);
    expect(text).toMatch(/SPICE/);
  });

  it("names Tulip only as opensemba/tulip", () => {
    const { container } = render(<SoftwareSection />);
    const text = container.textContent ?? "";

    expect(text).toMatch(/opensemba\/tulip/);
    expect(text.replace(/opensemba\/tulip/gi, "")).not.toMatch(/tulip/i);
  });

  it("does not mention VisIt but still names ParaView", () => {
    const { container } = render(<SoftwareSection />);
    const text = container.textContent ?? "";

    expect(text).not.toMatch(/visit/i);
    expect(text).toMatch(/ParaView/);
  });

  it("links opensemba/tulip to https://github.com/opensemba/tulip and ParaView to https://www.paraview.org/", () => {
    render(<SoftwareSection />);

    expectSoftwareLinks();
  });

  it("shows the same links after switching tabs away and back", () => {
    render(<SoftwareSection />);
    const [first, second] = screen.getAllByRole("button");

    fireEvent.click(second);
    expect(screen.queryByRole("link", { name: "ParaView" })).toBeNull();
    fireEvent.click(first);

    expectSoftwareLinks();
  });
});
