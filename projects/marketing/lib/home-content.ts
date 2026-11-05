// Static content for the Elemwave marketing home page.
// Images live in public/images/ and are served by Next.js.

export const UPLOADS = "/images/";
const DOCUMENTS = "/documents/certifications/";

const asset = (path: string): string => `${UPLOADS}${path}`;
const certDocument = (path: string): string => `${DOCUMENTS}${path}`;

export const HERO_IMAGES = {
  cad: asset("hero-a320-cad.webp"),
  solver: asset("hero-a320-solver.webp"),
  texture: asset("hero-a320-texture.webp"),
} as const;

/** A run of paragraph text, or a named piece of software linking to its own site. */
export type TextSegment = string | { text: string; href: string };

export interface SoftwareTab {
  label: string;
  iconUrl: string;
  title: string;
  imageUrl: string;
  /** A plain string, or segments when part of the text is a link. */
  paragraphs: (string | TextSegment[])[];
}

const TULIP_URL = "https://github.com/opensemba/tulip";
const PARAVIEW_URL = "https://www.paraview.org/";
const FDTD_URL = "https://github.com/opensemba/fdtd";
const DGTD_URL = "https://github.com/opensemba/dgtd";
const TESSELLATOR_URL = "https://github.com/opensemba/tessellator";
const NGSPICE_URL = "https://github.com/opensemba/ngspice";
const OPENSEMBA_URL = "https://github.com/opensemba";
const FREECAD_URL = "https://www.freecad.org/";
const GMSH_URL = "https://gmsh.info/";
const GID_URL = "https://www.gidsimulation.com/";

/** A paper's DOI resolved to its publisher page. */
const doiUrl = (doi: string): string => `https://doi.org/${doi}`;

/** A team paper, linked by its title to its DOI address. */
const paper = (title: string, doi: string): TextSegment => ({
  text: title,
  href: doiUrl(doi),
});

/** The closing paragraph of a capability: two of the team's peer-reviewed papers on it, each with its venue and year. */
const papers = (
  first: [TextSegment, string],
  second: [TextSegment, string],
): TextSegment[] => [
  "Peer-reviewed by the scientific community: ",
  first[0],
  ` (${first[1]}) and `,
  second[0],
  ` (${second[1]}).`,
];

/** The "Our Solution" section description, linking the FDTD engine it builds on. */
export const SOFTWARE_DESCRIPTION: TextSegment[] = [
  "Electromagnetic-compatibility simulation built on open-source FDTD and DGTD solvers, multilayer surface impedances, multiconductor cables and conformal modelling. Elemwave builds on the open-source FDTD engine ",
  { text: "opensemba/fdtd", href: FDTD_URL },
  ", and is designed for researchers who require accurate, scalable, and computationally efficient electromagnetic simulations. Elemwave is committed to transparency: its methods are open source and validated through peer review by the scientific community.",
];

