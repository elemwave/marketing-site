# Style Guide

## Overview

Canonical design tokens and reusable primitives for the Elemwave marketing
website, mapped onto the Next.js + Tailwind v4 app in `projects/marketing/`.
All new marketing UI MUST use these tokens and primitives before introducing new
visual structures.

## Design tokens

Tokens are declared in `projects/marketing/app/globals.css` under `@theme` and
consumed as Tailwind utilities (e.g. `bg-navy-950`, `text-ink-muted`,
`font-heading`).

### Colour

| Token | Value | Usage |
|---|---|---|
| `--color-navy-950` | `#020B1A` | Darkest navy — header, hero, footer backgrounds; active carousel dot; arrow buttons |
| `--color-navy-900` | `#030F2A` | Hero CTA text |
| `--color-navy-800` | `#0F1E36` | Book-a-meeting gradient top, tab circle backing, header/book CTA text |
| `--color-navy-700` | `#122949` | Base link colour, book-a-meeting gradient bottom, arrow hover |
| `--color-blue-500` | `#2A64B8` | Link hover |
| `--color-surface` | `#F5F7FA` | Light section background (software, science) |
| `--color-ink` | `#000000` | Section headings, underline bars, tab card titles, subtitles |
| `--color-ink-muted` | `#7A7A7A` | Body/description/bullet text |
| `--color-blue-200` | `#9FC3FF` | Nav and contact-panel link hover, on navy |
| `--color-dot-idle` | `#c3cbd6` | Inactive carousel dot |
| `--color-pill-hover` | `#dfe7f2` | Pill button hover background |

Colours used inline rather than as tokens, because no Tailwind utility applies
(gradients, glows) or an opacity modifier covers it:

| Value | Usage |
|---|---|
| `rgba(0,170,255,0.25 → 0.05 → transparent)` | Blue glow gradient (header, footer) |
| `rgba(59,89,129,1)` | Book-a-meeting upper glow |
| `rgba(255,255,255,0.25)` | Book-a-meeting lower glow |
| `rgba(2,1,1,0.33)` | Publication frame border (implemented as `border-black/30`) |

Text on navy uses white with an opacity modifier, not a token: `text-white/85`
(book-a-meeting paragraph), `text-white/75` (idle header nav links),
`text-white/70` (footer links, tagline), `text-white/55` (copyright, contact
detail labels).

Tab labels render at `#020101` in the design; the implementation uses `ink`
(`#000000`).

### Typography

- `--font-heading` → **Montserrat** (weights 400–700). Headlines, section titles,
  tab card titles, footer column titles.
- `--font-body` → **Inter** (weights 300–600). Body copy, buttons, bullets, links.
- Loaded via `next/font/google` in `projects/marketing/app/layout.tsx` as CSS
  variables `--font-heading` / `--font-body`.

Type scale. Headings are fluid — the figure after the slash is the clamp; smaller
copy stays fixed:

- Hero h1: `clamp(26px,3.5vw,44px)` / 600 / line-height 1.2 / letter-spacing 0.9px.
- Contact h1: `clamp(28px,3.5vw,44px)` / 600 / line-height 1.2, no tracking. The
  28px floor is 2px above the hero's; treated as intentional, like the software
  vs science title delta below.
- Section title h2: `clamp(30px,4.5vw,56px)` (software) and
  `clamp(30px,4.5vw,58px)` (science, letter-spacing `clamp(2px,0.5vw,5.7px)`).
- Tab card title: `clamp(26px,3.5vw,38px)` / 600 / letter-spacing 1px.
- Tab card subtitle: 16px / 600. "Usage:" label: 15px / 600.
- Book-a-meeting title: `clamp(26px,3.5vw,44px)` / 500 / letter-spacing
  `clamp(3px,0.7vw,8px)` / uppercase.
- Book-a-meeting paragraph: `clamp(16px,1.5vw,19px)` / 300 / line-height 1.6 /
  letter-spacing 1px.
