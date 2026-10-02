# Visual Regression

An automated check that compares how the shared chrome and the shared section
heading look against an approved reference, so an unapproved visual change
cannot reach the staging branch with a green gate.

### Requirement: An unapproved visual change to a shared component fails the gate

The verification gate SHALL compare the rendered site against an approved
reference, and SHALL fail when any covered capture differs from it beyond a
small fixed tolerance. The failure MUST show the difference against the
approved reference.

#### Scenario: A background colour leaks across sections
- **WHEN** a page-level wrapper gives every section a background it did not
  have
- **THEN** the check fails on the page captures and shows the difference

#### Scenario: A heading underline disappears on a dark band
- **WHEN** the shared section heading's underline takes a colour that is not
  visible on the dark certifications band
- **THEN** the check fails on the dark-band heading capture

### Requirement: The reference covers the shared chrome and the shared heading

The approved reference SHALL cover the header, the home hero, the partnerships
hero, the page wrapper on a short page and on a page tall enough for the
shell's growth rule to engage, and the shared section heading on a light band,
on the dark certifications band and as a page title. Each heading capture
SHALL cover only the heading's title, its underline bar and the band
immediately around them, so a content edit elsewhere in the section does not
fail it. It is captured in one desktop browser only.

#### Scenario: Content elsewhere in a section changes
- **WHEN** a card or paragraph in a section changes but its heading does not
- **THEN** the section's heading capture still passes

#### Scenario: A rule that only engages on a tall page changes
- **WHEN** the page shell changes how a tall page fills its window
- **THEN** the tall-page capture differs and the check fails

### Requirement: The verdict is deterministic

The reference SHALL be generated and compared only inside the project's pinned
browser image, with animations disabled and reduced motion requested.

#### Scenario: Unchanged site, repeated runs
- **WHEN** the check runs twice on an unchanged site
- **THEN** both runs pass

### Requirement: An intended change is approved by committing the new reference

A single documented command SHALL rewrite the reference in the pinned image,
and the rewritten images SHALL be committed with the change so they appear in
its review.

#### Scenario: Developer makes an intended visual change
- **WHEN** the developer runs `make e2e-update-visuals` and commits the
  updated images with the change
- **THEN** the check passes
