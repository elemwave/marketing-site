import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  NOTHING_SHOWN,
  chooseInTurn,
  firstChoice,
  itemButton,
  labelsAndTitles,
  openedFresh,
  ownPictureOf,
  ownPictures,
  paperLinks,
  reselect,
  scrollsOnActivation,
  select,
  serverMarkupFacts,
  shownAfreshAfterChoosing,
  shownPictures,
} from "@/test/item-tabs";
import { stubPrefersReducedMotion } from "@/test/prefersReducedMotion";
import { PROBLEMS } from "@/lib/home-content";
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

/** The items that show a video, and the name each one's still is announced by. */
const VIDEO_NAMES: Record<string, string> = {
  "Radiated emissions": "Radiated emissions video: Elemwave's own simulation of the field around a Vivaldi horn antenna",
  "Radiated immunity":
    "Radiated immunity video: Elemwave's own simulation of currents induced on an aircraft by high-intensity radiated fields",
  "Conducted susceptibility":
    "Conducted susceptibility video: Elemwave's own simulation of currents on a cable run between two panels",
};
const VIDEO_ITEMS = Object.keys(VIDEO_NAMES);

/** Each video item's own published video file, as the catalogue gives it. */
function videoFileOf(name: string) {
  return PROBLEMS.find((item) => item.label === name)?.video?.src;
}

/** The video elements in the document. */
function videos() {
  return [...document.querySelectorAll("video")];
}

/** The one video shown, or null when there is none. */
function video() {
  const shown = videos();
  return shown.length === 1 ? shown[0] : null;
}

/** The accessible names of the controls the shown item's card holds, its picture area included. */
function controlsInItemCard() {
  const card = screen.getByRole("heading", { level: 3 }).parentElement?.parentElement as HTMLElement;
  return [...within(card).queryAllByRole("button"), ...within(card).queryAllByRole("link")].map(
    (control) => control.getAttribute("aria-label") ?? control.textContent,
  );
}

/** Each application's text, word for word, one entry per paragraph, as the card's challenges document supplies it. */
const SUPPLIED_PARAGRAPHS: Record<string, string[]> = {
  "Radiated emissions": [
    "Every harness and every surface radiates. Somewhere inside your platform, one cable or one opening is the reason a level crosses its limit — and finding which one after the prototype exists is expensive.",
    "You can find it before you build. Currents from each harness feed the 3D field solution, and multilayer surface impedances show how much escapes through composite or coated skins.",
    "The result is the installed emission level, against its limit, with the cable or opening responsible named."
  ],
  "Radiated immunity": [
    "Threat fields arrive from outside — lightning pulses, radar, high-intensity radiated fields — and the question is what reaches the equipment inside.",
    "The incident field couples into the structure, through the skin's shielding and into every harness, and the induced voltage at each connector is what decides whether the equipment survives.",
    "Multilayer surface impedances and conformal modelling keep that shielding realistic, and the Cable Solver carries the field inside down to the currents each harness carries."
  ],
  "Conducted susceptibility": [
    "A disturbance can enter through a power cable or a signal harness and reach one pin, one connector, or one piece of equipment — and what decides whether it is tolerated is how much of it arrives where it matters.",
    "The current spreads across every conductor of the bundle, supply and signal alike, and the disturbance that reaches each equipment pin is returned, conductor by conductor, whatever the source that put it there.",
    "Levels and injection points can be swept before anything is built, and the harness changed and re-run as many times as the design needs."
  ],
  "Lightning": [
    "A strike enters at one attachment point and leaves at another, and everything in between carries part of it: structure, skins, and every cable run on the way.",
    "Two things come out of that. The direct effects — where the current goes and what it does on its path — and the indirect ones, the transients induced on cables and equipment, read at each connector.",
    "Multilayer surface impedances and conformal modelling carry the current through composite and coated skins as they really are, and the Cable Solver turns the field inside into the transient each harness carries."
  ],
  "Radar cross section": [
    "Radar cross section answers a narrow question: how much of an incident wave comes back, and from where. Over a band of frequencies and angles, one geometry can behave very differently from the next.",
    "Time-domain runs give the whole band at once. Unstructured meshes follow curved geometry, conformal modelling keeps surfaces true on a regular grid, and the result is the signature across angles, not a single number.",
    "Shaping, coatings and openings can then be compared before anything is built or measured — so you know which surface is doing the scattering."
  ]
};

