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

  it("shows the supplied introduction and keeps the heading and label", () => {
    render(<TeamSection />);

    expect(screen.getByText("Our team")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "The people behind Elemwave",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "We're a small team of engineers and researchers based in Granada, Spain, specialising in computational electromagnetics, EMC and RF. The methods inside Elemwave aren't licensed from a vendor: we developed them, published them in peer-reviewed journals, and built the software around them. When you ask us a technical question, you're talking to the authors.",
      ),
    ).toBeInTheDocument();
  });

  const REVISED_BIOGRAPHIES: readonly [string, string][] = [
    [
      "Salvador G. García",
      "Full Professor of Electromagnetism at the University of Granada, with a Ph.D. in physics earned with extraordinary distinction (Premio Extraordinario). He has published over 90 refereed articles and led national and international projects in computational electromagnetics, EMC, RCS and antenna design.",
    ],
    [
      "Luis D. Angulo",
      "Associate Professor at the University of Granada and physicist with a Ph.D. in time-domain discontinuous Galerkin methods. He is a lead developer of the open-source, time-domain simulation tool Semba, built for electromagnetic-compatibility problems, and works on the methods behind Elemwave's DGTD, FDTD and meshing solvers.",
    ],
    [
      "José Díaz",
      "Entrepreneur with an MSc in Computer Science from the University of London, and founder of three previous startups (Aircury, Smartgrade and Carousel Learning). He runs the business side of Elemwave, so the researchers can stay on the research.",
    ],
    [
      "Adrián Arce",
      "Adrián holds a degree in Physics from the University of Granada and a Master's degree in Big Data. He leads the software development team at Elemwave, where he combines his physics background with data-processing skills to build electromagnetic simulation tools.",
    ],
    [
      "Carlos González",
      "Software developer with a background in video-game development and deep expertise in C++ and Python. He leads geometry meshing at Elemwave, where the 3D-geometry instincts from game development pay off directly.",
    ],
  ];

  it("shows the supplied biography of each revised entry", () => {
    render(<TeamSection />);

    for (const [name, biography] of REVISED_BIOGRAPHIES) {
      const card = screen.getByRole("article", { name });

      expect(within(card).getByText(biography)).toBeInTheDocument();
    }
  });

  it("keeps the biographies of Amelia Rubio Bretones and Rafael Gómez Martín", () => {
    render(<TeamSection />);

    for (const [name, biography] of [
      [
        "Amelia Rubio Bretones",
        "Full Professor of Electromagnetism at the University of Granada since 2000. Her research covers numerical analysis of radiation and propagation with applications in antennas, radar and EMC, including long-term stays at Delft, Eindhoven and Penn State. Recipient of the URSI Young Scientists award (1993, 1995).",
      ],
      [
        "Rafael Gómez Martín",
        "Emeritus Professor at the University of Granada and former head of its Electromagnetic Group (1985–2001). He has coordinated numerous applied electromagnetics projects on wave propagation, ground penetrating radar, antennas and EMC, and is the author of two books and many peer-reviewed articles.",
      ],
    ]) {
      const card = screen.getByRole("article", { name });

      expect(within(card).getByText(biography)).toBeInTheDocument();
    }
  });

  it("leaves none of the first draft's wording on the page", () => {
    const { container } = render(<TeamSection />);

    for (const wording of [
      "Together we combine",
      "SCRUM Master",
      "talks on computational electromagnetics",
      "extraordinary award)",
    ]) {
      expect(container.textContent).not.toContain(wording);
    }
  });
});
