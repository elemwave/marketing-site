"use client";

import { PROBLEMS, TABS, type SoftwareTab } from "@/lib/home-content";
import type { Relations } from "@/lib/research-tree";
import { ItemTabs } from "./ItemTabs";
import { useResearchTree } from "./ResearchTreeProvider";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

const lineClass = "mx-auto mt-6 max-w-[860px] text-center font-body text-sm text-ink";

/** Our Solution's line: the items answering the chosen problem, or that none is listed. */
export const solutionsLine = ({ problem, solutions }: Relations) =>
  solutions.length > 0
    ? `Answers ${problem}: ${solutions.join(", ")}.`
    : `No supporting item is currently listed for ${problem}.`;

/** The challenges' tabs: choosing one chooses the problem the tree starts from. */
export function ProblemTabs() {
  const { select, relations } = useResearchTree();
  return (
    <>
      <p className={lineClass}>
        {relations.problem} leads to {plural(relations.solutions.length, "solution")} and{" "}
        {plural(relations.papers.length, "supporting paper")}, marked below.
      </p>
      <ItemTabs items={PROBLEMS} groupLabel="Applications" onActiveChange={select} />
    </>
  );
}

/** Our Solution's tabs, each marked as answering the chosen problem or not. */
export function SolutionTabs() {
  const { relations } = useResearchTree();
  const relationOf = (item: SoftwareTab) => ({
    related: relations.solutions.includes(item.label),
    note: relations.unsupported.includes(item.label)
      ? `Answers ${relations.problem}; no supporting paper is currently listed`
      : `Answers ${relations.problem}`,
  });
  return (
    <>
      <p className={lineClass}>{solutionsLine(relations)}</p>
      <ItemTabs items={TABS} groupLabel="Capabilities" relationOf={relationOf} />
    </>
  );
}
