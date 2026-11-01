# Code Style Capability

> This file is maintained by Aircury AI Framework. Do not edit it directly. Add project-specific rules in FRAMEWORK.local.md.

Detects and follows the project's configured linters, formatters and type checkers for any language, preferring the project's own lint entry point.

## Framework Rules

## Code Style

### Linting, Formatting and Static Analysis

Ensure code consistency by adhering to the project's configured tools, whatever the language.

- Find the tools for every language the change touches, in each sub-project, not only the root. Read each one's manifests and their scripts (`package.json`, `composer.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`…) and its tool config files (e.g. `biome.json`, `eslint.config.*`, `.prettierrc*`, `.php-cs-fixer*.php`, `phpstan.neon`, `phpcs.xml`, `ruff.toml`, `mypy.ini`, `.golangci.yml`, `rustfmt.toml`, `.shellcheckrc`, `.markdownlint*`, `.yamllint*`), plus `.editorconfig`.
- Prefer the project's own entry point over calling tools directly: a `Makefile` or `justfile` target (e.g. `make lint`), a package or Composer script, a command documented in the README or contributing guide, or the lint job in CI. Run it on the changed files when it accepts them.
- When there is no entry point, run the configured tools with the project's config, as CI does.
- Follow each tool's rules and the conventions of the surrounding code. When several tools cover one concern, let each handle its own (e.g. Prettier formats while ESLint checks logic; php-cs-fixer formats while PHPStan checks types).
- Never introduce a new tool, configuration or style the project does not already use, unless the user asks for it.
- If a language has no configured tool, match the existing code and `.editorconfig`, and use the language's standard formatter only where it is the norm (e.g. `gofmt`, `rustfmt`).

## Agent Operating Rules

- Before changing code, identify the linters, formatters and type checkers configured for every language and sub-project the change touches, and the project's own lint entry point (e.g. a `Makefile` target, package script or CI job).
- Ensure all changed code passes the project's checks, run through that entry point when there is one.
