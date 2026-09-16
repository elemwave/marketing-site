# Marketing Partnerships — Implementation Plan

Clean implementation source of truth. Keeps the partnerships page shippable
without a cleanup refactor.

## Component tree

```
app/partnerships/page.tsx  (server)
├── components/site/Header.tsx                        (server — shared chrome)
│   └── components/site/NavToggle.tsx                 (client — the only one)
├── components/partnerships/PartnershipsHero.tsx      (server, static)
├── components/partnerships/PartnerMarquee.tsx        (client — pause toggle)
├── components/partnerships/PartnershipsNarrative.tsx (server, static)
├── components/partnerships/BecomePartner.tsx         (server, static)
└── components/site/Footer.tsx                        (server — shared chrome)
```

Data in `lib/site-content.ts`: `PARTNER_LOGOS`, alongside the navigation and
contact details every page shares.

The pause toggle is `components/site/MotionPauseButton.tsx`. The animation
stays CSS (`animate-logo-scroll` plus `is-paused` for visitor pause).

## Server / client split

- `PartnerMarquee` is a client component because it owns the visitor's pause
  flag. The animation itself stays CSS: JavaScript only toggles the paused
  class and renders the control.
- The other sections of this page are server-rendered. Shared client code
  remains `BookingTrigger` and `NavToggle` inside the header.

## State ownership

- `PartnerMarquee`: `paused` (boolean, default false). While true, the
  animated row carries `is-paused`. Logos stay in the DOM, including the
  `aria-hidden` duplicate half. The pause control is omitted when
  `usePrefersReducedMotion` is true (false during server render, so `window`
  is never read while rendering).
- The navigation's open/closed state belongs to `NavToggle`; booking state to
  the existing provider.

## Composition

- The dark band around header and hero is composed in `page.tsx`, following the
  home page rather than the contact page — this page has a hero, so the band
  encloses both.
- The marquee's negative top offset is what joins it visually to the band. It
  belongs to the marquee, not the band. The navy parent MUST NOT clip overflow:
  `Header` clips the glow, and clipping this ancestor would cut the marquee cards.

## Why `BecomePartner` is not shared with `BookMeeting`

They are close: a navy gradient panel, a glow, a centred uppercase heading, a
paragraph, a pill. They differ in copy, heading weight, and padding.

Two similar instances are not a pattern; a third would be. Extracting now would
mean a component parameterised by everything that differs, which is the same
markup with indirection on top. The similarity is already recorded where it
belongs — `specs/ui/style-guide.md` → Composition patterns → Gradient CTA
panel. Revisit when a third panel appears.

## Styling approach

- Tailwind v4 utilities driven by tokens in `app/globals.css` (`@theme`).
- The decorative glow uses inline `style` — the sanctioned exception.
- The marquee animation is declared as `--animate-logo-scroll` in `@theme`,
  which is what generates the `animate-logo-scroll` utility. Declaring the
  keyframes alone does **not** produce a working animation, and fails silently:
  the class exists, matches nothing, and the strip simply never moves.
- The reduced-motion override lives outside any cascade layer, so it beats the
  generated utility regardless of source order.
- Class lists are composed with `cn()`, never by string concatenation.

## JSX / readability rules

- `LogoCard` is local to `PartnerMarquee`: it exists because the list is
  rendered twice and the card carries several classes, not because anything
  else needs it.
- Partner marks are plain `<img>`, matching `ScienceSection`. The export has no
  image optimisation, so `next/image` buys nothing here, and the lint rule is
  disabled inline exactly as it already is there.
- The narrative's two paragraphs are written out rather than mapped: they are
  prose, not data.

## Naming

- Components PascalCase. British English in prose and comments; product copy is
  preserved verbatim from the source design.
