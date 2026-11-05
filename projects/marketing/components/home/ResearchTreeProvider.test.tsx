import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResearchTreeProvider, useResearchTree } from "./ResearchTreeProvider";

const UNKNOWN = "<img src=x onerror=alert(1)>";

/** Shows the tree's state, and offers a button choosing each label it is given. */
function Probe({ labels = [] }: { labels?: string[] }) {
  const { selected, select, relations } = useResearchTree();
  return (
    <>
      <p data-testid="selected">{selected}</p>
      <p data-testid="problem">{relations.problem}</p>
      <p data-testid="solutions">{relations.solutions.join(", ")}</p>
      {labels.map((label) => (
        <button key={label} type="button" onClick={() => select(label)}>
          {`choose ${label}`}
        </button>
      ))}
    </>
  );
}

const text = (id: string) => screen.getByTestId(id).textContent;
const choose = (label: string) => fireEvent.click(screen.getByRole("button", { name: `choose ${label}` }));

describe("ResearchTreeProvider", () => {
  it("selects the first published problem initially", () => {
    render(
      <ResearchTreeProvider>
        <Probe />
      </ResearchTreeProvider>,
    );

    expect(text("selected")).toBe("Radiated emissions");
    expect(text("solutions")).toBe("Multilayer surface impedances, Cable Solver");
  });

  it("select replaces the selection with the latest valid label", () => {
    render(
      <ResearchTreeProvider>
        <Probe labels={["Lightning", "Radar cross section"]} />
      </ResearchTreeProvider>,
    );

    choose("Lightning");
    choose("Radar cross section");

    expect(text("selected")).toBe("Radar cross section");
    expect(text("problem")).toBe("Radar cross section");
  });

  it("select ignores an unknown label and keeps the last valid selection", () => {
    render(
      <ResearchTreeProvider>
        <Probe labels={["Lightning", UNKNOWN]} />
      </ResearchTreeProvider>,
    );

    choose("Lightning");
    choose(UNKNOWN);

    expect(text("selected")).toBe("Lightning");
    expect(text("problem")).toBe("Lightning");
  });

  it("a default selection exists without a provider", () => {
    render(<Probe labels={["Lightning"]} />);

    expect(text("selected")).toBe("Radiated emissions");
    choose("Lightning");
    expect(text("selected")).toBe("Lightning");
  });
});
