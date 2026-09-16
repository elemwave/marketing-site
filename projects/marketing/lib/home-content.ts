// Static content for the Elemwave marketing home page.
// Images live in public/images/ and are served by Next.js.

export const UPLOADS = "/images/";

const asset = (path: string): string => `${UPLOADS}${path}`;

export const HERO_IMAGES = {
  cad: asset("hero-a320-cad.webp"),
  solver: asset("hero-a320-solver.webp"),
  texture: asset("hero-a320-texture.webp"),
} as const;

export interface SoftwareTab {
  label: string;
  iconUrl: string;
  title: string;
  imageUrl: string;
  paragraphs: string[];
}

export const TABS: SoftwareTab[] = [
  {
    label: "Tulip",
    iconUrl: asset("tab-tulip.webp"),
    title: "TULIP",
    imageUrl: asset("tab-tulip.webp"),
    paragraphs: [
      "TULIP is one of Elemwave's flagship solver capabilities for advanced multiconductor transmission line modelling.",
      "It computes per-unit-length capacitance and inductance matrices for complex transmission line structures, providing the parameters needed for accurate FDTD-based EMC simulations.",
      "The workflow supports advanced geometries, dielectric materials, and CAD-based inputs, while keeping results ready for visual inspection in tools such as ParaView or VisIt.",
      "For engineers working with cable bundles, coupled conductors, or complex MTL structures, TULIP turns a difficult modelling step into a controlled, repeatable workflow.",
    ],
  },
  {
    label: "Boundaries",
    iconUrl: asset("tab-boundaries.webp"),
    title: "BOUNDARIES",
    imageUrl: asset("tab-boundaries.webp"),
    paragraphs: [
      "Boundary configuration is one of the foundations of a credible electromagnetic simulation.",
      "Elemwave allows electric and magnetic field boundaries to be configured separately, giving engineers the flexibility to reproduce different environmental behaviours in each direction.",
      "The workflow supports air interfaces, ground plates, reverberation scenarios, periodic conditions, and MUR conditions.",
      "Although boundary setup is not always the most visible part of a simulation, it is essential for building accurate, flexible, and physically meaningful electromagnetic models.",
    ],
  },
  {
    label: "Rectilinear Grid",
    iconUrl: asset("tab-rectilinear-grid.png"),
    title: "RECTILINEAR GRID",
    imageUrl: asset("tab-rectilinear-grid.png"),
    paragraphs: [
      "The rectilinear grid gives engineers finer control over mesh density, helping simulations focus computational effort where it matters most.",
      "Cell density can be increased around critical components, circuit boards, complex surfaces, and regions where geometric detail has a direct impact on the quality of the result.",
      "The goal is simple: improve precision without wasting resources across areas that do not need the same level of resolution.",
      "This capability is still under development, with the aim of giving users full control over the characteristics of this mesh type.",
    ],
  },
  {
    label: "Far Field Detectors",
    iconUrl: asset("tab-far-field-detectors.png"),
    title: "FAR FIELD DETECTORS",
    imageUrl: asset("tab-far-field-detectors.png"),
    paragraphs: [
      "Far field detectors give engineers a clear view of how structures radiate, scatter, and interact with electromagnetic energy.",
      "They provide full control for radar cross-section measurements and antenna-oriented studies, supporting 360-degree analysis and multi-signal measurement scenarios.",
      "The resulting visuals are easy to interpret and well suited to technical reviews, antenna studies, and presentation of simulation results.",
      "Whether the goal is to understand radiation behaviour or evaluate scattering around a structure, far field detectors make the result easier to analyse and communicate.",
    ],
  },
  {
    label: "Time Snapshots",
    iconUrl: asset("tab-time-snapshots.png"),
    title: "TIME SNAPSHOTS",
    imageUrl: asset("tab-time-snapshots.png"),
    paragraphs: [
      "Time snapshots turn simulation results into clear time-domain movies, helping engineers understand how fields and currents evolve across a structure.",
      "They are especially useful for analysing current transmission, transient behaviour, and propagation effects that are difficult to interpret from raw data alone.",
      "Instead of reading line after line of a .dat output file, users can watch the simulation unfold and identify the behaviour that matters.",
    ],
  },
  {
    label: "Frequency Slices",
    iconUrl: asset("tab-frequency-slices.png"),
    title: "FREQUENCY SLICES",
    imageUrl: asset("tab-frequency-slices.png"),
    paragraphs: [
      "Frequency slices help engineers see how electromagnetic behaviour changes across the spectrum.",
      "They process simulation data and generate snapshots across a defined frequency range, making it easier to identify which frequencies are emitted, detectable, or relevant to the behaviour of the system.",
      "This capability is essential for antenna emission analysis and EMC studies, where frequency behaviour can directly affect compliance, interference risk, and operational safety.",
      "For sectors such as telecommunications and aviation, frequency slices provide a clearer route from raw simulation data to practical engineering insight.",
    ],
  },
];