- Body/description: 16px / line-height 1.7 / `ink-muted`.
- Contact secondary paragraph: 15px / line-height 1.7 / `ink-muted`.
- Contact detail label: Montserrat 12px / 600 / letter-spacing 2.5px /
  uppercase / `text-white/55`. Its value: 16px / line-height 1.6 / white.
- Header nav link: 14px / 500.
- Bullets: 15px / line-height 25px / `ink-muted`.
- Tab label: 14px / 600 active, 400 idle.
- Buttons: 14px / letter-spacing 0.3px, everywhere.
- Footer column titles: 15px / 600. Footer links and tagline: 14px.
- Copyright: 13px.

### Radius

`24px` (pill buttons),
`--radius-card: 28px` (software card), `30px` (publication frame), `40px`
(book-a-meeting panel), `clamp(20px,3vw,32px)` (contact card), `12px` (tab card
image), `3px` (heading underline bar), `50%` (tab circles, dots, arrows).

The contact card's radius is a literal clamp, not a token — the same form
`BookMeeting` already uses. It MUST NOT be collapsed to `radius-card`: 28px sits
inside the clamp's range but is not the same value at any viewport but one.

### Shadow

- Card: `0 20px 50px -10px rgba(0,0,0,0.15)`.
- Tab circle: `0 12px 24px rgba(0,0,0,0.18)`.
- Publication frame: `4px 4px 17px 0 rgba(0,0,0,0.35)`.
- Arrow button: `0 6px 16px rgba(0,0,0,0.25)`.

### Glow (decorative)

Five radial-gradient + blur accents, in four places — **the hero has none**; the
glow above it belongs to the header. All are non-interactive
(`pointer-events:none`) and implemented as absolutely-positioned `<div>`s with
inline `background:radial-gradient(...)` and `filter:blur(...)` — no Tailwind
utility equivalent, so inline style is the sanctioned exception here.

| Placement | Geometry | Blur | Gradient |
|---|---|---|---|
| Header | `bottom:-40px; left:-10%; width:120%; height:180px` | 20px | `ellipse at center`, `rgba(0,170,255,0.25)` → `rgba(0,170,255,0.05)` → transparent 70% |
| Footer | `bottom:-15px; left:-10%; width:120%; height:160px` | 18px | same as header |
| Book panel (upper) | `bottom:200px; left:-25%; width:160%; height:300px` | 30px | `ellipse at center 30%`, `rgba(59,89,129,1)` → transparent 75% |
| Book panel (lower) | `bottom:-50px; left:10%; width:80%; height:160px` | 18px | `ellipse at center`, `rgba(255,255,255,0.25)` → transparent 70% |
| Contact panel | `bottom:-50px; left:-20%; width:140%; height:200px` | 24px | `ellipse at center`, `rgba(0,170,255,0.25)` → transparent 70% |

The contact panel glow has **two** stops, not the header and footer's three: it
drops straight from `rgba(0,170,255,0.25)` to transparent with no `0.05`
midpoint, so it reads tighter in a column that is only a third of the page wide.

Every glow is wider than its section (120–160%) and offset negatively, so each
overflows sideways and would widen the page. Each is contained by an ancestor that
clips: the dark band (header glow — which still bleeds downward over the hero, as
intended, because the band encloses both), the footer, the book-a-meeting panel,
and — twice over — the contact panel's own column and the card around it. Any new
glow MUST sit inside a clipping ancestor.

## Semantic usage rules

- Dark sections (header, hero, footer) use `navy-950`; white text/pills sit on top.
- Light content sections use `surface` (`#F5F7FA`) with `ink` headings and
  `ink-muted` body.
- Primary action is always the **white pill button**; never introduce a coloured
  primary button without updating this guide.
- Body copy is `ink-muted` on light, `text-white/70` on dark.
- Base link colour and its hover are declared once in `globals.css` under
  `@layer base`. They MUST stay inside that layer: an unlayered `a { }` rule
  outranks every Tailwind utility regardless of specificity, which would silently
  override any `text-*` class applied to a link.

## Core UI primitives

