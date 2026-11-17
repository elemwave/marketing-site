import { describe, expect, it } from "vitest";
import { marqueeDurationSeconds, marqueeRepeatsPerHalf } from "./partner-strip";

describe("the partner strip's repetition and pace", () => {
  it("repeats five marks three times per half", () => {
    expect(marqueeRepeatsPerHalf(5)).toBe(3);
  });

  it("repeats fifteen marks once per half", () => {
    expect(marqueeRepeatsPerHalf(15)).toBe(1);
  });

  it("repeats four marks four times per half", () => {
    expect(marqueeRepeatsPerHalf(4)).toBe(4);
  });

  it("repeats one mark fifteen times per half", () => {
    expect(marqueeRepeatsPerHalf(1)).toBe(15);
  });

  it("runs five marks for sixty seconds", () => {
    expect(marqueeDurationSeconds(5)).toBe(60);
  });

  it("runs four marks for sixty-four seconds", () => {
    expect(marqueeDurationSeconds(4)).toBe(64);
  });

  it("rejects a mark count below one", () => {
    expect(() => marqueeRepeatsPerHalf(0)).toThrow(RangeError);
    expect(() => marqueeDurationSeconds(0)).toThrow(RangeError);
  });
});
