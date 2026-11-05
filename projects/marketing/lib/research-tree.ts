import type { ProblemTab, ScienceSlide, SoftwareTab, TextSegment } from "./home-content";

/** What a selected problem leads to: its solutions, then the carousel papers supporting them. */
export interface Relations {
  problem: string;
  /** Labels of the related Our Solution items, in their tab order. */
  solutions: string[];
  /** Captions of the supporting carousel entries, each once, in carousel order. */
  papers: string[];
  /** Labels of related solutions none of whose listed papers is a carousel entry. */
  unsupported: string[];
}

const linksOf = (tab: SoftwareTab): string[] =>
  tab.paragraphs.flatMap((paragraph) =>
    typeof paragraph === "string"
      ? []
      : paragraph.flatMap((segment: TextSegment) => (typeof segment === "string" ? [] : [segment.href])),
  );

/**
 * The research tree below one problem, read only from the maintained content:
 * the solutions the problem names, and the carousel entries whose paper a
 * related solution's card already links. `null` for an unknown problem; a
 * named solution that does not exist is dropped rather than invented.
 */
export function relationsFor(
  problemLabel: string,
  problems: ProblemTab[],
  solutions: SoftwareTab[],
  slides: ScienceSlide[],
): Relations | null {
  const problem = problems.find((p) => p.label === problemLabel);
  if (!problem) {
    return null;
  }
  const related = solutions.filter((tab) => problem.solutions.includes(tab.label));
  const shown = new Set(slides.flatMap((s) => (s.paperUrl === undefined ? [] : [s.paperUrl])));
  const links = new Set(related.flatMap(linksOf));
  return {
    problem: problem.label,
    solutions: related.map((tab) => tab.label),
    papers: slides.filter((s) => s.paperUrl !== undefined && links.has(s.paperUrl)).map((s) => s.caption),
    unsupported: related.filter((tab) => !linksOf(tab).some((link) => shown.has(link))).map((tab) => tab.label),
  };
}
