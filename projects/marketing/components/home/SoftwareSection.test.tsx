import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SLIDES } from "@/lib/home-content";
import { SoftwareSection } from "./SoftwareSection";

const ITEMS = [
  "Multilayer surface impedances",
  "MTL cable solver",
  "Conformal modelling",
  "Radiated emissions",
  "Radiated immunity",
  "Conducted susceptibility",
];

/** The picture `plan.md`'s Data Models section gives each item. */
const PICTURES: Record<string, string> = {
  "Multilayer surface impedances": "publication-hie-s-fdtd.webp",
  "MTL cable solver": "tab-tulip.webp",
  "Conformal modelling": "publication-siva-uav-emc.webp",
  "Radiated emissions": "publication-hv-bonding-network.webp",
  "Radiated immunity": "publication-aircraft-shielding-s-fdtd.webp",
  "Conducted susceptibility": "publication-multiwire-in-cell-parameters.webp",
};

/** The first six words of each paragraph the removed feature items held. */
const REMOVED_PARAGRAPHS = [
  "Boundary configuration is one of the",
  "Elemwave allows electric and magnetic field",
  "The workflow supports air interfaces, ground",
  "Although boundary setup is not always",
  "The rectilinear grid gives engineers finer",
  "Cell density can be increased around",
  "The goal is simple: improve precision",
  "This capability is still under development,",
  "Far field detectors give engineers a",
  "They provide full control for radar",
  "The resulting visuals are easy to",
  "Whether the goal is to understand",
  "Time snapshots turn simulation results into",
  "They are especially useful for analysing",
  "Instead of reading line after line",
  "Frequency slices help engineers see how",
  "They process simulation data and generate",
  "This capability is essential for antenna",
  "For sectors such as telecommunications and",
];

function labelOf(tab: HTMLElement) {
  return within(tab).getByText(/\w/, { selector: "span:last-of-type, span" });
}

function itemButton(name: string) {
  return screen.getByRole("button", { name });
}

function select(name: string) {
  fireEvent.click(itemButton(name));
}

/** The active card's text: its heading and paragraphs, nothing else. */
function cardText() {
  const heading = screen.getByRole("heading", { level: 3 });
  return heading.parentElement?.textContent ?? "";
}

function picture() {
  return screen.getByRole("img", { name: /screenshot$/ });
}

function expectAnyOf(text: string, phrases: string[], atLeast: number) {
  const found = phrases.filter((phrase) => text.toLowerCase().includes(phrase.toLowerCase()));
  expect(found.length, `expected at least ${atLeast} of ${phrases.join(", ")}`).toBeGreaterThanOrEqual(atLeast);
}

function expectAll(text: string, phrases: string[]) {
  for (const phrase of phrases) {
    expect(text.toLowerCase()).toContain(phrase.toLowerCase());
  }
}

/** The MTL cable solver item links opensemba/tulip and ParaView to their own sites. */
function expectSoftwareLinks() {
  for (const link of screen.getAllByRole("link", { name: "opensemba/tulip" })) {
    expect(link).toHaveAttribute("href", "https://github.com/opensemba/tulip");
  }
  expect(screen.getByRole("link", { name: "ParaView" })).toHaveAttribute(
    "href",
    "https://www.paraview.org/",
  );
}

const CAPABILITIES = ["MTL cable solver", "multilayer surface impedances", "conformal modelling"];

