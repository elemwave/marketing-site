# Share site chrome and collapse the navigation below one breakpoint

## Context

The marketing site has several pages that render the same header and footer.
The header carries the primary navigation,
and that navigation needs to indicate which page the visitor is on.
More than one page renders the company's contact details,
which have to come from one place or they will drift.

Two properties of this project constrain the answer.
The site is a **static export** (`output: "export"`,
`specs/decisions/staging-on-s3-and-cloudfront.md`):
there is no server runtime and no request-time routing,
so every route is known at build time.
And the header is a **server component** —
`specs/features/marketing-home/implementation-plan.md` says so explicitly.
Pages compose the header directly so the current route stays build-time data,
while `Header` owns its dark surface and glow containment.

The navigation also has to fit at phone widths, and it does not.
At 375px the header padding leaves 335px;
the logo (~126px) and three entries alone need ~358px,
so wrapping no longer produces a usable header — it produces a stack.
And the navigation is not finished growing.

`specs/ui/style-guide.md` states that the site has no media queries
and no breakpoints,
and that a rule snapping at a breakpoint would be inconsistent
with the rest of the page.
Every size on the site is a `clamp()`.

## Decision

- **Chrome lives in `components/site/`.**
  `Header`, `Footer`, `PillButton` and `NavToggle` are not page-specific.
  `SectionHeading` stays in `components/home/`:
  moving it would be speculative.
  The rule is that `components/site/` holds what every page renders,
  and `components/<page>/` holds what one page renders.

- **Chrome is now composed once, by the root and `(site)` layouts, not
  per page.**
  `app/layout.tsx` renders Header, the primary-content landmark and Footer
  around every route, including the not-found page (`app/not-found.tsx`); a
  nested `app/(site)/layout.tsx` adds the organisation record for every page
  the sitemap lists, excluding not-found structurally by keeping it outside
  that route group.
  Page files do not add styling wrappers around Header or the landmark to
  provide the navy surface or contain the header glow.
  The header owns its navy background and clips its own glow, which is
  deliberately wider than the viewport (`specs/ui/style-guide.md` → Glow): an
  overflow-hidden wrapper inside `Header` covers exactly the header's bounds,
  so the glow is contained within the header and never paints over the section
  that follows it.
  Home and partnerships heroes own their own navy surfaces, and the page file
  MUST NOT become the overflow-clipping ancestor for unique content that
  follows the hero — the science carousel arrows and the partner marquee would
  be cut.
  This was originally rejected as "a shared layout holding header and footer"
  because the not-found page's dark band wrapped the header directly and a
  shared layout would have had to be parameterised by route to express that
  difference. Recomposing that band as a section inside not-found's own
  landmark (matching how the home and partnerships heroes already place a
  dark band immediately after the header) removed the one page that needed
  route-specific chrome, so the objection no longer holds — see Alternatives
  considered.

- **The header reads its current route from the router itself, in two small
  client islands, rather than taking it as a prop.**
  `HeaderNav` (the logo link and the wide-viewport entry row) and `NavToggle`
  (the narrow-viewport drawer) each call `usePathname()` internally. Once
  chrome is composed by the layouts rather than by pages, no page-level prop
  chain remains available to carry the route down to the header, so this
  moved from a page-supplied prop to the router. The static export still
  prerenders every route (`output: "export"`), so the served HTML for each
  route carries the right `aria-current` and the right logo link — there is
  no client-only rendering gap, matching how `NavToggle` already behaved
  before this change.

- **Cross-page links use the framework's link component; anchors do not.**
  This is not stylistic: the project's lint configuration
  treats a plain anchor pointing at a known route as an error,
  and resolves routes from the app directory.
  In-page anchors, `tel:` and `mailto:` stay plain anchors.

- **Shared content lives in `lib/site-content.ts`.**
  The brand mark, the navigation, and the company's contact details.
  Page-specific content stays beside its page.
  The address is stored once as its constituent lines;
  the footer joins them and the contact panel does not,
  so the two renderings cannot disagree.

- **The current-page state is expressed through the accessibility attribute,
  and that attribute is also the styling hook.**
  One signal drives both what the visitor sees and what assistive technology
  announces, so the two cannot fall out of step —
  which is exactly what happens when a conditional class carries the visual
  state and the attribute is added later, or forgotten.

- **The primary navigation collapses below 761px.**
  Above it, the entries render as a row
  between the logo and the call to action.
  Below it, a control opens a drawer against the right edge of the viewport,
  over a scrim, holding the same entries.
  Exactly one form is present at a time.

  The threshold and the drawer both come from the source design
  rather than from us.
  Matching it keeps the implemented site and the design file
  describing one thing.

