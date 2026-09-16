# Production Deployment

The production environment is the public marketing website.
It serves every visitor at the site's public address,
and only work that has been released and has passed every CI check reaches it.

### Requirement: Production serves the marketing site at its public address over HTTPS

The production environment SHALL serve the marketing site
at the public `www` address over HTTPS only.

#### Scenario: Visitor opens the public address
- **WHEN** a visitor requests the public address over HTTPS
- **THEN** the system responds successfully and renders the marketing home page

#### Scenario: Visitor opens the public address over plain HTTP
- **WHEN** a visitor requests the public address over HTTP
- **THEN** the system redirects the request to the equivalent HTTPS address

### Requirement: Production is open to every visitor

The production environment MUST serve its pages
without asking the visitor for any credentials.

#### Scenario: Request without credentials
- **WHEN** a request reaches production without credentials
- **THEN** the system serves the requested page

#### Scenario: Request carrying unrelated credentials
- **WHEN** a request reaches production carrying credentials of any kind
- **THEN** the system ignores them and serves the requested page

### Requirement: Directory paths resolve to their page document

The production environment SHALL resolve extension-less paths
to the corresponding page document
so that pretty URLs work without a server runtime.

#### Scenario: Visitor opens the site root
- **WHEN** a visitor requests the root path
- **THEN** the system serves the home page document

#### Scenario: Visitor opens a nested page path
- **WHEN** a visitor requests a nested path with no file extension
- **THEN** the system serves that path's page document

#### Scenario: Visitor opens an unknown path
- **WHEN** a visitor requests a path that has no page document
- **THEN** the system responds with a not-found status and the not-found page

### Requirement: Released work reaches production automatically

The system SHALL publish to production the files that have already passed
every CI check for that revision,
MUST NOT publish a revision whose CI checks did not pass,
MUST NOT publish a later copy of the same source produced at publication time,
MUST allow the same publication to be triggered on demand,
and MUST NOT report a publication successful until the live public site
has been observed to serve the intended revision and to exhibit
its required visitor-facing behaviours.

#### Scenario: Work lands on the default branch and passes CI
- **WHEN** a commit is pushed to the default branch
- **AND** every CI check for that commit passes
- **THEN** the files that passed those checks are published to production, and the cached copies are refreshed
- **AND** the publication confirms that production now serves that commit
- **AND** it confirms the live home page responds successfully and shows the marketing home page
- **AND** it confirms the live home page carries an enforcing content policy, carries no report-only content policy, and that policy does not block the page's own scripts
- **AND** it confirms an insecure request to the live address is redirected to the equivalent secure address
- **AND** it confirms an extension-less nested path that has a page document is served as that page
- **AND** it confirms a path that has no page document returns a not-found status and the not-found page
- **AND** it confirms a successful response carries no instruction keeping search engines from indexing it or following its links
- **AND** if any of those observations fail, the publication is not reported successful

#### Scenario: Work lands on the default branch and fails CI
- **WHEN** a commit is pushed to the default branch
- **AND** any CI check for that commit fails or is cancelled
- **THEN** nothing is published and production keeps serving the previous publication

#### Scenario: A newer release arrives while a publication is running
- **WHEN** a production publication is still running
- **AND** another verified commit is dispatched for production
- **THEN** the running publication completes before the next one starts

#### Scenario: Team member requests a publication on demand
- **WHEN** a team member triggers the production publication manually from the default branch
- **THEN** the same already-checked files are published, and publication does not succeed by producing an unchecked copy instead

#### Scenario: Publication runs without long-lived cloud credentials
- **WHEN** the publication runs
- **THEN** it authenticates through short-lived, workflow-scoped credentials only

#### Scenario: Publication is requested from any other branch
- **WHEN** a publication is triggered from a branch that is neither the staging branch nor the default branch
- **THEN** nothing is published

### Requirement: Published assets are cached by their volatility

The production environment MUST cache hashed build assets aggressively,
MUST keep page documents revalidated by browsers on every request
while the site's cache still serves them between publications,
and MUST cache public images in browsers and at the site's cache.

#### Scenario: Visitor reloads after a publication
- **WHEN** a new publication has completed
- **THEN** the visitor receives the newly published page documents
- **AND** the visitor receives the newly published public images
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
