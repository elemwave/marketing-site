# Marketing Contact — Experience

Behavioural source of truth for the contact page: what moves, what responds,
and what the visitor sees change.

The page has **no client-side state of its own**. Every interactive behaviour
below either belongs to shared chrome or is the browser's own.

## Hover and focus states

- Header nav: an entry the visitor is not on is dimmed white and brightens to
  full white on hover. The entry for the current page is already full white and
  goes to `blue-200` on hover, so hovering the page you are on still gives
  feedback rather than looking inert.
- Contact panel phone and email: white, going to `blue-200` on hover.
- "Schedule a call": the standard pill hover.
- Every interactive element is keyboard-focusable and reachable in reading
  order: logo → nav entries → header action → panel links → panel action →
  footer.

## Current-page indication

- The navigation entry matching the current page is marked as the current page
  for assistive technology, and that same marking drives its appearance. The
  two cannot drift apart, because there is only one signal.
- Exactly one entry is marked per page.

## Navigation anchors

- The logo navigates to the home page. It does **not** scroll, because there is
  nothing above it on this page — that behaviour belongs to the home page only.
- The "Home" nav entry navigates to the home page.
- The "Contact" nav entry navigates to the contact page, and is the current
  entry here.
- Header "Schedule a call" and panel "Schedule a call" both open the booking
  dialog. Footer "Schedule a meeting" does the same.

## Contact actions

- The telephone number is handed to the visitor's telephone application.
- The email address is handed to the visitor's mail application.
- The postal address is text, not a link — it opens no map.
- None of the three submits anything: the page has no form, and the site has no
  server to receive one.

## Booking dialog

Identical to the home page's. See
[`marketing-home/experience.md`](../marketing-home/experience.md).

## Responsive behaviour

- The card's two columns sit side by side while there is room and stack
  otherwise, introduction above details panel. No breakpoint governs this; the
  columns wrap when their content demands it.
- The header's call to action drops to a second row on narrow viewports rather
  than being clipped by the dark band. See `specs/ui/style-guide.md` → Layout
  metrics.
- No viewport width produces horizontal scrolling.

## Loading, empty, and error states

There are none. Every value on the page is static content compiled into it;
nothing is fetched, so nothing can be pending, empty, or failed. The only
deferred content on the page is the booking dialog's scheduler, whose states
belong to the dialog.
