import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "@/app/(site)/(home)/page";
import { withBooking } from "@/test/withBooking";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

/** The whole home page, as it is served, so the sections share its one research tree. */
function renderTree() {
  return render(withBooking(<Home />));
}

const sectionOf = (heading: string) =>
  screen.getByRole("heading", { level: 2, name: heading }).closest("section") as HTMLElement;
const problems = () => sectionOf("The challenges");
const software = () => sectionOf("Our Solution");
const science = () => sectionOf("Peer-Reviewed Publications");

const choose = (problem: string) => fireEvent.click(within(problems()).getByRole("button", { name: problem }));

const relatedSolutions = () =>
  within(software())
    .getAllByRole("button")
    .filter((b) => b.getAttribute("data-relation") === "related")
    .map((b) => b.textContent);

const relatedDots = () =>
  within(science())
    .getAllByRole("button", { name: /^Go to slide \d+$/ })
    .filter((dot) => dot.getAttribute("data-relation") === "related")
    .map((dot) => dot.getAttribute("aria-label"));

const pressedProblems = () =>
  within(problems())
    .getAllByRole("button")
    .filter((b) => b.getAttribute("aria-pressed") === "true")
    .map((b) => b.textContent);

describe("the research tree across the home sections", () => {
  it("highlights Cable Solver and Multilayer surface impedances for Radiated emissions", () => {
    renderTree();

    expect(relatedSolutions()).toEqual(["Multilayer surface impedances", "Cable Solver"]);
    expect(within(software()).getByRole("button", { name: "Cable Solver" })).toHaveAccessibleDescription(
      "Answers Radiated emissions",
    );
    expect(within(software()).getByText(/^Answers Radiated emissions: Multilayer surface impedances, Cable Solver\.$/)).toBeInTheDocument();
  });

  it("highlights the papers of those solutions as supporting evidence", () => {
    renderTree();

    expect(relatedDots()).toEqual(["Go to slide 6", "Go to slide 7", "Go to slide 10"]);
    expect(within(science()).getByRole("button", { name: "Go to slide 10" })).toHaveAccessibleDescription(
      "Supports Radiated emissions",
    );
    expect(within(science()).getByText(/^Supporting papers for Radiated emissions:/)).toBeInTheDocument();
  });

  it("keeps unrelated entries present and operable", () => {
    renderTree();
    const hpc = within(software()).getByRole("button", { name: "HPC" });

    expect(hpc).toHaveAttribute("data-relation", "unrelated");
    fireEvent.click(hpc);
    expect(within(software()).getByRole("heading", { level: 3 })).toHaveTextContent("HPC");
    fireEvent.click(within(science()).getByRole("button", { name: "Go to slide 1" }));
    expect(within(science()).getByRole("button", { name: "Go to slide 1" })).toHaveAttribute("aria-current", "true");
  });

  it("the latest activation is the only selected state", () => {
    renderTree();

    choose("Lightning");
    choose("Radar cross section");

    expect(pressedProblems()).toEqual(["Radar cross section"]);
    expect(relatedSolutions()).toEqual(["Conformal modelling", "FDTD solver", "DGTD solver"]);
  });

  it("starts on Radiated emissions on every render", () => {
    const first = renderTree();
    choose("Lightning");
    first.unmount();

    renderTree();

    expect(pressedProblems()).toEqual(["Radiated emissions"]);
    expect(within(problems()).getByText(/^Radiated emissions leads to 2 solutions and 3 supporting papers/)).toBeInTheDocument();
  });

  it("renders the relationships with no waiting state", () => {
    renderTree();

    expect(screen.queryByText(/loading/i)).toBeNull();
    expect(relatedSolutions()).not.toHaveLength(0);
    expect(relatedDots()).not.toHaveLength(0);
  });

  it("Radar cross section shows the no-supporting-paper line", () => {
    renderTree();

    choose("Radar cross section");

    expect(relatedDots()).toEqual([]);
    expect(within(science()).getByText("No supporting paper is currently listed for Radar cross section.")).toBeInTheDocument();
    expect(within(problems()).getByText(/^Radar cross section leads to 3 solutions and 0 supporting papers/)).toBeInTheDocument();
  });

  it("names a related solution with no supporting paper when others have one", () => {
    renderTree();

    choose("Lightning");

    expect(relatedDots()).toEqual(["Go to slide 6", "Go to slide 7", "Go to slide 10"]);
    expect(within(science()).getByText(/^Supporting papers for Lightning:/)).toHaveTextContent(
      /No supporting paper is currently listed for Conformal modelling\.$/,
    );
    expect(within(software()).getByRole("button", { name: "Conformal modelling" })).toHaveAccessibleDescription(
      "Answers Lightning; no supporting paper is currently listed",
    );
  });

  it("selecting a problem does not change the shown solution or slide", () => {
    renderTree();
    fireEvent.click(within(software()).getByRole("button", { name: "HPC" }));
    fireEvent.click(within(science()).getByRole("button", { name: "Go to slide 3" }));

    choose("Lightning");

    expect(within(software()).getByRole("heading", { level: 3 })).toHaveTextContent("HPC");
    expect(within(science()).getByRole("button", { name: "Go to slide 3" })).toHaveAttribute("aria-current", "true");
  });
});
