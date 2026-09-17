# Marketing Team — Implementation Plan

Clean implementation source of truth.
The page stays frontend-only and static.

## Component Responsibilities

`app/team/page.tsx` owns the route, metadata, shared organisation record,
shared header, primary landmark and shared footer.
It passes `currentPath="/team"` to the Header.

`components/team/TeamSection.tsx` owns the page-specific section:
introductory copy and a grid of staff cards rendered from `TEAM_MEMBERS`.

`lib/team-content.ts` owns the static catalogue and introductory copy.
It exports `TEAM_INTRO`, `TEAM_MEMBERS` and the `TeamMember` type.

`components/site/Header.tsx` and `components/site/NavToggle.tsx` continue to
derive all primary navigation entries from `NAV_ITEMS`.
`components/site/Footer.tsx` owns the footer Quick Links list.

## File Organisation

Create:

- `projects/marketing/app/team/page.tsx`.
- `projects/marketing/app/team/page.test.tsx`.
- `projects/marketing/components/team/TeamSection.tsx`.
- `projects/marketing/components/team/rendering.test.tsx`.
- `projects/marketing/lib/team-content.ts`.
- `projects/marketing/public/images/staff/*.webp`.

Update:

- `projects/marketing/lib/site-content.ts`.
- `projects/marketing/lib/site-content.test.ts`.
- `projects/marketing/lib/published-pictures.test.ts`.
- `projects/marketing/components/site/Footer.tsx`.
- `projects/marketing/components/site/Footer.test.tsx`.
- `projects/marketing/components/site/NavToggle.test.tsx`.
- `projects/marketing/app/sitemap.test.ts`.
- `projects/marketing/e2e/page-routes.spec.ts`.
- `projects/marketing/e2e/accessibility.spec.ts`.

This follows the existing app convention:
static content in `lib/`, page-specific components in `components/<page>/`,
and public images in `public/images/`.

## State Ownership

The page and team section are server-rendered and static.
They own no state.
Booking state remains in the existing booking provider.
The only client component reached through this work is the existing booking and
narrow-menu chrome.

## Hook Extraction Plan

No new hooks are needed.
There is no non-trivial local orchestration, no form coordination, no filters,
no derived interactive state and no async state.

## Rendering Structure

`TeamSection` maps `TEAM_MEMBERS` to one article per person.
Each article renders the portrait image, name heading, role label and summary.
The section keeps the intro block separate from the card grid so the JSX stays
readable.

Do not create a shared card primitive.
The staff card is currently a one-page pattern with no demonstrated reuse.

## Form and Validation Structure

The page has no form and no validation.
The booking dialog is reused unchanged.

## Reuse of Local Primitives

Reuse the shared Header, Footer, OrganisationRecord, BookingTrigger flow,
`pageMetadata` helper, `NAV_ITEMS` catalogue and design tokens from
`app/globals.css`.
Use `next/image` for staff portraits, matching other image-heavy page sections.
Use the existing white pill action appearance only through shared booking
triggers; the team section adds no new action button.

## Conditional Rendering Strategy

The page has no conditional rendering beyond shared chrome.
The current navigation state is derived from `currentPath="/team"`.

## Anti-Cleanup Checklist

- The page has one primary-content landmark and no duplicate H1.
- The team catalogue is typed and ordered from the supplied design.
- Each staff card renders all required fields from the catalogue.
- Each portrait has a person-identifying accessible name.
- The navigation, narrow menu, footer and sitemap all derive or assert the team
  route without duplicating hidden route state.
- Staff images are valid published WebP files under `public/images/staff/`.
- No backend, API, persistence, infrastructure or dependency changes are made.
- Focused Vitest, file-scoped lint and focused Playwright checks cover the
  changed behaviour.
