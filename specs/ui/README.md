# Frontend Design System

`specs/ui/` stores the project's living style guide and UI design tokens. Use `frontend-ui-workflow` to keep these files aligned with the real frontend design system.

- `style-guide.md`: The canonical source of truth for design tokens and UI patterns.
- Update the style guide whenever new tokens or patterns are identified.

## Relationship To Feature Specs

Use `specs/ui/style-guide.md` for visual fidelity across the whole frontend.

A change's own frontend contracts live under `specs/changes/<name>/`, scoped to
that change rather than kept as a standing per-feature document:

- `layout.md`: what must render.
- `experience.md`: how it behaves and when it renders.
- `implementation-plan.md`: how the UI code should be structured cleanly from the first pass.

New UI should reuse tokens, primitives, variants, and composition patterns from
`style-guide.md` while satisfying that change's own layout, experience, and
implementation plan. Behaviour the specification still needs once the change
lands belongs in the feature's own `spec.md`, as a requirement and scenario.
