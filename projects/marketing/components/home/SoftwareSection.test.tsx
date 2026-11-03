import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SLIDES } from "@/lib/home-content";
import { SoftwareSection } from "./SoftwareSection";

const ITEMS = [
  "Multilayer surface impedances",
  "Cable Solver",
  "Conformal modelling",
  "Radiated emissions",
  "Radiated immunity",
  "Conducted susceptibility",
];

/** The computer-generated picture `plan.md`'s Revision 2 table gives each item. */
const PICTURES: Record<string, string> = {
  "Multilayer surface impedances": "solution-multilayer-surface-impedances.webp",
  "Cable Solver": "solution-cable-solver.webp",
  "Conformal modelling": "solution-conformal-modelling.webp",
  "Radiated emissions": "solution-radiated-emissions.webp",
  "Radiated immunity": "solution-radiated-immunity.webp",
  "Conducted susceptibility": "solution-conducted-susceptibility.webp",
};

/** The team's peer-reviewed papers `plan.md`'s Revision 2 gives each capability, as DOI addresses. */
const PAPERS: Record<string, string[]> = {
  "Multilayer surface impedances": [
    "https://doi.org/10.1109/TMTT.2016.2637348",
    "https://doi.org/10.1109/TAP.2024.3484673",
  ],
  "Cable Solver": [
    "https://doi.org/10.1109/TEMC.2026.3713195",
    "https://doi.org/10.1109/EMCEurope61644.2025.11176342",
  ],
  "Conformal modelling": [
    "https://doi.org/10.1109/LMWC.2016.2588579",
    "https://doi.org/10.1109/TAP.2019.2930107",
  ],
};

const PUBLIC_IMAGES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../public/images");

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

/** The Cable Solver item links opensemba/tulip and ParaView to their own sites. */
function expectSoftwareLinks() {
  for (const link of screen.getAllByRole("link", { name: "opensemba/tulip" })) {
    expect(link).toHaveAttribute("href", "https://github.com/opensemba/tulip");
  }
  expect(screen.getByRole("link", { name: "ParaView" })).toHaveAttribute(
    "href",
    "https://www.paraview.org/",
  );
}

