# Marketing Partnerships — Experience

Behavioural source of truth for the partnerships page: what moves, what
responds, and what the visitor sees change.

The page holds no state of its own. The only interactive behaviour it owns is
the marquee's motion; everything else belongs to shared chrome.

## The partner marquee

- The strip moves continuously and linearly, never pausing and never reversing.
  There are no controls: it is ambient, not a carousel.
- Its list is rendered twice end to end and translated by exactly half the
  strip's width, so the loop point falls where the second copy's first mark
  sits under the first copy's. No break is visible.
- Hovering does not stop it. Nothing on the strip is interactive — the marks
  are not links — so there is nothing a pause would let the visitor do.
- **The duration governs distance, not speed.** A longer list covered in the
  same time scrolls faster. Adding partners without lengthening the duration
  speeds the marquee up; see `specs/ui/style-guide.md` → Motion.

### Reduced motion

- When the visitor's system asks for reduced motion, the strip does not move.
- The marks stay on screen. Reducing motion removes the movement, never the
  content — a section that vanishes under the preference is a defect.

### Assistive technology

- The duplicated half is hidden from assistive technology, so each partner
  organisation is announced once.
- Each mark is announced by its organisation's name, not a label shared with
  every other mark.

## Hover and focus states

- Header navigation and footer links: as elsewhere. See
  [`marketing-home/experience.md`](../marketing-home/experience.md).
- "Schedule a Call": the standard pill hover.
- Reading order is the visual order: header, hero, marquee, narrative, panel,
  footer.

## Navigation anchors

- The logo navigates to the home page; it does not scroll, because this page's
  band is not an anchor target.
- The "Partnerships" entry is the current one here.
- The panel's "Schedule a Call" and the footer's "Schedule a meeting" both open
  the booking dialog.

## Booking dialog

Identical to the home page's. See
[`marketing-home/experience.md`](../marketing-home/experience.md).

## Responsive behaviour

- The narrative's two columns sit side by side while there is room and stack
  otherwise, heading above prose.
- The marquee keeps its own overflow hidden. It is the page's most likely
  source of a horizontal scrollbar and must never produce one.
- The primary navigation collapses below 761px into a drawer; see
  [`marketing-home/experience.md`](../marketing-home/experience.md).

## Loading, empty, and error states

There are none. Every value is static content compiled into the page; nothing
is fetched, so nothing can be pending, empty, or failed. The partner list is
never empty — an empty list would render an empty strip, which is a content
error, not a state to design for.
