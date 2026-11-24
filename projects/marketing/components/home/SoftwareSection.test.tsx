import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  NOTHING_SHOWN,
  cardText,
  chooseInTurn,
  firstChoice,
  labelsAndTitles,
  missingPhrases,
  openedFresh,
  ownPictureOf,
  ownPictures,
  paperLinks,
  phrasesFound,
  picture,
  pictureLayer,
  reselect,
  scrollsOnActivation,
  select,
  serverMarkupFacts,
  shownAfreshAfterChoosing,
  shownPictures,
} from "@/test/item-tabs";
import { SoftwareSection } from "./SoftwareSection";

const ITEMS = [
  "The Workbench",
  "FDTD solver",
  "DGTD solver",
  "Cable Solver",
  "Multilayer surface impedances",
  "Conformal modelling",
  "Open and auditable",
  "HPC",
  "SPICE coupling",
  "Material characterisation service",
  "Simulation service",
];

/** The applications that moved to The challenges. */
const APPLICATIONS = ["Radiated emissions", "Radiated immunity", "Conducted susceptibility", "Lightning", "Radar cross section"];

/**
 * The picture each item shows: a computer-generated one, Elemwave's own for
 * the Cable Solver and the FDTD solver, or for The Workbench the still of
 * its own video.
 */
const PICTURES: Record<string, string> = {
  "The Workbench": "solution-ew-workbench.jpg",
  "FDTD solver": "solution-fdtd-solver.png",
  "DGTD solver": "solution-dgtd-solver.webp",
  "Cable Solver": "solution-cable-solver.png",
  "Multilayer surface impedances": "solution-multilayer-surface-impedances.webp",
  "Conformal modelling": "solution-conformal-modelling.webp",
  "Open and auditable": "solution-transparent-and-open-heart.webp",
  HPC: "solution-hpc.webp",
  "SPICE coupling": "solution-spice-coupling.webp",
  "Material characterisation service": "solution-material-characterisation.webp",
  "Simulation service": "solution-simulation-service.webp",
};

/** The Workbench's text, word for word, one entry per paragraph. */
const WORKBENCH_PARAGRAPHS = ["Geometry, materials, sources, ports and meshing in one place, inside FreeCAD. The Workbench is where an electromagnetic problem gets described — including cable bundles and the complex geometry around them — before any solver runs.", "Everything the solvers need comes from here, in a format they read directly."];

/** The Workbench picture area's name after `Play` or `Pause`: the item, that it is a video, and what it shows. */
const WORKBENCH_VIDEO_NAME =
  "The Workbench video: Elemwave's own video of the workbench in use, defining an electromagnetic problem";

