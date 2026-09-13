# ADRs Capability

> This file is maintained by Aircury AI Framework. Do not edit it directly. Add project-specific rules in FRAMEWORK.local.md.

Requires agents to capture material architectural and workflow decisions in ADRs under specs/decisions/.

## Framework Rules

## Architecture Decision Records

This installation uses ADRs to preserve architectural and workflow intent over time.
Each ADR holds the consolidated, current version of one decision; git history holds how it got there.

## ADR Rules

- Store ADRs under `specs/decisions/`.
- Capture a material architectural or workflow decision in an ADR when a task introduces it.
- Name each ADR file after the decision in lowercase, hyphen-separated form, without a sequence number, timestamp, or identifier prefix.
- Use the human-readable decision title as the ADR heading without an identifier prefix.
- Reference ADRs by their full repository path, for example `specs/decisions/<decision-name>.md`.
- Read relevant ADRs before implementing work in an area governed by prior decisions.
- Keep exactly one ADR per decision. When direction changes, edit the existing ADR in place so it states the decision as it now stands; do not create a second ADR that supersedes or amends it.
- When two ADRs state overlapping positions, merge them into one and delete the other.
- When a decision no longer applies, delete its ADR and update every reference to it.
- Do not record statuses, dates, or lineage markers such as `Supersedes`, `Amends`, or `Superseded by`. Git history is the record of earlier versions.

## ADR Dual-Write to Airsync

If Airsync is enabled, follow the Airsync module's canonical ADR dual-write rule when an ADR is created, changed, or deleted.

## ADR Template

```md
# <decision title>

## Context
<why this decision is needed>

## Decision
<what was decided>

## Consequences
<tradeoffs, follow-ups, and constraints>
```

## Agent Operating Rules

- Material architectural or workflow decisions MUST be captured or updated in `specs/decisions/`.
- ADR filenames MUST contain only a unique lowercase, hyphen-separated descriptive name and the `.md` extension, with no sequence number or timestamp.
- Agents MUST reference ADRs by full repository path, never by a number or identifier.
- If a prior decision changes, agents MUST edit its ADR in place so it remains the single consolidated statement of that decision.
- Agents MUST NOT add statuses, dates, or `Supersedes`, `Amends`, or `Superseded by` markers to ADRs.
- If Airsync is enabled and an ADR is created, changed, or deleted, agents MUST follow the Airsync module's canonical ADR dual-write rule.
