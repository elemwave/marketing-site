# Marketing Partnerships — Layout

Structural source of truth for the Elemwave partnerships page. Every field,
label, section, action, and static string below MUST render.

Tokens, type scale, shadows, glow geometry, section paddings, and the
`flex-basis`/`min-width` table live in
[`specs/ui/style-guide.md`](../../ui/style-guide.md); this document covers
structure and per-section specifics.

The header and footer are shared site chrome, described once in
[`marketing-home/layout.md`](../marketing-home/layout.md) §1 and §6.

## Page structure (top to bottom)

1. Skip control at the start of the shared header.
2. Header on its own `navy-950` surface, outside the primary-content landmark.
3. Hero on its own full-width `navy-950` surface, as the first section inside
   the primary-content landmark.
4. Partner marquee (`navy-950`), inside the primary-content landmark.
5. Narrative (`white`), inside the primary-content landmark.
6. Become a partner (`white` with gradient panel), inside the
   primary-content landmark.
7. Footer (`navy-950`), outside the landmark.

The Header and hero own adjacent navy surfaces. The marquee is pulled up under
the hero by a negative offset so the navy sections read as one field rather
than as stacked blocks.
The strip overlaps the band, so it MUST render in front of it:
every card stays whole, and no logo loses its top edge.

## 1. Header

As `marketing-home/layout.md` §1, with the Partnerships entry marked as the
current page.

The page file no longer composes `Header` at all — the root layout renders it
once for every route — so it is not in a position to add a styling wrapper
around it or around the hero. Header owns the header surface and glow, and
PartnershipsHero owns the hero surface.

## 2. Hero

Centred, on its own full-width `navy-950` surface. Its inner content, not the
surface itself, is constrained to the layout max width.

- H1 (Montserrat): **"Partnerships Built On Technical Trust"**, max 760px.
- Lead paragraph, max 640px: **"The best engineering partnerships are built
  through reliable delivery, technical depth, and confidence under demanding
  conditions."**

## 3. Partner marquee

A single continuously scrolling strip of partner marks on `navy-950`, labelled
as a partners region.

- Every partner logo the repository holds — currently fifteen, being every
  `logo-*` asset in `public/images/` except the Elemwave mark itself.
- Each sits in a white rounded card. The card is structural, not decorative:
  two of the assets have no alpha channel and would render as opaque
  rectangles directly on navy.
- Each organisation's mark carries **that organisation's catalogue name** as
  alternative text. The science section uses the same published names for the
  same marks.
- The list is rendered twice, end to end. The second copy is hidden from
  assistive technology, so each partner is announced once.
- While motion is available, the scrolling strip itself is a
  `button[type="button"]` named **"Pause partner marks"** or
  **"Resume partner marks"**.
  The button has no visible text, standalone pill, or icon at rest, on hover,
  or while paused. A pointer cursor on hover is the only sighted signal that
  it is interactive.
  The partner cards are not links, so this button does not nest interactive
  content.
- When the visitor prefers reduced motion, the strip is not a button. See
  [`experience.md`](./experience.md) for what happens to focus when that
  preference turns on while the button holds it.

**Four organisation names remain inferred from filenames** — Universidad de
Cádiz, Universitat Politècnica de Catalunya, Universitat de València and
Wavecore, inferred from `logo-uca`, `logo-upc`, `logo-uv` and
`logo-wavecore`. Those guessed names stay in the catalogue and are published
until a later product decision changes them.

## 4. Narrative

Two flexible columns that wrap, vertically centred against each other.

### Left column

- H2 (Montserrat): **"Collaborations That Shape Our Work"**.
- A 64×3px `ink` bar beneath it, 18px below, left-aligned and decorative — the
  same variant used on the contact page, not `SectionHeading`'s centred 80px
  bar.

### Right column

Two paragraphs, 16px:

- **"Our work has connected us with leading aerospace and research
  organisations, including Airbus and the University of Granada. Our tools have
  integrated proprietary Airbus solvers, and our background includes European
  initiatives such as HECATE, led by Collins Aerospace with partners like
  Airbus, Safran, and NLR."**
- **"These collaborations reflect the standard we bring to every project:
  rigorous engineering, clear communication, and software that supports real
  decisions."**

## 5. Become a partner (id `partner`)

A navy gradient panel on white, centred, with one contained glow — the same
composition as the home page's Book a Meeting.

- H2 (Montserrat), uppercase: **"Become a Partner"**.
- Paragraph, max 620px: **"If your team works on problems where computational
  electromagnetics makes the difference, we would be pleased to talk."**
- Action: **"Schedule a Call"** — opens the booking dialog.

**Deliberate deviation from the source design.** The design gives this button
16px/34px padding, a 10px radius, 16px text and 2px tracking — a third button
geometry. The style guide's one-pill rule wins and the standard pill is used
unchanged, which also makes this panel and Book a Meeting identical. Do not
reintroduce the design's values.

## 6. Footer

As `marketing-home/layout.md` §6, byte-identical.

## Image sources

Partner logos are served locally from `public/images/`; the list, with each
organisation's name, is `PARTNER_LOGOS` in
`projects/marketing/lib/site-content.ts`. The page carries no other imagery
beyond the logo in the header and footer.
