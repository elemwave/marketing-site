import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SLIDES } from "@/lib/home-content";
import { ScienceSection } from "./ScienceSection";

function mark(n: number) {
  return screen.getByRole("button", { name: `Go to slide ${n}` });
}

describe("ScienceSection", () => {
  it("exposes the first publication mark as current and shows its picture", () => {
    render(<ScienceSection />);

    expect(mark(1)).toHaveAttribute("aria-current", "true");
    for (let n = 2; n <= SLIDES.length; n += 1) {
      expect(mark(n)).not.toHaveAttribute("aria-current");
    }
    expect(
      screen.getByRole("img", { name: SLIDES[0].caption }),
    ).toBeInTheDocument();
  });

  it("moves current-ness when another mark is chosen", () => {
    render(<ScienceSection />);

    fireEvent.click(mark(2));

    expect(mark(2)).toHaveAttribute("aria-current", "true");
    expect(mark(1)).not.toHaveAttribute("aria-current");
    expect(
      screen.getByRole("img", { name: SLIDES[1].caption }),
    ).toBeInTheDocument();
  });

  it("wraps current-ness from the last mark to the first on next", () => {
    render(<ScienceSection />);

    fireEvent.click(mark(7));
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));

    expect(mark(1)).toHaveAttribute("aria-current", "true");
    expect(mark(7)).not.toHaveAttribute("aria-current");
  });

  it("wraps current-ness from the first mark to the last on previous", () => {
    render(<ScienceSection />);

    fireEvent.click(screen.getByRole("button", { name: "Previous slide" }));

    expect(mark(7)).toHaveAttribute("aria-current", "true");
    expect(mark(1)).not.toHaveAttribute("aria-current");
  });

  it("does not announce the first publication on first view", () => {
    render(<ScienceSection />);

    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("announces the newly shown caption when another mark is chosen", () => {
    render(<ScienceSection />);

    fireEvent.click(mark(2));

    expect(screen.getByRole("status")).toHaveTextContent(SLIDES[1].caption);
  });

  it("announces the newly shown caption on next and previous", () => {
    render(<ScienceSection />);

    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByRole("status")).toHaveTextContent(SLIDES[1].caption);

    fireEvent.click(screen.getByRole("button", { name: "Previous slide" }));
    expect(screen.getByRole("status")).toHaveTextContent(SLIDES[0].caption);
  });

  it("does not announce when the already current mark is chosen again", () => {
    render(<ScienceSection />);

    fireEvent.click(mark(1));

    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});
