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
      ).toHaveClass("object-cover", "object-top");
      expect(
        within(card).getByRole("img", { name: member.portraitAlt }).parentElement,
      ).toHaveClass("aspect-[4/5]");
    }
  });

  const MEMBER_NAMES = [
    "Salvador G. García",
    "Luis D. Angulo",
    "José Díaz",
    "Amelia Rubio Bretones",
    "Rafael Gómez Martín",
    "Adrián Arce",
    "Carlos González",
  ];

  it("lists the seven members in order with their roles", () => {
    expect(
      TEAM_MEMBERS.map((member) => [member.name, member.role]),
    ).toEqual([
      [MEMBER_NAMES[0], "Full Professor, University of Granada"],
      [MEMBER_NAMES[1], "Associate Professor, University of Granada"],
      [MEMBER_NAMES[2], "Software & Business"],
      [MEMBER_NAMES[3], "Full Professor, University of Granada"],
      [MEMBER_NAMES[4], "Emeritus Professor, University of Granada"],
      [MEMBER_NAMES[5], "Team Leader – Software Development"],
      [MEMBER_NAMES[6], "Software Developer"],
    ]);
  });

  it("names each portrait after the name its card shows", () => {
    render(<TeamSection />);

    for (const name of MEMBER_NAMES) {
      const card = screen.getByRole("article", { name });

      expect(within(card).getByRole("img", { name })).toBeInTheDocument();
    }
  });
});
