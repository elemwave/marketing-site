import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  NOTHING_SHOWN,
  cardText,
  chooseInTurn,
  firstChoice,
  itemButton,
  labelsAndTitles,
  missingPhrases,
  openedFresh,
  ownPictures,
  paperLinks,
  phrasesFound,
  reselect,
  scrollsOnActivation,
  select,
  serverMarkupFacts,
  shownAfreshAfterChoosing,
  shownPictures,
} from "@/test/item-tabs";
import { ProblemsSection } from "./ProblemsSection";

const ITEMS = [
  "Radiated emissions",
  "Radiated immunity",
  "Conducted susceptibility",
  "Lightning",
  "Radar cross section",
];

/** The computer-generated picture `plan.md`'s Revision 3 table gives each item. */
const PICTURES: Record<string, string> = {
  "Radiated emissions": "problem-radiated-emissions.webp",
  "Radiated immunity": "problem-radiated-immunity.webp",
  "Conducted susceptibility": "problem-conducted-susceptibility.webp",
  Lightning: "problem-lightning.webp",
  "Radar cross section": "problem-radar-cross-section.webp",
};

/** Our Solution's items an application may name as what serves it. */
const SOLUTION_ITEMS = [
  "Cable Solver",
  "multilayer surface impedances",
  "conformal modelling",
  "FDTD solver",
  "DGTD solver",
];

function description() {
  return screen.getByRole("heading", { level: 2, name: "The challenges" }).parentElement?.querySelector("h2 + div + p");
}

describe("ProblemsSection", () => {
  it("is headed The challenges and anchored at #problems", () => {
    const { container } = render(<ProblemsSection />);

    expect(screen.getByRole("heading", { level: 2, name: "The challenges" })).toBeInTheDocument();
    expect(container.querySelector("section")).toHaveAttribute("id", "problems");
  });

  it("retains The challenges introductory description", () => {
    render(<ProblemsSection />);

    expect(description()).toHaveTextContent("The electromagnetic questions a platform has to answer before it is certified: what it emits, what it withstands and what it reflects. Each is answered with the items of Our Solution below.");
  });

  it("offers five items in order, each with the same label and title", () => {
    render(<ProblemsSection />);

    expect(labelsAndTitles()).toEqual(ITEMS.map((name) => ({ label: name, title: name })));
  });

  it("announces its tabs as one group named Applications", () => {
    render(<ProblemsSection />);
    const groups = screen.getAllByRole("group");

    expect(groups.map((group) => group.getAttribute("aria-label"))).toEqual(["Applications"]);
    expect(within(groups[0]).getAllByRole("button")).toHaveLength(ITEMS.length);
  });

  it("opens with no application chosen, no item shown and nothing scrolled", () => {
    expect(openedFresh(() => render(<ProblemsSection />))).toEqual(NOTHING_SHOWN);
  });

  it("renders no item in its server markup", () => {
    expect(serverMarkupFacts(<ProblemsSection />, ITEMS)).toEqual({ missingLabels: [], itemMarkup: [] });
  });

  it("shows the first application chosen and announces it", () => {
    render(<ProblemsSection />);

    expect(firstChoice("Radiated emissions")).toEqual({ pressed: ["Radiated emissions"], title: "Radiated emissions", announcement: "Radiated emissions" });
  });

  it("shows only the last of several applications chosen in quick succession, starting from none", () => {
    render(<ProblemsSection />);

    expect(chooseInTurn(["Lightning", "Radiated immunity", "Radar cross section"])).toEqual({ before: [], pressed: ["Radar cross section"], title: "Radar cross section" });
  });

  it("moves the pressed state and announces the newly shown item when another tab is chosen", () => {
    render(<ProblemsSection />);
    expect(screen.getByRole("status")).toHaveTextContent("");

    select("Radiated emissions");
    select("Lightning");

    expect(itemButton("Lightning")).toHaveAttribute("aria-pressed", "true");
    expect(itemButton("Radiated emissions")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("status")).toHaveTextContent("Lightning");
  });

  it("brings the item card into view, no further than needed, when a tab is activated, keeping focus on the tab", () => {
    render(<ProblemsSection />);

    expect(scrollsOnActivation("Lightning")).toEqual({ calls: [{ options: { block: "nearest" }, onItemCard: true }], focusStayed: true });
  });

  it("keeps the selected item and its content when it is chosen again", () => {
    render(<ProblemsSection />);

    select("Radiated emissions");

    expect(reselect("Radiated emissions")).toEqual({ pressed: ["Radiated emissions"], title: "Radiated emissions", contentChanged: false, announcement: "Radiated emissions" });
  });

  it("shows no application again when the section is shown afresh", () => {
    expect(shownAfreshAfterChoosing(() => render(<ProblemsSection />), "Radar cross section")).toEqual({ pressed: [], itemTitles: 0 });
  });

  it("shows each item's own computer-generated picture, named after it", () => {
    render(<ProblemsSection />);

    const shown = shownPictures(Object.keys(PICTURES));

    expect(shown).toEqual(ownPictures(PICTURES));
  });

  it("describes radiated emissions and what serves them", () => {
    render(<ProblemsSection />);
    select("Radiated emissions");
    const text = cardText();

    expect(missingPhrases(text, ["fields that cables, equipment and structures radiate", "whole platform"])).toEqual([]);
    expect(phrasesFound(text, SOLUTION_ITEMS)).toBeGreaterThanOrEqual(1);
  });

  it("describes radiated immunity's threats, leaving lightning to its own item", () => {
    render(<ProblemsSection />);
    select("Radiated immunity");
    const text = cardText();

    expect(missingPhrases(text, [
      "external threat fields",
      "the platform, its equipment and its cables",
      "high-intensity radiated fields",
      "electromagnetic pulse",
    ])).toEqual([]);
    expect(text).not.toMatch(/lightning/i);
    expect(phrasesFound(text, SOLUTION_ITEMS)).toBeGreaterThanOrEqual(1);
  });

  it("describes conducted susceptibility, bulk current injection and the Cable Solver", () => {
    render(<ProblemsSection />);
    select("Conducted susceptibility");

    expect(missingPhrases(cardText(), ["disturbances injected onto cable bundles", "bulk current injection", "Cable Solver"])).toEqual([]);
  });

  it("describes a lightning strike's attachment, spreading current and induced transients", () => {
    render(<ProblemsSection />);
    select("Lightning");
    const text = cardText();

    expect(missingPhrases(text, ["attaches", "current spreading through", "transients", "cables and equipment"])).toEqual([]);
    expect(phrasesFound(text, SOLUTION_ITEMS)).toBeGreaterThanOrEqual(2);
  });

  it("describes radar cross section over frequencies and angles", () => {
    render(<ProblemsSection />);
    select("Radar cross section");
    const text = cardText();

    expect(missingPhrases(text, ["scatters back", "incident wave", "radar cross section", "frequencies and angles"])).toEqual([]);
    expect(phrasesFound(text, SOLUTION_ITEMS)).toBeGreaterThanOrEqual(1);
  });

  it("links no paper from any item", () => {
    render(<ProblemsSection />);

    for (const name of ITEMS) {
      select(name);
      const papers = paperLinks();
      expect(papers, name).toHaveLength(0);
    }
  });
});
