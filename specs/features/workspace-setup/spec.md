# Workspace Setup

How a fresh checkout prepares the local application stack and the
repository-level dependency trees used by verification.

### Requirement: Dependency preparation owns stale container-created directories

The workspace dependency preparation command SHALL replace the app and
infrastructure dependency directories with directories writable by the
invoking user before installing dependencies.

#### Scenario: Container-created dependency directories already exist
- **WHEN** dependency preparation runs after a container has created app
  or infrastructure dependency directories
- **THEN** those dependency directories are removed and recreated for
  the invoking user before dependency installation starts
- **AND** the dependency installation does not leave those dependency
  directories owned by root

#### Scenario: Dependency preparation runs repeatedly
- **WHEN** dependency preparation runs more than once in the same
  checkout
- **THEN** each run completes from the dependency directories left by
  the previous run
- **AND** the app and infrastructure dependency directories remain
  writable by the invoking user

### Requirement: App dependency preparation follows the declared dependencies

The app dependency preparation command SHALL install the app's declared
dependencies whenever the installed set is not known to match them, and SHALL
skip installation only when it is, reporting which it did.

#### Scenario: A dependency was added after the environment was initialised
- **WHEN** dependency preparation runs against an environment initialised
  before the declared dependencies changed
- **THEN** the declared dependencies are installed
- **AND** the output states that installation ran

#### Scenario: The declared dependencies have not changed
- **WHEN** dependency preparation runs again after a successful installation
  and neither the dependency manifest nor its lock file has changed
- **THEN** no installation takes place
- **AND** the output states that installation was skipped

#### Scenario: The installation has unknown provenance
- **WHEN** dependency preparation runs against an installation that holds
  dependencies but carries no record of the declared dependencies it was made
  from
- **THEN** the declared dependencies are installed

#### Scenario: An installation fails
- **WHEN** an installation fails
- **THEN** no record is left that the installed set is current
- **AND** the next run installs again

### Requirement: Workspace dependency preparation follows the declared dependencies

The repository-level checks read the dependencies installed in the working
tree, separately from the install that serves the running application. The
workspace dependency preparation command SHALL install a workspace's declared
dependencies whenever its installed set is not known to match them, and SHALL
leave a workspace alone when it is, reporting which it did for each. The app
and the infrastructure workspaces SHALL be judged independently.

#### Scenario: The declared dependencies have not changed
- **WHEN** workspace dependency preparation runs again after a successful
  installation and no manifest or lock file has changed
- **THEN** no installation takes place
- **AND** the output states that installation was skipped

#### Scenario: A lock file changed after the workspace was installed
- **WHEN** workspace dependency preparation runs after a manifest or lock file
  changed
- **THEN** the affected workspace is installed again
- **AND** the output states that installation ran

### Requirement: Repository-level checks refuse a stale workspace install

Each repository-level check that reads a workspace install, namely the
infrastructure type-check, the app tests with coverage, the infrastructure
tests and the dependency audit, SHALL refuse to run when the workspace it reads
is not known to match its declared dependencies. It SHALL fail before
producing a result, name the out-of-date workspace and the command that
refreshes it, and change nothing in the working tree. Checks that run inside
the application container are unaffected.

#### Scenario: Only the application install was refreshed
- **WHEN** a lock file changed and only the application-serving install was
  refreshed
- **THEN** each affected check exits with a failure before producing a result
- **AND** the message names the out-of-date workspace and `make deps-workspace`

#### Scenario: The workspace install was refreshed
- **WHEN** the workspace install has been refreshed
- **THEN** the same checks run without refusing

#### Scenario: The install has unknown provenance
- **WHEN** a workspace holds dependencies but carries no record of the declared
  dependencies it was made from
- **THEN** the checks that read it refuse to run

#### Scenario: One workspace is stale
- **WHEN** one workspace is current and the other is not
- **THEN** only the out-of-date workspace is named

#### Scenario: The full verification gate runs
- **WHEN** the full gate runs
- **THEN** it refreshes both installs first, so the refusal adds no step and no
  failure
