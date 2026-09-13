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
