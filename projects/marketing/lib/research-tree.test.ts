import { describe, expect, it } from "vitest";
import { PROBLEMS, SLIDES, TABS, type ProblemTab, type ScienceSlide, type SoftwareTab } from "./home-content";
import { relationsFor } from "./research-tree";

const CABLE_PAPER = "Numerical Computation of Unshielded Multiwires In-Cell Parameters for Coupling Between FDTD and MTL Methods Using Multipolar Expansions";

const solution = (label: string, dois: string[]): SoftwareTab => ({
  label,
  iconUrl: "",
  title: label,
  imageUrl: "",
  paragraphs: ["Text.", dois.map((doi) => ({ text: doi, href: `https://doi.org/${doi}` }))],
});

const slide = (caption: string, doi: string): ScienceSlide => ({
  logos: [],
  imageUrl: "",
  caption,
  paperUrl: `https://doi.org/${doi}`,
});

const problem = (label: string, solutions: string[]): ProblemTab => ({
  label,
  iconUrl: "",
  title: label,
  imageUrl: "",
  paragraphs: [],
  solutions,
});

describe("research tree relationships", () => {
  it("every problem solution label names an Our Solution item", () => {
    const labels = new Set(TABS.map((tab) => tab.label));

    const unknown = PROBLEMS.flatMap((p) => p.solutions.filter((label) => !labels.has(label)));

    expect(unknown).toEqual([]);
    expect(PROBLEMS.every((p) => p.solutions.length > 0)).toBe(true);
  });

  it("relationsFor returns the solutions of Lightning in tab order", () => {
    expect(relationsFor("Lightning", PROBLEMS, TABS, SLIDES)?.solutions).toEqual([
      "Multilayer surface impedances",
      "Cable Solver",
      "Conformal modelling",
    ]);
  });

  it("relationsFor derives Cable Solver papers from the DOI links in its card", () => {
    expect(relationsFor("Conducted susceptibility", PROBLEMS, TABS, SLIDES)).toEqual({
      problem: "Conducted susceptibility",
      solutions: ["Cable Solver"],
      papers: [CABLE_PAPER],
      unsupported: [],
    });
  });

  it("relationsFor lists a paper once when two solutions share it", () => {
    const solutions = [solution("A", ["10.1/shared", "10.1/a"]), solution("B", ["10.1/shared"])];
    const slides = [slide("Only A", "10.1/a"), slide("Shared", "10.1/shared"), slide("Neither", "10.1/none")];

    expect(relationsFor("P", [problem("P", ["B", "A"])], solutions, slides)?.papers).toEqual(["Only A", "Shared"]);
  });

  it("relationsFor returns no papers for Conformal modelling", () => {
    const conformalOnly = [problem("Shapes", ["Conformal modelling"])];

    expect(relationsFor("Shapes", conformalOnly, TABS, SLIDES)).toEqual({
      problem: "Shapes",
      solutions: ["Conformal modelling"],
      papers: [],
      unsupported: ["Conformal modelling"],
    });
  });

  it("relationsFor names the related solutions that have no carousel paper", () => {
    expect(relationsFor("Lightning", PROBLEMS, TABS, SLIDES)?.unsupported).toEqual(["Conformal modelling"]);
  });

  it("relationsFor returns null for an unknown problem label", () => {
    expect(relationsFor("Not a problem", PROBLEMS, TABS, SLIDES)).toBeNull();
  });

  it("relationsFor drops a solution label that is not in the supplied solutions", () => {
    const solutions = [solution("A", ["10.1/a"])];

    expect(relationsFor("P", [problem("P", ["A", "Missing"])], solutions, [slide("Only A", "10.1/a")])).toEqual({
      problem: "P",
      solutions: ["A"],
      papers: ["Only A"],
      unsupported: [],
    });
  });
});
