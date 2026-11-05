import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TABS } from "@/lib/home-content";
import { ItemTabs } from "./ItemTabs";

const ITEMS = TABS.slice(0, 3);
const relationOf = (item: { label: string }) => ({ related: item.label === "Cable Solver", note: "Answers Lightning" });

describe("ItemTabs", () => {
  it("calls onActiveChange with the label of the activated item", () => {
    const onActiveChange = vi.fn();
    render(<ItemTabs items={ITEMS} groupLabel="Capabilities" onActiveChange={onActiveChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Conformal modelling" }));

    expect(onActiveChange).toHaveBeenCalledWith("Conformal modelling");
  });

  it("a related item shows a visible marker that is not part of its accessible name", () => {
    render(<ItemTabs items={ITEMS} groupLabel="Capabilities" relationOf={relationOf} />);

    const related = screen.getByRole("button", { name: "Cable Solver" });

    expect(related.querySelector("[data-related-marker]")).toHaveAttribute("aria-hidden", "true");
    expect(related).toHaveTextContent(/^Cable Solver$/);
  });

  it("a related item describes its relationship through aria-describedby", () => {
    render(<ItemTabs items={ITEMS} groupLabel="Capabilities" relationOf={relationOf} />);

    expect(screen.getByRole("button", { name: "Cable Solver" })).toHaveAccessibleDescription("Answers Lightning");
  });

  it("an unrelated item stays present enabled and unmarked", () => {
    render(<ItemTabs items={ITEMS} groupLabel="Capabilities" relationOf={relationOf} />);

    const unrelated = screen.getByRole("button", { name: "Conformal modelling" });

    expect(unrelated).toBeVisible();
    expect(unrelated).toHaveAttribute("data-relation", "unrelated");
    expect(unrelated).toBeEnabled();
    expect(unrelated).not.toHaveAttribute("aria-describedby");
    expect(unrelated.querySelector("[data-related-marker]")).toBeNull();
    fireEvent.click(unrelated);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Conformal modelling");
  });

  it("aria-pressed still marks only the shown item", () => {
    render(<ItemTabs items={ITEMS} groupLabel="Capabilities" relationOf={relationOf} />);

    const pressed = screen.getAllByRole("button").filter((b) => b.getAttribute("aria-pressed") === "true");

    expect(pressed.map((b) => b.textContent)).toEqual(["Multilayer surface impedances"]);
    expect(screen.getByRole("button", { name: "Cable Solver" })).toHaveAttribute("aria-pressed", "false");
  });
});
