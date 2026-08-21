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

1. Dark band (`navy-950`) containing the Header and the hero.
2. Partner marquee (`navy-950`).
3. Narrative (`white`).
4. Become a partner (`white` with gradient panel).
5. Footer (`navy-950`).

The band encloses header and hero together, as the home page's does. The
marquee is pulled up under the band by a negative offset so the two navy
sections read as one field rather than as two stacked blocks.

## 1. Header

As `marketing-home/layout.md` §1, with the Partnerships entry marked as the
current page.

## 2. Hero

Centred, inside the dark band.

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
- Each mark carries **the name of its organisation** as alternative text, not
  the shared `alt="Partner logo"` the science carousel still uses.
- The list is rendered twice, end to end. The second copy is hidden from
  assistive technology, so each partner is announced once.

**Some partner names are inferred from their filenames** — `logo-uca`,
`logo-upc`, `logo-uv` and `logo-wavecore` are abbreviations, read here as
Universidad de Cádiz, Universitat Politècnica de Catalunya, Universitat de
València and Wavecore. They are marked in the source and need confirming. A
confidently wrong name in alternative text is worse than a generic one, because
no sighted reviewer encounters it.

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
