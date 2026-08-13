# Legal Pages — Layout

Structural source of truth for the legal prose pages.
Visual tokens and primitives live in `specs/ui/style-guide.md`.

## Pages

| Document | Path | Title | Language |
|---|---|---|---|
| Integrated policy | `/integrated-policy` | "Política integrada" | Spanish |
| Privacy policy | `/privacy-policy` | "Política de privacidad" | Spanish |

Slugs are English and kebab-case, matching the group's existing permalink for the
same documents; the titles are the documents' own Spanish names.

## Page structure

Top to bottom:

1. **Header** — the site header on the `navy-950` band, inside a clipping wrapper so
   its glow cannot widen the page.
2. **Document section** — light `surface` background, section padding
   `clamp(48px,7vw,88px)` top, `clamp(20px,4vw,56px)` horizontal,
   `clamp(56px,8vw,110px)` bottom.
3. **Footer** — the site footer.

## Document column

- Centred, `max-width: 820px` — the same measure as the home page's section
  descriptions.
- Carries `lang="es"` for the Spanish documents.
- Opens with the page title rendered through the shared section-heading primitive as
  an `h1`: centred Montserrat, `clamp(30px,4.5vw,56px)`, followed by the 80×3px
  underline bar.
- Body blocks follow, 40px below the title.

## Body blocks

| Block | Treatment |
|---|---|
| Section heading | Montserrat `clamp(20px,2.5vw,26px)`, 600, `ink`, 40px above |
| Paragraph | 16px, line-height 1.7, `ink-muted`, 16px above |
| List | Disc bullets, 24px indent, same type as paragraphs |
| Emphasis | Inline, 600 weight, lifted from `ink-muted` to `ink` |
| Inline link | Site link colours (`navy-700`, hover `blue-500`) plus an underline at 2px offset, so links stay findable in long prose |
| Contact block | Same type as a paragraph, rendered as an address block without the browser's default italics |

## Integrated policy content

Three opening paragraphs — the group's activity, the Direction's position on the four
management domains, and the standards the integrated management system conforms to
(ISO 9001, ISO 14001, ISO/IEC 20000-1, ISO/IEC 27001, ENS RD 311/2022) — followed by
seven sections, each a lead-in paragraph and a bulleted list of commitments:

Dirección · Calidad · Medio ambiente · Servicios de IT · Seguridad de la información ·
Equipo humano · Compliance

The document closes with two paragraphs on communication and periodic review.

## Privacy policy content

Three opening paragraphs — the legal framework (RGPD and Ley Orgánica 3/2018), the
security measures applied, and the user's own responsibility for the data supplied —
followed by six sections:

- **Datos del responsable** — a contact block: name, tax identifier, postal address
  and a contact email link.
- **Finalidad** — two paragraphs with bold lead-ins, "Contacto" and "Redes sociales".
- **Base legítima del tratamiento** — one paragraph.
- **Tiempos de conservación** — one paragraph.
- **Destinatarios y transferencias internacionales de datos** — one paragraph, then
  one line per third-party privacy policy (Twitter/X, LinkedIn), each an outbound
  link opening in a new context.
- **Derechos de los usuarios** — two paragraphs, carrying the contact email link and
  an outbound link to the supervisory authority.

## Footer link labels

The footer's **Policies** column lists "Política integrada" and "Política de
privacidad", each marked `lang="es"`.