- **This is the only width breakpoint in our own layout,
  and it is recorded as an exception** in the style guide,
  with its arithmetic and with the alternative that was rejected.
  A collapsing navigation cannot be expressed without a breakpoint:
  something has to decide when the entries give way to the control.
  Nothing else on the site gains a breakpoint,
  and a second one needs its own justification rather than citing this.
  (Two other media queries exist and are not layout breakpoints:
  one lifts Calendly's own `max-height` cap on vendor markup,
  and one honours `prefers-reduced-motion`.)

  761px clears the requirement with room for a fourth entry:
  at that width the padding leaves ~700px
  against the ~511px the full row needs.
  It is not a Tailwind default,
  so it is written as an arbitrary variant rather than rounded to `sm` or `md`,
  which would move the switch away from where the design put it.

- **The call to action stays in the header at every width.**
  It does not always fit beside the logo and the control —
  at 375px the three plus their gaps need ~337px against 335px —
  so the header keeps `flex-wrap` and lets it drop to a second row.
  The drawer carries its own copy, full width and 44px tall,
  because a drawer is a touch surface rather than a toolbar.

- **One small client component, not a client header.**
  `NavToggle` owns the open/closed state and renders the control and the panel.
  The header, the logo, and the wide-viewport entry row stay server-rendered.
  This is the same shape as `BookingTrigger`:
  a static header with interactive islands inside it.

- **The control's behaviour is part of the decision,
  not an implementation detail.**
  `aria-expanded` on the control and a labelled dialog role on the drawer;
  the scrim, the ✕, Escape and choosing an entry all close it,
  and closing returns focus to the control;
  the drawer is not rendered while closed,
  so its links leave the tab order with it;
  the page behind does not scroll while it is open;
  the hidden form is removed from the accessibility tree,
  so the entries are never announced twice.
  A collapsing navigation without these
  is a worse navigation than the row it replaced.

  Three of those — Escape, the focus return, and the scroll lock —
  are not in the source design.
  They are added because a drawer without them is a trap:
  the design describes the appearance, not the whole behaviour.

- **The control's icon is inline SVG.**
  The source design uses a `☰` character.
  A text glyph renders differently on every platform
  and cannot be stroked or sized with the rest of the iconography,
  so the shape is reproduced as SVG at the same box size.

## Consequences

- A new page costs one route file, one entry in the navigation data,
  and nothing else.
  The collapsed navigation scales with it,
  where wrapping would have degraded with each entry.
  It also costs nothing to compose: contributing a page under `app/(site)/`
  is contributing only that page's own content, since the layouts already
  own the chrome and the organisation record.
- The navigation is the only place routes are enumerated,
  so a page that exists but is not listed is unreachable by navigation.
  That is deliberate: it is how a page is kept out until it is ready.
- The style guide's no-breakpoints rule is a rule with one exception,
  which is weaker than a rule without one.
  Recording the exception explicitly, with its reasoning,
  is what keeps it from becoming a precedent.
- The header is not wholly static.
  The cost is bounded to its interactive islands,
  but the header does ship client JavaScript.

## Alternatives considered

- **A shared layout holding header and footer.**
  Originally rejected: pages needed different chrome context, because the
  not-found page wrapped the header in its own dark band while every other
  page did not, and a layout would have needed route-specific parameters to
  express that — more indirection for the same coupling.
  **This is the decision now.** The objection depended on not-found's band
  wrapping the header; recomposing that band as a section inside not-found's
  own landmark, the same shape the home and partnerships heroes already use,
  removed the one page that needed different chrome. With every page needing
  identical chrome, the root and `(site)` layouts compose it once instead of
  every page repeating the same three lines.
- **Reading the pathname at runtime, in two small client islands.**
  Originally rejected for the header as a whole: converting the whole,
  server-rendered header into a client component to discover something the
  build already knew would have contradicted the server/client split recorded
  above.
  **This is the decision now, narrowed to exactly the two pieces that need
  the route.** Once chrome moved out of pages and into the layouts, no
  page-level prop chain remained to carry the current route down to the
  header, so `HeaderNav` and `NavToggle` read it from the router themselves.
  `Header` stays a server component around them; only those two islands ship
  client JavaScript for this, the same shape `NavToggle` already used before
  this change.
- **Leaving chrome in `components/home/` and importing it from other pages.**
  Rejected: it would make the directory name a lie,
  and every new page would inherit the confusion.
- **Letting the navigation wrap on narrow viewports.**
  Rejected: with three entries the header becomes a stack rather than a row,
  and each further entry makes it worse.
