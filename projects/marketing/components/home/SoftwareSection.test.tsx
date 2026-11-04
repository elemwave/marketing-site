import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  cardText,
  itemButton,
  labelsAndTitles,
  missingPhrases,
  ownPictures,
  paperLinks,
  phrasesFound,
  reselect,
  scrollsOnActivation,
  select,
  selection,
  shownPictures,
} from "@/test/item-tabs";
import { SoftwareSection } from "./SoftwareSection";

const ITEMS = [
  "Multilayer surface impedances",
  "Cable Solver",
  "Conformal modelling",
  "Transparent and open heart",
  "HPC",
  "SPICE coupling",
  "FDTD solver",
  "DGTD solver",
  "Tessellator Mesher",
];

/** The applications that moved to The challenges. */
const APPLICATIONS = ["Radiated emissions", "Radiated immunity", "Conducted susceptibility", "Lightning", "Radar cross section"];

/** The computer-generated picture `plan.md`'s Revision 3 table gives each item. */
const PICTURES: Record<string, string> = {
  "Multilayer surface impedances": "solution-multilayer-surface-impedances.webp",
  "Cable Solver": "solution-cable-solver.webp",
  "Conformal modelling": "solution-conformal-modelling.webp",
  "Transparent and open heart": "solution-transparent-and-open-heart.webp",
  HPC: "solution-hpc.webp",
  "SPICE coupling": "solution-spice-coupling.webp",
  "FDTD solver": "solution-fdtd-solver.webp",
  "DGTD solver": "solution-dgtd-solver.webp",
  "Tessellator Mesher": "solution-tessellator.webp",
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

/** Each named link in the active card goes to its address in a new tab. */
function expectLinks(links: Record<string, string>) {
  const card = screen.getByRole("heading", { level: 3 }).parentElement as HTMLElement;
  for (const [name, href] of Object.entries(links)) {
    const link = within(card).getByRole("link", { name });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
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

describe("SoftwareSection", () => {
  it("offers nine items in order, each with the same label and title", () => {
    render(<SoftwareSection />);

    expect(labelsAndTitles()).toEqual(ITEMS.map((name) => ({ label: name, title: name })));
  });

  it("announces its tabs as one group named Capabilities", () => {
    render(<SoftwareSection />);
    const groups = screen.getAllByRole("group");

    expect(groups.map((group) => group.getAttribute("aria-label"))).toEqual(["Capabilities"]);
    expect(within(groups[0]).getAllByRole("button")).toHaveLength(ITEMS.length);
  });

  it("offers none of the applications that moved to The challenges", () => {
    render(<SoftwareSection />);

    for (const name of APPLICATIONS) {
      expect(screen.queryByRole("button", { name }), name).toBeNull();
    }
  });

  it("opens on the Multilayer surface impedances item", () => {
    render(<SoftwareSection />);

    expect(selection()).toEqual({ pressed: ["Multilayer surface impedances"], title: "Multilayer surface impedances" });
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

  it("brings the item card into view, no further than needed, when a tab is activated, keeping focus on the tab", () => {
    render(<SoftwareSection />);

    expect(scrollsOnActivation("FDTD solver")).toEqual({ calls: [{ options: { block: "nearest" }, onItemCard: true }], focusStayed: true });
  });

  it("keeps the selected item and its content when it is chosen again", () => {
    render(<SoftwareSection />);

    expect(reselect("Multilayer surface impedances")).toEqual({ pressed: ["Multilayer surface impedances"], title: "Multilayer surface impedances", contentChanged: false, announcement: "" });
  });

  it("selects Multilayer surface impedances again when the section is shown afresh", () => {
    const { unmount } = render(<SoftwareSection />);
    select("HPC");
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
      const itemNames = [...screen.getAllByRole("button"), screen.getByRole("heading", { level: 3 })].map(
        (element) => element.textContent ?? "",
      );
      for (const removed of [/^Boundaries$/i, /^Rectilinear Grid$/i, /^Far Field Detectors$/i, /^Time Snapshots$/i, /^Frequency Slices$/i]) {
        expect(itemNames.some((itemName) => removed.test(itemName)), `${removed}`).toBe(false);
      }
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

  it("describes EMC simulation built on open-source FDTD and DGTD solvers, surface impedances, multiconductor cables and conformal modelling", () => {
    const { container } = render(<SoftwareSection />);
    const description = screen.getByRole("heading", { level: 2, name: "Our Solution" }).parentElement?.querySelector("h2 ~ p");

    expect(description?.textContent).toMatch(
      /Electromagnetic-compatibility simulation built on open-source FDTD and DGTD solvers, multilayer surface impedances, multiconductor cables and conformal modelling\. Elemwave builds on/i,
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

    const shown = shownPictures(Object.keys(PICTURES));

    expect(shown).toEqual(ownPictures(PICTURES));
  });

  it("describes multilayer surface impedances and the applications they serve", () => {
    render(<SoftwareSection />);
    select("Multilayer surface impedances");
    const text = cardText();

    expect(missingPhrases(text, [
      "several layers",
      "thickness and electrical properties",
      "surface impedance rather than meshed through their thickness",
    ])).toEqual([]);
    expect(phrasesFound(text, ["shielding effectiveness", "lightning and high-intensity radiated field", "radiated immunity"])).toBeGreaterThanOrEqual(2);
  });

  it("describes conformal modelling, conformal surface impedances and where surface accuracy matters", () => {
    render(<SoftwareSection />);
    select("Conformal modelling");
    const text = cardText();

    expect(missingPhrases(text, [
      "represented conformally within the regular grid",
      "staircase error of a purely cubic mesh",
      "conformal treatment extends to surface impedances",
      "curved multilayer skins",
    ])).toEqual([]);
    expect(phrasesFound(text, ["curved aircraft and vehicle skins", "resonances"])).toBeGreaterThanOrEqual(1);
  });

  it("describes the Cable Solver and the applications it serves", () => {
    render(<SoftwareSection />);
    select("Cable Solver");
    const text = cardText();

    expect(missingPhrases(text, ["cable bundles as multiconductor transmission lines (MTL) coupled to the 3D field simulation"])).toEqual([]);
    expect(phrasesFound(text, ["crosstalk", "field-to-cable coupling", "signal integrity", "conducted susceptibility"])).toBeGreaterThanOrEqual(2);
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

    expect(missingPhrases(text, ["3D simulation", "an MTL solver", "SPICE", "opensemba/tulip", "ParaView", "complex MTL networks"])).toEqual([]);
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
      const papers = paperLinks();

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

    expect(missingPhrases(description?.textContent ?? "", [
      "committed to transparency",
      "validated through peer review by the scientific community",
    ])).toEqual([]);
  });

  it("describes the transparent and open heart: open tools, tests, auditability and AI agents", () => {
    render(<SoftwareSection />);
    select("Transparent and open heart");
    const text = cardText();

    expect(missingPhrases(text, [
      "orchestrates and fills the gaps of a collection of open-source tools",
      "proprietary battery of tests",
      "performance and robustness",
      "rather than a trademarked perfect boundary condition",
      "control and audit, every single step of the simulation process",
      "nothing is hidden: what you see is what is simulated",
      "strong foundation on peer-reviewed journals",
      "LLMs and AI agents",
      "fine-tune the algorithms to your specific needs",
      "nobody else offers",
    ])).toEqual([]);
    expectLinks({
      FreeCAD: "https://www.freecad.org/",
      Gmsh: "https://gmsh.info/",
      opensemba: "https://github.com/opensemba",
    });
  });

  it("describes HPC: define once, run on many nodes, compiled for the machine, billions of cells", () => {
    render(<SoftwareSection />);
    select("HPC");

    expect(missingPhrases(cardText(), [
      "high-performance computing",
      "define a simulation once",
      "as many nodes as you want",
      "compiled specifically for your machine",
      "get the most out of your hardware",
      "billions of cells",
    ])).toEqual([]);
  });

  it("describes SPICE coupling of circuits to the field simulation through ngspice", () => {
    render(<SoftwareSection />);
    select("SPICE coupling");

    expect(missingPhrases(cardText(), ["circuits described in SPICE", "coupled to the field simulation", "act on each other"])).toEqual([]);
    expectLinks({ ngspice: "https://github.com/opensemba/ngspice" });
  });

  it("describes the FDTD solver as opensemba/fdtd, focused on EMC, standalone or in FreeCAD", () => {
    render(<SoftwareSection />);
    select("FDTD solver");

    expect(missingPhrases(cardText(), [
      "finite-difference time-domain solver",
      "electromagnetic compatibility",
      "standalone",
      "FreeCAD workbench",
    ])).toEqual([]);
    expectLinks({
      "opensemba/fdtd": "https://github.com/opensemba/fdtd",
      FreeCAD: "https://www.freecad.org/",
    });
  });

  it("describes the DGTD solver from opensemba on unstructured meshes", () => {
    render(<SoftwareSection />);
    select("DGTD solver");

    expect(missingPhrases(cardText(), [
      "Maxwell's curl equations",
      "discontinuous Galerkin time-domain",
      "unstructured meshes",
      "curved geometry",
    ])).toEqual([]);
    expectLinks({
      opensemba: "https://github.com/opensemba",
      "opensemba/dgtd": "https://github.com/opensemba/dgtd",
    });
  });

  it("names the Tessellator Mesher explicitly as the staircasing engine of GiD", () => {
    render(<SoftwareSection />);
    select("Tessellator Mesher");

    expect(missingPhrases(cardText(), ["is the staircasing engine of GiD", "staircased and conformal meshes", "rectilinear grids"])).toEqual([]);
    expectLinks({
      "opensemba/tessellator": "https://github.com/opensemba/tessellator",
      GiD: "https://www.gidsimulation.com/",
    });
  });
});
