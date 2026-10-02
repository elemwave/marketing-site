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
