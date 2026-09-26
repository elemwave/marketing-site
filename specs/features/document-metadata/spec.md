# Document Metadata

An automated check of the root layout's title template and the shared
link-preview image address, exercised against what a visitor is actually
served, run as part of verification, so a regression to the template or the
metadata base cannot land unnoticed.

### Requirement: Verification confirms the served document title follows the site's title template

Every verification run MUST confirm that the contact page, the partnerships
page, the privacy policy, the integrated policy, and a path that has no page
each serve a document title equal to that page's own declared title followed
by " | Elemwave".

#### Scenario: Verification runs against a revision
- **WHEN** verification runs against a revision
- **THEN** it confirms the served document title of the contact page, the
  partnerships page, the privacy policy, the integrated policy, and a path
  that has no page each combine that page's own title with " | Elemwave"

#### Scenario: A templated page's served title stops following the template
- **WHEN** a templated page's served document title no longer combines its
  own title with " | Elemwave"
- **THEN** the verification run fails

### Requirement: Verification confirms the home page's served title carries no brand suffix

The home page's title stands for the brand itself. Every verification run
MUST confirm the home page serves that title alone, with no suffix added.

#### Scenario: The home page serves its title
- **WHEN** verification runs against a revision
- **THEN** it confirms the home page's served document title is exactly its
  own declared title, with no " | Elemwave" suffix

#### Scenario: The home page's served title gains a suffix
- **WHEN** the home page's served document title no longer matches its own
  declared title exactly
- **THEN** the verification run fails

### Requirement: Verification confirms the shared link-preview image resolves to an absolute production address

The shared link-preview image is declared as a relative path and depends on
the root layout's metadata base to resolve. Every verification run MUST
confirm that, as actually served, it resolves to an absolute address on the
public production site.

#### Scenario: Verification runs against a revision
- **WHEN** verification runs against a revision
- **THEN** it confirms the served link-preview image address is an absolute
  address on the public production site

#### Scenario: The served link-preview image address stops resolving absolute
- **WHEN** the served link-preview image address is no longer an absolute
  address on the public production site
- **THEN** the verification run fails
