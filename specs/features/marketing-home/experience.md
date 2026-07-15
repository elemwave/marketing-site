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
  600, and a 60% underline appears; the active card content (title, subtitle,
  bullets, screenshot) updates to that tab.
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

- Header "Schedule a call" and footer "Schedule a meeting" scroll to `#book`.
- Hero "Try our demo" scrolls to `#software`.
- Logo scrolls to `#top`.

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
- **The logo row is the one exception to the no-breakpoints rule**, and it is
  deliberate. Its threshold depends on the slide's logo count (660px at three logos,
  900px at four, 1145px at five), which no `clamp()` can express — a viewport-only
  rule balances one slide and orphans another. `layout.md` carries the proof.

## States

- No loading/error/empty states (static content, no data fetching).
- Images that fail to load degrade to their `alt` / `aria-label` text.
