# ADR-0004: Share site chrome across pages and pass the current route as a prop

Status: Accepted

## Context

Until the contact page, the marketing site had exactly one route.
Header and footer lived in `components/home/`
because "home" and "the site" were the same thing,
and neither component needed to know which page it was on,
because there was only one.

Adding a second page breaks all three assumptions at once.
The header and footer are now chrome, not home-page sections.
The header needs a navigation bar,
and that navigation needs to indicate which page the visitor is on.
And two pages now render the same contact details,
which have to come from one place or they will drift.

Two properties of this project constrain the answer.
The site is a **static export** (`output: "export"`, ADR-0003):
there is no server runtime and no request-time routing,
so every route is known at build time.
And the header is currently a **server component** —
`specs/features/marketing-home/implementation-plan.md` says so explicitly,
and it is the reason the dark band is composed in the page
rather than in a wrapper component.

## Decision

- **Chrome moves to `components/site/`.**
  `Header`, `Footer`, and `PillButton` are no longer home-specific.
  `SectionHeading` stays in `components/home/`:
  only the software and science sections use it,
  and moving it would be speculative.
  The rule is that `components/site/` holds what every page renders,
  and `components/<page>/` holds what one page renders.

- **Chrome stays composed per page, not lifted into a shared layout.**
  Each page wraps the header in its own clipping dark band.
  On the home page that band also encloses the hero;
  on the contact page it encloses the header alone.
  The band is what clips the header glow,
  which is deliberately wider than the viewport
  (`specs/ui/style-guide.md` → Glow).
  A shared layout would have to be parameterised by route to express that,
  which is the same coupling with an extra indirection.

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

## Consequences

- A third page costs one route file, one entry in the navigation data,
  and nothing else. That is the point.
- The header now wraps on narrow viewports.
  Adding a navigation bar made it overflow at phone widths,
  and because the dark band clips, the failure was a silently cut-off button
  rather than a visible scrollbar.
  The call to action drops to a second row instead.
  This changes the home header too — it is one component.
- Every page's header must pass its route.
  Forgetting is a type error, not a rendering bug.
- The navigation is the only place routes are enumerated,
  so a page that exists but is not listed is unreachable by navigation.
  That is deliberate: it is how the Partnerships entry in the source design
  is kept out until the page exists.

## Alternatives considered

- **A shared layout holding header and footer.**
  Rejected: the two pages need different clipping bands,
  so the layout would need a prop for the band's contents —
  more indirection for the same coupling.
- **Reading the pathname at runtime.**
  Rejected: it converts a static, server-rendered header into a client one
  to discover something the build already knows,
  and it contradicts the server/client split already recorded for the header.
- **Leaving chrome in `components/home/` and importing it from the contact
  page.**
  Rejected: it would make the directory name a lie,
  and the next page would inherit the confusion.
