export interface TeamMember {
  name: string;
  role: string;
  portrait: `/images/staff/${string}.webp`;
  portraitAlt: string;
  summary: string;
}

export const TEAM_INTRO = {
  eyebrow: "Our team",
  heading: "The people behind Elemwave",
  body:
    "We're a small team of physicists and engineers in Granada. We write the solvers, publish the methods and support the teams that use them. Nothing inside Elemwave is licensed from a vendor: the physics is ours, the code is open, and when you ask a technical question you are talking to someone who writes it.",
} as const;

export const TEAM_MEMBERS: readonly TeamMember[] = [
  {
    name: "Salvador G. García",
    role: "Full Professor, University of Granada",
    portrait: "/images/staff/salvador_garcia.webp",
    portraitAlt: "Salvador G. García",
    summary:
      "Full Professor of Electromagnetism at the University of Granada, with a Ph.D. in physics earned with extraordinary distinction (Premio Extraordinario). He has published over 90 refereed articles and led national and international projects in computational electromagnetics, EMC, RCS and antenna design.",
  },
  {
    name: "Luis D. Angulo",
    role: "Tenured Professor, University of Granada",
    portrait: "/images/staff/luis_angulo.webp",
    portraitAlt: "Luis D. Angulo",
    summary:
      "Physicist whose doctoral work on time-domain discontinuous Galerkin methods received the University of Granada's Extraordinary Doctorate Award. He leads the development of OpenSEMBA — the open-source solver family behind Elemwave's FDTD, DGTD and meshing tools — and his work on in-cell bundle parameters and multilayer surface conditions underpins the Cable Solver and the multilayer capabilities.",
  },
  {
    name: "José Díaz",
    role: "Software & Business",
    portrait: "/images/staff/jose_diaz.webp",
    portraitAlt: "José Díaz",
    summary:
      "Entrepreneur with an MSc in Computer Science from the University of London, and founder of three previous startups (Aircury, Smartgrade and Carousel Learning). He runs the business side of Elemwave, so the engineering team can focus on the physics.",
  },
  {
    name: "Amelia Rubio Bretones",
    role: "Full Professor, University of Granada",
    portrait: "/images/staff/amelia_rubio.webp",
    portraitAlt: "Amelia Rubio Bretones",
    summary:
      "Full Professor of Electromagnetism at the University of Granada since 2000. Her research covers numerical analysis of radiation and propagation with applications in antennas, radar and EMC, including long-term stays at Delft, Eindhoven and Penn State. Recipient of the URSI Young Scientists award (1993, 1995).",
  },
  {
    name: "Rafael Gómez Martín",
    role: "Emeritus Professor, University of Granada",
    portrait: "/images/staff/rafael_gomez.webp",
    portraitAlt: "Rafael Gómez Martín",
    summary:
      "Emeritus Professor at the University of Granada and former head of its Electromagnetic Group (1985–2001). He has coordinated numerous applied electromagnetics projects on wave propagation, ground penetrating radar, antennas and EMC, and is the author of two books and many peer-reviewed articles.",
  },
  {
    name: "Adrián Arce",
    role: "Team Leader – Software Development",
    portrait: "/images/staff/adrian_arce.webp",
    portraitAlt: "Adrián Arce",
    summary:
      "Adrián holds a degree in Physics from the University of Granada and a Master's degree in Big Data. He leads the software development team at Elemwave, where he combines his physics background with data-processing skills to build electromagnetic simulation tools.",
  },
  {
    name: "Carlos González",
    role: "Software Developer",
    portrait: "/images/staff/carlos_gonzalez.webp",
    portraitAlt: "Carlos González",
    summary:
      "Software developer with a background in video-game development and deep expertise in C++ and Python. He leads geometry meshing at Elemwave, where the 3D-geometry instincts from game development pay off directly.",
  },
];
