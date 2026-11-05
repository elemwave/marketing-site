"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { PROBLEMS, SLIDES, TABS } from "@/lib/home-content";
import { relationsFor, type Relations } from "@/lib/research-tree";

/** The problem a visitor has chosen and what it leads to. */
export interface ResearchTree {
  selected: string;
  /** Choose a problem by label; an unknown label is ignored. */
  select: (label: string) => void;
  relations: Relations;
}

const ResearchTreeContext = createContext<ResearchTree | null>(null);

const FIRST_PROBLEM = PROBLEMS[0].label;

function useTreeState(): ResearchTree {
  const [selected, setSelected] = useState(FIRST_PROBLEM);
  return useMemo(
    () => ({
      selected,
      select: (label: string) => {
        if (relationsFor(label, PROBLEMS, TABS, SLIDES)) {
          setSelected(label);
        }
      },
      // `selected` only ever holds a known label, so this always resolves.
      relations: relationsFor(selected, PROBLEMS, TABS, SLIDES) as Relations,
    }),
    [selected],
  );
}

/**
 * Shares the chosen problem between The challenges, Our Solution and the
 * publications carousel. It starts on the first published problem and keeps
 * nothing once the page is left.
 */
export function ResearchTreeProvider({ children }: { children: ReactNode }) {
  const tree = useTreeState();
  return <ResearchTreeContext.Provider value={tree}>{children}</ResearchTreeContext.Provider>;
}

/** The page's research tree, or a section's own when it is shown alone. */
export function useResearchTree(): ResearchTree {
  const own = useTreeState();
  return useContext(ResearchTreeContext) ?? own;
}
