# Marketing Home — Experience

Behavioural source of truth for the Elemwave home page.

## Hero image cross-fade

- Three A320 images are stacked absolutely in the hero.
- A timer advances `heroState` through `0 → 1 → 2 → 0` every **3000 ms**.
- Layer opacities: base (`A320texture`) visible when `heroState === 0`; solver
  layer visible when `heroState === 1`; state `2` shows the base CAD layer beneath
  (both overlays faded out). Opacity transitions animate over 0.5s ease.
- The timer starts on mount and is cleared on unmount (client component).
- Reduced-motion: honour `prefers-reduced-motion` by not auto-advancing.

## Software tabs

- 6 tabs; `activeTab` starts at index 0 (Tulip).
- Clicking a tab sets it active: its circle lifts −5px, its label goes to weight
  600, and a 60% underline appears; the active card content (title, paragraphs,
  screenshot) updates to that tab.
- Non-active tabs are flat, label weight 400, no underline.
- Only one tab active at a time; no empty state (index 0 default).

## Science carousel

- 7 slides; `slide` starts at index 0.
- Next arrow → `(slide + 1) mod 7`; previous arrow → `(slide - 1 + 7) mod 7`
  (wraps both directions).
- Each dot selects its slide directly; the active dot is filled `navy-950`, others
  `dot-idle`.
- Changing slide swaps the logo row and publication image together.
- Changing slide never shifts the layout:
  the logo block keeps the tallest slide's height,
  so the frame, arrows and dots stay put
  and the cursor remains over the arrow across repeated clicks.

## Hover / focus states

- Pill buttons: background → `#dfe7f2` on hover.
- Links: colour → `blue-500` on hover; footer links → white.
- Arrows: background → `navy-700` on hover.
- All interactive elements are keyboard-focusable (`<button>` / `<a>`).

## Navigation anchors

- Header "Schedule a call", the book panel "Schedule a Call",
  and footer "Schedule a meeting" open the booking dialog.
- Hero "Try our demo" scrolls to `#software`.
- Logo scrolls to `#top` **on this page**; on any other page the same logo
  navigates to the home page instead.
- Header nav "Home" is the current entry here; "Partnerships" and "Contact"
  navigate to their pages. The footer's Quick Links do the same.

## Primary navigation states

- An entry the visitor is not on is dimmed white and brightens to full white on
  hover. The current entry is already full white and goes to `blue-200` on
  hover, so hovering the page you are on still gives feedback.
- The current entry is marked as such for assistive technology, and that same
  marking drives its appearance — one signal, so the two cannot drift apart.
  Exactly one entry is marked per page.

## Narrow-viewport navigation

- Below 761px the entries are replaced by a control that opens a drawer against
  the right edge of the viewport, over a dimmed, blurred page. Above it, the
  full row renders. Exactly one form exists at a time, so the entries are never
  announced twice.
- The header's call to action stays in the header at every width; it drops to a
  second row when it will not fit. The drawer carries its own copy at the
  bottom.
- The control reports whether the drawer is open. The scrim, the ✕, Escape and
  choosing an entry all close it, and closing returns focus to the control.
- While closed, the drawer is not rendered, so its links are not reachable by
  keyboard. While open, the page behind it does not scroll.
- This is the site's only layout breakpoint. See `specs/ui/style-guide.md` →
  Responsive conventions for why it exists and why it does not generalise.

## Booking dialog

- Opens as Calendly's own popup modal, portalled into `<body>`
  over a translucent scrim.
  Escape, the ✕ button, or a click on the scrim closes it.
  The page behind cannot scroll while it is open.
  Focus is still not trapped: Calendly's modal binds no keys
  and sets no `inert`, a deliberate trade-off for using it as it ships.
  Escape and the scroll lock are wired back on our side.
- The modal embeds the Calendly scheduling widget.
  It mounts only while the modal is open — never up front —
  so nothing third-party loads before the visitor asks for it
  and reopening never stacks a second widget.
- Scheduling completes entirely inside the widget;
  the site performs no email verification of its own.

## Responsive behaviour

- Hero, software card, and footer columns use flex-wrap; content stacks vertically
  on narrow viewports (each block has a `flex-basis` + `min-width`).
- The science logo row also wraps. Its wrappers share the row width equally once all
  of a slide's logos fit at their 170px floor, which for five logos is a viewport of
  ~1145px (measured; they wrap by ~1105px).
- Each logo's height cap scales with the viewport, so the row shrinks rather than
  stacking full-height logos on a phone.
- Below the width where they all fit, how many logos share a row is derived from the
  slide's logo count, so no row is ever left holding a single orphan logo — four
  logos split 2+2, five split 3+2. Values and rationale in
  [`layout.md`](./layout.md).
- Section padding, type, gaps and image heights scale fluidly with the viewport via
  `clamp()`. Column floors use `min(100%, Xpx)` so narrow screens never gain a
  horizontal scrollbar.
- **The logo row's wrap thresholds depend on the slide's logo count** (660px at
  three logos, 900px at four, 1145px at five), which no `clamp()` can express — a
  viewport-only rule balances one slide and orphans another. `layout.md` carries
  the proof. This is not a breakpoint: there is no media query, and the
  thresholds emerge from `flex-basis` as the row runs out of room. The site's
  only layout breakpoint is the navigation's, above.

## States

- No loading/error/empty states (static content, no data fetching).
- Images that fail to load degrade to their `alt` / `aria-label` text.
