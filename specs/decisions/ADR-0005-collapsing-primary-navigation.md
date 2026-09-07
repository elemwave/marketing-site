# ADR-0005: Collapse the primary navigation below a single breakpoint

Status: Draft

Amends: ADR-0004

## Context

ADR-0004 established the shared site chrome: header and footer in
`components/site/`, composed per page, with the current route passed to the
header as a prop so it stays a server component.

That arrangement assumed a navigation that fits. With two entries it did, just:
at 375px the header padding leaves 335px, and the logo (~126px), the entries
(~115px) and the call to action (~137px) needed ~410px, which a `flex-wrap`
resolved by dropping the button to a second row.

The partnerships page adds a third entry and the arithmetic stops working.
The logo and three entries alone need ~358px against the same 335px, so
wrapping no longer produces a usable header — it produces a stack. And the
navigation is not finished growing.

`specs/ui/style-guide.md` states that the site has no media queries and no
breakpoints, and that a rule snapping at a breakpoint would be inconsistent
with the rest of the page. Every size on the site is a `clamp()`.

## Decision

- **The primary navigation collapses below 761px.** Above it, the entries
  render as a row between the logo and the call to action. Below it, a control
  opens a drawer against the right edge of the viewport, over a scrim, holding
  the same entries. Exactly one form is present at a time.

  The threshold and the drawer both come from the source design rather than
  from us. An earlier cut of this work used 640px and an inline panel; the
  design's own header answers the same question differently, and matching it
  keeps the implemented site and the design file describing one thing.

- **This is the only width breakpoint in our own layout, and it is recorded as
  an exception**
  in the style guide, with its arithmetic and with the alternative that was
  rejected. A collapsing navigation cannot be expressed without a breakpoint:
  something has to decide when the entries give way to the control. Nothing
  else on the site gains a breakpoint, and a second one needs its own
  justification rather than citing this. (Two other media queries exist and are
  not layout breakpoints: one lifts Calendly's own `max-height` cap on vendor
  markup, and one honours `prefers-reduced-motion`.)

  761px clears the requirement with room for a fourth entry: at that width the
  padding leaves ~700px against the ~511px the full row needs. It is not a
  Tailwind default, so it is written as an arbitrary variant rather than
  rounded to `sm` or `md`, which would move the switch away from where the
  design put it.

- **The call to action stays in the header at every width.** It does not
  always fit beside the logo and the control — at 375px the three plus their
  gaps need ~337px against 335px — so the header keeps `flex-wrap` and lets it
  drop to a second row. The drawer carries its own copy, full width and 44px
  tall, because a drawer is a touch surface rather than a toolbar.

- **One small client component, not a client header.** `NavToggle` owns the
  open/closed state and renders the control and the panel. The header, the
  logo, and the wide-viewport entry row stay server-rendered. This is the same
  shape the header already had with `BookingTrigger`: a static header with one
  interactive island inside it.

- **The control's behaviour is part of the decision, not an implementation
  detail.** `aria-expanded` on the control and a labelled dialog role on the
  drawer; the scrim, the ✕, Escape and choosing an entry all close it, and
  closing returns focus to the control; the drawer is not rendered while
  closed, so its links leave the tab order with it; the page behind does not
  scroll while it is open; the hidden form is removed from the accessibility
  tree, so the entries are never announced twice. A collapsing navigation
  without these is a worse navigation than the row it replaced.

  Three of those — Escape, the focus return, and the scroll lock — are not in
  the source design. They are added because a drawer without them is a trap:
  the design describes the appearance, not the whole behaviour.

- **The control's icon is inline SVG.** The source design uses a `☰` character.
  A text glyph renders differently on every platform and cannot be stroked or
  sized with the rest of the iconography, so the shape is reproduced as SVG at
  the same box size.

## Consequences

- The navigation now scales. A fourth or fifth entry costs an item in the data
  and nothing else, where wrapping would have degraded with each one.
- The style guide's no-breakpoints rule is now a rule with one exception, which
  is weaker than a rule without one. Recording the exception explicitly, with
  its reasoning, is what keeps it from becoming a precedent.
- The header is no longer wholly static. The cost is bounded to one component,
  but it is no longer true that the header ships zero client JavaScript.
- The behaviour above is untested. The project has no test runner, and this is
  the first real interactive behaviour outside the booking dialog — open,
  close, Escape, focus return. It is the strongest argument so far for standing
  one up.

## What ADR-0004 still governs

Everything else, unchanged. Chrome still lives in `components/site/`, still
composes per page around each page's own clipping band, still takes its route
as a prop rather than reading the router, and shared content still lives in
`lib/site-content.ts`. This ADR adds a form to the navigation; it does not
replace the arrangement around it.
