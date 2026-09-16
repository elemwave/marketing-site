# Marketing Home

The home page is the public entry point of the Elemwave marketing website. It
presents the product, its software capabilities, the science behind it, and a
call to book a meeting.

### Requirement: Home page is publicly reachable

The system SHALL serve the home page at the site root without authentication.

#### Scenario: Visitor opens the site root
- **WHEN** a visitor requests the site root path
- **THEN** the system responds successfully and renders the home page

### Requirement: Home presents all primary sections

The home page MUST present, in order, the hero, the software capabilities
section, the science section, the book-a-meeting call to action, and the footer.

#### Scenario: Visitor scrolls the home page
- **WHEN** the home page has loaded
- **THEN** the hero heading, "What Our Software Can Do", "The Science Behind Us",
  "Book a Meeting", and the footer are all present

### Requirement: Hero imagery rotates automatically

The hero SHALL cycle its A320 imagery on a fixed interval to convey the
simulation stages.

#### Scenario: Visitor waits on the hero
- **WHEN** the hero has been visible for the rotation interval
- **THEN** the displayed A320 layer changes without any user interaction
- **AND WHEN** the visitor prefers reduced motion
- **THEN** the imagery does not auto-advance

### Requirement: Software tabs switch the active capability

The software section MUST let the visitor select one of the capability tabs and
show that tab's title, body paragraphs, and screenshot.

#### Scenario: Visitor selects a tab
- **WHEN** the visitor activates a capability tab
- **THEN** that tab becomes the active tab
- **AND** the card shows the selected tab's title, paragraphs, and image

### Requirement: Science carousel navigates between slides

The science section MUST let the visitor move between publication slides using
previous/next controls and per-slide dots, wrapping at both ends.

#### Scenario: Visitor advances the carousel
- **WHEN** the visitor activates the next control on the last slide
- **THEN** the first slide becomes active
- **AND WHEN** the visitor activates a specific dot
- **THEN** that dot's slide becomes active

### Requirement: Software capability chooser exposes which capability is selected

The software capability chooser SHALL identify exactly one capability as
selected, matching the capability whose title, body and picture are shown.
The chooser MUST remain operable from the keyboard.

#### Scenario: Visitor first sees the software capabilities
- **WHEN** the software capabilities first appear
- **THEN** assistive technology identifies exactly one capability as selected
- **AND** that capability is the one whose title, body and picture are shown

#### Scenario: Visitor chooses a different software capability
- **WHEN** the visitor chooses a different capability
- **THEN** assistive technology identifies that capability as selected and no other
- **AND** the selected capability remains lifted, heavier and underlined
- **AND** the other capabilities remain flat, regular weight and without an underline

### Requirement: Science publication chooser exposes which publication is current

The science publication chooser SHALL identify exactly one publication as
current, matching the publication whose picture is shown.
The chooser MUST remain operable from the keyboard.

#### Scenario: Visitor first sees the science publications
- **WHEN** the science publications first appear
- **THEN** assistive technology identifies exactly one publication chooser as current
- **AND** that chooser is the one whose picture is shown

#### Scenario: Visitor chooses a different science publication
- **WHEN** the visitor chooses a different publication, whether by a chooser mark
  or by previous or next
- **THEN** assistive technology identifies that publication as current and no other

### Requirement: Changing the shown capability or publication is announced

When the visitor chooses a different software capability or science publication,
the system MUST inform assistive technology that the displayed content has
changed.

#### Scenario: Visitor changes the shown software capability
- **WHEN** the visitor chooses a different capability
- **THEN** assistive technology is informed of the newly shown heading

#### Scenario: Visitor changes the shown science publication
- **WHEN** the visitor chooses a different publication
- **THEN** assistive technology is informed of the newly shown caption

#### Scenario: Visitor activates the already shown item
- **WHEN** the visitor activates the already selected capability or the already
  current publication
- **THEN** assistive technology is not informed of a content change

### Requirement: Unused publication chooser marks are distinguishable from the page

Each unused science publication chooser mark MUST contrast with the page surface
at least as strongly as a non-text control requires.

#### Scenario: Visitor with low vision looks for unused publication marks
- **WHEN** the science publications are shown
- **THEN** each unused publication chooser mark contrasts with the page surface
  at least 3:1
- **AND** the current mark remains the dark fill

### Requirement: Calls to action open the booking dialog

Primary calls to action MUST open the booking dialog,
where the visitor starts the meeting-scheduling flow.

#### Scenario: Visitor uses a booking call to action
- **WHEN** the visitor activates "Schedule a call" or "Schedule a meeting"
- **THEN** a modal dialog opens containing the embedded scheduler

### Requirement: Booking dialog embeds the Calendly scheduler

The booking dialog MUST embed the Calendly scheduling widget
so the visitor books the meeting without leaving the site.
The site performs no email verification of its own.

