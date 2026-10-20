# Living Specifications

`specs/features/` stores the canonical, technology-agnostic description of observable system behaviour.

- Create one folder per capability.
- Keep `spec.md` focused on requirements and scenarios.
- Update these specs whenever observable behaviour changes.

## Frontend Feature Contract

For new UI, high-fidelity rebuilds, non-trivial forms, role-gated UI, or substantial frontend behaviour changes, use `frontend-ui-workflow` to keep feature-level frontend contracts under that change's own `specs/changes/<name>/`, beside its `spec.md`, `plan.md` and `tasks.md`:

- `layout.md`: structural source of truth for fields, labels, sections, actions, and static content.
- `experience.md`: behavioral source of truth for flows, micro-interactions, validation, loading/error/empty states, and visibility rules.
- `implementation-plan.md`: clean implementation source of truth for component responsibilities, file organization, state ownership, JSX structure, local primitive reuse, and conditional rendering strategy.

These files complement `spec.md` while the change is in flight. They do not replace the canonical behaviour spec: once the change ships, any of their behaviour this folder's `spec.md` lacks is folded in as scenarios, and the three documents stay in `specs/changes/<name>/` rather than moving here.

Visual tokens, reusable primitives, and composition patterns live in `specs/ui/style-guide.md`.