- **PillButton** — white rounded button, `font-body` 600, hover background
  `pill-hover`.
  One style for every call to action, header to book-a-meeting:
  24px radius, `clamp(16px,2.5vw,24px)` horizontal padding, 12px vertical,
  14px text, `0.3px` tracking.
  Renders an `<a>`;
  for `<button>` triggers reuse the exported `pillButtonClassName` constant
  so both share the exact class list.
  The contact panel's call to action reuses it **unchanged**: the source design
  asks for `13px 28px` padding there, and this rule wins over the design. The
  delta is 1px vertical and at most 4px horizontal, which does not justify a
  second pill geometry.
  Because `PillButton` renders a plain `<a href>`, it MUST NOT be pointed at a
  route: `@next/next/no-html-link-for-pages` is an error in this project and
  resolves routes from `app/`, so `href="/contact"` fails lint. Anchors
  (`#software`), `tel:` and `mailto:` are fine.
- **HeaderNav** — the primary navigation, one entry per page. Flex row,
  `clamp(18px,3vw,36px)` gap, 14px / 500. Wrapped in `<nav aria-label="Primary">`.
  The entry for the current page carries `aria-current="page"`, and that
  attribute — not a conditional class — is the styling hook, so the visual state
  and the assistive-tech state cannot drift apart. Cross-page entries use
  `next/link`; same-page anchors stay plain `<a>`.
- **ContactDetail** — an uppercase label above its value, 6px apart, inside the
  navy contact panel. Rendered as `<dt>` / `<dd>` within one `<dl>`, which is
  what a run of label/value pairs is.
- **Booking dialog** — Calendly's own popup modal, deliberately outside the
  design system. It is the one surface on the site that does not use these
  tokens, so nothing here is ours to restyle:
  scrim `rgba(31,31,31,0.4)` with no blur;
  panel 80% wide between 900px and 1000px, 90% tall capped at 680px,
  square corners, no shadow, no title bar;
  below 975px it goes full width from 50px down.
  Close: Calendly's 19px white ✕, 25px from the top right (15px below 975px).
  Body: the scheduling iframe, filling the panel.
  Above 975px `globals.css` lifts the vendor's 680px cap
  with `max-height: none`, keeping its proportional `height: 90%`,
  so the scheduler's later steps fit instead of scrolling inside the iframe.
  The page behind is locked from scrolling while the modal is open.
  Its accent colour travels as `pageSettings.primaryColor`
  (mirrors `navy-700`; keep both in sync if the token changes).
  The trigger buttons that open it stay on `pillButtonClassName`.
- **SectionHeading** — centred Montserrat h2 + 80×3px underline bar (18px below
  the title), optional description paragraph 32px below the bar. Reused by the
  software and science sections.
- **Card** — white, `radius-card`, card shadow, 48px padding.
- **TabCircle** — `clamp(80px,10vw,110px)` circle, 6px white border, tab-circle shadow, `navy-800`
  backing, image `cover` background; active state lifts −5px and shows a 60%
  underline with a 600 label. Transition 0.25s ease.
- **Dot** — 10px circle; active `navy-950`, idle `dot-idle`.
- **Arrow** — 44px `navy-950` circle, white 20px glyph, hover `navy-700`.

## Layout metrics

The layout is fluid: sizes are `clamp(min, preferred-vw, max)` rather than fixed,
so they scale continuously with the viewport instead of snapping at breakpoints.
There are no media queries. The `max` of each clamp is the desktop value.

Section padding (top / horizontal / bottom):

| Section | Padding |
|---|---|
| Header | `14px clamp(20px,4vw,56px)` |
| Contact | `clamp(48px,7vw,96px) clamp(20px,4vw,56px)` (symmetric); card columns `clamp(32px,5vw,64px)` |
| Hero | `clamp(28px,4vw,50px) clamp(20px,4vw,48px)` (symmetric) |
| Software | `clamp(48px,7vw,88px) clamp(20px,4vw,56px) clamp(56px,8vw,110px)` |
| Science | `clamp(24px,4vw,40px) clamp(20px,4vw,56px) clamp(56px,8vw,100px)` |
| Book a meeting | `clamp(48px,6vw,80px) clamp(20px,4vw,56px) clamp(56px,8vw,100px)`; inner panel `clamp(48px,7vw,90px) clamp(24px,4.5vw,60px) clamp(56px,8.5vw,110px)` |
| Footer | `clamp(40px,5vw,64px) clamp(20px,6vw,88px) 32px` |