export interface ScienceLogo {
  src: string;
  width: number;
  height: number;
}

export interface ScienceSlide {
  logos: ScienceLogo[];
  imageUrl: string;
  caption: string;
}

const logo = (file: string, width: number, height: number): ScienceLogo => ({
  src: asset(file),
  width,
  height,
});

export const SLIDES: ScienceSlide[] = [
  {
    logos: [
      logo("logo-msca.webp", 590, 335),
      logo("logo-university-of-manchester.png", 768, 325),
      logo("logo-amasya-university.png", 500, 500),
      logo("logo-ugr.png", 2560, 2560),
    ],
    imageUrl: asset("publication-joint-research.webp"),
    caption: "FDTD Voxels-in-Cell Method With Debye Media",
  },
  {
    logos: [
      logo("logo-european-union.webp", 332, 219),
      logo("logo-airbus.png", 500, 500),
      logo("logo-ugr.png", 2560, 2560),
    ],
    imageUrl: asset("publication-aircraft-shielding-s-fdtd.webp"),
    caption: "Analysis of aircraft shieldings for lightning indirect effects by a novel S-FDTD",
  },
  {
    logos: [
      logo("logo-european-union.webp", 332, 219),
      logo("logo-university-of-manchester.png", 768, 325),
      logo("logo-msca.webp", 590, 335),
      logo("logo-amasya-university.png", 500, 500),
      logo("logo-ugr.png", 2560, 2560),
    ],
    imageUrl: asset(
      "publication-accelerating-finite-difference.webp",
    ),
    caption:
      "Accelerating Finite-Difference Time-Domain (FDTD) Solvers using Voxels-in-Cell Method",
  },
  {
    logos: [
      logo("logo-european-union.webp", 332, 219),
      logo("logo-airbus.png", 500, 500),
      logo("logo-ugr.png", 2560, 2560),
      logo("logo-uv.png", 500, 500),
      logo("logo-upc.png", 400, 319),
    ],
    imageUrl: asset("publication-siva-uav-emc.webp"),
    caption:
      "The SIVA UAV: a case study for the EMC analysis of composite air vehicles",
  },
  {
    logos: [
      logo("logo-politecnica-marche.png", 500, 500),
      logo("logo-uca.png", 420, 594),
      logo("logo-hartree-centre.png", 810, 308),
      logo("logo-ugr.png", 2560, 2560),
    ],
    imageUrl: asset("publication-parallel-fdtd-bioelectromagnetics.webp"),
    caption:
      "Performance of parallel FDTD method for shared- and distributed-memory architectures: Application to bioelectromagnetics",
  },
  {
    logos: [
      logo("logo-european-union.webp", 332, 219),
      logo("logo-aei.png", 1280, 665),
      logo("logo-wavecore.png", 400, 193),
      logo("logo-ugr.png", 2560, 2560),
      logo("logo-airbus.png", 500, 500),
    ],
    imageUrl: asset("publication-hie-s-fdtd.webp"),
    caption:
      "A HIE S-FDTD Method to Account for Geometrical and Material Uncertainties in Lossy Thin Panels",
  },
  {
    logos: [
      logo("logo-european-union.webp", 332, 219),
      logo("logo-airbus.png", 500, 500),
      logo("logo-ugr.png", 2560, 2560),
      logo("logo-york-university.webp", 620, 200),
      logo("logo-cost.webp", 291, 136),
    ],
    imageUrl: asset("publication-hybrid-crank-nicolson-subgridding.webp"),
    caption:
      "A Hybrid Crank-Nicolson FDTD Subgridding Boundary Condition for Lossy Thin-Layer Modeling",
  },
];
