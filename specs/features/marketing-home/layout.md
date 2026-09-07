# Marketing Home — Layout

Structural source of truth for the Elemwave home page. Every field, label,
section, action, and static string below MUST render.

Tokens, type scale, shadows, glow geometry, section paddings, and the
`flex-basis`/`min-width` table live in
[`specs/ui/style-guide.md`](../../ui/style-guide.md); this document covers
structure and per-section specifics.

## Page structure (top to bottom)

1. Dark band (`navy-950`) containing Header + Hero.
2. What Our Software Can Do (`surface`).
3. The Science Behind Us (`surface`).
4. Book a Meeting (`white` with gradient panel).
5. Footer (`navy-950`).

## 1. Header

Shared site chrome: the same header renders on every page, including
[Contact](../marketing-contact/layout.md) and
[Partnerships](../marketing-partnerships/layout.md).

- Elemwave logo image, 64px tall, width auto. On the home page it links to
  `#top`; on every other page it navigates to the home page.
- Primary navigation: **"Home"**, **"Partnerships"** and **"Contact"**, in that
  order. The entry for the current page is marked as such, both visually and
  for assistive technology.
- Primary action: **"Schedule a call"** pill button — opens the booking dialog.
- Three flex children — logo, navigation, action — laid out `space-between`,
  with the navigation taking the space between the other two and centring
  itself in it. A decorative glow sits behind, clipped horizontally.
- **Below 761px** the entries are replaced by a control that opens a drawer
  over the page; the action stays in the header. Exactly one form renders at a
  time. See
  `specs/ui/style-guide.md` → HeaderNav, and
  [`ADR-0005`](../../decisions/ADR-0005-collapsing-primary-navigation.md).

## 2. Hero (`#top` band, id anchor `top`)

- H1 (Montserrat): **"INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS
  SIMULATIONS"**, max 780px wide.
- CTA pill: **"Try our demo"** → `#software`. Always rendered.
- A320 imagery: 3 images stacked absolutely in a 520px-tall box, each
  `object-fit: contain` at full width/height:
  - `A320CAD` — base layer, always opaque, no transition.
  - `A320Solver` — overlay, visible at `heroState === 1`.
  - `A320texture` — overlay, visible at `heroState === 0`.
  - Cross-fade behaviour in [`experience.md`](./experience.md).
- The section clips its own overflow, so its columns are cut rather than widening
  the page at their `min-width` floors.

## 3. What Our Software Can Do (id `software`)

- Section heading: **"What Our Software Can Do"** + underline bar.
- Description: "High-precision tools for modelling transmission lines, shielding
  effects, and complex multiconductor systems with scientific reliability.
  Designed for researchers who require accurate, scalable, and computationally
  efficient electromagnetic simulations."
- **6 tab circles** (icon + label), centred and wrapping in a 1100px row:
  Tulip, Boundaries, Rectilinear Grid, Far Field Detectors, Time Snapshots,
  Frequency Slices.
