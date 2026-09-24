# Staging Deployment

The staging environment is the pre-production copy of the marketing website.
It lets the team review merged work on a public URL
before anything reaches the production site.

### Requirement: Staging serves the marketing site over HTTPS

The staging environment SHALL serve the marketing site
at the staging subdomain over HTTPS only.

#### Scenario: Reviewer opens the staging subdomain
- **WHEN** a reviewer requests the staging subdomain over HTTPS with valid credentials
- **THEN** the system responds successfully and renders the marketing home page

#### Scenario: Reviewer opens the staging subdomain over plain HTTP
- **WHEN** a reviewer requests the staging subdomain over HTTP
- **THEN** the system redirects the request to the equivalent HTTPS address

### Requirement: Staging is restricted to people holding the shared credentials

The staging environment MUST reject any request
that does not carry the shared staging credentials.

#### Scenario: Request without credentials
- **WHEN** a request reaches staging without credentials
- **THEN** the system responds with an unauthorised status
- **AND** the response invites the client to present credentials for the staging realm

#### Scenario: Request with incorrect credentials
- **WHEN** a request presents credentials that do not match the shared ones
- **THEN** the system responds with an unauthorised status
- **AND** no page content is disclosed

### Requirement: Staging is excluded from search engines

The staging environment MUST instruct search engines
not to index any of its responses.

#### Scenario: Crawler receives a staging response
- **WHEN** any staging response is returned
- **THEN** it carries an instruction not to index and not to follow its links

### Requirement: Directory paths resolve to their page document

The staging environment SHALL resolve extension-less paths
to the corresponding page document
so that pretty URLs work without a server runtime.

#### Scenario: Reviewer opens the site root
- **WHEN** a reviewer requests the root path
- **THEN** the system serves the home page document

#### Scenario: Reviewer opens a nested page path
- **WHEN** a reviewer requests a nested path with no file extension
- **THEN** the system serves that path's page document

#### Scenario: Reviewer opens an unknown path
- **WHEN** a reviewer requests a path that has no page document
- **THEN** the system responds with a not-found status and the not-found page

### Requirement: Merged work reaches staging automatically

The system SHALL publish the marketing site to staging
whenever work lands on the staging branch and passes every CI check,
MUST NOT publish a revision whose CI checks did not pass,
MUST allow the same publication to be triggered on demand,
and MUST NOT report a publication successful until the live pre-production copy
has been observed to serve the intended revision and to exhibit
its required visitor-facing behaviours, including the credential gate
and the search-exclusion instruction on a successful authenticated response.

#### Scenario: Work lands on the staging branch and passes CI
- **WHEN** a commit is pushed to the staging branch
- **AND** every CI check for that commit passes
- **THEN** that commit is built, published to staging, and the cached copies are refreshed
- **AND** the publication confirms that staging now serves that commit
- **AND** it confirms the live home page responds successfully and shows the marketing home page, using the shared credentials
- **AND** it confirms the live home page carries an enforcing content policy, carries no report-only content policy, and that policy does not block the page's own scripts
- **AND** it confirms an insecure request to the live address is redirected to the equivalent secure address
- **AND** it confirms an extension-less nested path that has a page document is served as that page
- **AND** it confirms a path that has no page document returns a not-found status and the not-found page
- **AND** it confirms a request without credentials receives an unauthorised status and a challenge to present credentials
- **AND** it confirms a successful authenticated response instructs search engines neither to index it nor to follow its links
- **AND** if any of those observations fail, the publication is not reported successful

#### Scenario: Work lands on the staging branch and fails CI
- **WHEN** a commit is pushed to the staging branch
- **AND** any CI check for that commit fails or is cancelled
- **THEN** nothing is published and staging keeps serving the previous publication

#### Scenario: Reviewer requests a publication on demand
- **WHEN** a team member triggers the staging publication manually
- **THEN** the same build and publication steps run

#### Scenario: Publication runs without long-lived cloud credentials
- **WHEN** the publication runs
- **THEN** it authenticates through short-lived, workflow-scoped credentials only

#### Scenario: Work lands on the staging branch and CI does not pass
- **WHEN** a commit is pushed to the staging branch
- **AND** that commit's checks fail or are cancelled
- **THEN** the staging Deploy run history records that commit as not published, without publishing it

### Requirement: Published assets are cached by their volatility

The staging environment MUST cache hashed build assets aggressively,
MUST keep page documents revalidated by browsers on every request
while the site's cache still serves them between publications,
and MUST cache public images in browsers and at the site's cache.

#### Scenario: Reviewer reloads after a publication
- **WHEN** a new publication has completed
- **THEN** the reviewer receives the newly published page documents
- **AND** the reviewer receives the newly published public images
- **AND** unchanged fingerprinted assets are still served from cache

#### Scenario: Repeated page request between publications
- **WHEN** a page document is requested again between publications
- **THEN** the site's cache serves it without fetching the published file store

#### Scenario: Browser revalidates a page document on each visit
- **WHEN** a visitor requests a page document they have seen before
- **THEN** the browser revalidates that page document
- **AND** it does not use a stored copy without checking

#### Scenario: Repeated public-image request between publications
- **WHEN** a public image is requested again between publications
- **THEN** the site's cache serves it without fetching the published file store

#### Scenario: Returning visitor does not re-request every public image
- **WHEN** a returning visitor loads a page whose public images they have already received
- **THEN** the browser does not re-request every public image

#### Scenario: Freshness rules that would not be applied fail the check
- **WHEN** a page document, public image, or hashed build asset would be published with the wrong freshness
- **THEN** a verification check fails
