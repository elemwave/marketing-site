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
    "We're a small team of engineers and researchers based in Granada, Spain, specialising in computational electromagnetics, EMC and RF. The methods inside Elemwave aren't licensed from a vendor: we developed them, published them in peer-reviewed journals, and built the software around them. When you ask us a technical question, you're talking to the authors.",
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
    role: "Associate Professor, University of Granada",
    portrait: "/images/staff/luis_angulo.webp",
    portraitAlt: "Luis D. Angulo",
    summary:
      "Associate Professor at the University of Granada and physicist with a Ph.D. in time-domain discontinuous Galerkin methods. He is a lead developer of the open-source, time-domain simulation tool Semba, built for electromagnetic-compatibility problems, and works on the methods behind Elemwave's DGTD, FDTD and meshing solvers.",
  },
  {
    name: "José Díaz",
    role: "Software & Business",
    portrait: "/images/staff/jose_diaz.webp",
    portraitAlt: "José Díaz",
    summary:
      "Entrepreneur with an MSc in Computer Science from the University of London, and founder of three previous startups (Aircury, Smartgrade and Carousel Learning). He runs the business side of Elemwave, so the researchers can stay on the research.",
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
