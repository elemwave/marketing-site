# Marketing Partnerships — Implementation Plan

Clean implementation source of truth. Keeps the partnerships page shippable
without a cleanup refactor.

## Component tree

```
app/partnerships/page.tsx  (server)
├── components/site/Header.tsx                        (server — shared chrome)
│   └── components/site/NavToggle.tsx                 (client — the only one)
├── components/partnerships/PartnershipsHero.tsx      (server, static)
├── components/partnerships/PartnerMarquee.tsx        (client — strip button)
│   └── components/partnerships/MarqueeLogo.tsx       (client — promote deferred marks)
├── components/partnerships/PartnershipsNarrative.tsx (server, static)
├── components/partnerships/BecomePartner.tsx         (server, static)
└── components/site/Footer.tsx                        (server — shared chrome)
```

Data in `lib/site-content.ts`: `PARTNER_LOGOS`, alongside the navigation and
contact details every page shares.

The strip itself owns the native button semantics while motion is available;
it renders no separate pause/resume primitive or icon.
The animation stays CSS (`animate-logo-scroll` plus `is-paused` for visitor
pause).
`components/site/useReducedMotionFocusHandoff.ts` hands keyboard focus to a
stable fallback element when a live reduced-motion change removes the
currently focused pause/resume button; shared with `components/home/Hero.tsx`.

## Server / client split

- `PartnerMarquee` is a client component because it owns the visitor's pause
  flag. The animation itself stays CSS: JavaScript only toggles the paused
  class and renders the strip as a control. Motion still runs before hydration.
- `MarqueeLogo` is a small client child used only by `PartnerMarquee`. It
  renders each partner mark deferred in the first HTML, then promotes those
  marks to ordinary fetching after mount so the CSS translation still has
  pixels when an off-screen mark enters the visible window. That is not a
  rewrite of the animation.
- The other sections of this page are server-rendered. Shared client code
  remains `BookingTrigger` and `NavToggle` inside the header.

## State ownership

- `PartnerMarquee`: `paused` (boolean, default false). While true, the
  animated row carries `is-paused`. Logos stay in the DOM, including the
  `aria-hidden` duplicate half. The strip is not rendered as a pause/resume
  button when `usePrefersReducedMotion` is true (false during server render, so
  `window` is never read while rendering).
  `useReducedMotionFocusHandoff` tracks whether the button holds focus (via
  `onFocus`/`onBlur`, no re-render) and, in a `useLayoutEffect` keyed on the
  reduced-motion value, focuses the persistent wrapping `<section>`
  (`tabIndex={-1}`) when that button is removed while focused.
- `MarqueeLogo`: each mark starts deferred and is promoted to ordinary
  fetching after mount. That state is local to the child; `PartnerMarquee`
  does not own it.
- The navigation's open/closed state belongs to `NavToggle`; booking state to
  the existing provider.

## Composition

- Header and PartnershipsHero own adjacent navy surfaces. `page.tsx` composes
  them directly rather than adding a styling wrapper around either component.
- The marquee's negative top offset is what joins it visually to the hero
  surface. It belongs to the marquee, not the hero. No page-owned ancestor may
  clip overflow: `Header` clips the glow, and clipping that ancestor would cut
  the marquee cards.

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
  else needs it. The mark inside it is `MarqueeLogo`.
- Partner marks are plain `<img>`, matching `ScienceSection`. The export has no
  image optimisation, so `next/image` buys nothing here, and the lint rule is
  disabled inline exactly as it already is there.
- The narrative's two paragraphs are written out rather than mapped: they are
  prose, not data.

## Naming

- Components PascalCase. British English in prose and comments; product copy is
  preserved verbatim from the source design.
