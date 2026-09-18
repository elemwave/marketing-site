# FRAMEWORK.local.md

Project-specific instructions, additions, and overrides for this repository.

This file is intentionally local to the project. Aircury AI Framework installs it as a starter file but never overwrites it during updates.

Add repository-specific rules below.

## The backlog lives on the delivery board

The standing list of known defects and improvements
is the **Backlog** column of the delivery board named in
`README.md § AI delivery board`,
not a file in this repository.

Read the board before proposing or planning work,
so a known finding is not rediscovered and written up again.
When work turns up something real but out of scope,
file it through the `overboards-add-card` skill
(`.agents/skills/overboards-add-card/SKILL.md`),
which checks whether a card already covers it first.
A card's evidence is dated the day it was filed,
so re-verify it against the current code before acting on it,
and comment any correction on the card as part of the same delivery.

## Card commit subjects

A commit that belongs to a card on the delivery board names the card first:
`[EWM-<number>] type(scope): description` —
the card's public key in square brackets, exactly one space,
then an ordinary Conventional Commits subject.
The Overboards pipeline requires that form on every commit
in a card branch's delivery range, and that holds inside submodules too.

A commit that belongs to no card stays a plain Conventional Commit.
Subjects already written as `EWM-1 | …` stay as they are:
history is not rewritten to match.

## Source comments are not product state

Source comments on static content are evidence to investigate,
not product requirements by themselves.
When a card exposes uncertainty hidden in a comment,
fix only the behaviour the card owns and leave the uncertain fact visible
unless the card or a person explicitly asks for a new product state.

For example, a `// ?` beside a name may justify a follow-up card
to confirm that name,
but it does not by itself justify adding a confirmation flag,
generic fallback copy,
or another visitor-visible policy.
That extra state changes product behaviour and must come from the card,
a clarification,
or a separate product decision.

## Shape complexity is not the lint command

`make lint` loads `projects/marketing/eslint.config.mjs`.
It does not load `eslint-plugin-sonarjs`.

`make shape-complexity` loads `projects/marketing/eslint.shape.config.mjs`,
which imports `sonarjs.configs.recommended` and ratchets new findings
against `shape-lint-baseline.json`.
That is the pass the merge gate's `shape` job runs.

A bump of `eslint-plugin-sonarjs`, or of a rule that plugin newly
recommends, is a change to what the shape pass measures.
Run `make shape-complexity` to read the new measurement.
A green `make lint` after that bump does not speak to the shape job.

The two configs are deliberately separate: the ordinary lint pass fails
on any finding, and the shape pass only fails on findings the baseline
does not already record.
Do not treat an `eslint-plugin-*` version bump as a lint-command trigger
until the config that actually imports the plugin has been identified.
The same split applies to any later analyser that is added only to the
shape config.

A dependency-maintenance run that ships the plugin bump without the
shape reading leaves the merge gate to discover the new recommended
rule, and the small in-family code fix the card already allows then
arrives as a review finding instead of in the same batch.
