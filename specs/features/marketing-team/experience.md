# Marketing Team — Experience

Behavioural source of truth for the Our Team page.
The page has no client-side state of its own.
Interactive behaviour belongs to shared chrome or to the existing booking flow.

## User Flows and Navigation

A visitor reaches `/team` from the primary navigation, the narrow-viewport menu,
or the footer Quick Links column.
The page loads with the shared header, one primary-content landmark containing
the team section, and the shared footer.

The logo navigates to the home page.
Home, Partnerships, Our Team and Contact navigate to their respective pages.
The Our Team entry is the current entry on this page.

The footer Our Team link navigates to `/team`.
The footer Schedule a meeting action opens the booking dialog.

## Interaction and Micro-Interactions

Header navigation hover and focus behaviour is identical to the other primary
pages.
The current Our Team entry is marked with `aria-current="page"`, and that same
attribute drives its visual current state.

The header Schedule a call action and the footer Schedule a meeting action open
the existing booking dialog.
The team cards are static content and do not open profile pages.

Portrait images are content images.
Each image is announced by the staff member's name.

## State Management and Logic

The page owns no local state, effects, timers, form state, loading state,
empty state or error state.
The team catalogue is static content compiled into the page.
Booking state remains in the existing booking provider.

Exactly one primary-navigation entry is marked current on the page:
Our Team.
The narrow menu applies the same current-page rule when it is opened.

## Accessibility Behaviour

The skip control moves focus to the `main-content` landmark.
The page exposes a single `main` landmark with `id="main-content"`.
The shared header and footer are outside that landmark.

The staff-card grid reflows on narrow viewports.
Text and portraits do not overlap, clip or cause horizontal scrolling.
Keyboard order follows the shared chrome, then the static team content,
then footer links and actions.

The narrow-viewport menu behaviour is identical to the shared HeaderNav
contract:
it opens as a modal dialog named Menu, traps focus while open, closes through
Escape, the scrim, the close control or choosing an entry, and restores focus
to the menu control for passive closes.