Max widths: hero h1 780px · software description 820px · science description
760px · tab circle row 1100px · software card 1240px · science carousel 1180px ·
publication frame 980px · book panel 1100px · book paragraph 680px · contact
card 1100px · footer container and copyright 1240px · footer tagline 320px.

Flexible columns (`flex-basis` + `min-width`), all wrapping:

| Block | Basis | Min width |
|---|---|---|
| Hero text | `1 1 440px` | `min(100%, 340px)`, max 700px |
| Hero imagery | `1 1 480px` | `min(100%, 360px)`, max 700px |
| Software text | `1 1 380px` | `min(100%, 320px)` |
| Software image | `1 1 480px` | `min(100%, 320px)` |
| Contact intro | `1 1 400px` | `min(100%, 320px)` |
| Contact panel | `1 1 360px` | `min(100%, 300px)` |
| Footer brand | `2 1 280px` | 240px |
| Footer Policies | `1 1 160px` | 150px |
| Footer Quick Links | `1 1 180px` | 160px |
| Footer Get In Touch | `1 1 220px` | 200px |

**The `min(100%, Xpx)` form on the hero, software and contact columns is
load-bearing.** A
bare `min-width: 340px` cannot yield below 340px, so on a 375px viewport the
column plus its section padding exceeds the screen and the whole page gains a
horizontal scrollbar. Wrapping the floor in `min(100%, …)` lets it collapse to the
container width on narrow screens while still holding the column open on desktop.
The footer columns are narrow enough (150–240px) not to need it.

**The two hero columns MUST share one max width.** Once they wrap, each column
takes the full container, so a difference between the caps is the difference
between the stacked blocks: at 620px against 700px the imagery overhung the text by
80px on every viewport from 700px to 1024px. The basis stays asymmetric (`440px`
against `480px`) — side by side the imagery is meant to outweigh the text, and the
caps do not bind there.

Heights: hero section min `clamp(420px,55vw,700px)`; hero imagery has no fixed
height — `aspect-ratio: 1024/572` with `max-height: 520px`, so it scales with its
column instead of letterboxing. Software card min 540px, tab card image
`clamp(220px,42vw,460px)`, publication image `clamp(240px,55vw,640px)`.

Gaps: `clamp(28px,4vw,48px)` (hero columns), `clamp(20px,4vw,48px)` (tab circle
row), `clamp(32px,4vw,48px)` (footer columns), `clamp(28px,3.5vw,44px)` (software
card columns), `clamp(24px,4vw,48px)` (science logo row), `clamp(24px,3vw,36px)`
(hero text stack, contact panel stack), `clamp(18px,3vw,36px)` (header nav),
20px (contact intro stack), 16px horizontal / 12px vertical (header), 30px (book
panel stack), 18px (tab circle → label, software text stack), 10px (carousel
dots), 6px (contact detail label → value).

**The header is three flex children — logo, nav, call to action — and it wraps.**
The nav takes `flex: 1` and centres its own contents, so it sits centred in the
space between the logo and the call to action. That is what `justify-content:
space-between` would give if the two flanking elements were the same width;
`flex: 1` gives it regardless of their widths, and survives the wrap below.

Once the nav joined it, the header no longer fits a narrow viewport: at 375px the
padding leaves 335px, while the logo (~126px), the nav (~115px), the
`whitespace-nowrap` pill (~137px) and two gaps need roughly 410px. The dark band
clips its overflow, so the failure mode was a silently cut-off button rather than
a scrollbar. `flex-wrap` therefore drops the call to action to a second row when
it must: the remaining logo + nav row needs 297px including padding, which fits
at 320px. Nothing wraps on desktop, so the layout there is unchanged. This is not
a breakpoint — the wrap happens when the content demands it, at whatever width
that is.

## Interaction states

