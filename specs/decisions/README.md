# Architecture Decision Records

`specs/decisions/` stores ADRs that preserve architectural and workflow intent.

- Keep one ADR per decision, stating that decision as it stands today.
- Name each ADR file after the decision in lowercase, hyphen-separated form,
  with no sequence number, timestamp, or identifier prefix.
- Use the human-readable decision title as the ADR heading,
  with no identifier prefix.
- Reference an ADR by its full repository path,
  for example `specs/decisions/staging-on-s3-and-cloudfront.md`.
- When a decision changes, edit its ADR in place so it stays consolidated.
  Git history keeps the earlier versions.
- When two ADRs state overlapping positions, merge them into one.
- When a decision no longer applies, delete its ADR
  and update every reference to it.
- Do not add statuses, dates, or markers such as `Supersedes`, `Amends`,
  or `Superseded by`.
- Read relevant ADRs before changing areas they govern.
