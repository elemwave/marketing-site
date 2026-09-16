# Accessibility Inspection

An automated scan of the site's public pages for definite accessibility failures, run as part of verification, so a regression in contrast, structure, naming or images cannot land unnoticed.

### Requirement: Verification inspects every public page for definite accessibility failures

Every verification run MUST inspect the home page, the contact page, the partnerships page, the privacy policy, the integrated policy, and a path that has no page, each in the state a visitor first sees, for accessibility failures a rule-based scan can determine without a person's judgement.

#### Scenario: Verification runs against a revision
- **WHEN** verification runs against a revision
- **THEN** it inspects the home page, the contact page, the partnerships page, the privacy policy, the integrated policy, and a path that has no page
- **AND** each page is inspected as first shown, with no prior interaction

### Requirement: A definite accessibility failure fails the run

The inspection MUST fail the run when a covered page has insufficient contrast on ordinary text, no primary-content landmark or more than one, a skipped heading rank, an image conveying information with no text alternative, a control with no accessible name, or another definite accessibility failure the inspection reports.

#### Scenario: A covered page fails the inspection
- **WHEN** the inspection finds a definite accessibility failure on a covered page
- **THEN** the verification run fails

#### Scenario: A covered page passes the inspection
- **WHEN** every covered page has no definite accessibility failure
- **THEN** the verification run does not fail because of this inspection

### Requirement: A finding needing judgement does not fail the run

A finding the inspection cannot resolve without a person's judgement MUST NOT fail the run.

#### Scenario: The inspection reports a finding needing judgement
- **WHEN** the inspection reports a finding it cannot resolve without a person's judgement
- **THEN** the verification run does not fail because of that finding

### Requirement: A green verification run states the pages passed inspection

A verification run that passes MUST mean the covered pages passed this inspection, not only that the project's individual control and token checks passed.

#### Scenario: Verification passes
- **WHEN** a verification run passes
- **THEN** every covered page passed the accessibility inspection
