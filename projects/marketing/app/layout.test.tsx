import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { expectNoPageOwnedHeaderBand, expectSingleMainLandmark } from "@/test/page-landmarks";
import RootLayout from "./layout";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));
vi.mock("next/font/google", () => {
  const font = () => ({ variable: "--font-mock" });
  return { Montserrat: font, Inter: font };
});

beforeEach(() => {
  process.env.CALENDLY_URL = "https://calendly.test/x";
});

afterEach(() => {
  delete process.env.CALENDLY_URL;
});

function renderLayout() {
  render(<RootLayout>content</RootLayout>);
}

describe("the root layout", () => {
  it("presents the header, then the page content, then the footer, in order", () => {
    renderLayout();

    const banner = screen.getByRole("banner");
    const main = screen.getByRole("main");
    const contentinfo = screen.getByRole("contentinfo");
    expect(
      banner.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      main.compareDocumentPosition(contentinfo) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("exposes exactly one primary-content landmark holding the page content", () => {
    renderLayout();

    const main = expectSingleMainLandmark();
    expect(main).toHaveTextContent("content");
  });

  it("adds no styling wrapper around the header", () => {
    renderLayout();

    expectNoPageOwnedHeaderBand();
  });
});