export const TABS: SoftwareTab[] = [
  {
    label: "Multilayer surface impedances",
    iconUrl: asset("solution-multilayer-surface-impedances.webp"),
    title: "Multilayer surface impedances",
    imageUrl: asset("solution-multilayer-surface-impedances.webp"),
    paragraphs: [
      "Thin surfaces made of several layers — carbon-fibre skins, metallised coatings, paint over metal — each with its own thickness and electrical properties, are represented as a surface impedance rather than meshed through their thickness.",
      "The grid stays as coarse as the geometry allows, while the layered material still decides how much field passes through the surface.",
      "This serves shielding effectiveness studies of composite and coated panels, lightning and high-intensity radiated field coupling through aircraft and vehicle skins, and radiated immunity assessments of whole platforms.",
      papers(
        [
          paper(
            "A Hybrid Crank–Nicolson FDTD Subgridding Boundary Condition for Lossy Thin-Layer Modeling",
            "10.1109/TMTT.2016.2637348",
          ),
          "IEEE Transactions on Microwave Theory and Techniques, 2017",
        ],
        [
          paper(
            "A HIE S-FDTD Method to Account for Geometrical and Material Uncertainties in Lossy Thin Panels",
            "10.1109/TAP.2024.3484673",
          ),
          "IEEE Transactions on Antennas and Propagation, 2024",
        ],
      ),
    ],
  },
  {
    label: "Cable Solver",
    iconUrl: asset("solution-cable-solver.webp"),
    title: "Cable Solver",
    imageUrl: asset("solution-cable-solver.webp"),
    paragraphs: [
      [
        "Built on ",
        { text: "opensemba/fdtd", href: FDTD_URL },
        ", the Cable Solver models cable bundles as multiconductor transmission lines (MTL) coupled to the 3D field simulation, so that every conductor in a harness sees the fields around it and feeds its own currents back into them.",
      ],
      [
        "It combines 3D simulation with an MTL solver and SPICE, for advanced multiconductor transmission line modelling. Its transmission line engine is ",
        { text: "opensemba/tulip", href: TULIP_URL },
        ".",
      ],
      [
        "It computes per-unit-length capacitance and inductance matrices for complex MTL networks, providing the parameters needed for accurate FDTD-based EMC simulations.",
      ],
      [
        "Results stay ready for visual inspection in tools such as ",
        { text: "ParaView", href: PARAVIEW_URL },
        ", whether the question is crosstalk between conductors, field-to-cable coupling under radiated threats, signal integrity along the harness or a conducted susceptibility test.",
      ],
      papers(
        [
          paper(
            "Numerical Computation of Unshielded Multiwires In-Cell Parameters for Coupling Between FDTD and MTL Methods Using Multipolar Expansions",
            "10.1109/TEMC.2026.3713195",
          ),
          "IEEE Transactions on Electromagnetic Compatibility, 2026",
        ],
        [
          paper(
            "Hybridization of full-wave FDTD solver with a Multilevel Multiconductor Transmission Line solver with ngspice Interconnections",
            "10.1109/EMCEurope61644.2025.11176342",
          ),
          "EMC Europe, 2025",
        ],
      ),
    ],
  },
  {
    label: "Conformal modelling",
    iconUrl: asset("solution-conformal-modelling.webp"),
    title: "Conformal modelling",
    imageUrl: asset("solution-conformal-modelling.webp"),
    paragraphs: [
      "Curved and slanted surfaces are represented conformally within the regular grid, so that a fuselage or a radome follows its true shape, avoiding the staircase error of a purely cubic mesh.",
      "The conformal treatment extends to surface impedances: curved multilayer skins are represented conformally too, keeping their material behaviour where the geometry bends.",
      "Surface accuracy matters most on curved aircraft and vehicle skins, around apertures and seams, and for the resonances that decide how fields build up inside enclosures.",
      papers(
        [
          paper("A New Efficient and Stable 3D Conformal FDTD", "10.1109/LMWC.2016.2588579"),
          "IEEE Microwave and Wireless Components Letters, 2016",
        ],
        [
          paper("A New Conformal FDTD for Lossy Thin Panels", "10.1109/TAP.2019.2930107"),
          "IEEE Transactions on Antennas and Propagation, 2019",
        ],
      ),
    ],
  },
  {
    label: "Transparent and open heart",
    iconUrl: asset("solution-transparent-and-open-heart.webp"),
    title: "Transparent and open heart",
    imageUrl: asset("solution-transparent-and-open-heart.webp"),
    paragraphs: [
      [
        "Elemwave orchestrates and fills the gaps of a collection of open-source tools — ",
        { text: "FreeCAD", href: FREECAD_URL },
        ", ",
        { text: "Gmsh", href: GMSH_URL },
        ", ",
        { text: "opensemba", href: OPENSEMBA_URL },
        " and more — and endows everything with a proprietary battery of tests that guarantees performance and robustness.",
      ],
      "Nothing is hidden: what you see is what is simulated.",
      "Every method stands on a strong foundation on peer-reviewed journals.",
      "Being open also lets your LLMs and AI agents fine-tune the algorithms to your specific needs. Nobody else offers this approach.",
    ],
  },
  {
    label: "HPC",
    iconUrl: asset("solution-hpc.webp"),
    title: "HPC",
    imageUrl: asset("solution-hpc.webp"),
    paragraphs: [
      "High-performance computing: define a simulation once and run it on as many nodes as you want.",
      "Each build is compiled specifically for your machine, to get the most out of your hardware.",
      "We routinely run simulations with billions of cells.",
    ],
  },
  {
    label: "SPICE coupling",
    iconUrl: asset("solution-spice-coupling.webp"),
    title: "SPICE coupling",
    imageUrl: asset("solution-spice-coupling.webp"),
    paragraphs: [
      "Circuits described in SPICE — terminations, filters, protection devices and nonlinear loads — are coupled to the field simulation where cables and ports end, so that the fields and the circuits act on each other as the simulation runs.",
      [
        "The circuits are solved by ",
        { text: "ngspice", href: NGSPICE_URL },
        ", step by step with the 3D field and the Cable Solver's transmission lines.",
      ],
    ],
  },
  {
    label: "FDTD solver",
    iconUrl: asset("solution-fdtd-solver.webp"),
    title: "FDTD solver",
    imageUrl: asset("solution-fdtd-solver.webp"),
    paragraphs: [
      [
        { text: "opensemba/fdtd", href: FDTD_URL },
        " is a finite-difference time-domain solver with a special focus on electromagnetic compatibility problems.",
      ],
      "A single time-domain run covers a whole band of frequencies, on regular and graded grids that the surface impedance, cable and conformal models build on.",
      [
        "It runs standalone or from a ",
        { text: "FreeCAD", href: FREECAD_URL },
        " workbench.",
      ],
    ],
  },
  {
    label: "DGTD solver",
    iconUrl: asset("solution-dgtd-solver.webp"),
    title: "DGTD solver",
    imageUrl: asset("solution-dgtd-solver.webp"),
    paragraphs: [
      [
        "From ",
        { text: "opensemba", href: OPENSEMBA_URL },
        ", ",
        { text: "opensemba/dgtd", href: DGTD_URL },
        " solves Maxwell's curl equations with discontinuous Galerkin time-domain methods.",
      ],
      "It works on unstructured meshes that follow curved geometry closely, for problems where the shape matters more than a regular grid can show.",
    ],
  },
  {
    label: "Tessellator Mesher",
    iconUrl: asset("solution-tessellator.webp"),
    title: "Tessellator Mesher",
    imageUrl: asset("solution-tessellator.webp"),
    paragraphs: [
      [
        { text: "opensemba/tessellator", href: TESSELLATOR_URL },
        " is the staircasing engine of ",
        { text: "GiD", href: GID_URL },
        ".",
      ],
      "It turns lines, surfaces and volumes into the staircased and conformal meshes the FDTD solver needs, on uniform or graded rectilinear grids, and resolves where different layers meet by a set hierarchy.",
    ],
  },
];