describe("SoftwareSection", () => {
  it("offers six items in order, each with the same label and title", () => {
    render(<SoftwareSection />);
    const buttons = screen.getAllByRole("button");

    expect(buttons.map((button) => button.textContent)).toEqual(ITEMS);
    buttons.forEach((button, i) => {
      fireEvent.click(button);
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(ITEMS[i]);
    });
  });

  it("opens on the Multilayer surface impedances item", () => {
    render(<SoftwareSection />);
    const [first, ...others] = screen.getAllByRole("button");

    expect(first).toHaveAttribute("aria-pressed", "true");
    for (const other of others) {
      expect(other).toHaveAttribute("aria-pressed", "false");
    }
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Multilayer surface impedances");
  });

  it("moves the emphasis when another tab is chosen", () => {
    render(<SoftwareSection />);
    const [first, second] = screen.getAllByRole("button");

    fireEvent.click(second);

    expect(labelOf(second).className).toContain("font-semibold");
    expect(labelOf(first).className).toContain("font-normal");
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

  it("announces the newly shown item when a different tab is chosen", () => {
    render(<SoftwareSection />);
    const [, second] = screen.getAllByRole("button");

    fireEvent.click(second);

    expect(screen.getByRole("status")).toHaveTextContent("MTL cable solver");
  });

  it("keeps the selected item and its content when it is chosen again", () => {
    render(<SoftwareSection />);
    const [first] = screen.getAllByRole("button");
    const before = cardText();

    fireEvent.click(first);

    expect(first).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Multilayer surface impedances");
    expect(cardText()).toBe(before);
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("selects Multilayer surface impedances again when the section is shown afresh", () => {
    const { unmount } = render(<SoftwareSection />);
    select("Radiated immunity");
    unmount();

    render(<SoftwareSection />);

    expect(itemButton("Multilayer surface impedances")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Multilayer surface impedances");
  });

  it("offers none of the removed feature items or their paragraphs", () => {
    const { container } = render(<SoftwareSection />);

    for (const name of ITEMS) {
      select(name);
      const text = container.textContent ?? "";
      expect(text).not.toMatch(/Boundaries|Rectilinear Grid|Far Field Detectors|Time Snapshots|Frequency Slices/i);
      for (const paragraph of REMOVED_PARAGRAPHS) {
        expect(text).not.toContain(paragraph);
      }
    }
  });

  it("offers no separate Cable solver or MTL cables item", () => {
    render(<SoftwareSection />);

    expect(screen.queryByRole("button", { name: /^Cable solver$/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^MTL cables$/ })).toBeNull();
  });

  it("links every appearance of opensemba/fdtd to https://github.com/opensemba/fdtd, whichever item is selected", () => {
    const { container } = render(<SoftwareSection />);
    const description = () => screen.getByRole("heading", { level: 2, name: "Our Solution" }).parentElement?.querySelector("h2 ~ p");

    for (const name of ITEMS) {
      select(name);
      const mentions = (container.textContent ?? "").split("opensemba/fdtd").length - 1;
      const links = screen.getAllByRole("link", { name: "opensemba/fdtd" });
      expect(links.length).toBeGreaterThanOrEqual(1);
      expect(links).toHaveLength(mentions);
      for (const link of links) {
        expect(link).toHaveAttribute("href", "https://github.com/opensemba/fdtd");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noreferrer");
      }
      expect(within(description() as HTMLElement).getByRole("link", { name: "opensemba/fdtd" })).toBeInTheDocument();
    }
  });

  it("describes EMC simulation built on surface impedances, multiconductor cables and conformal modelling", () => {
    const { container } = render(<SoftwareSection />);
    const description = screen.getByRole("heading", { level: 2, name: "Our Solution" }).parentElement?.querySelector("h2 ~ p");

    expect(description?.textContent).toMatch(
      /Electromagnetic-compatibility simulation built on multilayer surface impedances, multiconductor cables and conformal modelling/i,
    );
    expect(container.textContent).not.toContain("High-precision tools for modelling transmission lines");
  });

  it("shows the Our Solution heading and not the old one", () => {
    render(<SoftwareSection />);

    expect(screen.getByRole("heading", { name: "Our Solution" })).toBeInTheDocument();
    expect(screen.queryByText("What Our Software Can Do")).toBeNull();
  });

  it("shows a published picture of Elemwave's own, named after each item", () => {
    render(<SoftwareSection />);
    const published = new Set(["/images/tab-tulip.webp", ...SLIDES.map((slide) => slide.imageUrl)]);

    for (const name of ITEMS) {
      select(name);
      const img = screen.getByRole("img", { name: `${name} screenshot` });
      const url = img.style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1] ?? "";
      expect(url.endsWith(`/${PICTURES[name]}`), `${name} shows ${url}`).toBe(true);
      expect(published.has(url), `${url} is published on the site`).toBe(true);
    }
  });

  it("describes multilayer surface impedances and the applications they serve", () => {
    render(<SoftwareSection />);
    select("Multilayer surface impedances");
    const text = cardText();

    expectAll(text, [
      "several layers",
      "thickness and electrical properties",
      "surface impedance rather than meshed through their thickness",
    ]);
    expectAnyOf(text, ["shielding effectiveness", "lightning and high-intensity radiated field", "radiated immunity"], 2);
  });

  it("describes conformal modelling, conformal surface impedances and where surface accuracy matters", () => {
    render(<SoftwareSection />);
    select("Conformal modelling");
    const text = cardText();

    expectAll(text, [
      "represented conformally within the regular grid",
      "staircase error of a purely cubic mesh",
      "conformal treatment extends to surface impedances",
      "curved multilayer skins",
    ]);
    expectAnyOf(text, ["curved aircraft and vehicle skins", "resonances"], 1);
  });

  it("describes radiated emissions and the capability that serves them", () => {
    render(<SoftwareSection />);
    select("Radiated emissions");
    const text = cardText();

    expectAll(text, ["fields that cables, equipment and structures radiate", "whole platform"]);
    expectAnyOf(text, CAPABILITIES, 1);
  });

  it("describes radiated immunity, its threats and the capability that serves it", () => {
    render(<SoftwareSection />);
    select("Radiated immunity");
    const text = cardText();

    expectAll(text, [
      "external threat fields",
      "the platform, its equipment and its cables",
      "Lightning",
      "high-intensity radiated fields",
      "electromagnetic pulse",
    ]);
    expectAnyOf(text, CAPABILITIES, 1);
  });

  it("describes conducted susceptibility, bulk current injection and the MTL cable solver", () => {
    render(<SoftwareSection />);
    select("Conducted susceptibility");

    expectAll(cardText(), ["disturbances injected onto cable bundles", "bulk current injection", "MTL cable solver"]);
  });

  it("describes the MTL cable solver and the applications it serves", () => {
    render(<SoftwareSection />);
    select("MTL cable solver");
    const text = cardText();

    expectAll(text, ["Cable bundles are modelled as multiconductor transmission lines coupled to the 3D field simulation"]);
    expectAnyOf(text, ["crosstalk", "field-to-cable coupling", "signal integrity", "conducted susceptibility"], 2);
  });

  it("keeps the cable solver's picture and statements in the MTL cable solver item", () => {
    render(<SoftwareSection />);
    select("MTL cable solver");

    expect(picture().style.backgroundImage).toContain("tab-tulip.webp");
    expectAll(cardText(), [
      "3D simulation",
      "Multiconductor Transmission Lines solver",
      "SPICE",
      "opensemba/tulip",
      "ParaView",
    ]);
  });

  it("names Tulip only as opensemba/tulip", () => {
    render(<SoftwareSection />);

    for (const name of ITEMS) {
      select(name);
      expect(cardText().replace(/opensemba\/tulip/gi, "")).not.toMatch(/tulip/i);
    }
    select("MTL cable solver");
    expect(cardText()).toMatch(/opensemba\/tulip/);
  });

  it("does not mention VisIt but still names ParaView", () => {
    const { container } = render(<SoftwareSection />);
    select("MTL cable solver");
    const text = container.textContent ?? "";

    expect(text).not.toMatch(/visit/i);
    expect(text).toMatch(/ParaView/);
  });

  it("links opensemba/tulip to https://github.com/opensemba/tulip and ParaView to https://www.paraview.org/", () => {
    render(<SoftwareSection />);
    select("MTL cable solver");

    expectSoftwareLinks();
  });

  it("shows the same links after switching tabs away and back", () => {
    render(<SoftwareSection />);

    select("MTL cable solver");
    select("Conformal modelling");
    expect(screen.queryByRole("link", { name: "ParaView" })).toBeNull();
    select("MTL cable solver");

    expectSoftwareLinks();
  });
});
