import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MotionPauseButton } from "./MotionPauseButton";

function Harness() {
  const [paused, setPaused] = useState(false);
  return (
    <MotionPauseButton
      paused={paused}
      onToggle={() => setPaused((value) => !value)}
      labelWhenRunning="Pause hero pictures"
      labelWhenPaused="Resume hero pictures"
    />
  );
}

describe("MotionPauseButton", () => {
  it("names the running action and is not pressed until activated", () => {
    render(<Harness />);

    const control = screen.getByRole("button", { name: "Pause hero pictures" });
    expect(control).toHaveAttribute("aria-pressed", "false");
    expect(control).toHaveAttribute("type", "button");

    fireEvent.click(control);

    const resumed = screen.getByRole("button", { name: "Resume hero pictures" });
    expect(resumed).toHaveAttribute("aria-pressed", "true");
  });
});
