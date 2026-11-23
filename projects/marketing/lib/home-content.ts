// Static content for the Elemwave marketing home page.
// Images live in public/images/ and are served by Next.js.

export const UPLOADS = "/images/";
const DOCUMENTS = "/documents/certifications/";

const asset = (path: string): string => `${UPLOADS}${path}`;
const certDocument = (path: string): string => `${DOCUMENTS}${path}`;

/** A run of paragraph text, or a named piece of software linking to its own site. */
export type TextSegment = string | { text: string; href: string };

/** A video file the site publishes for an item, and its own shape, `"<width> / <height>"`. */
export interface ItemVideo {
  src: string;
  aspectRatio: string;
}

export interface SoftwareTab {
  label: string;
  iconUrl: string;
  title: string;
  imageUrl: string;
  /** The picture's whole accessible name where it must say what the picture shows; absent, `<title> screenshot`. */
  pictureLabel?: string;
  /**
   * Elemwave's own recording or simulation, published with the site as a
   * muted, looping video and played in the picture area once the item is
   * chosen; `imageUrl` is then its still, shown until the video plays.
   */
  video?: ItemVideo;
  /** A plain string, or segments when part of the text is a link. */
  paragraphs: (string | TextSegment[])[];
}

const TULIP_URL = "https://github.com/opensemba/tulip";
const FDTD_URL = "https://github.com/opensemba/fdtd";
const DGTD_URL = "https://github.com/opensemba/dgtd";
const NGSPICE_URL = "https://github.com/opensemba/ngspice";
const OPENSEMBA_URL = "https://github.com/opensemba";
const FREECAD_URL = "https://www.freecad.org/";
const GMSH_URL = "https://gmsh.info/";

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

/** The "Our Solution" section description. */
export const SOFTWARE_DESCRIPTION: TextSegment[] = [
  "Elemwave gives you that answer before the first prototype: coupled 3D fields, cable harnesses and circuits, treated as the single system they are. Every method is published, peer-reviewed and implemented in open source — so how a number was obtained is something you can show, not something you have to trust.",
];