/** Each revised item's own text, word for word, one entry per paragraph, as the card's solutions document supplies it. */
const SUPPLIED_PARAGRAPHS: Record<string, string[]> = {
  "FDTD solver": [
    "A time-domain solver written for EMC problems.",
    "Cable bundles branch and join, conductors carry their own resistance and inductance, and ngspice circuits close the network at every termination. Layered skins and thin slots are treated where they are, without meshing through them.",
    "No limit on cells, no limit on nodes: the same case runs on your machine or across a cluster. And it is the engine inside the Workbench, whether you drive it from there or run it standalone.",
    "The solver itself is opensemba/fdtd, open source and maintained in the open."
  ],
  "DGTD solver": [
    "Some geometry cannot be meshed into cubes without lying about it — curved radomes, swept wings, tapering transitions. opensemba/dgtd solves the same equations on unstructured tetrahedral meshes, curved elements included, so the shape stays what it is.",
    "It handles what the geometry brings with it: dispersive media — Debye, Lorentz and Drude, down to collision profiles that model the atmosphere itself — and thin multilayer sheets through the same subcell treatment the FDTD solver uses.",
    "Time-domain like its sibling, so one run still covers the whole band. It scales through MPI and OpenMP, runs on CUDA when there is a GPU, and post-processes radar cross section offline over any sweep of frequencies and angles."
  ],
  "Cable Solver": [
    "A harness is not a lumped element. Its conductors are close enough to couple to each other, and long enough to carry fields in ways a circuit model cannot follow — which is why the Cable Solver treats each bundle as a multiconductor transmission line, coupled to the 3D field around it.",
    "Every conductor sees the field and feeds its own currents back into it. That bidirectional coupling is what makes crosstalk between conductors, field-to-cable coupling under a radiated threat and signal integrity along a harness all the same problem, solved at once.",
    "The transmission-line engine is opensemba/tulip, which computes the per-unit-length capacitance and inductance matrices for networks of arbitrary complexity. Circuits described in SPICE close the network at every termination."
  ],
  "Multilayer surface impedances": [
    "A carbon-fibre skin, a metallised coating, paint over metal: surfaces a few microns thick, in a model metres across. Meshing them would mean a grid far finer than the physics needs, so they are carried as a surface impedance instead — the layers decide how much field passes, and the grid stays where it was.",
    "That is what makes shielding effectiveness of composite panels, lightning current through a coated skin or HIRF coupling through a fuselage answerable without remeshing the whole platform.",
    "The method has been through peer review more than once, and it has been extended since: subgridding boundary conditions for lossy thin layers, and a formulation that carries geometrical and material uncertainties through the same thin panels, so the answer comes with its spread rather than as a single number."
  ],
  "Open and auditable": [
    "Elemwave is built on open-source tools — FreeCAD, Gmsh, opensemba — and the parts that make them work together. What it adds on top is not a wrapper: it is a battery of tests the whole stack has to pass before it ships, and a set of methods that are published rather than proprietary.",
    "Nothing is hidden. What you see is what is simulated, down to the equations.",
    "And because the code is yours to read, you can put it under your own tests and extend it to your own problem.",
    "What you get is not a black box but a toolbox, for you and for the AI agents working with you. You and your agents can read every tool, see how it reaches its answer and adjust it until the simulation fits your own problem."
  ],
  "HPC": [
    "The same case, on one core or across a cluster. Nothing in the model changes when you add nodes or threads, and there is no cap on either: the decomposition follows the problem, not a licence.",
    "Each build is compiled for the machine it will run on — flags tuned to that host's architecture, so the run goes as fast as the hardware allows. That only works because the source is open: with a binary you run what the vendor shipped, optimised for the average machine rather than yours.",
    "The solvers carry their own parallel back ends — MPI across nodes, OpenMP within each one, GPU offload where there is one. Problems this size stop being exceptions: we routinely run simulations with billions of cells, a full platform with every harness in it among them."
  ],
  "SPICE coupling": [
    "A termination is rarely a resistor. Filters, protection devices and nonlinear loads all behave differently depending on what reaches them, and a fixed impedance cannot follow that.",
    "So the circuits are described in SPICE — whatever the model, however nonlinear — and solved by ngspice, step by step with the 3D field and the Cable Solver's transmission lines. Field and circuit act on each other at every time step, not one after the other."
  ],
  "Material characterisation service": [
    "A model of a composite fuselage or a shielded harness needs numbers that most datasheets do not give: how well a carbon-fibre laminate conducts, how much a panel shields, how much a cable's shield lets through.",
    "Elemwave measures them for you, as a service. We characterise the electromagnetic properties of carbon-fibre materials, measure the shielding effectiveness of materials and panels, and measure the transfer impedance of cable shields, on samples of your own.",
    "Measured values are what a simulation's materials and cables are described with, so your model can start from your own data rather than from assumed values."
  ]
};

/**
 * What a service item, Material characterisation service or Simulation service,
 * may not claim: an accreditation, a standard, a frequency range, an accuracy,
 * a price, a turnaround, a delivery format, an instrument maker, exclusivity,
 * peer review or a guarantee (EWM-185 FR-06, FR-07; EWM-184 FR-05).
 */
