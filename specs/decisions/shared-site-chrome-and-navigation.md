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
`specs/features/marketing-home/implementation-plan.md` says so explicitly,
and it is the reason the dark band is composed in the page
rather than in a wrapper component.

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

- **Chrome stays composed per page, not lifted into a shared layout.**
  Each page wraps the header in its own dark band.
  On the home and partnerships pages that band also encloses the hero;
  on other pages it may enclose the header alone.
  The header clips its own glow, which is deliberately wider than the
  viewport (`specs/ui/style-guide.md` → Glow): an overflow-hidden wrapper
  inside `Header` extends below the header so the glow still bleeds over
  the hero.
  Home and partnerships navy parents MUST NOT clip overflow, because unique
  content that follows the hero — the science carousel arrows and the
  partner marquee — would be cut.
  A shared layout would have to be parameterised by route to express the
  different bands, which is the same coupling with an extra indirection.

- **The header receives its current route as a prop,
  rather than reading it from the router.**
  Reading the pathname at runtime would make the header a client component,
  pulling the logo import and the whole header markup into the client bundle
  for a value that is already known when the page is built.
  The prop's type is derived from the navigation data,
  so a route that is not in the navigation fails the build
  rather than silently rendering nothing as current.

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
  `aria-expanded` on the control and a labelled modal dialog on the drawer
  (`aria-modal` plus the dialog role, named Menu);
  focus moves into the dialog when it opens and Tab stays inside it
  until it closes;
  the rest of the page is not an interactive surface while the menu is open;
  the overlay remains a close target;
  the scrim, the ✕, Escape and choosing an entry all close it;
  overlay, close control, and Escape still return focus to the control
  that opened it;
  choosing Schedule a call inside the menu dismisses it without returning
  that focus, then the booking dialog opens as it does today;
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
- Every page's header must pass its route.
  Forgetting is a type error, not a rendering bug.
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
  Rejected: pages need different dark bands (home and partnerships enclose
  the hero; contact, legal and not-found enclose the header alone),
  so the layout would need a prop for the band's contents —
  more indirection for the same coupling.
- **Reading the pathname at runtime.**
  Rejected: it converts a static, server-rendered header into a client one
  to discover something the build already knows,
  and it contradicts the server/client split recorded for the header.
- **Leaving chrome in `components/home/` and importing it from other pages.**
  Rejected: it would make the directory name a lie,
  and every new page would inherit the confusion.
- **Letting the navigation wrap on narrow viewports.**
  Rejected: with three entries the header becomes a stack rather than a row,
  and each further entry makes it worse.