/** The "The challenges" section description. */
export const PROBLEMS_DESCRIPTION =
  "The electromagnetic questions a platform has to answer before it is certified: what it emits, what it withstands and what it reflects. Each is answered with the items of Our Solution below.";

/** An application of "The challenges", with the labels of the Our Solution items that answer it. */
export interface ProblemTab extends SoftwareTab {
  /** Labels of `TABS` items, as the application's own text names them. */
  solutions: string[];
}

/** The applications "The challenges" presents, ahead of the items of Our Solution that answer them. */
export const PROBLEMS: ProblemTab[] = [
  {
    label: "Radiated emissions",
    solutions: ["Cable Solver", "Multilayer surface impedances"],
    iconUrl: asset("problem-radiated-emissions.webp"),
    title: "Radiated emissions",
    imageUrl: asset("problem-radiated-emissions.webp"),
    paragraphs: [
      "Radiated emissions are predicted by computing the fields that cables, equipment and structures radiate, anywhere around a whole platform.",
      "The Cable Solver carries the currents of each harness into the 3D simulation, and multilayer surface impedances set how much of that radiation escapes through composite or coated skins.",
      "Installed emission levels can be compared with their limits before a prototype exists, together with the cable or opening responsible.",
    ],
  },
  {
    label: "Radiated immunity",
    solutions: ["Multilayer surface impedances", "Conformal modelling", "Cable Solver"],
    iconUrl: asset("problem-radiated-immunity.webp"),
    title: "Radiated immunity",
    imageUrl: asset("problem-radiated-immunity.webp"),
    paragraphs: [
      "Radiated immunity is assessed by simulating external threat fields coupling into the platform, its equipment and its cables.",
      "Electromagnetic pulse (EMP) and high-intensity radiated fields (HIRF) are applied as incident threats, and the induced voltages and currents are read where the equipment connects.",
      "Multilayer surface impedances and conformal modelling keep the skin's shielding realistic, and the Cable Solver turns the field inside into the currents each harness carries.",
    ],
  },
  {
    label: "Conducted susceptibility",
    solutions: ["Cable Solver"],
    iconUrl: asset("problem-conducted-susceptibility.webp"),
    title: "Conducted susceptibility",
    imageUrl: asset("problem-conducted-susceptibility.webp"),
    paragraphs: [
      "Conducted susceptibility is assessed by simulating disturbances injected onto cable bundles, as bulk current injection (BCI) tests do.",
      "The Cable Solver spreads the injected current across every conductor of the bundle and returns the disturbance that reaches each equipment pin.",
      "Test levels and injection points can be explored in simulation before the bench test, and repeated as the harness design changes.",
    ],
  },
  {
    label: "Lightning",
    solutions: ["Multilayer surface impedances", "Conformal modelling", "Cable Solver"],
    iconUrl: asset("problem-lightning.webp"),
    title: "Lightning",
    imageUrl: asset("problem-lightning.webp"),
    paragraphs: [
      "A lightning strike is simulated from where it attaches to the platform to where it leaves, with the current spreading through the structure along every path it can take.",
      "The transients it induces on cables and equipment are read at each connector, for both the direct effects on the structure and the indirect effects inside it.",
      "Multilayer surface impedances and conformal modelling carry the current through composite and coated skins as they really are, and the Cable Solver turns the field inside into the transient each harness carries.",
    ],
  },
  {
    label: "Radar cross section",
    solutions: ["FDTD solver", "DGTD solver", "Conformal modelling"],
    iconUrl: asset("problem-radar-cross-section.webp"),
    title: "Radar cross section",
    imageUrl: asset("problem-radar-cross-section.webp"),
    paragraphs: [
      "The field a platform scatters back under an incident wave is computed around it, giving its radar cross section over a band of frequencies and angles from time-domain runs.",
      "The FDTD solver covers the whole band in one run, the DGTD solver follows curved geometry on unstructured meshes, and conformal modelling keeps surfaces true on the regular grid.",
      "Shaping, coatings and openings can be compared in simulation before anything is built or measured.",
    ],
  },
];

