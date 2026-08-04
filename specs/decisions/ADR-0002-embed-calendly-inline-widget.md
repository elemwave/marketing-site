# ADR-0002: Embed Calendly's own popup modal as the booking dialog

Status: Draft
Supersedes: ADR-0001

## Context

ADR-0001 put a mocked email + confirmation-code flow
in front of a Calendly link
while no real mailer existed.
The team now prefers to let Calendly handle the entire scheduling flow
directly on the page,
which makes the verification layer — mocked or real — unnecessary.

## Decision

- The three calls to action open **Calendly's own popup modal**,
  through the `react-calendly` library's `PopupModal` component.
  `pageSettings.primaryColor` carries the accent colour,
  mirroring the `navy-700` token.
- The scheduling page comes from `CALENDLY_URL`.
  Its value lives in `projects/marketing/.env`, which is versioned:
  the URL is public — it ships inside the exported HTML —
  so it is configuration, not a secret,
  and `.env.local` stays available for a local override.
  The root layout reads it — it is a server component —
  and hands it to `BookingModalProvider`, which wraps every page,
  so any page can carry booking calls to action
  without repeating the read or threading a prop of its own.
  The client bundle never sees the variable,
  so it needs no `NEXT_PUBLIC_` prefix,
  and the read must stay in the layout:
  moved into the provider, which is a client component,
  it compiles and prerenders but throws in the browser at hydration.
  The layout throws when the variable is unset,
  so a misconfigured environment fails the build
  rather than shipping a modal with nowhere to go.
  Pages are prerendered, so the value resolves during the build:
  Next loads the `.env` files of `projects/marketing/`
  in `next build` as it does in `next dev`,
  which is why the deployment workflow needs no step of its own for it,
  and why changing the link means rebuilding.
- `PopupModal` renders the scheduling iframe itself
  and never requests `assets.calendly.com/assets/external/widget.js`,
  so no vendor script, no `Window.Calendly` global
  and no manual initialisation are involved.
  It renders nothing at all while closed,
  which gives two guarantees:
  nothing third-party loads up front,
  and every open gets a fresh scheduler that cannot stack.
- The booking surface is the vendor's modal as it ships,
  not a shell of ours around an embed.
  Sizing that embed inside a native `<dialog>` is the alternative,
  and it leaves visible dead space below the scheduler,
  because Calendly's `resize` option belongs to the script this decision avoids.
  Taking the vendor's modal is the simpler answer;
  matching it to the design system is not.
- The site holds no booking state of its own:
  no email-verification domain, no `/api/booking/*` routes,
  no form steps inside the dialog, and no `--color-error` token.
  `lib/booking/constants.ts` holds only the accent colour.
- Trade-off: the page carries a third-party iframe — but no third-party script —
  and only once the visitor opens the modal.
  The booking surface does not follow `specs/ui/style-guide.md`:
  grey scrim rather than the navy one, no card, no title, Calendly's own ✕,
  and one request to `assets.calendly.com` for that ✕ icon.
  Accessibility is narrower too — the vendor modal traps no focus,
  binds no keys, and leaves the page behind scrollable.
  Escape and a body scroll lock are ours;
  focus trapping is accepted as lost.
  Its panel is capped at 680px with no prop to change it,
  so `globals.css` lifts that cap above 975px
  to keep the second step from scrolling inside the iframe.
