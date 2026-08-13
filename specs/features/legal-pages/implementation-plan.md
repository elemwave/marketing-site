# Legal Pages — Implementation Plan

Clean implementation source of truth: component responsibilities, file organisation
and reuse. Reflects the shipped code.

## File organisation

```
projects/marketing/
  app/(legal)/
    layout.tsx                    chrome shared by every legal page
    integrated-policy/page.tsx    /integrated-policy
    privacy-policy/page.tsx       /privacy-policy
  components/legal/prose.ts       prose class-name constants
```

`(legal)` is a route group, mirroring the existing `(home)` group.
It adds no path segment.

## Responsibilities

| Unit | Owns |
|---|---|
| `app/(legal)/layout.tsx` | Booking provider, header, `<main>`, footer. Nothing document-specific. |
| `integrated-policy/page.tsx` | Page metadata and the integrated policy's own copy. |
| `privacy-policy/page.tsx` | Page metadata and the privacy policy's own copy. |
| `components/legal/prose.ts` | The class names shared by both documents. |

## State ownership

None.
All three files are server components with no state and no data fetching.
The only client state on these pages is the booking dialog's open flag, owned by
`BookingModalProvider` as on the home page.

## Layout JSX structure

```tsx
<BookingModalProvider>
  <div className="overflow-hidden bg-navy-950">
    <Header />
  </div>
  <main>{children}</main>
  <Footer />
</BookingModalProvider>
```

The provider is not optional: `Header` and `Footer` both render `BookingTrigger`,
which throws without a provider in scope.
The wrapper around `Header` is not optional either: it clips the header's 120%-wide
glow, per `specs/ui/style-guide.md § Glow`.

The home page keeps composing its own chrome, because its dark band wraps the header
**and** the hero in one container — a structure the legal pages do not share.

## Page JSX structure

```tsx
<section className="bg-surface …section padding…">
  <div lang="es" className="mx-auto max-w-[820px]">
    <SectionHeading as="h1" title="…" />
    …headings, paragraphs and lists using the prose constants…
  </div>
</section>
```

## Local primitive reuse

- `SectionHeading` (`components/home/SectionHeading.tsx`) renders the title and
  underline bar. It takes an optional `as?: "h1" | "h2"` prop, defaulting to `"h2"`,
  so the home page is unaffected and page titles are correctly `h1`.
- `Header`, `Footer`, `BookingModalProvider` and `BookingTrigger` are reused as-is.
- `prose.ts` exports `legalHeading`, `legalParagraph`, `legalList`, `legalStrong`,
  `legalLink` and `legalAddress`, following the class-constant pattern already used
  by `Footer.tsx` and `PillButton.tsx`.

No typography plugin is used, and no new design tokens were introduced.

## Rejected alternatives

- **A `LegalPage` wrapper component** — the approved legal text is pasted in by hand;
  a wrapper owning title, date and section structure would constrain that paste for
  no present benefit. Two documents is not enough repetition to justify it.
- **Hoisting the chrome to the root layout** — would force the home page to opt out
  of it, because of the shared header/hero dark band.
- **`@tailwindcss/typography`** — a new dependency, and therefore an ADR, for two
  pages of static prose.

## Conditional rendering

None. Every block on both pages is literal markup.

## Content updates

Amending an approved policy is a copy edit inside that page's content column.
No layout, styling or structural change is required.
The privacy policy's contact address is held in a single `CONTACT_EMAIL` constant,
used by both the contact block and the data-rights paragraph.
