# Token Efficiency Capability

> This file is maintained by Aircury AI Framework. Do not edit it directly. Add project-specific rules in FRAMEWORK.local.md.

Project token-efficiency rules plus the Caveman skill for terse responses

## Framework Rules

## Token Efficiency

This module enables terse-by-default communication for project sessions.

- Load and apply the `caveman` skill in `full` mode at the start of each new session in this project.
- Optimize for fewer output tokens without losing technical accuracy.
- Prefer short, direct answers over explanatory padding when the task is straightforward.
- Keep implementation details complete, but compress surrounding prose aggressively.
- If the user asks for more detail, examples, or a normal tone, expand the response immediately.

This module is reinforced by the external `caveman` skill, which is installed alongside the project configuration.

## Agent Operating Rules

- Load and apply the `caveman` skill in `full` mode at the start of every new session in this project.
- ACTIVE EVERY RESPONSE: respond tersely by default while preserving full technical accuracy.
- Remove filler, pleasantries, and unnecessary hedging unless the user explicitly asks for more detail.
- Prefer short, direct phrasing with fragments when the meaning stays precise.
- Keep code, commands, commit messages, and other project artefacts in their normal readable form unless the user explicitly asks for compressed output there too.
- Treat `stop caveman` or `normal mode` as an instruction to disable the terse style for the rest of the session.
