# Marketing Contact — Implementation Plan

Clean implementation source of truth. Keeps the contact page shippable without
a cleanup refactor.

## Component tree

```
app/contact/page.tsx  (server)
├── components/site/Header.tsx              (server, static — shared chrome)
├── components/contact/ContactSection.tsx   (server, static)
│   └── components/contact/ContactDetail.tsx (server, static, ×3)
└── components/site/Footer.tsx              (server, static — shared chrome)
```

Shared primitives in `components/site/`:
- `PillButton.tsx` — white pill action, and the `pillButtonClassName` constant
  that `<button>` triggers reuse.

Data in `lib/site-content.ts`:
- `LOGO`, `NAV_ITEMS`, `SitePath`, `CONTACT_EMAIL`, `CONTACT_PHONE`,
  `ADDRESS_LINES`.

## Where components live

`components/site/` holds chrome every page renders; `components/home/` and
`components/contact/` hold what belongs to one page. `SectionHeading` stays in
`components/home/` because only the home sections use it — the contact heading
deliberately does not reuse it (see below).

## Server / client split

- The whole page is server-rendered. The only client component reached is
  `BookingTrigger`, which was already a client component.
- No `usePathname`: the header takes its current path as a prop, so it stays a
  server component. With a static export there is no dynamic routing to react
  to, and making the header a client component would pull the logo and all its
  markup into the client graph for a value known at build time.

## State ownership

None. The page holds no state, no effects, and no timers. Booking state lives
in the existing provider.

## Composition

- The dark band around the header is composed in `page.tsx`, not a wrapper
  component — the same reason the home page does it: the band must clip the
  header glow, and its contents differ per page.
- The header is three flex children (logo, nav, action). The nav takes `flex-1`
  and centres its contents, which is what keeps it centred between the two
  flanking elements at any of their widths, and what survives the header's
  wrap. Grouping the logo and nav in a wrapper also produces the wrap but
  loses the centring; it was tried and rejected.

## Styling approach

- Tailwind v4 utilities driven by tokens in `app/globals.css` (`@theme`).
- The decorative glow uses inline `style` — the single sanctioned inline-style
  exception, per `specs/ui/style-guide.md`.
- Class lists are composed with `cn()`, never by string concatenation.
- The nav's current-page state is expressed as an `aria-[current=page]:`
  variant rather than a conditional class, so the visual state and the
  assistive-tech state have one source.

## JSX / readability rules

- `ContactDetail` exists because the label carries five classes and appears
  three times; the three details are otherwise written out, not mapped, because
  their values differ in kind (two lines of text, a telephone link, a mail
  link).
- `SectionHeading` is not reused for the contact heading: that heading is an
  `h1`, left-aligned, with a 64px bar, a different type ramp, and no
  description. Serving both from one component would mean four props for one
  caller.
- If `ContactSection.tsx` grows past roughly 110 lines, split the details panel
  into its own component. Do not pre-split.

## Naming

- Components PascalCase. British English in prose and comments; product copy is
  preserved verbatim from the source design.
