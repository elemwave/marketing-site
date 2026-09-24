import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScienceSection } from "./ScienceSection";
import { SLIDES } from "@/lib/home-content";

function dots() {
  return SLIDES.map((_, i) =>
    screen.getByRole("button", { name: `Go to slide ${i + 1}` }),
  );
}

describe("ScienceSection", () => {
  it("marks the first dot as current and the others as not current", () => {
    render(<ScienceSection />);
    const [first, second] = dots();

    expect(first).toHaveAttribute("aria-current", "true");
    expect(second).not.toHaveAttribute("aria-current");
  });

  it("moves the current mark when another dot is chosen", () => {
    render(<ScienceSection />);
    const [first, second] = dots();

    fireEvent.click(second);

    expect(second).toHaveAttribute("aria-current", "true");
    expect(first).not.toHaveAttribute("aria-current");
  });

  it("wraps the current mark forward from the last slide", () => {
    render(<ScienceSection />);
    const all = dots();
    const last = all[all.length - 1];

    fireEvent.click(last);
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));

    expect(all[0]).toHaveAttribute("aria-current", "true");
    expect(last).not.toHaveAttribute("aria-current");
  });

  it("wraps the current mark backward from the first slide", () => {
    render(<ScienceSection />);
    const all = dots();

    fireEvent.click(screen.getByRole("button", { name: "Previous slide" }));

    expect(all[all.length - 1]).toHaveAttribute("aria-current", "true");
    expect(all[0]).not.toHaveAttribute("aria-current");
  });

  it("announces nothing on first render", () => {
    render(<ScienceSection />);
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("announces the newly shown publication when a different dot is chosen", () => {
    render(<ScienceSection />);
    const [, second] = dots();

    fireEvent.click(second);

    expect(screen.getByRole("status")).toHaveTextContent(SLIDES[1].caption);
  });

  it("announces the newly shown publication after next/previous", () => {
    render(<ScienceSection />);

    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));

    expect(screen.getByRole("status")).toHaveTextContent(SLIDES[1].caption);
  });

  it("does not repeat the announcement when the already-current dot is chosen again", () => {
    render(<ScienceSection />);
    const [first] = dots();

    fireEvent.click(first);

    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});