export interface ScienceLogo {
  src: string;
  width: number;
  height: number;
}

export interface ScienceJournal {
  name: string;
  url: string;
}

export interface ScienceSlide {
  logos: ScienceLogo[];
  imageUrl: string;
  caption: string;
  /** The paper's own publication page; absent when none was confirmed. */
  paperUrl?: string;
  /** The journal the paper appeared in; absent when none was confirmed. */
  journal?: ScienceJournal;
}

const TAP: ScienceJournal = {
  name: "IEEE Transactions on Antennas and Propagation",
  url: "https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=8",
};
const TEMC: ScienceJournal = {
  name: "IEEE Transactions on Electromagnetic Compatibility",
  url: "https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=15",
};
const TMTT: ScienceJournal = {
  name: "IEEE Transactions on Microwave Theory and Techniques",
  url: "https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=22",
};
const PLOS_ONE: ScienceJournal = {
  name: "PLOS One",
  url: "https://journals.plos.org/plosone/",
};

const logo = (file: string, width: number, height: number): ScienceLogo => ({
  src: asset(file),
  width,
  height,
});

export const SLIDES: ScienceSlide[] = [
  {
    logos: [
      logo("logo-university-of-manchester.png", 530, 224),
      logo("logo-amasya-university.png", 410, 410),
      logo("logo-ugr.png", 410, 410),
    ],
    imageUrl: asset("publication-joint-research.webp"),
    caption: "FDTD Voxels-in-Cell Method With Debye Media",
    paperUrl: doiUrl("10.1109/TAP.2024.3378847"),
    journal: TAP,
  },
  {
    logos: [
      logo("logo-airbus.png", 410, 410),
      logo("logo-ugr.png", 410, 410),
    ],
    imageUrl: asset("publication-aircraft-shielding-s-fdtd.webp"),
    caption: "Analysis of aircraft shieldings for lightning indirect effects by a novel S-FDTD",
    paperUrl: doiUrl("10.1109/EMCEurope57790.2023.10274208"),
  },
  {
    logos: [
      logo("logo-university-of-manchester.png", 530, 224),
      logo("logo-amasya-university.png", 410, 410),
      logo("logo-ugr.png", 410, 410),
    ],
    imageUrl: asset(
      "publication-accelerating-finite-difference.webp",
    ),
    caption:
      "Accelerating Finite-Difference Time-Domain (FDTD) Solvers using Voxels-in-Cell Method",
    paperUrl: doiUrl("10.1109/AP-S/INC-USNC-URSI52054.2024.10687154"),
  },
  {
    logos: [
      logo("logo-airbus.png", 410, 410),
      logo("logo-ugr.png", 410, 410),
      logo("logo-uv.png", 410, 410),
      logo("logo-upc.png", 400, 319),
    ],
    imageUrl: asset("publication-siva-uav-emc.webp"),
    caption:
      "The SIVA UAV: a case study for the EMC analysis of composite air vehicles",
    paperUrl: doiUrl("10.1109/TEMC.2017.2648507"),
    journal: TEMC,
  },
  {
    logos: [
      logo("logo-politecnica-marche.png", 410, 410),
      logo("logo-uca.png", 290, 410),
      logo("logo-hartree-centre.png", 530, 202),
      logo("logo-ugr.png", 410, 410),
    ],
    imageUrl: asset("publication-parallel-fdtd-bioelectromagnetics.webp"),
    caption:
      "Performance of parallel FDTD method for shared- and distributed-memory architectures: Application to bioelectromagnetics",
    paperUrl: doiUrl("10.1371/journal.pone.0238115"),
    journal: PLOS_ONE,
  },
  {
    logos: [
      logo("logo-wavecore.png", 400, 193),
      logo("logo-ugr.png", 410, 410),
      logo("logo-airbus.png", 410, 410),
    ],
    imageUrl: asset("publication-hie-s-fdtd.webp"),
    caption:
      "A HIE S-FDTD Method to Account for Geometrical and Material Uncertainties in Lossy Thin Panels",
    paperUrl: doiUrl("10.1109/TAP.2024.3484673"),
    journal: TAP,
  },
  {
    logos: [
      logo("logo-airbus.png", 410, 410),
      logo("logo-ugr.png", 410, 410),
      logo("logo-york-university.webp", 530, 171),
    ],
    imageUrl: asset("publication-hybrid-crank-nicolson-subgridding.webp"),
    caption:
      "A Hybrid Crank-Nicolson FDTD Subgridding Boundary Condition for Lossy Thin-Layer Modeling",
    paperUrl: doiUrl("10.1109/TMTT.2016.2637348"),
    journal: TMTT,
  },
  {
    logos: [
      logo("logo-airbus.png", 410, 410),
      logo("logo-ugr.png", 410, 410),
      logo("logo-elemwave-affiliation.png", 530, 185),
    ],
    imageUrl: asset("publication-hv-bonding-network.webp"),
    caption:
      "Design of a High-Voltage Bonding Network for a Hybrid Electric Aircraft",
    paperUrl: doiUrl("10.1109/EMCEurope65281.2026.11732955"),
  },
  {
    logos: [
      logo("logo-ugr.png", 410, 410),
      logo("logo-upc.png", 400, 319),
      logo("logo-airbus.png", 410, 410),
    ],
    imageUrl: asset("publication-nonlinear-effects-esn-mockup.webp"),
    caption:
      "A Study of Nonlinear Effects on an Aircraft Electrical-Structure Network Mockup",
    paperUrl: doiUrl("10.1109/EMCEurope65281.2026.11732924"),
  },
  {
    logos: [
      logo("logo-ugr.png", 410, 410),
      logo("logo-nlr.png", 530, 321),
    ],
    imageUrl: asset("publication-multiwire-in-cell-parameters.webp"),
    caption:
      "Numerical Computation of Unshielded Multiwires In-Cell Parameters for Coupling Between FDTD and MTL Methods Using Multipolar Expansions",
    paperUrl: doiUrl("10.1109/TEMC.2026.3713195"),
    journal: TEMC,
  },
];

