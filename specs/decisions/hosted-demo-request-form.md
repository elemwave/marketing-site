# Collect demo requests through an Elemwave-owned hosted form

## Context

Prospective clients need a way to request the beta demo without booking a
meeting. The marketing site is a static export and has no submission backend.

## Decision

An Elemwave-owned Google Form collects name, affiliation, email address,
industry sector and acceptance of the beta/six-month terms. The site links
to the supplied public form in a new tab with `rel="noreferrer"`, using a
single public URL in site content. The site receives and stores no request.
Someone at Elemwave reads each response and emails the demo download link.
Each request is kept for twelve months then deleted by Elemwave. The privacy
policy discloses Google Forms, its privacy notice, collected details, purpose,
retention and possible storage outside the European Economic Area.

The English demo-request disclosure may be published before the approved
Spanish source receives it, as expressly approved for EWM-133; updating that
source is a follow-up. Existing translated policy content remains unchanged.

Related precedent:
[Embed Calendly's own popup modal as the booking dialog](specs/decisions/calendly-popup-modal-booking-dialog.md).

## Consequences

The website stays static and collects no form data. The form account owner
maintains validation, response access, deletion and delivery. Human QA must
verify the hosted form's settings and wording before release. Changing the
public form address requires rebuilding the site.