const UNSUPPORTED_CLAIMS = [
  /accredit/i,
  /certif/i,
  /\bISO\b/,
  /standard/i,
  /\b[kMG]?Hz\b/,
  /frequency range/i,
  /accuracy/i,
  /price/i,
  /turnaround/i,
  /nobody else/i,
  /no one else/i,
  /only Elemwave/i,
  /unique/i,
  /Keysight|Rohde|Agilent|Anritsu|Keithley/,
  /peer[- ]?review/i,
  /guarantee/i,
  /\breport\b/i,
  /\bPDF\b/,
  /\b\d+\s*(hours?|days?|weeks?)\b/i,
];

/** The item EWM-184 adds, a service Elemwave performs. */
const SIMULATION = "Simulation service";

/** American spellings the site's British copy does not use. */
const AMERICAN_SPELLINGS = /color|organiz|optimiz|analyz|characteriz|center\b|modeling|behavior|license/i;

/** The closing paragraph that links a capability's two papers. */
const PAPERS_PARAGRAPH = /^Peer-reviewed by the scientific community: /;

/** The names and addresses the removed Tessellator Mesher item carried, which no item may show or link. */
const TESSELLATOR_NAMES = [
  { name: "Tessellator Mesher", pattern: /Tessellator Mesher/i },
  { name: "opensemba/tessellator", pattern: /opensemba\/tessellator/i },
  { name: "GiD", pattern: /\bGiD\b|gidsimulation\.com/ },
];

/** The accessible name of Elemwave's own FDTD solver picture, which says what it shows. */
const FDTD_SOLVER_PICTURE_NAME =
  "FDTD solver screenshot: grid definition around an aircraft model in Elemwave's FreeCAD workbench";

