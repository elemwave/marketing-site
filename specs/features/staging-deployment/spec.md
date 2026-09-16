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

The system SHALL publish to staging the files that have already passed
every CI check for that revision,
MUST NOT publish a revision whose CI checks did not pass,
MUST NOT publish a later copy of the same source produced at publication time,
and MUST allow the same publication to be triggered on demand.

#### Scenario: Work lands on the staging branch and passes CI
- **WHEN** a commit is pushed to the staging branch
- **AND** every CI check for that commit passes
- **THEN** the files that passed those checks are published to staging, and the cached copies are refreshed

#### Scenario: Work lands on the staging branch and fails CI
- **WHEN** a commit is pushed to the staging branch
- **AND** any CI check for that commit fails or is cancelled
- **THEN** nothing is published and staging keeps serving the previous publication

#### Scenario: Reviewer requests a publication on demand
- **WHEN** a team member triggers the staging publication manually
- **THEN** the same already-checked files are published, and publication does not succeed by producing an unchecked copy instead

#### Scenario: Publication runs without long-lived cloud credentials
- **WHEN** the publication runs
- **THEN** it authenticates through short-lived, workflow-scoped credentials only

### Requirement: Published assets are cached by their volatility

The staging environment MUST cache immutable build assets aggressively
and MUST keep page documents revalidated on every request.

#### Scenario: Reviewer reloads after a publication
- **WHEN** a new publication has completed
- **THEN** the reviewer receives the newly published page documents
- **AND** unchanged fingerprinted assets are still served from cache
