# Site Chrome

Shared navigation and footer that appear on every page that carries site
chrome.

### Requirement: Every page presents the header, its own content, then the footer, with nothing else around them

Every page SHALL present the site header, then its own primary content as the
single primary-content landmark, then the site footer, in that order, with
nothing else wrapped around any of the three. This holds on every page,
including the not-found page.

#### Scenario: Visitor loads any page
- **WHEN** a visitor loads any page, including the not-found page
- **THEN** the site header is presented first
- **AND THEN** the page's own primary content follows, as the single
  primary-content landmark
- **AND THEN** the site footer follows that landmark
- **AND THEN** no other wrapper surrounds the header, the landmark or the
  footer

### Requirement: The footer is a named landmark with its own hidden heading

The site footer SHALL expose a contentinfo landmark named Footer.
It MUST include a Footer heading at rank 2 before the column headings.
That Footer heading MUST be available to assistive technologies without adding
a visible heading to the page.

#### Scenario: Visitor reaches the footer
- **WHEN** a visitor reaches the footer of a page that carries the site footer
- **THEN** the footer landmark is named Footer
- **AND THEN** a Footer heading is exposed to assistive technologies at heading
  rank 2
- **AND THEN** that Footer heading is not visibly added to the page

### Requirement: Footer column titles are subsections of the footer

The site footer SHALL expose the titles of its columns as headings.
On every page that carries the site footer, the three column titles MUST appear
in the document outline at heading rank 3 after the Footer heading.

#### Scenario: Visitor lists headings in document order
- **WHEN** the headings of a page that carries the site footer are listed in
  document order
- **THEN** the footer heading follows the last heading of that page's own
  content
- **AND THEN** the three footer column titles follow the Footer heading
- **AND THEN** each of those three titles is heading rank 3

#### Scenario: Visitor compares footer headings across pages
- **WHEN** a visitor compares the footer on different pages that carry the site
  footer
- **THEN** the Footer heading and the three column titles use the same heading
  ranks on every such page

### Requirement: Footer column titles keep their present wording and appearance

The three footer column titles MUST keep their present wording, size and colour.

#### Scenario: Visitor looks at the footer
- **WHEN** a visitor looks at the footer
- **THEN** the three column titles still read Policies, Quick Links and Get In
  Touch
- **AND THEN** their visible size and colour are unchanged

### Requirement: The footer sits at the bottom of the visitor's window on a short page

On any page that carries the site footer, WHEN that page's own content is
shorter than the visitor's browser window, the footer's bottom edge MUST sit
flush with the bottom edge of the window, with no visible gap beneath it, AND
the page's own content area MUST extend down to meet the footer, with no
visible gap between the content and the footer either — the leftover height
reads as more of the page's content, not as a second, unstyled gap above the
footer. That leftover height MUST be distributed evenly around the page's own
visible content within that area, so the content is centred rather than left
pressed against the top with the added space collecting below it. WHEN a
page's own content is at least as tall as the visitor's window, the footer's
appearance and the page's scrolling behaviour MUST be unchanged.

#### Scenario: Visitor opens a page shorter than their window
- **WHEN** a visitor opens a page that carries the site footer, and that
  page's own content is shorter than the visitor's browser window
- **THEN** the footer's bottom edge sits flush with the bottom edge of the
  window
- **AND THEN** no visible, unstyled gap appears below the footer
- **AND THEN** the page's own content area extends down to meet the footer,
  with no visible gap between the content and the footer
- **AND THEN** the page's own visible content is centred within that content
  area's leftover height, with balanced space above and below it

#### Scenario: Visitor opens a page at least as tall as their window
- **WHEN** a visitor opens a page that carries the site footer, and that
  page's own content is at least as tall as the visitor's browser window
- **THEN** the footer appears only once the visitor scrolls to the end of the
  content, exactly as before
- **AND THEN** the page's visible content and scrolling length are unchanged

### Requirement: In-page destinations honour the visitor's reduced-motion preference

When the visitor prefers reduced motion, every in-page destination MUST be
reached without an animated scroll of the page. When the visitor has not
requested reduced motion, in-page navigation MUST keep the current animated
scroll.

Every in-page destination is in scope: skip-to-content, the home logo to the
top of the page, and any other in-page destination.

#### Scenario: Visitor who prefers reduced motion follows an in-page link
- **WHEN** a visitor who prefers reduced motion activates an in-page link
- **THEN** the destination is shown without an animated scroll of the page
- **AND THEN** the destination of that link is unchanged and remains reachable

#### Scenario: Visitor who has not requested reduced motion follows an in-page link
- **WHEN** a visitor who has not requested reduced motion activates an in-page
  link
- **THEN** the page still uses an animated scroll to that destination

#### Scenario: Every in-page destination honours the same preference
- **WHEN** a visitor prefers reduced motion
- **THEN** every in-page destination on the site honours that preference the
  same way — no in-page link is an exception

### Requirement: The narrow-viewport menu behaves as a modal dialog

When the narrow-viewport navigation menu is open, it SHALL be presented as a
modal dialog named Menu. Keyboard focus MUST move into the menu when it
opens. While the menu is open, keyboard focus MUST NOT reach any control that
is not part of the menu, and closing the menu MUST be the only way to leave
it. While the menu is open, the rest of the page MUST NOT be available to
keyboard or assistive technology as an interactive surface.

#### Scenario: Visitor opens the narrow-viewport menu
- **WHEN** a visitor on a narrow viewport opens the navigation menu
- **THEN** the menu is presented as a modal dialog named Menu
- **AND THEN** keyboard focus moves into the menu

#### Scenario: Visitor tries to leave the open menu without closing it
- **WHEN** the narrow-viewport menu is open
- **THEN** keyboard focus cannot reach any control outside the menu
- **AND THEN** the rest of the page is not available to assistive technology
  as an interactive surface
- **AND THEN** closing the menu is the only way to reach controls outside it

### Requirement: Choosing Schedule a call inside the menu closes it and returns focus once booking finishes

Choosing Schedule a call inside the open narrow-viewport menu MUST close the
menu. Once a booking dialog opened that way is itself closed, keyboard focus
MUST return to the control that opens the menu.

#### Scenario: Visitor chooses Schedule a call from the open menu
- **WHEN** a visitor chooses Schedule a call inside the open narrow-viewport
  menu
- **THEN** the menu closes
- **AND THEN** the booking dialog opens

#### Scenario: Visitor closes the booking dialog opened from the menu
- **WHEN** a visitor closes a booking dialog that was opened from the
  narrow-viewport menu
- **THEN** keyboard focus returns to the control that opens the menu
