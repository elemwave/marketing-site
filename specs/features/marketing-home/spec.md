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

## Notes

- Images are served locally from `public/images/`; they are not optimised through
  an asset pipeline yet, and several partner logos are inconsistently trimmed (see
  the style guide's known gaps).
- The hero call to action is always rendered; there is no condition under which it
  is hidden.
