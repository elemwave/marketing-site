# Marketing Team — Specification

## Problem

Elemwave's public site introduces the product, partnerships and contact routes,
but it has no page where visitors can learn who is behind the company.
The supplied team-page design and staff portraits define the intended public
experience.
The site must publish that page, expose it in shared navigation, and make it
discoverable to visitors and crawlers.

## Goals

Publish a public Our Team page that presents the people behind Elemwave,
using the supplied team design as the content and visual source.
The page fits the existing public site journey:
visitors can reach it from shared navigation and footer links,
identify it as the current page, return to the other public pages,
open the existing booking flow, and find it through public discovery surfaces.

## Public Route

The stable public route is `/team`.
Requests for `/team` and `/team/` resolve to the page rather than a missing
page response.

## Content Requirements

The page's primary heading is **"The people behind Elemwave"**.
The page introduces Elemwave as a small team of engineers and researchers based
in Granada, Spain, specialising in computational electromagnetics, EMC and RF.

The page presents one staff entry for each supplied member, in this order:

- Salvador G. García.
- Luis D. Angulo.
- Jose Diaz.
- Amelia Rubio Bretones.
- Rafael Gómez Martín.

Each staff entry presents the supplied portrait, name, role and concise
biography summary from the supplied team design.
Each portrait has an accessible name that identifies the person shown.

## Navigation and Shared Chrome

The primary navigation includes an **Our Team** entry alongside Home,
Partnerships and Contact.
When a visitor is on the Our Team page, the Our Team navigation entry is exposed
as the current page.
The narrow-viewport menu includes the Our Team entry and marks it as current on
the Our Team page.

The footer Quick Links column includes an Our Team link alongside the existing
public-page links and booking action.
The Our Team page carries the same site header, skip-to-content behaviour,
booking action, footer and organisation record expectations as the other primary
public pages.
The booking action opens the existing scheduling flow.

## Discovery Requirements

The sitemap includes `https://www.elemwave.com/team` alongside the home,
partnerships, contact and legal pages.
The page publishes metadata and link-preview information whose title,
description and canonical address describe the team page.

## Responsive and Accessibility Requirements

The page remains usable and readable across narrow and wide viewports.
Staff entries reflow rather than overlapping or clipping content.
Staff portrait framing preserves the top of each portrait so the pictured
person's head is not clipped.
The page exposes one primary-content landmark with `id="main-content"`.
The shared header remains outside the primary-content landmark, and the shared
footer remains outside it.

## Non-Goals

Individual staff profile pages are out of scope.
Recruiting, vacancies, organisation charts and team filtering are out of scope.
Changing the existing booking flow, company contact details, legal-page content
or partnership content is out of scope.

Editing or expanding the supplied staff biographies is out of scope,
except for copy corrections needed to publish the design's wording clearly.

## Assumptions

The `/team` route is the shortest route that matches the design's "Our Team"
navigation label and the existing route style.
The design's concise card summaries are the public biography copy to show on
the first page.
Staff names follow the supplied design's visible spelling rather than portrait
filenames.
The supplied portraits are approved for publication.
