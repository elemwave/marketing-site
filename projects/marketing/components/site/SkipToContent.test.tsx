import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SkipToContent } from "./SkipToContent";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} data-framework-link="" {...rest}>
      {children}
    </a>
  ),
}));

describe("SkipToContent", () => {
  it("is a same-document fragment link named Skip to content", () => {
    render(<SkipToContent />);

    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveAttribute("href", "#main-content");
    expect(link.tagName).toBe("A");
    expect(link).not.toHaveAttribute("data-framework-link");
  });
});
