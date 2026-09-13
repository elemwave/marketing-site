# Legal Pages

The site publishes the organisation's legal and governance documents as standalone
prose pages, reachable from the footer of every page.
They exist so that visitors, clients and auditors can read the published policies
directly, without contacting the company.

### Requirement: Legal pages are publicly reachable

The system SHALL serve each legal document at its own stable path without
authentication.

#### Scenario: Visitor opens the integrated policy
- **WHEN** a visitor requests the integrated policy path
- **THEN** the system responds successfully and renders the integrated policy

#### Scenario: Visitor opens the privacy policy
- **WHEN** a visitor requests the privacy policy path
- **THEN** the system responds successfully and renders the privacy policy

### Requirement: Legal pages carry the same chrome as the rest of the site

Each legal page MUST present the site header and the site footer, so a visitor can
navigate onwards from a legal page as from any other page.

#### Scenario: Visitor arrives directly on a legal page
- **WHEN** a legal page has loaded
- **THEN** the site header and the site footer are both present
- **AND** the brand logo returns the visitor to the home page

#### Scenario: Visitor checks where they are in the navigation
- **WHEN** a legal page has loaded
- **THEN** no primary navigation entry is indicated as the current page,
  because legal pages are reached from the footer and have no entry of their own

### Requirement: The booking action works from a legal page

The scheduling action offered in the header and footer MUST behave on a legal page
exactly as it does on the home page.

#### Scenario: Visitor schedules from a legal page
- **WHEN** the visitor activates the scheduling action on a legal page
- **THEN** the booking dialog opens with the scheduling widget

### Requirement: A legal page presents its document as readable prose

A legal page MUST show the document's title followed by its body, in a single
measured reading column, using headings, paragraphs and lists to reflect the
document's own structure.

#### Scenario: Visitor reads a legal document
- **WHEN** a legal page has loaded
- **THEN** the document title is the page's primary heading
- **AND** the document body follows in reading order beneath it

#### Scenario: Visitor reads the browser tab
- **WHEN** a legal page has loaded
- **THEN** the browser tab names the document once, followed by the brand once

### Requirement: Legal documents are published in English

Legal documents MUST be published in English, the language of the rest of the
site.
When a document was approved in another language,
the page MUST publish a faithful English translation of it.

#### Scenario: A policy approved in Spanish is published on the site
- **WHEN** an approved policy exists only in Spanish
- **THEN** the page presents a faithful English translation of that text
- **AND** the document body, the page title and the footer link for it are in
  English and declare no language other than the site's own

### Requirement: Every page links to the legal pages

The footer MUST offer a link to each published legal document, from every page of
the site.

#### Scenario: Visitor looks for the policies
- **WHEN** a visitor reaches the footer of any page
- **THEN** a link to each legal document is present
- **AND** following a link opens the corresponding legal page

### Requirement: The privacy policy exposes the means of exercising data rights

The privacy policy MUST identify the data controller, publish a contact address for
data-protection enquiries, and point the visitor at the supervisory authority.

#### Scenario: Visitor wants to exercise a data right
- **WHEN** the visitor reads the privacy policy
- **THEN** the controller's identity and postal address are stated
- **AND** a contact address for data-protection enquiries is offered as a usable
  contact link
- **AND** the supervisory authority for complaints is named and linked

#### Scenario: Visitor wants to know who handles a meeting booking
- **WHEN** the visitor reads the privacy policy
- **THEN** it states that meetings are booked through a named third-party
  scheduling service, which sets its own cookies once the booking dialog is opened
- **AND** it links to that service's own privacy notice

#### Scenario: Visitor follows a third-party privacy link
- **WHEN** the visitor follows a link to a third party's own privacy policy
- **THEN** that policy opens without replacing the visitor's place in the Elemwave
  policy