export const TABS: SoftwareTab[] = [
  {
    label: "The Workbench",
    iconUrl: asset("solution-ew-workbench.jpg"),
    title: "The Workbench",
    imageUrl: asset("solution-ew-workbench.jpg"),
    pictureLabel: "The Workbench video: Elemwave's own video of the workbench in use, defining an electromagnetic problem",
    video: { src: asset("solution-ew-workbench.mp4"), aspectRatio: "1280 / 686" },
    paragraphs: [
      [
        "Geometry, materials, sources, ports and meshing in one place, inside ",
        { text: "FreeCAD", href: FREECAD_URL },
        ". The Workbench is where an electromagnetic problem gets described — including cable bundles and the complex geometry around them — before any solver runs.",
      ],
      "Everything the solvers need comes from here, in a format they read directly.",
    ],
  },
  {
    label: "FDTD solver",
    iconUrl: asset("solution-fdtd-solver.png"),
    title: "FDTD solver",
    imageUrl: asset("solution-fdtd-solver.png"),
    pictureLabel: "FDTD solver screenshot: grid definition around an aircraft model in Elemwave's FreeCAD workbench",
    paragraphs: [
      "A time-domain solver written for EMC problems.",
      "Cable bundles branch and join, conductors carry their own resistance and inductance, and ngspice circuits close the network at every termination. Layered skins and thin slots are treated where they are, without meshing through them.",
      "No limit on cells, no limit on nodes: the same case runs on your machine or across a cluster. And it is the engine inside the Workbench, whether you drive it from there or run it standalone.",
      [
        "The solver itself is ",
        { text: "opensemba/fdtd", href: FDTD_URL },
        ", open source and maintained in the open.",
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
        "Some geometry cannot be meshed into cubes without lying about it — curved radomes, swept wings, tapering transitions. ",
        { text: "opensemba/dgtd", href: DGTD_URL },
        " solves the same equations on unstructured tetrahedral meshes, curved elements included, so the shape stays what it is.",
      ],
      "It handles what the geometry brings with it: dispersive media — Debye, Lorentz and Drude, down to collision profiles that model the atmosphere itself — and thin multilayer sheets through the same subcell treatment the FDTD solver uses.",
      "Time-domain like its sibling, so one run still covers the whole band. It scales through MPI and OpenMP, runs on CUDA when there is a GPU, and post-processes radar cross section offline over any sweep of frequencies and angles.",
    ],
  },
  {
    label: "Cable Solver",
    iconUrl: asset("solution-cable-solver.png"),
    title: "Cable Solver",
    imageUrl: asset("solution-cable-solver.png"),
    pictureLabel: "Cable Solver screenshot: electric field around a five-wire cable cross-section",
    paragraphs: [
      "A harness is not a lumped element. Its conductors are close enough to couple to each other, and long enough to carry fields in ways a circuit model cannot follow — which is why the Cable Solver treats each bundle as a multiconductor transmission line, coupled to the 3D field around it.",
      "Every conductor sees the field and feeds its own currents back into it. That bidirectional coupling is what makes crosstalk between conductors, field-to-cable coupling under a radiated threat and signal integrity along a harness all the same problem, solved at once.",
      [
        "The transmission-line engine is ",
        { text: "opensemba/tulip", href: TULIP_URL },
        ", which computes the per-unit-length capacitance and inductance matrices for networks of arbitrary complexity. Circuits described in SPICE close the network at every termination.",
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
    label: "Multilayer surface impedances",
    iconUrl: asset("solution-multilayer-surface-impedances.webp"),
    title: "Multilayer surface impedances",
    imageUrl: asset("solution-multilayer-surface-impedances.webp"),
    paragraphs: [
      "A carbon-fibre skin, a metallised coating, paint over metal: surfaces a few microns thick, in a model metres across. Meshing them would mean a grid far finer than the physics needs, so they are carried as a surface impedance instead — the layers decide how much field passes, and the grid stays where it was.",
      "That is what makes shielding effectiveness of composite panels, lightning current through a coated skin or HIRF coupling through a fuselage answerable without remeshing the whole platform.",
      "The method has been through peer review more than once, and it has been extended since: subgridding boundary conditions for lossy thin layers, and a formulation that carries geometrical and material uncertainties through the same thin panels, so the answer comes with its spread rather than as a single number.",
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
    label: "Open and auditable",
    iconUrl: asset("solution-transparent-and-open-heart.webp"),
    title: "Open and auditable",
    imageUrl: asset("solution-transparent-and-open-heart.webp"),
    paragraphs: [
      [
        "Elemwave is built on open-source tools — ",
        { text: "FreeCAD", href: FREECAD_URL },
        ", ",
        { text: "Gmsh", href: GMSH_URL },
        ", ",
        { text: "opensemba", href: OPENSEMBA_URL },
        " — and the parts that make them work together. What it adds on top is not a wrapper: it is a battery of tests the whole stack has to pass before it ships, and a set of methods that are published rather than proprietary.",
      ],
      "Nothing is hidden. What you see is what is simulated, down to the equations.",
      "And because the code is yours to read, you can put it under your own tests, extend it to your own problem, or hand it to your own tools — including the AI agents you already run.",
    ],
  },
  {
    label: "HPC",
    iconUrl: asset("solution-hpc.webp"),
    title: "HPC",
    imageUrl: asset("solution-hpc.webp"),
    paragraphs: [
      "The same case, on one core or across a cluster. Nothing in the model changes when you add nodes or threads, and there is no cap on either: the decomposition follows the problem, not a licence.",
      "Each build is compiled for the machine it will run on — flags tuned to that host's architecture, so the run goes as fast as the hardware allows. That only works because the source is open: with a binary you run what the vendor shipped, optimised for the average machine rather than yours.",
      "The solvers carry their own parallel back ends — MPI across nodes, OpenMP within each one, GPU offload where there is one. Problems this size stop being exceptions: we routinely run simulations with billions of cells, a full platform with every harness in it among them.",
    ],
  },
  {
    label: "SPICE coupling",
    iconUrl: asset("solution-spice-coupling.webp"),
    title: "SPICE coupling",
    imageUrl: asset("solution-spice-coupling.webp"),
    paragraphs: [
      "A termination is rarely a resistor. Filters, protection devices and nonlinear loads all behave differently depending on what reaches them, and a fixed impedance cannot follow that.",
      [
        "So the circuits are described in SPICE — whatever the model, however nonlinear — and solved by ",
        { text: "ngspice", href: NGSPICE_URL },
        ", step by step with the 3D field and the Cable Solver's transmission lines. Field and circuit act on each other at every time step, not one after the other.",
      ],
    ],
  },
  {
    label: "Material characterisation service",
    iconUrl: asset("solution-material-characterisation.webp"),
    title: "Material characterisation service",
    imageUrl: asset("solution-material-characterisation.webp"),
    paragraphs: [
      "A model of a composite fuselage or a shielded harness needs numbers that most datasheets do not give: how well a carbon-fibre laminate conducts, how much a panel shields, how much a cable's shield lets through.",
      "Elemwave measures them for you, as a service. We characterise the electromagnetic properties of carbon-fibre materials, measure the shielding effectiveness of materials and panels, and measure the transfer impedance of cable shields, on samples of your own.",
      "Measured values are what a simulation's materials and cables are described with, so your model can start from your own data rather than from assumed values.",
    ],
  },
];

/** The "The challenges" section description. */
export const PROBLEMS_DESCRIPTION =
  "Before a single drawing exists, you are already being asked what the system will emit, withstand and reflect. Getting those answers right is cheaper than discovering them later.";

/** The applications "The challenges" presents, ahead of the items of Our Solution that answer them. */
export const PROBLEMS: SoftwareTab[] = [
  {
    label: "Radiated emissions",
    iconUrl: asset("problem-radiated-emissions.jpg"),
    title: "Radiated emissions",
    imageUrl: asset("problem-radiated-emissions.jpg"),
    pictureLabel: "Radiated emissions video: Elemwave's own simulation of the field around a Vivaldi horn antenna",
    video: { src: asset("problem-radiated-emissions.mp4"), aspectRatio: "802 / 620" },
    paragraphs: [
      "Every harness and every surface radiates. Somewhere inside your platform, one cable or one opening is the reason a level crosses its limit — and finding which one after the prototype exists is expensive.",
      "You can find it before you build. Currents from each harness feed the 3D field solution, and multilayer surface impedances show how much escapes through composite or coated skins.",
      "The result is the installed emission level, against its limit, with the cable or opening responsible named.",
    ],
  },
  {
    label: "Radiated immunity",
    iconUrl: asset("problem-radiated-immunity.jpg"),
    title: "Radiated immunity",
    imageUrl: asset("problem-radiated-immunity.jpg"),
    pictureLabel: "Radiated immunity video: Elemwave's own simulation of currents induced on an aircraft by high-intensity radiated fields",
    video: { src: asset("problem-radiated-immunity.mp4"), aspectRatio: "1278 / 720" },
    paragraphs: [
      "Threat fields arrive from outside — lightning pulses, radar, high-intensity radiated fields — and the question is what reaches the equipment inside.",
      "The incident field couples into the structure, through the skin's shielding and into every harness, and the induced voltage at each connector is what decides whether the equipment survives.",
      "Multilayer surface impedances and conformal modelling keep that shielding realistic, and the Cable Solver carries the field inside down to the currents each harness carries.",
    ],
  },
  {
    label: "Conducted susceptibility",
    iconUrl: asset("problem-conducted-susceptibility.jpg"),
    title: "Conducted susceptibility",
    imageUrl: asset("problem-conducted-susceptibility.jpg"),
    pictureLabel: "Conducted susceptibility video: Elemwave's own simulation of currents on a cable run between two panels",
    video: { src: asset("problem-conducted-susceptibility.mp4"), aspectRatio: "1250 / 720" },
    paragraphs: [
      "A disturbance can enter through a power cable or a signal harness and reach one pin, one connector, or one piece of equipment — and what decides whether it is tolerated is how much of it arrives where it matters.",
      "The current spreads across every conductor of the bundle, supply and signal alike, and the disturbance that reaches each equipment pin is returned, conductor by conductor, whatever the source that put it there.",
      "Levels and injection points can be swept before anything is built, and the harness changed and re-run as many times as the design needs.",
    ],
  },
  {
    label: "Lightning",
    iconUrl: asset("problem-lightning.webp"),
    title: "Lightning",
    imageUrl: asset("problem-lightning.webp"),
    paragraphs: [
      "A strike enters at one attachment point and leaves at another, and everything in between carries part of it: structure, skins, and every cable run on the way.",
      "Two things come out of that. The direct effects — where the current goes and what it does on its path — and the indirect ones, the transients induced on cables and equipment, read at each connector.",
      "Multilayer surface impedances and conformal modelling carry the current through composite and coated skins as they really are, and the Cable Solver turns the field inside into the transient each harness carries.",
    ],
  },
  {
    label: "Radar cross section",
    iconUrl: asset("problem-radar-cross-section.png"),
    title: "Radar cross section",
    imageUrl: asset("problem-radar-cross-section.png"),
    pictureLabel: "Radar cross section screenshot: far-field detectors arranged around an aircraft model",
    paragraphs: [
      "Radar cross section answers a narrow question: how much of an incident wave comes back, and from where. Over a band of frequencies and angles, one geometry can behave very differently from the next.",
      "Time-domain runs give the whole band at once. Unstructured meshes follow curved geometry, conformal modelling keeps surfaces true on a regular grid, and the result is the signature across angles, not a single number.",
      "Shaping, coatings and openings can then be compared before anything is built or measured — so you know which surface is doing the scattering.",
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