- **Active tab card**: title (uppercase),
  body paragraphs, and a screenshot scaled to `contain`.
  There is no subtitle, no "Usage:" label and no bullet list.
  Content per tab:

  - **TULIP** — paragraphs:
    "TULIP is one of Elemwave's flagship solver capabilities for advanced
    multiconductor transmission line modelling.";
    "It computes per-unit-length capacitance and inductance matrices for complex
    transmission line structures, providing the parameters needed for accurate
    FDTD-based EMC simulations.";
    "The workflow supports advanced geometries, dielectric materials, and
    CAD-based inputs, while keeping results ready for visual inspection in tools
    such as ParaView or VisIt.";
    "For engineers working with cable bundles, coupled conductors, or complex MTL
    structures, TULIP turns a difficult modelling step into a controlled,
    repeatable workflow."
  - **BOUNDARIES** — paragraphs:
    "Boundary configuration is one of the foundations of a credible
    electromagnetic simulation.";
    "Elemwave allows electric and magnetic field boundaries to be configured
    separately, giving engineers the flexibility to reproduce different
    environmental behaviours in each direction.";
    "The workflow supports air interfaces, ground plates, reverberation
    scenarios, periodic conditions, and MUR conditions.";
    "Although boundary setup is not always the most visible part of a simulation,
    it is essential for building accurate, flexible, and physically meaningful
    electromagnetic models."
  - **RECTILINEAR GRID** — paragraphs:
    "The rectilinear grid gives engineers finer control over mesh density,
    helping simulations focus computational effort where it matters most.";
    "Cell density can be increased around critical components, circuit boards,
    complex surfaces, and regions where geometric detail has a direct impact on
    the quality of the result.";
    "The goal is simple: improve precision without wasting resources across areas
    that do not need the same level of resolution.";
    "This capability is still under development, with the aim of giving users
    full control over the characteristics of this mesh type."
  - **FAR FIELD DETECTORS** — paragraphs:
    "Far field detectors give engineers a clear view of how structures radiate,
    scatter, and interact with electromagnetic energy.";
    "They provide full control for radar cross-section measurements and
    antenna-oriented studies, supporting 360-degree analysis and multi-signal
    measurement scenarios.";
    "The resulting visuals are easy to interpret and well suited to technical
    reviews, antenna studies, and presentation of simulation results.";
    "Whether the goal is to understand radiation behaviour or evaluate scattering
    around a structure, far field detectors make the result easier to analyse and
    communicate."
  - **TIME SNAPSHOTS** — paragraphs:
    "Time snapshots turn simulation results into clear time-domain movies,
    helping engineers understand how fields and currents evolve across a
    structure.";
    "They are especially useful for analysing current transmission, transient
    behaviour, and propagation effects that are difficult to interpret from raw
    data alone.";
    "Instead of reading line after line of a .dat output file, users can watch the
    simulation unfold and identify the behaviour that matters."
  - **FREQUENCY SLICES** — paragraphs:
    "Frequency slices help engineers see how electromagnetic behaviour changes
    across the spectrum.";
    "They process simulation data and generate snapshots across a defined
    frequency range, making it easier to identify which frequencies are emitted,
    detectable, or relevant to the behaviour of the system.";
    "This capability is essential for antenna emission analysis and EMC studies,
    where frequency behaviour can directly affect compliance, interference risk,
    and operational safety.";
    "For sectors such as telecommunications and aviation, frequency slices provide
    a clearer route from raw simulation data to practical engineering insight."

## 4. The Science Behind Us

- Section heading: **"The Science Behind Us"** + underline bar.
- Description: "Developed and validated through academic publications and joint
  projects with universities, research centers, and industrial partners. Our work
  contributes to the advancement of computational electromagnetics through
  published research and collaborations with leading engineering organizations."
- **Carousel** of 7 slides, each = a partner logo row + a large publication image:
- **Logo row** — centred, wrapping, `clamp(24px,4vw,48px)` gaps. Each logo is a real
  `<img>` capped at 205px tall, centred in a wrapper that takes an equal share of
  the row's width. See "Logo sizing" below.
  All 7 slides' logo rows render stacked in one grid cell (inactive ones
  `visibility: hidden`), so the block always reserves the tallest slide's height
  and the publication frame below never shifts when the slide changes.
- **Publication frame** — max 980px, 30px radius, 1px border, framed shadow,
  white backing; image 640px tall, `cover`, anchored to top centre.