/** The file the shown picture's background names. */
const shownFile = () => picture().style.backgroundImage.match(/\/images\/([^'")]+)/)?.[1] ?? "";

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

/** The "Our Solution" introduction as the card's home-page document supplies it. */
const SOLUTION_INTRODUCTION =
  "Elemwave gives you that answer before the first prototype: coupled 3D fields, cable harnesses and circuits, treated as the single system they are. Every method is published, peer-reviewed and implemented in open source — so how a number was obtained is something you can show, not something you have to trust.";

/** Phrases of the introductions it replaces. */
const PREVIOUS_INTRODUCTION = [
  "solutions predict what your platform emits and receives",
  "nothing rests on a black box",
  "Electromagnetic-compatibility simulation built on open-source FDTD and DGTD solvers",
  "validated through peer review by the scientific community",
];

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

/** The Cable Solver item links opensemba/tulip to its own site, and nothing links ParaView. */
function expectSoftwareLinks() {
  for (const link of screen.getAllByRole("link", { name: "opensemba/tulip" })) {
    expect(link).toHaveAttribute("href", "https://github.com/opensemba/tulip");
  }
  expect(screen.queryByRole("link", { name: "ParaView" })).toBeNull();
  expect(document.querySelector('a[href*="paraview.org"]')).toBeNull();
}

/**
 * Chooses the named item, then chooses it again twice: once to read what the
 * card shows and announces, and once to read how the page is asked to scroll.
 */
function chosenAgain(name: string) {
  select(name);
  const reselected = reselect(name);
  return { reselected, scrolls: scrollsOnActivation(name) };
}

/**
 * Renders the section, requires it to offer Simulation service, shows that
 * item and returns its paragraphs and their text, the title left out.
 */
function simulationItem() {
  render(<SoftwareSection />);
  expect(labelsAndTitles().map(({ label }) => label)).toContain(SIMULATION);
  select(SIMULATION);
  const paragraphs = itemParagraphs();
  return { paragraphs, text: paragraphs.join(" ") };
}

/** The shown item's card. */
function itemCard() {
  return screen.getByRole("heading", { level: 3 }).parentElement as HTMLElement;
}

/** The paragraphs of the shown item's card, in order. */
function itemParagraphs() {
  return [...itemCard().querySelectorAll("p")].map((paragraph) => paragraph.textContent ?? "");
}

/** The names of the links in the shown item's text, papers excluded. */
function softwareLinkNames() {
  return within(itemCard())
    .queryAllByRole("link")
    .filter((link) => !link.getAttribute("href")?.startsWith("https://doi.org/"))
    .map((link) => link.textContent);
}

describe("SoftwareSection", () => {
  it("offers every item in order, each with the same label and title", () => {
    render(<SoftwareSection />);

    const shown = labelsAndTitles();
    expect(shown).toEqual(ITEMS.map((name) => ({ label: name, title: name })));
    for (const former of ["EW Workbench", "Transparent and open heart"]) {
      expect(shown.flatMap(({ label, title }) => [label, title])).not.toContain(former);
      expect(screen.queryByRole("button", { name: former })).toBeNull();
    }
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

  it("opens with no capability chosen, no item shown and nothing scrolled", () => {
    expect(openedFresh(() => render(<SoftwareSection />))).toEqual(NOTHING_SHOWN);
  });

  it("renders no item in its server markup", () => {
    expect(serverMarkupFacts(<SoftwareSection />, ITEMS)).toEqual({ missingLabels: [], itemMarkup: [] });
  });

  it("shows the first capability chosen and announces it", () => {
    render(<SoftwareSection />);

    expect(firstChoice("Multilayer surface impedances")).toEqual({ pressed: ["Multilayer surface impedances"], title: "Multilayer surface impedances", announcement: "Multilayer surface impedances" });
  });

  it("shows only the last of several capabilities chosen in quick succession, starting from none", () => {
    render(<SoftwareSection />);

    expect(chooseInTurn(["HPC", "Cable Solver", "DGTD solver"])).toEqual({ before: [], pressed: ["DGTD solver"], title: "DGTD solver" });
  });

  it("moves the emphasis when another tab is chosen", () => {
    render(<SoftwareSection />);
    const [first, second] = screen.getAllByRole("button");

    fireEvent.click(first);
    fireEvent.click(second);

    expect(labelOf(second).className).toContain("font-semibold");
    expect(labelOf(first).className).toContain("font-normal");
  });

  it("moves the pressed state when another tab is chosen", () => {
    render(<SoftwareSection />);
    const [first, second] = screen.getAllByRole("button");

    fireEvent.click(first);
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
    const [first, second] = screen.getAllByRole("button");

    fireEvent.click(first);
    fireEvent.click(second);

    expect(screen.getByRole("status")).toHaveTextContent(ITEMS[1]);
  });

  it("brings the item card into view, no further than needed, when a tab is activated, keeping focus on the tab", () => {
    render(<SoftwareSection />);

    expect(scrollsOnActivation("FDTD solver")).toEqual({ calls: [{ options: { block: "nearest" }, onItemCard: true }], focusStayed: true });
  });

  it("keeps the selected item and its content when it is chosen again", () => {
    render(<SoftwareSection />);

    for (const name of ["Multilayer surface impedances", "Open and auditable", "Material characterisation service", "Simulation service"]) {
      expect(chosenAgain(name), name).toEqual({
        reselected: { pressed: [name], title: name, contentChanged: false, announcement: name },
        scrolls: { calls: [{ options: { block: "nearest" }, onItemCard: true }], focusStayed: true },
      });
    }
  });

  it("shows no capability again when the section is shown afresh", () => {
    expect(shownAfreshAfterChoosing(() => render(<SoftwareSection />), "HPC")).toEqual({ pressed: [], itemTitles: 0 });
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

    for (const name of ITEMS) {
      select(name);
      const mentions = (container.textContent ?? "").split("opensemba/fdtd").length - 1;
      const links = screen.queryAllByRole("link", { name: "opensemba/fdtd" });
      expect(links).toHaveLength(mentions);
      for (const link of links) {
        expect(link).toHaveAttribute("href", "https://github.com/opensemba/fdtd");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noreferrer");
      }
    }
  });

  it("shows the corrected supplied text as the Our Solution introduction and nothing of the previous one", () => {
    const { container } = render(<SoftwareSection />);
    const description = screen.getByRole("heading", { level: 2, name: "Our Solution" }).parentElement?.querySelector("h2 + div + p");

    expect(description?.textContent).toBe(SOLUTION_INTRODUCTION);
    for (const previous of PREVIOUS_INTRODUCTION) {
      expect(description?.textContent).not.toContain(previous);
    }
    expect(description?.querySelectorAll("a")).toHaveLength(0);
    expect(container.textContent).not.toContain("High-precision tools for modelling transmission lines");
  });

  it("shows the Our Solution heading and not the old one", () => {
    render(<SoftwareSection />);

    expect(screen.getByRole("heading", { name: "Our Solution" })).toBeInTheDocument();
    expect(screen.queryByText("What Our Software Can Do")).toBeNull();
  });

  it("shows each item's own picture, named after it", () => {
    render(<SoftwareSection />);

    const shown = shownPictures(Object.keys(PICTURES));

    expect(shown).toEqual(ownPictures(PICTURES));
  });

  it("shows Elemwave's own picture for the Cable Solver, named for what it shows", () => {
    render(<SoftwareSection />);

    expect(ownPictureOf("Cable Solver")).toEqual({
      name: "Cable Solver screenshot: electric field around a five-wire cable cross-section",
      url: "/images/solution-cable-solver.png",
      tabUrl: "/images/solution-cable-solver.png",
      inInteractiveControl: false,
      urlAfterVisitingAnotherItem: "/images/solution-cable-solver.png",
    });
  });

  it("shows Elemwave's own picture for the FDTD solver, named for what it shows", () => {
    render(<SoftwareSection />);

    expect(ownPictureOf("FDTD solver")).toEqual({
      name: FDTD_SOLVER_PICTURE_NAME,
      url: "/images/solution-fdtd-solver.png",
      tabUrl: "/images/solution-fdtd-solver.png",
      inInteractiveControl: false,
      urlAfterVisitingAnotherItem: "/images/solution-fdtd-solver.png",
    });
  });

  it("shows the FDTD solver's own picture, and no other item's, after moving quickly between it and other items", () => {
    render(<SoftwareSection />);

    const shownInTurn = ["FDTD solver", "Cable Solver", "FDTD solver", "HPC", "Cable Solver", "FDTD solver"].map((name) => {
      select(name);
      return { name, file: shownFile(), label: picture().getAttribute("aria-label") };
    });

    expect(shownInTurn.map(({ name, file }) => ({ name, file }))).toEqual(
      shownInTurn.map(({ name }) => ({ name, file: PICTURES[name] })),
    );
    expect(shownInTurn.filter(({ name }) => name === "FDTD solver").map(({ label }) => label)).toEqual([
      FDTD_SOLVER_PICTURE_NAME,
      FDTD_SOLVER_PICTURE_NAME,
      FDTD_SOLVER_PICTURE_NAME,
    ]);
  });

  it("shows the supplied multilayer surface impedances text", () => {
    render(<SoftwareSection />);
    select("Multilayer surface impedances");
    const paragraphs = itemParagraphs();

    expect(paragraphs.slice(0, -1)).toEqual(SUPPLIED_PARAGRAPHS["Multilayer surface impedances"]);
    expect(paragraphs.at(-1)).toMatch(PAPERS_PARAGRAPH);
    expect(softwareLinkNames()).toEqual([]);
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

  it("shows the supplied Cable Solver text, then its papers", () => {
    render(<SoftwareSection />);
    select("Cable Solver");
    const paragraphs = itemParagraphs();

    expect(paragraphs.slice(0, -1)).toEqual(SUPPLIED_PARAGRAPHS["Cable Solver"]);
    expect(paragraphs.at(-1)).toMatch(PAPERS_PARAGRAPH);
  });

  it("opens the Cable Solver with why it exists", () => {
    render(<SoftwareSection />);
    select("Cable Solver");

    expect(itemParagraphs()[0]).toMatch(/^A harness is not a lumped element\./);
  });

  it("keeps the cable solver's statements in the Cable Solver item, speaking of transmission-line networks", () => {
    render(<SoftwareSection />);
    select("Cable Solver");
    const text = cardText();

    expect(missingPhrases(text, ["multiconductor transmission line", "opensemba/tulip", "SPICE", "networks of arbitrary complexity"])).toEqual([]);
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

  it("names neither VisIt nor ParaView in any item", () => {
    const { container } = render(<SoftwareSection />);

    for (const name of ITEMS) {
      select(name);
      const text = container.textContent ?? "";
      expect(text, name).not.toMatch(/visit/i);
      expect(text, name).not.toMatch(/paraview/i);
    }
  });

  it("links opensemba/tulip to https://github.com/opensemba/tulip and links no ParaView", () => {
    render(<SoftwareSection />);
    select("Cable Solver");

    expectSoftwareLinks();
    expect(softwareLinkNames()).toEqual(["opensemba/tulip"]);
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

  it("shows the supplied Open and auditable text", () => {
    render(<SoftwareSection />);
    select("Open and auditable");
    const text = cardText();

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS["Open and auditable"]);
    expect(softwareLinkNames()).toEqual(["FreeCAD", "Gmsh", "opensemba"]);
    expectLinks({
      FreeCAD: "https://www.freecad.org/",
      Gmsh: "https://gmsh.info/",
      opensemba: "https://github.com/opensemba",
    });
    expect(itemParagraphs().at(-1)).toMatch(/not a black box but a toolbox/);
    expect(itemParagraphs().at(-1)).toContain("AI agents");
    expect(text).not.toMatch(/nobody else offers/i);
    expect(text).not.toMatch(/guarantee/i);
    expect(text).not.toMatch(/perfect/i);
  });

  it("shows the same Open and auditable paragraphs after switching to another item and back", () => {
    render(<SoftwareSection />);

    select("Open and auditable");
    select("HPC");
    select("Open and auditable");

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS["Open and auditable"]);
    expect(softwareLinkNames()).toEqual(["FreeCAD", "Gmsh", "opensemba"]);
  });

  it("shows the supplied HPC text", () => {
    render(<SoftwareSection />);
    select("HPC");

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS.HPC);
    expect(softwareLinkNames()).toEqual([]);
  });

  it("shows the Material characterisation service text, naming the three measurements and linking nothing", () => {
    render(<SoftwareSection />);
    select("Material characterisation service");
    const text = cardText();

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS["Material characterisation service"]);
    expect(softwareLinkNames()).toEqual([]);
    expect(missingPhrases(text, ["carbon-fibre", "shielding effectiveness", "transfer impedance"])).toEqual([]);
    expect(UNSUPPORTED_CLAIMS.filter((claim) => claim.test(text)).map(String)).toEqual([]);
  });

  it("opens the Simulation service text with the problem, in two to four paragraphs", () => {
    const { paragraphs } = simulationItem();

    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(paragraphs.length).toBeLessThanOrEqual(4);
    expect(paragraphs[0]).not.toMatch(/\b(Elemwave|we|our)\b/i);
  });

  it("says the Simulation service is run for the visitor, as a service, on Elemwave's own resources", () => {
    const { text } = simulationItem();

    expect(missingPhrases(text, ["for you", "as a service", "your own design", "our own computing resources", "the results"])).toEqual([]);
  });

  it("says the Simulation service is for a visitor without the infrastructure or software of their own", () => {
    const { text } = simulationItem();

    expect(missingPhrases(text, ["no hardware to buy", "no software to set up", "the answer rather than the tool"])).toEqual([]);
  });

  it("says the Simulation service runs with the tools the section describes, naming none of them", () => {
    const { text } = simulationItem();

    expect(missingPhrases(text, ["the same tools"])).toEqual([]);
    expect(ITEMS.filter((name) => name !== SIMULATION && text.toLowerCase().includes(name.toLowerCase()))).toEqual([]);
  });

  it("links nothing and claims nothing unsupported in the Simulation service text", () => {
    const { text } = simulationItem();

    expect(softwareLinkNames()).toEqual([]);
    expect(UNSUPPORTED_CLAIMS.filter((claim) => claim.test(text)).map(String)).toEqual([]);
  });

  it("writes the Simulation service text in British spelling", () => {
    const { text } = simulationItem();

    expect(text).not.toMatch(AMERICAN_SPELLINGS);
  });

  it("shows the supplied SPICE coupling text", () => {
    render(<SoftwareSection />);
    select("SPICE coupling");

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS["SPICE coupling"]);
    expect(softwareLinkNames()).toEqual(["ngspice"]);
    expectLinks({ ngspice: "https://github.com/opensemba/ngspice" });
  });

  it("shows the supplied FDTD solver text", () => {
    render(<SoftwareSection />);
    select("FDTD solver");

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS["FDTD solver"]);
    expect(softwareLinkNames()).toEqual(["opensemba/fdtd"]);
    expectLinks({ "opensemba/fdtd": "https://github.com/opensemba/fdtd" });
  });

  it("shows the supplied DGTD solver text", () => {
    render(<SoftwareSection />);
    select("DGTD solver");

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS["DGTD solver"]);
    expect(softwareLinkNames()).toEqual(["opensemba/dgtd"]);
    expectLinks({ "opensemba/dgtd": "https://github.com/opensemba/dgtd" });
  });

  it("offers no Tessellator Mesher item and names neither opensemba/tessellator nor GiD in any item", () => {
    render(<SoftwareSection />);

    const named = ITEMS.flatMap((item) => {
      select(item);
      const card = screen.getByRole("heading", { level: 3 }).parentElement as HTMLElement;
      const links = within(card)
        .queryAllByRole("link")
        .map((link) => `${link.textContent} ${link.getAttribute("href")}`);
      const shown = [cardText(), ...links].join(" ");
      return TESSELLATOR_NAMES.filter(({ pattern }) => pattern.test(shown)).map(({ name }) => `${item}: ${name}`);
    });

    expect(screen.queryByRole("button", { name: "Tessellator Mesher" })).toBeNull();
    expect(named).toEqual([]);
  });

  it("shows The Workbench's video from the site's own file, muted, looping and without controls, over its own still", () => {
    render(<SoftwareSection />);
    select("The Workbench");

    const videos = [...document.querySelectorAll("video")];
    const still = pictureLayer(picture());

    expect(
      videos.map((video) => ({
        src: video.getAttribute("src"),
        muted: video.muted,
        loop: video.loop,
        autoplay: video.autoplay,
        controls: video.hasAttribute("controls"),
      })),
    ).toEqual([{ src: "/images/solution-ew-workbench.mp4", muted: true, loop: true, autoplay: true, controls: false }]);
    expect(still.style.backgroundImage).toContain("/images/solution-ew-workbench.jpg");
    expect(document.querySelectorAll("iframe")).toHaveLength(0);
  });

  it(`names The Workbench picture area Play or Pause followed by the whole of "${WORKBENCH_VIDEO_NAME}", and says what activating it does`, () => {
    render(<SoftwareSection />);

    expect(ownPictureOf("The Workbench").name).toBe(`Play ${WORKBENCH_VIDEO_NAME}`);
    expect(screen.getByRole("button", { name: `Play ${WORKBENCH_VIDEO_NAME}` })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /EW Workbench video/ })).toBeNull();
  });

  it("shows the supplied text of The Workbench, with FreeCAD its one link", () => {
    render(<SoftwareSection />);
    select("The Workbench");

    const links = within(itemCard())
      .queryAllByRole("link")
      .map((link) => ({ name: link.textContent, href: link.getAttribute("href") }));

    expect(itemParagraphs()).toEqual(WORKBENCH_PARAGRAPHS);
    expect(links).toEqual([{ name: "FreeCAD", href: "https://www.freecad.org/" }]);
    expectLinks({ FreeCAD: "https://www.freecad.org/" });
    expect(paperLinks()).toEqual([]);
  });
});
