# Marketing Home — Implementation Plan

Clean implementation source of truth. Keeps the home page shippable without a
cleanup refactor.

## Component tree

```
app/page.tsx  (server)
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

Local primitives in `components/home/`:
- `SectionHeading.tsx` — centred title + underline + optional description. Used
  only by the software and science sections.

Data in `lib/site-content.ts` (shared with every page):
- `LOGO`, `NAV_ITEMS`, `SitePath`, `CONTACT_EMAIL`, `CONTACT_PHONE`,
  `ADDRESS_LINES`.

Data in `lib/home-content.ts` (this page only):
- `UPLOADS` base URL constant.
- `TABS: SoftwareTab[]` (label, iconUrl, title, subtitle, imageUrl, bullets).
- `SLIDES: ScienceSlide[]` (logos[], imageUrl, caption).
- Hero image URLs.

## Server / client split

- Only Hero, SoftwareSection, ScienceSection are `"use client"` (they own state /
  timers). Everything else renders on the server.
- The dark band (Header + Hero) is composed in `page.tsx`, not a wrapper
  component, to keep the static Header on the server while Hero is a client child.
  The contact page composes its own band the same way, around the Header alone.
- The Header receives its current path as a prop rather than reading it from
  the router, which keeps it a server component. See
  `specs/decisions/ADR-0004-shared-site-chrome-and-navigation.md`.

## State ownership

- `Hero`: `heroState: 0|1|2`, `useEffect` interval (3s), cleared on unmount;
  respects `prefers-reduced-motion`.
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
