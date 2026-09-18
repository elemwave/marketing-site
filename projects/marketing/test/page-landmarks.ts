import { expect } from "vitest";
import { screen } from "@testing-library/react";

export function expectSingleMainLandmark(): HTMLElement {
  const mains = screen.getAllByRole("main");
  expect(mains).toHaveLength(1);
  const main = mains[0];
  expect(main).toHaveAttribute("id", "main-content");
  expect(screen.getByRole("banner").closest("main")).toBeNull();
  expect(screen.getByRole("contentinfo").closest("main")).toBeNull();
  return main;
}

export function expectNavyParentDoesNotClipOverflow(): void {
  const navyParent = screen.getByRole("banner").parentElement;
  expect(navyParent).not.toBeNull();
  expect(navyParent?.className.split(/\s+/)).not.toContain("overflow-hidden");
  expect(screen.getByRole("main").className.split(/\s+/)).not.toContain(
    "overflow-hidden",
  );
}

export function expectNoPageOwnedHeaderBand(): void {
  const bannerParentClasses = screen
    .getByRole("banner")
    .parentElement?.className.split(/\s+/)
    .filter(Boolean);

  expect(bannerParentClasses).not.toContain("bg-navy-950");
  expect(bannerParentClasses).not.toContain("overflow-hidden");
  expect(bannerParentClasses).not.toContain("relative");
}
