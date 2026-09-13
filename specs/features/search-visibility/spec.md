# Search Visibility

How the marketing site presents itself to search engines:
what the public site invites crawlers to index,
and how the staging copy keeps itself out of search results.

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

### Requirement: Staging stays out of search results

Every response from the staging environment MUST instruct search engines
neither to index it nor to follow its links.
Staging serves the public site's own robots policy,
so this instruction, not that policy, is what keeps staging out of search results.

#### Scenario: A crawler reaches staging
- **WHEN** a response is served from the staging environment
- **THEN** it instructs search engines not to index it
- **AND** it instructs them not to follow its links