- Captions (used as the frame's `aria-label`).
  Each is the published paper's literal title, and each MUST stay unique:
  the dot list keys on the caption.
  1. "FDTD Voxels-in-Cell Method With Debye Media" (4 logos).
  2. "Analysis of aircraft shieldings for lightning indirect effects by a novel
     S-FDTD" (3 logos).
  3. "Accelerating Finite-Difference Time-Domain (FDTD) Solvers using
     Voxels-in-Cell Method" (5 logos).
  4. "The SIVA UAV: a case study for the EMC analysis of composite air vehicles"
     (5 logos).
  5. "Performance of parallel FDTD method for shared- and distributed-memory
     architectures: Application to bioelectromagnetics" (4 logos).
  6. "A HIE S-FDTD Method to Account for Geometrical and Material Uncertainties in
     Lossy Thin Panels" (5 logos).
  7. "A Hybrid Crank-Nicolson FDTD Subgridding Boundary Condition for Lossy
     Thin-Layer Modeling" (5 logos).
- Controls: previous arrow ‹ and next arrow › (44px, inset −16px from the carousel
  edges, vertically centred on the publication frame —
  the logo row wrapping to two rows must not shift them),
  and one dot per slide, 28px below the frame.

### Logo sizing

Each logo is a real `<img width:auto; max-width:100%>` inside a wrapper that is a
flex item of the row. The logo's height cap scales with the viewport —
`max-height: clamp(64px, 16vw, 205px)` — reaching its 205px desktop value by a
~1281px viewport. It exists to shrink the row on a phone, where a fixed 205px cap
left five logos stacked one per row and 1091px tall against a 240px publication
frame: 82% of the section.

**The wrapper's width is driven by the slide's logo count, not by the viewport
alone.** Two values derive from that count, `n`:

- **`per`** — logos per row while the row cannot hold them all: `n ≤ 3 ? n :
  ceil(n / 2)`, so 3→3, 4→2, 5→3. Below `bp` the wrapper takes an explicit
  `width: calc((100% - gap × (per - 1)) / per)`, so exactly `per` land on a row.
- **`bp`** — the width at which all `n` fit one row at their 170px floor
  (`n × 170 + (n-1) × gap + padding`): 3→660px, 4→900px, 5→1145px. At and above
  it the wrapper drops the explicit width and reverts to sharing the row —
  `flex: 1`, `min-width: 170px`, `max-width: 265px`.

Above `bp` the desktop layout is exactly what fixed values always gave: no width is
fixed, wrappers share the row equally between the floor and the cap, and a logo's
available width falls out of the count — 265px on a four-logo slide, 204px on a
five-logo one at full container width.

### Why the count has to drive it

This is the one place in the page that uses breakpoints, and the reason is worth
stating: **a shared `min-width` cannot balance every slide.** How many logos fit a
row is a function of the container, the floor and the gap — the slide's logo count
does not enter into it. So any single value balances one slide and orphans another:

- `k=2`: four logos land 2+2, but five land 2+2+1.
- `k=3`: five land 3+2, but four land 3+1.
- `k=4`: four land on one row, but five land 4+1.

Only `k ≥ 5` — every logo on one row — serves both, and on a 375px phone that puts
five logos at 48px each, illegible. Measured and rejected. Deriving `per` from the
count is what removes the orphan at every width.

`bp` has to come from the count too. A single shared threshold would regress the
four-logo slide from one row to 2+2 between 900px and 1145px.

The height cap and `max-width:100%` together reproduce `contain`, and which one
binds depends on the logo. Partner aspect ratios span 0.71–3.10. Square and
portrait logos are height-bound and render at the full cap on every slide
regardless of count; landscape logos are width-bound and do vary with the count.
That variation is the intended cost of distributing the space.

Three constraints on any future change here:

- The `max-width:100%` is load-bearing, not decoration. Height-capped logos keep
  their natural width, and those widths are large: at 205px tall,
  `logo-york-university.webp` alone is 620px wide and a five-logo slide totals
  ~1792px against a 1180px container. Every slide overflows without it.
- The `min-width` and `max-width` apply **only at and above `bp`**; below it the
  wrapper carries an explicit `width` and neither is in play. The 170px floor is
  what sets `bp` itself: five logos hold one row while the container is at least
  `5 × min-width + 4 × gap`, which lands at a ~1145px viewport (measured; they wrap
  by ~1105px). Raising either the `min-width` or the gap raises `bp` for every
  count, and `FULL_ROW_AT` in `ScienceSection.tsx` must be recomputed to match —
  the map is hand-derived, nothing checks it.
- The wrapper's `max-width` (265px) is now close to inert. It was there to stop a
  short trailing row from splitting its whole width between one or two logos, and
  `per` removes those rows entirely. What is left is a ceiling on very wide
  viewports: a three-logo slide would otherwise let each wrapper take a third of
  the 1180px container. Four logos at full container width come to exactly 265px,
  so the cap never binds below that.

Squeezing the **desktop** height cap is the failure mode to avoid: it shrinks
square logos to roughly half the width of their landscape neighbours. The portrait
`logo-uca.png` (0.71) is the current extreme, landing at 145×205 — full height
keeps its visual mass comparable to a square logo's, so it needs no special
handling. A still narrower logo would start to look lost; the fix is to trim its
transparent padding, never to lower the 205px cap.

### Small viewports

Below `bp` the row shrinks with the viewport and splits into balanced rows.
Measured across the three counts in use — no width leaves a row holding a single
orphan logo:

| Viewport | 3 logos | 4 logos | 5 logos |
|---|---|---|---|
| 320–375px | 3 | 2+2 | 3+2 |
| 414–768px | 3 | 2+2 | 3+2 |
| 900–1024px | 3 | 4 | 3+2 |
| 1145px | 3 | 4 | 5 |
| 1280–1440px | 3 | 4 | 5 |

Row heights on the five-logo slide, its worst case: 152px at 375px against a 240px
publication frame, 276px at 768px against 422px, 197px at 1280px against 640px.
With a fixed 205px cap and a fixed 170px floor that 375px row was 1091px tall —
one logo per row, 82% of the section, burying the publication under a long scroll.

The 64px height floor is what puts two logos on a row at 375px instead of one. It
is a deliberate trade: at that size a logo reads as its mark, and fine print
inside the artwork (UPC's "BARCELONATECH", the wordmark under the UGR crest) stops
being legible. Hiding the row on small screens was considered and rejected — the
partners are the section's credibility signal.

## 5. Book a Meeting (id `book`)

- Gradient navy panel (max 1100px, 40px radius) with two layered glows and centred
  content.
- H2: **"BOOK A MEETING"** (uppercase, letter-spacing 8px).
- Paragraph: "Schedule a technical discussion with our team to explore
  collaboration opportunities" (max 680px).
- CTA: **"Schedule a Call"** — opens the booking dialog.

### Booking dialog

Calendly's own popup modal, portalled into `<body>` — not our markup, and
deliberately outside the design system. There is no card of ours around it, no
heading of ours above it, and no close button of ours on it: the scrim, the
panel, and the ✕ are all the vendor's, and nothing here is ours to restyle.

Its measurements and the one override we do apply — lifting the vendor's
`max-height` cap above 975px — are recorded once in
[`specs/ui/style-guide.md`](../../ui/style-guide.md) → Booking dialog.

The scheduler's accent colour travels as a page setting mirroring `navy-700`.

Behaviour — what closes it, the scroll lock, and why nothing loads until it
opens — is in [`experience.md`](./experience.md).

## 6. Footer

Shared site chrome: the footer is identical on every page, including
[Contact](../marketing-contact/layout.md) and
[Partnerships](../marketing-partnerships/layout.md).

- Elemwave logo (64px) + tagline: "Innovative solutions for advanced
  electromagnetics simulations" (max 320px).
- Column **Policies**: "Privacy policy", "Integrated policy". Neither has a
  destination yet — recorded in `specs/ui/style-guide.md` → Known gaps.
- Column **Quick Links**: "Contact" (navigates to the contact page),
  "Partnerships" (navigates to the partnerships page),
  "Schedule a meeting" (opens the booking dialog).
- Column **Get In Touch**: "Email: info@elemwave.com",
  "Phone: +44 203 289 1024", "Recogidas 35 1A, 18005 Granada, Spain".
- Copyright: "© 2021-2024 Elemwave - CEM and EMC solutions", centred, 48px below
  the columns.

The address here and the two-line address in the contact panel are one value
rendered two ways; they cannot disagree.

## Image sources

Images are served locally by Next.js from `public/images/`. Exact filenames live
in `projects/marketing/lib/home-content.ts` (`UPLOADS` base + `HERO_IMAGES` +
`TABS` + `SLIDES`). The logo is `logo-elemwave.png`.
