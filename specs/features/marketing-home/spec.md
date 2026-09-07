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
page the site serves, and MUST indicate which of them the visitor is currently
on.

#### Scenario: Visitor looks at the navigation
- **WHEN** any page has loaded
- **THEN** the navigation lists every page the site serves
- **AND** exactly one entry is indicated as the current page, both visually and
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

## Notes

- The header navigation lists only pages that exist. 
- The footer's two policy links have no destinations yet (see the style guide's
  known gaps).
- Images are served locally from `public/images/`; they are not optimised through
  an asset pipeline yet, and several partner logos are inconsistently trimmed (see
  the style guide's known gaps).
- The hero call to action is always rendered; there is no condition under which it
  is hidden.