/** The opening words of each application's former first paragraph, which no item may still show. */
const FORMER_OPENINGS: Record<string, string> = {
  "Radiated emissions": "Radiated emissions are predicted by computing the fields that cables, equipment and structures radiate",
  "Radiated immunity": "Radiated immunity is assessed by simulating external threat fields",
  "Conducted susceptibility": "Conducted susceptibility is assessed by simulating disturbances injected onto cable bundles",
  "Lightning": "A lightning strike is simulated from where it attaches to the platform",
  "Radar cross section": "The field a platform scatters back under an incident wave is computed around it"
};

/** The paragraphs of the shown item's card, in order. */
function itemParagraphs() {
  const card = screen.getByRole("heading", { level: 3 }).parentElement as HTMLElement;
  return [...card.querySelectorAll("p")].map((paragraph) => paragraph.textContent);
}

function description() {
  return screen.getByRole("heading", { level: 2, name: "The challenges" }).parentElement?.querySelector("h2 + div + p");
}

describe("ProblemsSection", () => {
  // jsdom implements neither `play` nor `pause`, and logs that each is missing.
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is headed The challenges and anchored at #problems", () => {
    const { container } = render(<ProblemsSection />);

    expect(screen.getByRole("heading", { level: 2, name: "The challenges" })).toBeInTheDocument();
    expect(container.querySelector("section")).toHaveAttribute("id", "problems");
  });

  it("retains The challenges introductory description", () => {
    render(<ProblemsSection />);

    expect(description()?.textContent).toBe("Before a single drawing exists, you are already being asked what the system will emit, withstand and reflect. Getting those answers right is cheaper than discovering them later.");
    expect(description()).not.toHaveTextContent("The electromagnetic questions a platform has to answer");
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

  it("names each video item's picture area after the item, says it is Elemwave's own simulation video, and says what activating it does", () => {
    render(<ProblemsSection />);

    const names = VIDEO_ITEMS.map((name) => ownPictureOf(name).name);

    expect(names).toEqual(Object.values(VIDEO_NAMES).map((label) => `Play ${label}`));
    expect(names.filter((name) => !/^Play .+ video: Elemwave's own simulation of /.test(name ?? ""))).toEqual([]);
  });

  it("renders one video for each video item, from the site's own file, muted, looping and without controls", () => {
    render(<ProblemsSection />);

    const shown = VIDEO_ITEMS.map((name) => {
      select(name);
      const element = video();
      return {
        name,
        count: videos().length,
        src: element?.getAttribute("src"),
        muted: element?.muted,
        defaultMuted: element?.defaultMuted,
        loop: element?.loop,
        autoplay: element?.autoplay,
        playsInline: element?.hasAttribute("playsinline"),
        controls: element?.hasAttribute("controls"),
        frames: document.querySelectorAll("iframe").length,
      };
    });

    expect(shown).toEqual(
      VIDEO_ITEMS.map((name) => ({
        name,
        count: 1,
        src: videoFileOf(name),
        muted: true,
        defaultMuted: true,
        loop: true,
        autoplay: true,
        playsInline: true,
        controls: false,
        frames: 0,
      })),
    );
    expect(VIDEO_ITEMS.map(videoFileOf).filter((src) => !src?.startsWith("/images/"))).toEqual([]);
  });

  it("gives each video's frame its video's own shape and a width that keeps it inside the picture area", () => {
    render(<ProblemsSection />);

    const frames = VIDEO_ITEMS.map((name) => {
      select(name);
      const frame = video()?.parentElement;
      // jsdom keeps the declared shape and folds the width's calc() into one factor of the area's height.
      const factor = frame?.style.width.match(/^min\(100cqw, ([\d.]+)cqh\)$/)?.[1];
      return { name, aspectRatio: frame?.style.aspectRatio, heightFactor: factor === undefined ? undefined : Math.round(Number(factor)) };
    });

    expect(frames).toEqual(
      VIDEO_ITEMS.map((name) => {
        const ratio = PROBLEMS.find((item) => item.label === name)?.video?.aspectRatio ?? "";
        const [width, height] = ratio.split(" / ").map(Number);
        return { name, aspectRatio: ratio, heightFactor: Math.round((100 * width) / height) };
      }),
    );
    expect(frames.map(({ aspectRatio }) => aspectRatio)).toEqual(["802 / 620", "1278 / 720", "1250 / 720"]);
  });

  it("offers each video item's picture area as one button, named `Play ` and the item's `pictureLabel` before the video has played", () => {
    render(<ProblemsSection />);

    const controls = VIDEO_ITEMS.map((name) => {
      select(name);
      return { name, controls: controlsInItemCard() };
    });

    expect(controls).toEqual(VIDEO_ITEMS.map((name) => ({ name, controls: [`Play ${VIDEO_NAMES[name]}`] })));
  });

  it("renders no video before any item is chosen, nor for Lightning or Radar cross section", () => {
    render(<ProblemsSection />);

    const counts = [videos().length];
    for (const name of ["Lightning", "Radar cross section", "Radiated immunity"]) {
      select(name);
      counts.push(videos().length);
    }

    // The last choice, a video item, shows that a video is counted where one exists.
    expect(counts).toEqual([0, 0, 0, 1]);
  });

  it("keeps the same video when the chosen video item is chosen again", () => {
    render(<ProblemsSection />);

    select("Radiated immunity");
    const first = video();
    select("Radiated immunity");
    select("Radiated immunity");

    expect(first).not.toBeNull();
    expect(video()).toBe(first);
  });

  it("removes the video when another item is chosen", () => {
    render(<ProblemsSection />);

    select("Conducted susceptibility");
    const before = videos().length;
    select("Lightning");

    expect({ before, after: videos().length }).toEqual({ before: 1, after: 0 });
  });

  it("mounts a new video when a video item is chosen again after another item", () => {
    render(<ProblemsSection />);

    select("Radiated emissions");
    const first = video();
    select("Lightning");
    select("Radiated emissions");
    const second = video();

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(second).not.toBe(first);
  });

  it("mounts a new video when another video item is chosen directly, with no other item between", () => {
    render(<ProblemsSection />);

    select("Radiated immunity");
    const first = video();
    select("Conducted susceptibility");
    const second = video();

    expect(first?.getAttribute("src")).toBe(videoFileOf("Radiated immunity"));
    expect(second?.getAttribute("src")).toBe(videoFileOf("Conducted susceptibility"));
    expect(second).not.toBe(first);
  });

  it("leaves only the last chosen item's video after quick switching between the three video items", () => {
    render(<ProblemsSection />);

    for (const name of [...VIDEO_ITEMS, ...VIDEO_ITEMS]) {
      select(name);
    }

    expect(videos().map((element) => element.getAttribute("src"))).toEqual([videoFileOf("Conducted susceptibility")]);
  });

  it("shows the still alone, with no video and no button, when the visitor prefers reduced motion", () => {
    const restore = stubPrefersReducedMotion(true);
    try {
      render(<ProblemsSection />);

      const shown = VIDEO_ITEMS.map((name) => {
        select(name);
        return { name, videos: videos().length, controls: controlsInItemCard(), still: ownPictureOf(name) };
      });

      expect(shown).toEqual(
        VIDEO_ITEMS.map((name) => ({
          name,
          videos: 0,
          controls: [],
          still: {
            name: VIDEO_NAMES[name],
            url: `/images/${PICTURES[name]}`,
            tabUrl: `/images/${PICTURES[name]}`,
            inInteractiveControl: false,
            urlAfterVisitingAnotherItem: `/images/${PICTURES[name]}`,
          },
        })),
      );
    } finally {
      restore();
    }
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

  it("shows the supplied radiated emissions text", () => {
    const { container } = render(<ProblemsSection />);
    select("Radiated emissions");

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS["Radiated emissions"]);
    expect(container.textContent).not.toContain(FORMER_OPENINGS["Radiated emissions"]);
  });

  it("shows the supplied radiated immunity text", () => {
    const { container } = render(<ProblemsSection />);
    select("Radiated immunity");

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS["Radiated immunity"]);
    expect(container.textContent).not.toContain(FORMER_OPENINGS["Radiated immunity"]);
  });

  it("shows the supplied conducted susceptibility text", () => {
    const { container } = render(<ProblemsSection />);
    select("Conducted susceptibility");

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS["Conducted susceptibility"]);
    expect(container.textContent).not.toContain(FORMER_OPENINGS["Conducted susceptibility"]);
  });

  it("shows the supplied lightning text", () => {
    const { container } = render(<ProblemsSection />);
    select("Lightning");

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS["Lightning"]);
    expect(container.textContent).not.toContain(FORMER_OPENINGS["Lightning"]);
  });

  it("shows the supplied radar cross section text", () => {
    const { container } = render(<ProblemsSection />);
    select("Radar cross section");

    expect(itemParagraphs()).toEqual(SUPPLIED_PARAGRAPHS["Radar cross section"]);
    expect(container.textContent).not.toContain(FORMER_OPENINGS["Radar cross section"]);
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
