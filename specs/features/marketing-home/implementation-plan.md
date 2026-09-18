# Marketing Home — Implementation Plan

Clean implementation source of truth. Keeps the home page shippable without a
cleanup refactor.

## Component tree

```
app/(home)/page.tsx  (server)
├── components/site/Header.tsx        (server, static — shared chrome)
├── components/home/Hero.tsx          (client — cross-fade timer)
├── components/home/SoftwareSection.tsx (client — active tab state)
├── components/home/ScienceSection.tsx  (client — active slide state)
├── components/home/BookMeeting.tsx   (server, static)
└── components/site/Footer.tsx        (server, static — shared chrome)
```

`components/site/` holds chrome every page renders; `components/home/` holds
what belongs to this page alone.

Shared primitives in `components/site/`:
- `PillButton.tsx` — white pill action (`href`, children), plus the
  `pillButtonClassName` constant that `<button>` triggers reuse. It renders a
  plain `<a>`, so it must not be pointed at a route.
- `MotionPauseButton.tsx` — presentational pause/resume toggle using
  `pillButtonClassName`. It owns no motion.

Local primitives in `components/home/`:
- `SectionHeading.tsx` — centred title + underline + optional description. Used
  only by the software and science sections.

Data in `lib/site-content.ts` (shared with every page):
- `LOGO`, `NAV_ITEMS`, `SitePath`, `CONTACT_EMAIL`, `CONTACT_PHONE`,
  `ADDRESS_LINES`.

Data in `lib/home-content.ts` (this page only):
- `UPLOADS` base URL constant.
- `TABS: SoftwareTab[]` (label, iconUrl, title, subtitle, imageUrl, bullets).
- `SLIDES: ScienceSlide[]` (logos[] of `{ src, width, height }`, imageUrl,
  caption). `width` and `height` are the picture file's own pixel size, used
  as HTML attributes so the row has a fallback intrinsic size before the file
  arrives. Displayed size still comes from the existing `max-height` clamp /
  `width: auto` / `max-width: 100%` fitting rules.
- Hero image URLs.

## Server / client split

- Only Hero, SoftwareSection, ScienceSection are `"use client"` (they own state /
  timers). Everything else renders on the server.
- Header and Hero own adjacent navy surfaces. `page.tsx` composes them directly
  rather than adding a styling wrapper around either component, keeping the
  static Header on the server while Hero is a client child.
  The contact page composes Header the same way, without a page-owned band.
- The Header receives its current path as a prop rather than reading it from
  the router, which keeps it a server component. See
  `specs/decisions/shared-site-chrome-and-navigation.md`.

## State ownership

- `Hero`: `heroState: 0|1|2`, `paused` (boolean, default false), a local flag
  that admits the solver overlay after mount, and a `useEffect` interval (3s)
  that depends on `paused` and `usePrefersReducedMotion` and is cleared on
  unmount. When `paused` is true, or reduced motion is preferred, the interval
  is not held and `heroState` is left as it is — including when reduced motion
  is turned on after the interval has already started. The solver overlay is
  admitted only on the path that starts that interval, so reduced motion that
  cancelled it never fetches the unused layer. The pause control is omitted
  when `usePrefersReducedMotion` is true. That hook is false during server
  render, so `window` is never read while rendering;
  `react-hooks/set-state-in-effect` forbids the otherwise equivalent
  `useState` plus effect. Rotation interval, reduced-motion, and
  slide-wrapping behaviour are otherwise unchanged.
- `SoftwareSection`: `activeTab: number` (default 0); derives active card from
  `TABS[activeTab]`.
- `ScienceSection`: `slide: number` (default 0); `next`/`prev`/`goTo` handlers.
- No global state, no context; data is imported static content.

## Styling approach

- Tailwind v4 utilities driven by tokens in `app/globals.css` (`@theme`).
- Decorative radial glows use inline `style` (no utility equivalent) — the single
  sanctioned inline-style exception, per `specs/ui/style-guide.md`.
- Images: plain `<img>` referencing the external WordPress URLs (tradeoff noted in
  the feature spec; `next/image` + `remotePatterns` is a future optimisation).

## JSX / readability rules

- Each section component owns its markup; `page.tsx` only composes and sets the
  section order + anchor ids.
- Map over `TABS` / `SLIDES`; no duplicated per-item JSX.
- Keep bullet lists, logo rows, and dots as small inline maps within their section
  (one-off, no extraction needed).

## Naming

- Components PascalCase; content types `SoftwareTab`, `ScienceSlide`.
- British English in prose/comments; product copy preserved verbatim from source
  (e.g. US spellings inside quoted marketing copy stay as-is).
