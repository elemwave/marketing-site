# Site Chrome

Shared navigation and footer that appear on every page that carries site
chrome.

### Requirement: Footer column titles are headings of their columns

The site footer SHALL expose the titles of its columns as headings.

#### Scenario: Visitor reaches the footer
- **WHEN** a visitor reaches the footer of a page that carries the site footer
- **THEN** the three column titles Policies, Quick Links and Get In Touch are
  exposed as headings

### Requirement: Footer column titles follow the page without a skipped heading rank

On every page that carries the site footer, the three column titles MUST appear
in the document outline at heading rank 2, so that no heading rank is skipped
between the last heading of that page's own content and the first footer column
title.

#### Scenario: Visitor lists headings in document order
- **WHEN** the headings of a page that carries the site footer are listed in
  document order
- **THEN** the three footer column titles follow the last heading of that page's
  own content
- **AND THEN** no heading rank is skipped between that last content heading and
  the first footer column title
- **AND THEN** each of those three titles is heading rank 2

#### Scenario: Visitor compares footer headings across pages
- **WHEN** a visitor compares the footer on different pages that carry the site
  footer
- **THEN** the three column titles use the same heading rank on every such page

### Requirement: Footer column titles keep their present wording and appearance

The three footer column titles MUST keep their present wording, size and colour.

#### Scenario: Visitor looks at the footer
- **WHEN** a visitor looks at the footer
- **THEN** the three column titles still read Policies, Quick Links and Get In
  Touch
- **AND THEN** their visible size and colour are unchanged

### Requirement: In-page destinations honour the visitor's reduced-motion preference

When the visitor prefers reduced motion, every in-page destination MUST be
reached without an animated scroll of the page. When the visitor has not
requested reduced motion, in-page navigation MUST keep the current animated
scroll.

Every in-page destination is in scope: skip-to-content, the home logo to the
top of the page, the home "Try our demo" control to the software section, and
any other in-page destination.

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