- Links: base `navy-700`, hover `blue-500`; footer links `text-white/70` → white.
- Header nav: idle `text-white/75` → white; the current page `text-white` →
  `blue-200`. Both hooked off `aria-current="page"`.
- Contact panel phone and email: white → `blue-200`.
- Pill buttons: hover background `pill-hover`.
- Tab: active = lifted −5px, 600 label, 60% underline; idle = flat, 400 label, no
  underline. Both transition over 0.25s ease.
- Carousel: active dot filled `navy-950`; arrows hover to `navy-700`.

## Composition patterns

- **Dark band** wraps header + hero in a single `navy-950` container.
- **Centred section**: heading + underline + description, then content, on
  `surface`.
- **Gradient CTA panel**: rounded navy gradient block
  (`linear-gradient(to bottom, navy-800, navy-700)`) with two layered glows and
  centred content.
- **Split contact card**: a white `overflow-hidden` card on `surface`, holding
  two wrapping flex columns — light intro on the left, a navy gradient panel on
  the right carrying its own contained glow. The panel reuses the Gradient CTA
  panel's `navy-800` → `navy-700` gradient, so this is a recomposition of
  existing parts rather than a new visual language.
- **Footer**: 4-column flex (brand / Policies / Quick Links / Get In Touch) +
  centred copyright.

## Responsive conventions

- Sections use `flex-wrap` with `flex: 1 1 <basis>` and `min-width` so hero,
  software card, and footer columns stack on narrow viewports. The science logo
  row follows the same pattern with a `0` basis: its wrappers share the row width
  equally between a 170px `min-width` (below which the row wraps) and a 265px
  `max-width` (which bounds a short trailing row after wrapping), each holding a
  height-capped `<img>`.
- Everything scales fluidly via `clamp()` — padding, type, gaps, circle and image
  sizes. There are **no media queries and no breakpoints**; a new rule that snaps
  at a breakpoint would be inconsistent with the rest of the page.
- Column floors use `min(100%, Xpx)` so they collapse rather than force a
  horizontal scrollbar on narrow screens. See "Layout metrics".

## Accessibility-related visual conventions

- Background-image elements standing in for pictures (tab card screenshot,
  publication frame) use `role="img"` + `aria-label`; partner logos are real
  `<img>`s with `alt`. Glows are `pointer-events:none`.
- Carousel arrows/dots carry `aria-label` ("Previous slide", "Go to slide N").
- Tabs are real `<button>`s; the active tab is conveyed by weight + underline.

## Known gaps and inconsistencies

- Section title sizes differ slightly (56px software vs 58px science); treated as
  intentional.
- Colours are hex literals inherited from a WordPress theme, not a formal token
  system; this guide is the first canonical token layer.
- Every partner logo shares the same `alt="Partner logo"`, so assistive tech cannot
  tell them apart.
- The contact heading's underline bar is 64px and left-aligned, against
  `SectionHeading`'s 80px centred one. A variant, not a second primitive: the
  contact heading is an `h1` with a different ramp and no description slot, so
  serving both from one component would mean four props for one caller.
- `SoftwareSection` writes `rounded-[28px]` literally rather than using the
  `--radius-card` token that holds the same value, and this guide lists the book
  panel radius as a flat `40px` where the code clamps it. Pre-existing drift;
  new work should not copy either habit.
- The footer's "Privacy policy" and "Integrated policy" have no destinations and
  ship as `href="#"`. Rendering a destination-less entry as plain text would be
  better — `href="#"` scrolls to the top and announces as actionable — but that
  changes existing behaviour and is not this change's business.
- Logo assets are inconsistently trimmed: aspect ratios span 0.71–3.10, and some
  carry baked-in padding. Two — `logo-european-union.webp`
  and `logo-cost.webp` — have no alpha channel and render as opaque blocks on
  `surface`. None of this is fixable in CSS.

## Strict reuse rules

- Use `PillButton`, `SectionHeading`, `Card`, `TabCircle`, `Dot`, `Arrow` before
  writing new markup for the same role.
- Do not hardcode colours/fonts/radii that already exist as tokens.
- New tokens must be added here first, then to `@theme`, before use.
