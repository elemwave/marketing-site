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

The system SHALL publish the marketing site to production
whenever work lands on the default branch and passes every CI check,
MUST NOT publish a revision whose CI checks did not pass,
and MUST allow the same publication to be triggered on demand.
An on-demand publication from the default branch MUST refuse a named
revision that is not on that branch, and MUST refuse a named revision
whose required checks did not pass, were cancelled, or have not
completed, in both cases before anything is built or published,
leaving the public site serving the previous publication.

#### Scenario: Work lands on the default branch and passes CI
- **WHEN** a commit is pushed to the default branch
- **AND** every CI check for that commit passes
- **THEN** that commit is built, published to production, and the cached copies are refreshed
- **AND** the publication confirms that production now serves that commit

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
- **THEN** the same build and publication steps run

#### Scenario: On-demand publication names a revision that is not on the default branch
- **WHEN** a team member triggers the production publication manually from the default branch
- **AND** the named revision is not on the default branch
- **THEN** nothing is built or published
- **AND** production keeps serving the previous publication

#### Scenario: On-demand publication names a revision whose required checks did not pass
- **WHEN** a team member triggers the production publication manually from the default branch
- **AND** the named revision's required checks did not pass, were cancelled, or have not completed
- **THEN** nothing is built or published
- **AND** production keeps serving the previous publication

#### Scenario: On-demand publication names no revision and the default-branch head has not passed required checks
- **WHEN** a team member triggers the production publication manually from the default branch without naming a revision
- **AND** the head of the default branch has not passed every required check
- **THEN** nothing is built or published
- **AND** production keeps serving the previous publication

#### Scenario: Publication runs without long-lived cloud credentials
- **WHEN** the publication runs
- **THEN** it authenticates through short-lived, workflow-scoped credentials only

#### Scenario: Publication is requested from any other branch
- **WHEN** a publication is triggered from a branch that is neither the staging branch nor the default branch
- **THEN** nothing is published

### Requirement: Published assets are cached by their volatility

The production environment MUST cache immutable build assets aggressively
and MUST keep page documents revalidated on every request.

#### Scenario: Visitor reloads after a publication
- **WHEN** a new publication has completed
- **THEN** the visitor receives the newly published page documents
- **AND** unchanged fingerprinted assets are still served from cache
