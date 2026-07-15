# Marketing Home — Implementation Plan

Clean implementation source of truth. Keeps the home page shippable without a
cleanup refactor.

## Component tree

```
app/page.tsx  (server)
├── components/home/Header.tsx        (server, static)
├── components/home/Hero.tsx          (client — cross-fade timer)
├── components/home/SoftwareSection.tsx (client — active tab state)
├── components/home/ScienceSection.tsx  (client — active slide state)
├── components/home/BookMeeting.tsx   (server, static)
└── components/home/Footer.tsx        (server, static)
```

Shared local primitives in `components/home/`:
- `PillButton.tsx` — white pill action (`href`, children).
- `SectionHeading.tsx` — centred title + underline + optional description.

Data in `lib/home-content.ts`:
- `UPLOADS` base URL constant.
- `TABS: SoftwareTab[]` (label, iconUrl, title, subtitle, imageUrl, bullets).
- `SLIDES: ScienceSlide[]` (logos[], imageUrl, caption).
- `LOGO_URL`, hero image URLs.

## Server / client split

- Only Hero, SoftwareSection, ScienceSection are `"use client"` (they own state /
  timers). Everything else renders on the server.
- The dark band (Header + Hero) is composed in `page.tsx`, not a wrapper
  component, to keep the static Header on the server while Hero is a client child.

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
