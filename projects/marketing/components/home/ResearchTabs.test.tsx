import { describe, expect, it } from "vitest";
import { solutionsLine } from "./ResearchTabs";

describe("ResearchTabs", () => {
  it("states that no supporting item is listed when a problem names no solution", () => {
    expect(solutionsLine({ problem: "Static discharge", solutions: [], papers: [], unsupported: [] })).toBe(
      "No supporting item is currently listed for Static discharge.",
    );
  });

  it("names the solutions answering the chosen problem", () => {
    expect(
      solutionsLine({ problem: "Lightning", solutions: ["Cable Solver", "HPC"], papers: [], unsupported: [] }),
    ).toBe("Answers Lightning: Cable Solver, HPC.");
  });
});
