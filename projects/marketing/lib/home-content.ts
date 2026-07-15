// Static content for the Elemwave marketing home page.
// Images live in public/images/ and are served by Next.js.

import logoElemwave from "@/public/images/logo-elemwave.png";

export const UPLOADS = "/images/";

const asset = (path: string): string => `${UPLOADS}${path}`;

export const LOGO = logoElemwave;

export const HERO_IMAGES = {
  cad: asset("hero-a320-cad.png"),
  solver: asset("hero-a320-solver.png"),
  texture: asset("hero-a320-texture.png"),
} as const;

export interface SoftwareTab {
  label: string;
  iconUrl: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  bullets: string[];
}

export const TABS: SoftwareTab[] = [
  {
    label: "Tulip",
    iconUrl: asset("tab-tulip.png"),
    title: "TULIP",
    subtitle:
      "Transmission line unit length conductors and in-cell parameters",
    imageUrl: asset("tab-tulip.png"),
    bullets: [
      "Calculation of p.u.l C and L matrices.",
      "Third order isoparametric elements.",
      "Support for dielectric materials.",
      "Open boundary conditions.",
      "Works on closed, open, or semiopen MTL.",
      "Multilevel domain decomposition.",
      "Uses a modified MFEM solver engine.",
      "Result visualization with Paraview or VisIt.",
      "Start from .step CAD files using the step2gmsh workflow.",
    ],
  },
  {
    label: "Boundaries",
    iconUrl: asset("tab-boundaries.webp"),
    title: "BOUNDARIES",
    subtitle:
      "Separate boundary definitions for electric and magnetic fields",
    imageUrl: asset("tab-boundaries.webp"),
    bullets: [
      "Simulate environment behaviour using specific boundaries for each direction: air, ground plates, reverberation cases, periodic conditions...",
    ],
  },
  {
    label: "Rectilinear Grid",
    iconUrl: asset("tab-rectilinear-grid.png"),
    title: "RECTILINEAR GRID",
    subtitle: "Adjustable grid. Improved precision and simulation efficiency",
    imageUrl: asset("tab-rectilinear-grid.png"),
    bullets: [
      "Increase cell density on critical components such as circuit boards or complex surfaces.",
    ],
  },
  {
    label: "Far Field Detectors",
    iconUrl: asset("tab-far-field-detectors.png"),
    title: "FAR FIELD DETECTORS",
    subtitle: "Full control for RCS measures",
    imageUrl: asset("tab-far-field-detectors.png"),
    bullets: ["Full 360º support for multi-signal measures."],
  },
  {
    label: "Time Snapshots",
    iconUrl: asset("tab-time-snapshots.png"),
    title: "TIME SNAPSHOTS",
    subtitle: "Creates time domain movies used for visual interpretation",
    imageUrl: asset("tab-time-snapshots.png"),
    bullets: ["Great tool for visual analysis of current transmission."],
  },
  {
    label: "Frequency Slices",
    iconUrl: asset("tab-frequency-slices.png"),
    title: "FREQUENCY SLICES",
    subtitle: "Frequency domain field slices across your model",
    imageUrl: asset("tab-frequency-slices.png"),
    bullets: [
      "Mandatory for antenna emission or electromagnetic compatibility.",
    ],
  },
];

export interface ScienceSlide {
  logos: string[];
  imageUrl: string;
  caption: string;
}

export const SLIDES: ScienceSlide[] = [
  {
    logos: [
      asset("logo-msca.webp"),
      asset("logo-university-of-manchester.png"),
      asset("logo-amasya-university.png"),
      asset("logo-ugr.png"),
    ],
    imageUrl: asset("publication-joint-research.png"),
    caption: "FDTD Voxels-in-Cell Method With Debye Media",
  },
  {
    logos: [
      asset("logo-european-union.webp"),
      asset("logo-airbus.png"),
      asset("logo-ugr.png"),
    ],
    imageUrl: asset("publication-aircraft-shielding-s-fdtd.png"),
    caption: "Analysis of aircraft shieldings for lightning indirect effects by a novel S-FDTD",
  },
  {
    logos: [
      asset("logo-european-union.webp"),
      asset("logo-university-of-manchester.png"),
      asset("logo-msca.webp"),
      asset("logo-amasya-university.png"),
      asset("logo-ugr.png"),
    ],
    imageUrl: asset(
      "publication-accelerating-finite-difference.webp",
    ),
    caption:
      "Accelerating Finite-Difference Time-Domain (FDTD) Solvers using Voxels-in-Cell Method",
  },
  {
    logos: [
      asset("logo-european-union.webp"),
      asset("logo-airbus.png"),
      asset("logo-ugr.png"),
      asset("logo-uv.png"),
      asset("logo-upc.png"),
    ],
    imageUrl: asset("publication-siva-uav-emc.png"),
    caption:
      "The SIVA UAV: a case study for the EMC analysis of composite air vehicles",
  },
  {
    logos: [
      asset("logo-politecnica-marche.png"),
      asset("logo-uca.png"),
      asset("logo-hartree-centre.png"),
      asset("logo-ugr.png"),
    ],
    imageUrl: asset("publication-parallel-fdtd-bioelectromagnetics.png"),
    caption:
      "Performance of parallel FDTD method for shared- and distributed-memory architectures: Application to bioelectromagnetics",
  },
  {
    logos: [
      asset("logo-european-union.webp"),
      asset("logo-aei.png"),
      asset("logo-wavecore.png"),
      asset("logo-ugr.png"),
      asset("logo-airbus.png"),
    ],
    imageUrl: asset("publication-hie-s-fdtd.png"),
    caption:
      "A HIE S-FDTD Method to Account for Geometrical and Material Uncertainties in Lossy Thin Panels",
  },
  {
    logos: [
      asset("logo-european-union.webp"),
      asset("logo-airbus.png"),
      asset("logo-ugr.png"),
      asset("logo-york-university.webp"),
      asset("logo-cost.webp"),
    ],
    imageUrl: asset("publication-hybrid-crank-nicolson-subgridding.png"),
    caption:
      "A Hybrid Crank-Nicolson FDTD Subgridding Boundary Condition for Lossy Thin-Layer Modeling",
  },
];
