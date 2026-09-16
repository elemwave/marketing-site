# Marketing Partnerships

The partnerships page presents the collaborations the company's work rests on —
the aerospace and research organisations it has worked with — and invites new
ones. It carries the same site navigation and footer as every other page.

### Requirement: Partnerships page is publicly reachable

The system SHALL serve the partnerships page at its own path without
authentication.

#### Scenario: Visitor opens the partnerships path
- **WHEN** a visitor requests the partnerships path
- **THEN** the system responds successfully and renders the partnerships page

#### Scenario: Visitor requests the path without a file extension
- **WHEN** a visitor requests the partnerships path with or without a trailing
  slash
- **THEN** the system resolves it to the partnerships page rather than
  reporting it as missing

### Requirement: Partnerships page names the collaborating organisations

The partnerships page MUST present the organisations the company has worked
with, both as their marks and as prose naming them.

#### Scenario: Visitor looks at the partner marks
- **WHEN** the partnerships page has loaded
- **THEN** the partner organisations' marks are all present
- **AND** each mark is labelled with the name of the organisation it belongs
  to, not a generic label shared with the others

#### Scenario: Visitor reads the narrative
- **WHEN** the partnerships page has loaded
- **THEN** prose names the collaborating organisations and the initiatives they
  came from

### Requirement: Partner marks are shown without demanding attention

The partner marks SHALL be presented as a continuously moving strip, and that
movement MUST respect the visitor's stated motion preference.

#### Scenario: Visitor watches the strip
- **WHEN** the partnerships page has loaded
- **THEN** the strip of partner marks moves steadily and continuously
- **AND** the sequence repeats without a visible break

#### Scenario: Visitor pauses the partner marks
- **WHEN** the strip has been moving automatically
- **THEN** the visitor can pause it from a control on the partnerships page
- **AND** the strip stays still
- **AND** the partner marks remain visible

#### Scenario: Visitor resumes the partner marks
- **WHEN** the strip is paused
- **THEN** the visitor can resume its movement from that control

#### Scenario: Visitor prefers reduced motion
- **WHEN** the visitor's system asks for reduced motion
- **THEN** the strip does not move
- **AND** the partner marks remain visible
- **AND** the pause control is not presented

#### Scenario: Assistive technology reads the strip
- **WHEN** the strip is read by assistive technology
- **THEN** each partner organisation is announced once, not repeated

### Requirement: First-load picture fetching is limited to the first view

On first load, the partnerships page MUST ask the browser to fetch at high
priority only the pictures that are visible in the first view.

#### Scenario: Visitor first opens the partnerships page
- **WHEN** a visitor first opens the partnerships page
- **THEN** the page does not ask the browser to fetch at high priority partner
  marks that are off-screen in the strip
- **AND** the site mark may still be fetched promptly
- **AND** the footer mark is not fetched at high priority

#### Scenario: Visitor reaches the partner strip
- **WHEN** a visitor reaches the partner strip
- **THEN** the organisations' marks still appear
- **AND** the sequence still repeats without a visible break

#### Scenario: Visitor opens contact or a legal page
- **WHEN** a visitor first opens contact or a legal page
- **THEN** first-load picture fetching on that page is unchanged

### Requirement: Partnerships page invites new partners

The partnerships page MUST close with an invitation to begin a partnership,
offering the same booking action as the rest of the site.

#### Scenario: Visitor asks to schedule a call from the partnerships page
- **WHEN** the visitor activates the scheduling action on the partnerships page
- **THEN** the booking dialog opens, behaving exactly as it does elsewhere on
  the site

### Requirement: Partnerships page carries the site navigation and footer

The partnerships page MUST present the same primary navigation and the same
footer as every other page.

#### Scenario: Visitor compares the footer between pages
- **WHEN** the visitor moves between any two pages
- **THEN** the footer presents identical content on both
