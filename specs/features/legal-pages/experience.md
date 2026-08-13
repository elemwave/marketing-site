# Legal Pages — Experience

Behavioural source of truth for the legal prose pages.

## Flows

### Reaching a legal page

From any page, the visitor scrolls to the footer's **Policies** column and follows
one of the two links.
Navigation is client-side; the target page is prerendered, so there is no loading
state to show.

Legal pages are also entered directly, from a search result, an email or an audit
trail. Nothing on the page assumes the visitor came from the home page.

### Leaving a legal page

- The brand logo in the header returns to the home page and to its top.
- The footer's remaining links behave exactly as they do on the home page.

### Scheduling from a legal page

The header's "Schedule a call" and the footer's "Schedule a meeting" open the same
booking dialog as on the home page.
The dialog, its scrim, its close control and its scheduling widget behave identically;
see `specs/features/marketing-home/experience.md`.

## States

**Loaded** is the only state.
The pages are static: no data fetching, no forms, no user input, therefore no loading,
error or empty states.

## Micro-interactions

- Footer links: `white/70`, brightening to white on hover, as every other footer link.
- Body links: base `navy-700`, hover `blue-500`, underlined.
- Outbound links to third-party policies and to the supervisory authority open in a
  new context, so the visitor does not lose their place in the document.
- Contact email links open the visitor's mail client with the address prefilled.
- No animation, no scroll-triggered behaviour, no reveal.

## Reading and assistive behaviour

- The document title is the page's only `h1`; the document's own sections are `h2`,
  giving a flat, predictable outline for screen-reader navigation.
- The document body declares its own language, so a screen reader switches
  pronunciation on entering the column and switches back on leaving it.
  The same applies to the footer link labels.
- The measure is capped at 820px so line length stays readable regardless of viewport
  width.

## Responsive behaviour

The pages follow the site's fluid convention: padding and type scale with `clamp()`,
with no media queries and no breakpoints.
The reading column collapses to the available width below 820px.
The header's glow stays clipped by its wrapper, so no viewport width produces a
horizontal scrollbar.
