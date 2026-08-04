# ADR-0001: Mocked booking flow behind real API routes

Status: Superseded
Superseded by: [ADR-0002](./ADR-0002-embed-calendly-inline-widget.md)

## Context

The marketing home's booking CTAs must open a dialog
that verifies the visitor's email with a confirmation code
before opening the Calendly scheduling link.
For now the whole flow is mocked: no email is actually sent.

## Decision

- The frontend talks to **real Next.js route handlers**
  (`POST /api/booking/request-code`, `POST /api/booking/verify-code`)
  whose internals are mocked.
  Swapping in a real mailer later is a server-only change.
- The mock affordance is a single **optional `mockCode` field**
  in the request-code response.
  The UI shows the hint only when the field is present,
  so removing it requires no frontend change.
- The domain lives in `lib/booking/` behind two ports:
  `CodeSender` (mock logs to the server console)
  and `CodeStore` (in-memory `Map` stashed on `globalThis`
  so dev HMR does not wipe codes mid-flow).
  A real deployment swaps the store for Redis/DB behind the same port;
  the in-memory store does not survive serverless instance recycling.
- Codes are 6 digits, single-use, expire after 10 minutes,
  and allow 3 verification attempts.
  Request-rate limiting is deferred until a real mailer exists.
- The dialog's visual design comes from the imported Claude Design
  reference ("Elemwave Home.dc.html", project 5c1b0cb9):
  white card, navy form buttons, ✕ close, demo-hint box.
- The dialog uses the native `<dialog>` element (`showModal()`)
  instead of a UI dependency:
  top-layer rendering, focus trapping, Escape, and backdrop come built in,
  and the project has zero UI dependencies today.
- Exception to TDD (FRAMEWORK.md): the user explicitly opted out
  of automated tests for this mocked flow (2026-08-03).
  The project has no test runner yet;
  the domain service is built with injectable clock/code-generator seams
  so tests can be added without refactoring
  when the flow stops being a mock.
  Verified manually instead.
