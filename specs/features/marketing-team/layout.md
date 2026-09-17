# Marketing Team — Layout

Structural source of truth for the Elemwave Our Team page.
Every field, label, section, action and static string below must render.

Tokens, type scale, shadows, glow geometry and shared chrome rules live in
[`specs/ui/style-guide.md`](../../ui/style-guide.md).
This document covers structure and page-specific content.

The header and footer are shared site chrome, described once in
[`marketing-home/layout.md`](../marketing-home/layout.md) §1 and §6.
Only what differs on this page is repeated here.

## Page Structure

1. Skip control at the start of the shared header.
2. Dark band containing the shared Header alone.
3. Team section inside the primary-content landmark.
4. Footer outside the primary-content landmark.

The dark band encloses only the header.
The page has no hero image and no top anchor.

## 1. Header

As `marketing-home/layout.md` §1, with the Our Team entry marked as the current
page.
The navigation lists Home, Partnerships, Our Team and Contact in that order.

Below 761px the navigation collapses into the shared drawer.
The drawer lists the same four entries and marks Our Team as current.

## 2. Team Section

The team section is a white content section.
It contains one introductory block followed by a wrapping staff-card grid.

### Introductory Block

- Eyebrow: **"Our team"**.
- H1: **"The people behind Elemwave"**.
- Decorative 64px underline bar.
- Lead paragraph:
  **"We are a small team of engineers and researchers based in Granada, Spain,
  specialising in computational electromagnetics, EMC and RF. Together we
  combine academic research with hands-on engineering software development to
  solve complex simulation challenges for our clients."**

### Staff Cards

The section renders five staff entries, in this order:

1. **Salvador G. García**.
   Role: **"Full Professor, University of Granada"**.
   Portrait: `/images/staff/salvador_garcia.webp`.
   Portrait accessible name: **"Salvador G. García"**.
   Summary:
   **"Full Professor of Electromagnetism at the University of Granada, with a
   Ph.D. in physics (extraordinary award). He has published over 90 refereed
   articles and led national and international projects in computational
   electromagnetics, EMC, RCS and antenna design."**
2. **Luis D. Angulo**.
   Role: **"Associate Professor, University of Granada"**.
   Portrait: `/images/staff/luis_angulo.webp`.
   Portrait accessible name: **"Luis D. Angulo"**.
   Summary:
   **"Associate Professor at the University of Granada and physicist with a
   Ph.D. on time-domain discontinuous Galerkin methods. He is a lead developer
   of Semba, a time-domain simulation tool built for electromagnetic
   compatibility problems, and works on DGTD, FDTD and meshing for modern
   solvers."**
3. **Jose Diaz**.
   Role: **"Software & Business"**.
   Portrait: `/images/staff/jose_diaz.webp`.
   Portrait accessible name: **"Jose Diaz"**.
   Summary:
   **"Entrepreneur specialised in software development and data processing,
   with an MSc in Computer Science from the University of London. He holds
   SCRUM Master, ITILv3, PRINCE2 and Symfony certifications and has founded
   three other startups: Aircury, Smartgrade and Carousel Learning."**
4. **Amelia Rubio Bretones**.
   Role: **"Full Professor, University of Granada"**.
   Portrait: `/images/staff/amelia_rubio.webp`.
   Portrait accessible name: **"Amelia Rubio Bretones"**.
   Summary:
   **"Full Professor of Electromagnetism at the University of Granada since
   2000. Her research covers numerical analysis of radiation and propagation
   with applications in antennas, radar and EMC, including long-term stays at
   Delft, Eindhoven and Penn State. Recipient of the URSI Young Scientists
   award (1993, 1995)."**
5. **Rafael Gómez Martín**.
   Role: **"Emeritus Professor, University of Granada"**.
   Portrait: `/images/staff/rafael_gomez.webp`.
   Portrait accessible name: **"Rafael Gómez Martín"**.
   Summary:
   **"Emeritus Professor at the University of Granada and former head of its
   Electromagnetic Group (1985–2001). He has coordinated numerous applied
   electromagnetics projects on wave propagation, ground penetrating radar,
   antennas and EMC, and is the author of two books and many peer-reviewed
   articles."**

Each staff card contains, in order:

- Portrait image.
- Name heading.
- Role label.
- Summary paragraph.

## 3. Footer

As `marketing-home/layout.md` §6, with the Quick Links column including:

- Our Team.
- Contact.
- Partnerships.
- Schedule a meeting.

## Image Sources

The team page uses five staff portraits under
`projects/marketing/public/images/staff/`.
The header and footer continue to use the shared Elemwave logo.
