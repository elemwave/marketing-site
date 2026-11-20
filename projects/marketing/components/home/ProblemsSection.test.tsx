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
  ownPictureOf,
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

/**
 * The picture each item shows: the still of its own simulation video for
 * Radiated emissions, Radiated immunity and Conducted susceptibility, Elemwave's
 * own picture for Radar cross section, and a computer-generated one for Lightning.
 */
const PICTURES: Record<string, string> = {
  "Radiated emissions": "problem-radiated-emissions.jpg",
  "Radiated immunity": "problem-radiated-immunity.jpg",
  "Conducted susceptibility": "problem-conducted-susceptibility.jpg",
  Lightning: "problem-lightning.webp",
  "Radar cross section": "problem-radar-cross-section.png",
};

/** The items that show a video, and the name each one's still and player are announced by. */
const VIDEO_NAMES: Record<string, string> = {
  "Radiated emissions": "Radiated emissions video: Elemwave's own simulation of the field around a Vivaldi horn antenna",
  "Radiated immunity":
    "Radiated immunity video: Elemwave's own simulation of currents induced on an aircraft by high-intensity radiated fields",
  "Conducted susceptibility":
    "Conducted susceptibility video: Elemwave's own simulation of currents on a cable run between two panels",
};
const VIDEO_ITEMS = Object.keys(VIDEO_NAMES);

/** Each video item's YouTube video. */
const VIDEO_IDS: Record<string, string> = {
  "Radiated emissions": "hAY9OCxZVBU",
  "Radiated immunity": "Q64_MgQxD_U",
  "Conducted susceptibility": "WXt820TPCLI",
};

/** The player frames in the document. */
function frames() {
  return [...document.querySelectorAll("iframe")];
}

/** The one player frame shown, or null when there is none. */
function frame() {
  const shown = frames();
  return shown.length === 1 ? shown[0] : null;
}

/** The parts of a player frame's address a visitor's experience depends on. */
function playerAddress(element: HTMLIFrameElement | null) {
  if (!element) {
    return null;
  }
  const url = new URL(element.src);
  const id = url.pathname.replace(/^\/embed\//, "");
  return {
    host: url.origin,
    video: id,
    autoplay: url.searchParams.get("autoplay"),
    mute: url.searchParams.get("mute"),
    loop: url.searchParams.get("loop"),
    playlist: url.searchParams.get("playlist"),
    controls: url.searchParams.get("controls"),
  };
}

/** The controls the shown item's card holds, its picture area included, apart from the player itself. */
function controlsInItemCard() {
  const card = screen.getByRole("heading", { level: 3 }).parentElement?.parentElement as HTMLElement;
  return [...within(card).queryAllByRole("button"), ...within(card).queryAllByRole("link")].length;
}

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

  it("shows each item's own picture, named after it", () => {
    render(<ProblemsSection />);

    const shown = shownPictures(Object.keys(PICTURES));

    expect(shown).toEqual(ownPictures(PICTURES));
  });

  it("shows each video item's still in its round tab", () => {
    render(<ProblemsSection />);

    const tabs = VIDEO_ITEMS.map((name) => ({ name, tabUrl: ownPictureOf(name).tabUrl }));

    expect(tabs).toEqual(VIDEO_ITEMS.map((name) => ({ name, tabUrl: `/images/${PICTURES[name]}` })));
  });

  it("names each video item's still after the item and says it is Elemwave's own simulation video", () => {
    render(<ProblemsSection />);

    const names = VIDEO_ITEMS.map((name) => ownPictureOf(name).name);

    expect(names).toEqual(Object.values(VIDEO_NAMES));
    expect(names.filter((name) => !/^.+ video: Elemwave's own simulation of /.test(name ?? ""))).toEqual([]);
  });

  it("renders one player frame for each video item, from the privacy-enhanced host, muted, looping and without controls", () => {
    render(<ProblemsSection />);

    const shown = VIDEO_ITEMS.map((name) => {
      select(name);
      return { name, count: frames().length, address: playerAddress(frame()), title: frame()?.title };
    });

    expect(shown).toEqual(
      VIDEO_ITEMS.map((name) => ({
        name,
        count: 1,
        address: {
          host: "https://www.youtube-nocookie.com",
          video: VIDEO_IDS[name],
          autoplay: "1",
          mute: "1",
          loop: "1",
          playlist: VIDEO_IDS[name],
          controls: "0",
        },
        title: VIDEO_NAMES[name],
      })),
    );
  });

  it("adds no control of the site's own to a video item's picture area", () => {
    render(<ProblemsSection />);

    const controls = VIDEO_ITEMS.map((name) => {
      select(name);
      return controlsInItemCard();
    });

    expect(controls).toEqual([0, 0, 0]);
  });

  it("leaves the player's own keyboard control enabled", () => {
    render(<ProblemsSection />);

    select("Radiated immunity");
    const address = frame() ? new URL(frame()!.src) : null;

    expect(address?.searchParams.has("disablekb")).toBe(false);
  });

  it("renders no player frame before any item is chosen, nor for Lightning or Radar cross section", () => {
    render(<ProblemsSection />);

    const counts = [frames().length];
    for (const name of ["Lightning", "Radar cross section"]) {
      select(name);
      counts.push(frames().length);
    }

    expect(counts).toEqual([0, 0, 0]);
  });

  it("keeps the same player frame when the chosen video item is chosen again", () => {
    render(<ProblemsSection />);

    select("Radiated immunity");
    const first = frame();
    select("Radiated immunity");
    select("Radiated immunity");

    expect(first).not.toBeNull();
    expect(frame()).toBe(first);
  });

  it("removes the player frame when another item is chosen", () => {
    render(<ProblemsSection />);

    select("Conducted susceptibility");
    const before = frames().length;
    select("Lightning");

    expect({ before, after: frames().length }).toEqual({ before: 1, after: 0 });
  });

  it("mounts a new player frame when a video item is chosen again after another item", () => {
    render(<ProblemsSection />);

    select("Radiated emissions");
    const first = frame();
    select("Lightning");
    select("Radiated emissions");
    const second = frame();

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(second).not.toBe(first);
  });

  it("leaves only the last chosen item's player frame after quick switching between the three video items", () => {
    render(<ProblemsSection />);

    for (const name of [...VIDEO_ITEMS, ...VIDEO_ITEMS]) {
      select(name);
    }

    expect(frames().map((element) => playerAddress(element)?.video)).toEqual([VIDEO_IDS["Conducted susceptibility"]]);
  });

  it("shows Radar cross section's own far-field picture, named for what it shows", () => {
    render(<ProblemsSection />);

    expect(ownPictureOf("Radar cross section")).toEqual({
      name: "Radar cross section screenshot: far-field detectors arranged around an aircraft model",
      url: "/images/problem-radar-cross-section.png",
      tabUrl: "/images/problem-radar-cross-section.png",
      inInteractiveControl: false,
      urlAfterVisitingAnotherItem: "/images/problem-radar-cross-section.png",
    });
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
