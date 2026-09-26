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