export interface Certification {
  name: string;
  subtitle: string;
  body: string;
  sealSrc: string;
  certificateUrl: string;
  annexUrl: string;
}

const IQNET_SEAL = asset("seal-iqnet.svg");
const IQNET_BODY = "Certified by IQNet, 2026.";

export const CERTIFICATIONS: Certification[] = [
  {
    name: "ISO 9001:2015",
    subtitle: "Quality Management System",
    body: IQNET_BODY,
    sealSrc: IQNET_SEAL,
    certificateUrl: certDocument("IQNetES-0405-2026_2026-09-17.pdf"),
    annexUrl: certDocument("AnexoDirecIQNetES-0405-2026_2026-09-17.pdf"),
  },
  {
    name: "ISO 14001:2015",
    subtitle: "Environmental Management System",
    body: IQNET_BODY,
    sealSrc: IQNET_SEAL,
    certificateUrl: certDocument("IQNetES-2026-0206_2026-09-17.pdf"),
    annexUrl: certDocument("AnexoDirecIQNetES-2026-0206_2026-09-17.pdf"),
  },
  {
    name: "ISO/IEC 27001:2022",
    subtitle: "Information Security Management System",
    body: IQNET_BODY,
    sealSrc: IQNET_SEAL,
    certificateUrl: certDocument("IQNetES-SI-0112-2026_2026-06-23.pdf"),
    annexUrl: certDocument("AnexoDirecIQNetES-SI-0112-2026_2026-06-23.pdf"),
  },
];
