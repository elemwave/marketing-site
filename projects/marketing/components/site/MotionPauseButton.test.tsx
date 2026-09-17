import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MotionPauseAffordance } from "./MotionPauseButton";

describe("MotionPauseAffordance", () => {
  it("stays visual-only and becomes persistently visible when paused", () => {
    const { rerender } = render(
      <MotionPauseAffordance paused={false} name="hero" />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hero-motion-paused")).not.toBeInTheDocument();

    rerender(<MotionPauseAffordance paused name="hero" />);

    expect(screen.getByTestId("hero-motion-paused")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
