# Marketing Contact — Layout

Structural source of truth for the Elemwave contact page. Every field, label,
section, action, and static string below MUST render.

Tokens, type scale, shadows, glow geometry, section paddings, and the
`flex-basis`/`min-width` table live in
[`specs/ui/style-guide.md`](../../ui/style-guide.md); this document covers
structure and per-section specifics.

The header and footer are shared site chrome, described once in
[`marketing-home/layout.md`](../marketing-home/layout.md) §1 and §6. Only what
differs on this page is repeated here.

## Page structure (top to bottom)

1. Dark band (`navy-950`) containing the Header alone.
2. Contact card (`surface`).
3. Footer (`navy-950`).

Unlike the home page, the dark band encloses only the header — there is no hero
below it — and carries no `top` anchor, because the logo here navigates home
rather than scrolling.

## 1. Header

As `marketing-home/layout.md` §1, with the Contact entry marked as the current
page.

## 2. Contact card

A single white card on `surface`, clipped, holding two flexible columns that
wrap. The card is the whole section; there is no heading above it.

### Left column — introduction

- H1 (Montserrat): **"Contact us"**.
- A 64×3px `ink` bar directly beneath, left-aligned and decorative.
- Paragraph, 16px: **"Have an electromagnetic simulation, EMC, RF, or
  engineering software challenge? We would be pleased to hear from you."**
- Paragraph, 15px: **"Elemwave S.L. is based in Granada, Spain, and works with
  engineering and research teams on specialist computational electromagnetics
  projects."**

### Right column — details panel

A `navy-800` → `navy-700` gradient panel, clipped, with one decorative glow
behind its contents. Three labelled details, rendered as a description list:

- **ADDRESS** — "Recogidas 35 1A" and "18005 Granada, Spain", on two lines. Not
  a link.
- **PHONE** — "+44 203 289 1024", linking to the telephone application.
- **EMAIL** — "info@elemwave.com", linking to the mail application.

Then the primary action: **"Schedule a call"** — opens the booking dialog,
aligned to the start of the column rather than stretched.

**Deliberate deviation from the source design.** The design gives this button
`13px 28px` padding, against the site's single pill geometry. The style guide's
"one style for every call to action" rule wins and the standard pill is used
unchanged. This is the most likely place for an implementer to silently
reintroduce the design's value; do not.

## 3. Footer

As `marketing-home/layout.md` §6, byte-identical.

## Image sources

The contact page carries no imagery of its own. The only image is the logo in
the header and footer, `logo-elemwave.png`, exported from
`projects/marketing/lib/site-content.ts`.
