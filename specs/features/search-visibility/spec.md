# Search Visibility

How the marketing site presents itself to search engines:
what the public site invites crawlers to index,
the organisation those pages describe,
and how the staging copy keeps itself out of search results.

### Requirement: Production is open to search engines

No response from the production environment SHALL instruct search engines
not to index it or not to follow its links.

#### Scenario: A crawler reaches production
- **WHEN** a response is served from the production environment
- **THEN** it carries no instruction keeping search engines from indexing it or following its links

### Requirement: The robots policy admits every crawler and names the sitemap

The site SHALL publish a robots policy
that allows every crawler to crawl every path
and names the address of the sitemap.

#### Scenario: A crawler reads the robots policy
- **WHEN** a crawler requests the robots policy
- **THEN** the policy allows every user agent to crawl every path
- **AND** it names the sitemap at the public site's address

### Requirement: The sitemap lists every page at its public address

The site SHALL publish a sitemap
that lists each page of the primary navigation and each legal page,
every one at its canonical address on the public site,
and no other address.

#### Scenario: A crawler reads the sitemap
- **WHEN** a crawler requests the sitemap
- **THEN** it lists the home page, the partnerships page and the contact page
- **AND** it lists the integrated policy and the privacy policy
- **AND** every address it lists is on the public site

### Requirement: Every listed page publishes an organisation record

Each page the sitemap lists SHALL include a machine-readable organisation
record that describes the company behind the site.
The record SHALL name the organisation with the same public name, legal name,
tax identifier, postal address, telephone number, email address, brand mark,
and public site address the site already shows people.

#### Scenario: A crawler reads a listed page
- **WHEN** a crawler fetches the home page, the partnerships page, the contact
  page, the integrated policy, or the privacy policy
- **THEN** the page includes a machine-readable organisation record
- **AND** the record's public name is Elemwave
- **AND** the record's legal name is Elemwave S.L.
- **AND** the record's tax identifier is B06913164
- **AND** the record's postal address is Recogidas 35 1A, 18005 Granada, Spain
- **AND** the record's telephone number is +44 203 289 1024
- **AND** the record's email address is info@elemwave.com
- **AND** the record names the brand mark at a stable address on the public site
- **AND** the record's site address is https://www.elemwave.com

### Requirement: The organisation record is the same on every listed page

The organisation record MUST be the same on every page the sitemap lists.

#### Scenario: A crawler compares listed pages
- **WHEN** a crawler reads the organisation record on any two listed pages
- **THEN** the two records describe the same organisation with the same facts

### Requirement: The not-found page does not publish an organisation record

The not-found page MUST NOT include a machine-readable organisation record.

#### Scenario: A crawler is served the not-found page
- **WHEN** a crawler is served the not-found page
- **THEN** the page includes no machine-readable organisation record

### Requirement: Publishing the organisation record does not change crawler access

The organisation record MUST NOT change the robots policy, the sitemap,
production remaining open to crawlers, or staging staying out of search results.

#### Scenario: Listed pages carry the organisation record
- **WHEN** the listed pages publish the organisation record
- **THEN** the robots policy and the sitemap remain as they are
- **AND** production responses still carry no instruction keeping search engines
  from indexing them or following their links
- **AND** staging responses still instruct search engines neither to index them
  nor to follow their links

### Requirement: Staging stays out of search results

Every response from the staging environment MUST instruct search engines
neither to index it nor to follow its links.
Staging serves the public site's own robots policy,
so this instruction, not that policy, is what keeps staging out of search results.

#### Scenario: A crawler reaches staging
- **WHEN** a response is served from the staging environment
- **THEN** it instructs search engines not to index it
- **AND** it instructs them not to follow its links
