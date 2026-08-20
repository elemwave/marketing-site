# Marketing Contact

The contact page is where a visitor finds out how to reach Elemwave: where the
company is, what number to call, what address to write to, and how to book a
conversation. It carries the same site navigation and footer as every other
page.

### Requirement: Contact page is publicly reachable

The system SHALL serve the contact page at its own path without authentication.

#### Scenario: Visitor opens the contact path
- **WHEN** a visitor requests the contact path
- **THEN** the system responds successfully and renders the contact page

#### Scenario: Visitor requests the contact path without a file extension
- **WHEN** a visitor requests the contact path with or without a trailing slash
- **THEN** the system resolves it to the contact page rather than reporting it
  as missing

### Requirement: Contact page presents the company's contact details

The contact page MUST present the company's postal address, telephone number,
and email address, each under its own label.

#### Scenario: Visitor reads the contact details
- **WHEN** the contact page has loaded
- **THEN** the postal address, telephone number, and email address are all
  present, each labelled

#### Scenario: Visitor acts on the telephone number
- **WHEN** the visitor activates the telephone number
- **THEN** the system hands the number to the visitor's telephone application

#### Scenario: Visitor acts on the email address
- **WHEN** the visitor activates the email address
- **THEN** the system hands the address to the visitor's mail application

### Requirement: Contact page invites a booked conversation

The contact page MUST offer the same booking action as the rest of the site,
alongside the contact details.

#### Scenario: Visitor asks to schedule a call from the contact page
- **WHEN** the visitor activates a scheduling action on the contact page
- **THEN** the booking dialog opens, behaving exactly as it does elsewhere on
  the site

### Requirement: Contact page states what the company does

The contact page MUST state, in prose, the kind of work the company invites
enquiries about and where it is based.

#### Scenario: Visitor reads the introduction
- **WHEN** the contact page has loaded
- **THEN** an introduction names the fields of work the company welcomes
  enquiries about, and where the company is based

### Requirement: Contact page carries the site navigation and footer

The contact page MUST present the same primary navigation and the same footer
as every other page.

#### Scenario: Visitor compares the footer between pages
- **WHEN** the visitor moves between the home page and the contact page
- **THEN** the footer presents identical content on both

#### Scenario: Visitor navigates away and back
- **WHEN** the visitor selects the home entry in the primary navigation
- **THEN** the home page is presented
- **AND WHEN** the visitor selects the contact entry from the home page
- **THEN** the contact page is presented