const CAPABILITIES = ["Cable Solver", "multilayer surface impedances", "conformal modelling"];

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

  it("places the capabilities in the first row of tabs and the applications in the second", () => {
    render(<SoftwareSection />);
    const rows = screen.getAllByRole("group");

    expect(rows.map((row) => row.getAttribute("aria-label"))).toEqual(["Capabilities", "Applications"]);
    expect(within(rows[0]).getAllByRole("button").map((button) => button.textContent)).toEqual(ITEMS.slice(0, 3));
    expect(within(rows[1]).getAllByRole("button").map((button) => button.textContent)).toEqual(ITEMS.slice(3));
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

    expect(screen.getByRole("status")).toHaveTextContent("Cable Solver");
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

  it("offers no separate MTL cables or MTL cable solver item", () => {
    render(<SoftwareSection />);

    expect(screen.queryByRole("button", { name: /^MTL cables$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /^MTL cable solver$/i })).toBeNull();
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

  it("shows each item's own computer-generated picture, named after it", () => {
    render(<SoftwareSection />);
    const paperFigures = new Set(SLIDES.map((slide) => slide.imageUrl));
    const shown = new Set<string>();

    for (const name of ITEMS) {
      select(name);
      const url = picture().style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1] ?? "";
      expect(screen.getByRole("img", { name: `${name} screenshot` })).toBe(picture());
      expect(url, `${name} shows ${url}`).toBe(`/images/${PICTURES[name]}`);
      expect(existsSync(path.join(PUBLIC_IMAGES, PICTURES[name])), `${url} exists`).toBe(true);
      expect(paperFigures.has(url), `${url} is a paper figure`).toBe(false);
      expect(url).not.toMatch(/publication-|tab-tulip/);
      shown.add(url);
    }
    expect(shown.size).toBe(ITEMS.length);
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

  it("describes conducted susceptibility, bulk current injection and the Cable Solver", () => {
    render(<SoftwareSection />);
    select("Conducted susceptibility");

    expectAll(cardText(), ["disturbances injected onto cable bundles", "bulk current injection", "Cable Solver"]);
  });

  it("describes the Cable Solver and the applications it serves", () => {
    render(<SoftwareSection />);
    select("Cable Solver");
    const text = cardText();

    expectAll(text, ["cable bundles as multiconductor transmission lines (MTL) coupled to the 3D field simulation"]);
    expectAnyOf(text, ["crosstalk", "field-to-cable coupling", "signal integrity", "conducted susceptibility"], 2);
  });

  it("opens the Cable Solver by naming opensemba/fdtd and the MTL acronym", () => {
    render(<SoftwareSection />);
    select("Cable Solver");
    const heading = screen.getByRole("heading", { level: 3 });
    const firstParagraph = heading.parentElement?.querySelector("p")?.textContent ?? "";

    expect(firstParagraph).toMatch(/^Built on opensemba\/fdtd/);
    expect(firstParagraph).toContain("multiconductor transmission lines (MTL)");
  });

  it("keeps the cable solver's statements in the Cable Solver item, speaking of MTL networks", () => {
    render(<SoftwareSection />);
    select("Cable Solver");
    const text = cardText();

    expectAll(text, ["3D simulation", "an MTL solver", "SPICE", "opensemba/tulip", "ParaView", "complex MTL networks"]);
    expect(text).not.toMatch(/complex (transmission line|MTL) structures/i);
  });

  it("names Tulip only as opensemba/tulip", () => {
    render(<SoftwareSection />);

    for (const name of ITEMS) {
      select(name);
      expect(cardText().replace(/opensemba\/tulip/gi, "")).not.toMatch(/tulip/i);
    }
    select("Cable Solver");
    expect(cardText()).toMatch(/opensemba\/tulip/);
  });

  it("does not mention VisIt but still names ParaView", () => {
    const { container } = render(<SoftwareSection />);
    select("Cable Solver");
    const text = container.textContent ?? "";

    expect(text).not.toMatch(/visit/i);
    expect(text).toMatch(/ParaView/);
  });

  it("links opensemba/tulip to https://github.com/opensemba/tulip and ParaView to https://www.paraview.org/", () => {
    render(<SoftwareSection />);
    select("Cable Solver");

    expectSoftwareLinks();
  });

  it("shows the same links after switching tabs away and back", () => {
    render(<SoftwareSection />);

    select("Cable Solver");
    select("Conformal modelling");
    expect(screen.queryByRole("link", { name: "ParaView" })).toBeNull();
    select("Cable Solver");

    expectSoftwareLinks();
  });

  it("links the team's peer-reviewed papers from each capability", () => {
    render(<SoftwareSection />);

    for (const name of ITEMS) {
      select(name);
      const card = screen.getByRole("heading", { level: 3 }).parentElement as HTMLElement;
      const papers = within(card)
        .queryAllByRole("link")
        .filter((link) => link.getAttribute("href")?.startsWith("https://doi.org/"));

      expect(papers.map((link) => link.getAttribute("href")), name).toEqual(PAPERS[name] ?? []);
      if (papers.length > 0) {
        expect(papers[0].closest("p")?.textContent, name).toMatch(/^Peer-reviewed by the scientific community: /);
      }
      for (const link of papers) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noreferrer");
        expect(link.textContent?.length ?? 0).toBeGreaterThan(20);
      }
    }
  });

  it("states Elemwave's commitment to transparency and peer-reviewed validation", () => {
    render(<SoftwareSection />);
    const description = screen.getByRole("heading", { level: 2, name: "Our Solution" }).parentElement?.querySelector("h2 ~ p");

    expectAll(description?.textContent ?? "", [
      "committed to transparency",
      "validated through peer review by the scientific community",
    ]);
  });
});
