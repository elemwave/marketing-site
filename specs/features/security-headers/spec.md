# Security Headers

The response headers that limit what a browser will do with the marketing site's pages:
what content it may load and run,
how it treats declared content types,
and, on the deployed site, how it handles transport, framing and referrers.

### Requirement: Pages forbid content-type sniffing

Every page response MUST instruct the browser
to use the declared content type rather than guess one.

#### Scenario: A browser loads a page
- **WHEN** a browser receives any page of the site
- **THEN** the response forbids content-type sniffing

### Requirement: Pages carry an enforcing content policy

Every page response MUST carry a content policy the browser enforces,
never one the browser only reports.

#### Scenario: A browser loads the home page
- **WHEN** a browser receives the home page
- **THEN** the response carries an enforcing content policy
- **AND** it carries no report-only content policy

### Requirement: Inline scripts run only by content hash

The content policy MUST admit the site's own inline scripts only by the hash of their content,
and MUST NOT admit inline or evaluated script in general.

#### Scenario: The policy governs scripts
- **WHEN** the content policy's script rule is read
- **THEN** it names a content hash for the inline scripts the pages carry
- **AND** it permits neither inline script in general nor evaluated script

### Requirement: Published pages keep running their scripts while a publication replaces them

While a publication replaces the deployed pages,
the content policy MUST admit the inline scripts of the pages already published
as well as those of the pages being published,
and the next publication MUST stop admitting the scripts of pages it no longer replaces.

#### Scenario: A visitor receives a previously published page during a publication
- **WHEN** the deployed environment has switched to the new content policy
- **AND** a visitor still receives a page from the previous publication
- **THEN** the policy admits that page's inline scripts

#### Scenario: Nothing has been published yet
- **WHEN** an environment is published for the first time
- **THEN** the policy admits only the inline scripts of the pages being published

### Requirement: The site and the booking dialog load without a policy violation

The content policy SHALL permit everything the pages and the booking dialog legitimately load,
including the scheduling provider's frame
and the icon the dialog loads from the provider's asset host.

#### Scenario: A visitor opens the home page
- **WHEN** a visitor opens the home page
- **THEN** the page shows its main heading
- **AND** the browser reports no content policy violation

#### Scenario: A visitor opens the booking dialog
- **WHEN** a visitor opens the booking dialog from the home page
- **THEN** the scheduling frame appears
- **AND** the browser reports no content policy violation

### Requirement: The deployed site hardens transport, framing and referrers

Every response from the deployed environment MUST also
require secure transport,
forbid the page from being framed,
and limit the referrer it sends to other origins.

#### Scenario: A browser receives a response from the deployed environment
- **WHEN** a browser receives any response from the deployed environment
- **THEN** the response requires secure transport for a year, subdomains included
- **AND** the content policy asks the browser to upgrade insecure requests
- **AND** the response forbids any page from framing it
- **AND** it sends other origins only the site's origin as referrer
- **AND** it sends no referrer when a secure page leads to an insecure one

### Requirement: Deployed sniffing and transport follow the declared policy

The sniffing instruction and the transport instruction the deployed environment sends
MUST be the ones the site's declared security-header policy names.

#### Scenario: A browser receives a response from the deployed environment
- **WHEN** a browser receives any response from the deployed environment
- **THEN** the sniffing instruction is the one the declared policy names
- **AND** the transport duration, subdomain inclusion, and preload request are the ones the declared policy names
