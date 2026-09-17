import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TEAM_INTRO, TEAM_MEMBERS } from "@/lib/team-content";
import { TeamSection } from "./TeamSection";

describe("the team section", () => {
  it("renders the team introduction and every supplied staff card", () => {
    render(<TeamSection />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "The people behind Elemwave",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(TEAM_INTRO.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(TEAM_INTRO.body)).toBeInTheDocument();

    for (const member of TEAM_MEMBERS) {
      const card = screen.getByRole("article", { name: member.name });

      expect(
        within(card).getByRole("heading", { level: 2, name: member.name }),
      ).toBeInTheDocument();
      expect(within(card).getByText(member.role)).toBeInTheDocument();
      expect(within(card).getByText(member.summary)).toBeInTheDocument();
      expect(
        within(card).getByRole("img", { name: member.portraitAlt }),
      ).toBeInTheDocument();
    }
  });
});
