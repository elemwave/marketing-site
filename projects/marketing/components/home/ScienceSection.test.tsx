import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScienceSection } from "./ScienceSection";
import { SLIDES } from "@/lib/home-content";

function dots() {
  return SLIDES.map((_, i) =>
    screen.getByRole("button", { name: `Go to slide ${i + 1}` }),
  );
}

function linkTo(url: string | undefined) {
  const link = screen
    .queryAllByRole("link")
    .find((candidate) => candidate.getAttribute("href") === url);
  if (!url || !link) {
    throw new Error(`expected a link to ${url}`);
  }
  return link;
}

describe("ScienceSection", () => {
  it("titles the section Peer-Reviewed Publications", () => {
    render(<ScienceSection />);

    expect(
      screen.getByRole("heading", { name: "Peer-Reviewed Publications" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "The Science Behind Us" }),
    ).not.toBeInTheDocument();
  });

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

  it("links the shown paper picture to its publication page", () => {
    render(<ScienceSection />);

    const link = linkTo(SLIDES[0].paperUrl);

    expect(link).toContainElement(screen.getByRole("img", { name: SLIDES[0].caption }));
  });

  it("opens the paper link in a new window with noopener and noreferrer", () => {
    render(<ScienceSection />);

    const link = linkTo(SLIDES[0].paperUrl);

    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")?.split(" ")).toEqual(
      expect.arrayContaining(["noopener", "noreferrer"]),
    );
  });

  it("marks the paper picture as clickable", () => {
    render(<ScienceSection />);

    expect(linkTo(SLIDES[0].paperUrl)).toHaveClass("cursor-pointer");
  });

  it("shows the journal link under the picture", () => {
    render(<ScienceSection />);
    const journal = SLIDES[0].journal;

    const link = linkTo(journal?.url);
    const picture = screen.getByRole("img", { name: SLIDES[0].caption });

    expect(link).toHaveTextContent(journal?.name ?? "");
    expect(picture.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(link.closest(".relative")).toBeNull();
  });

  it("opens the journal link in a new window with noopener and noreferrer", () => {
    render(<ScienceSection />);

    const link = linkTo(SLIDES[0].journal?.url);

    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")?.split(" ")).toEqual(
      expect.arrayContaining(["noopener", "noreferrer"]),
    );
  });

  it("names the paper link for the paper and the new window", () => {
    render(<ScienceSection />);

    expect(
      screen.getByRole("link", { name: `${SLIDES[0].caption} (opens in a new window)` }),
    ).toHaveAttribute("href", SLIDES[0].paperUrl);
  });

  it("names the journal link for the journal and the new window", () => {
    render(<ScienceSection />);

    expect(
      screen.getByRole("link", { name: `${SLIDES[0].journal?.name} (opens in a new window)` }),
    ).toHaveAttribute("href", SLIDES[0].journal?.url);
  });

  it("reaches both links in tab order", () => {
    render(<ScienceSection />);
    const paper = linkTo(SLIDES[0].paperUrl);
    const journal = linkTo(SLIDES[0].journal?.url);

    for (const link of [paper, journal]) {
      expect(link).not.toHaveAttribute("tabindex", "-1");
      link.focus();
      expect(link).toHaveFocus();
    }
    expect(paper.compareDocumentPosition(journal) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("gives both links a visible focus style class", () => {
    render(<ScienceSection />);

    for (const link of [linkTo(SLIDES[0].paperUrl), linkTo(SLIDES[0].journal?.url)]) {
      expect(link).toHaveClass("focus-visible:outline", "focus-visible:outline-2");
    }
  });

  it("has no paper link or journal link for papers that are not shown", () => {
    render(<ScienceSection />);
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));

    for (const slide of SLIDES.slice(1)) {
      if (slide.paperUrl !== SLIDES[0].paperUrl) {
        expect(hrefs).not.toContain(slide.paperUrl);
      }
    }
    expect(hrefs).toEqual([SLIDES[0].paperUrl, SLIDES[0].journal?.url]);
  });

  it("moves the links to the paper now shown", () => {
    render(<ScienceSection />);
    const [, , , fourth] = dots();

    fireEvent.click(fourth);

    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      SLIDES[3].paperUrl,
      SLIDES[3].journal?.url,
    ]);
  });

  it("keeps the carousel on the same paper when a link is clicked repeatedly", () => {
    render(<ScienceSection />);
    const [first] = dots();
    const paper = linkTo(SLIDES[0].paperUrl);
    const journal = linkTo(SLIDES[0].journal?.url);

    for (let click = 0; click < 3; click += 1) {
      fireEvent.click(paper);
      fireEvent.click(journal);
    }

    expect(first).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("img", { name: SLIDES[0].caption })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("shows no link for a paper without an address", () => {
    const unlinked = { ...SLIDES[0], paperUrl: undefined, journal: undefined };

    const { container } = render(<ScienceSection slides={[unlinked]} />);

    const picture = screen.getByRole("img", { name: unlinked.caption });
    expect(picture.closest("a")).toBeNull();
    expect(container.querySelectorAll("a")).toHaveLength(0);
  });

  it("links only the paper when the paper has no journal", () => {
    const paperOnly = { ...SLIDES[0], journal: undefined };

    const { container } = render(<ScienceSection slides={[paperOnly]} />);

    expect(screen.getByRole("img", { name: paperOnly.caption }).closest("a")).toBe(
      linkTo(paperOnly.paperUrl),
    );
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(screen.queryByText(SLIDES[0].journal!.name)).toBeNull();
  });

  it("keeps the previous and next controls outside the paper link", () => {
    render(<ScienceSection />);
    const paper = linkTo(SLIDES[0].paperUrl);

    expect(paper).not.toContainElement(screen.getByRole("button", { name: "Previous slide" }));
    expect(paper).not.toContainElement(screen.getByRole("button", { name: "Next slide" }));
  });
});