#### Scenario: Visitor opens the booking dialog
- **WHEN** the visitor opens the booking dialog
- **THEN** the Calendly scheduler opens over the page
  showing the Elemwave scheduling page

#### Scenario: Visitor reopens the booking dialog
- **WHEN** the visitor closes the dialog and opens it again
- **THEN** a single fresh scheduler is shown, never a stacked duplicate

### Requirement: Every page offers navigation to every other page

The site MUST present the same primary navigation on every page, listing each
primary page the site serves, and MUST indicate which of them the visitor is
currently on.
Legal pages are reached from the footer and are not primary pages.

#### Scenario: Visitor looks at the navigation
- **WHEN** any page has loaded
- **THEN** the navigation lists every primary page the site serves
- **AND WHEN** that page is itself a primary page
- **THEN** exactly one entry is indicated as the current page, both visually and
  to assistive technology

#### Scenario: Visitor selects another page
- **WHEN** the visitor selects a navigation entry other than the current one
- **THEN** that page is presented, with its own entry now indicated as current

#### Scenario: Visitor views the site on a narrow screen
- **WHEN** the header's contents do not fit the width available
- **THEN** the navigation entries are replaced by a control that reveals them
- **AND** no part of the header is cut off, and the page does not scroll
  sideways

#### Scenario: Visitor reveals the navigation on a narrow screen
- **WHEN** the visitor activates that control
- **THEN** the navigation entries and the scheduling action are presented
- **AND WHEN** the visitor presses Escape
- **THEN** they are hidden again and the control regains focus

#### Scenario: Assistive technology reads the navigation
- **WHEN** any page is read by assistive technology, at any width
- **THEN** each navigation entry is announced once
- **AND** the control reports whether the entries are currently revealed
- **AND** entries that are not revealed are not reachable

### Requirement: Every page states how to reach the company

The site MUST present the company's email address, telephone number, and postal
address in the footer of every page, and those values MUST be identical
wherever they appear.

#### Scenario: Visitor reads the footer
- **WHEN** any page has loaded
- **THEN** the footer states the company's email address, telephone number, and
  postal address

#### Scenario: Visitor compares the footer between pages
- **WHEN** the visitor moves between pages
- **THEN** the footer presents identical content on each

### Requirement: The footer copyright reaches the year of publication

The footer MUST state a copyright period
that begins in 2021 and ends in the year the published site was produced,
so the notice never advertises a stale year.

#### Scenario: Visitor reads the copyright notice
- **WHEN** any page has loaded
- **THEN** the copyright period ends in the year that publication took place

### Requirement: Every page identifies the registered company

The footer of every page MUST state the company's registered name, its tax
identification number and its entry in the mercantile registry.

#### Scenario: Visitor checks who operates the site
- **WHEN** any page has loaded
- **THEN** the footer states the registered company name and its tax
  identification number
- **AND** the footer states the registry, volume, book, folio, section and sheet
  under which the company is registered

### Requirement: Search engines can discover every page

The site MUST tell crawlers that its pages may be indexed and MUST publish a
sitemap listing every page it serves at the production address.

#### Scenario: Crawler reads the crawling rules
- **WHEN** a crawler requests the robots file
- **THEN** every page is allowed to be crawled
- **AND** the location of the sitemap is given

#### Scenario: Crawler reads the sitemap
- **WHEN** a crawler requests the sitemap
- **THEN** it lists every primary page and every legal page at the production
  address, and no other page

### Requirement: Every page describes itself to search engines and link previews

Every page the site serves MUST declare its production address as its canonical
address, and MUST describe itself for link previews with its own title, its own
description, its address, the brand name and a branded preview image.
The not-found page MUST NOT declare a canonical address.

#### Scenario: Search engine reaches a page through an alternative address
- **WHEN** a page is reached through an address other than its production one
- **THEN** the page names its production address as canonical

#### Scenario: Visitor shares a link to a page
- **WHEN** a link to any page is shared somewhere that renders link previews
- **THEN** the preview shows that page's title followed by the brand, its
  description and the branded preview image
- **AND WHEN** the shared page is the home page
- **THEN** the preview shows the brand title without repeating the brand

### Requirement: An unknown address presents a branded not-found page

A request for a path the site does not serve MUST present a not-found page that
keeps the site header and footer and leads the visitor back to the home page.

#### Scenario: Visitor follows a broken link
- **WHEN** a visitor requests a path that has no page
- **THEN** the page states that it was not found, as its primary heading
- **AND** the site header and the site footer are both present
- **AND** a link returns the visitor to the home page
- **AND** the browser tab names the page once, followed by the brand once

## Notes

- The header navigation lists only pages that exist. 
- The not-found page has no navigation entry, so no entry is indicated as current.
- Images are served locally from `public/images/`; they are not optimised through
  an asset pipeline yet, and several partner logos are inconsistently trimmed (see
  the style guide's known gaps).
- The hero call to action is always rendered; there is no condition under which it
  is hidden.
