# Feature plan

The work that brings JOIN from course project to production standard, in implementation order. Each file is self-contained: load one with `/feature load <number>`, then follow the workflow in `context/ai-interaction.md` (plan review by `architecture-reviewer`, tests, `code-reviewer`/`security-auditor`, PR with green checks). A feature is one PR with named commits inside; `/feature load` moves its spec from this folder to `context/features/`.

The plan was reviewed by an independent senior-architect agent on 2026-11-17 (verdict after two rounds: OK with changes, all changes taken). The handbook (`BilionIevgeniy/join-handbook`) is written after the features, from the real code.

Rules for every spec:

- `context/architecture-rules.md` and `context/coding-standards.md` win over anything written here. If a step conflicts with them, the plan review decides, and a changed rule gets an ADR
- Check every API against the installed version first ("Checking APIs" in `context/ai-interaction.md`); the links under "Read first" are starting points, not a replacement
- Every feature updates the E2E journeys of the pages and routes it changes (from feature 4 on)
- Work found during a feature is done in that feature; what is too large goes into the Scope of the matching spec below
- When a feature is merged, tick it here and add it to `context/feature-history.md`

| # | Feature | Priority | Status |
| --- | --- | --- | --- |
| 1 | [Angular 22 and TypeScript 6](1.angular-22-upgrade.md) | MUST | [ ] |
| 2 | [Tooling, CI and deploy](2.tooling-ci-deploy.md) | MUST | [ ] |
| 3 | [Supabase as code and security lockdown](3.supabase-as-code-and-lockdown.md) | MUST | [ ] |
| 4 | [E2E smoke tests](4.e2e-smoke.md) | MUST | [ ] |
| 5 | [Feature structure and SignalStores](5.feature-structure-and-stores.md) | MUST | [ ] |
| 6 | [Unit and component tests](6.unit-and-component-tests.md) | MUST | [ ] |
| 7 | [Workspaces, invitations and RLS](7.workspaces-and-rls.md) | MUST | [ ] |
| 8 | [Auth completeness](8.auth-completeness.md) | MUST | [ ] |
| 9 | [Files in Supabase Storage](9.files-in-storage.md) | MUST | [ ] |
| 10 | [Routing and UX](10.routing-and-ux.md) | MUST | [ ] |
| 11 | [Data states, errors and monitoring](11.data-states-errors-monitoring.md) | MUST | [ ] |
| 12 | [CDK drag and drop and accessibility](12.drag-drop-and-a11y.md) | MUST | [ ] |
| 13 | [Legal pages and privacy](13.legal-and-privacy.md) | MUST | [ ] |
| 14 | [Signal Forms](14.signal-forms.md) | MUST | [ ] |
| 15 | [Hardening: performance, CSP and headers](15.hardening.md) | MUST | [ ] |
| 16 | [English and German (i18n)](16.i18n-en-de.md) | MUST | [ ] |
| 17 | [Realtime board](17.realtime-board.md) | MUST | [ ] |
| 18 | [Full E2E suite](18.e2e-full.md) | MUST | [ ] |
| 19 | [Final review pass](19.final-review.md) | MUST, last | [ ] |

**Dependencies:** 2 needs 1 · 3 needs 2 (CI runs the integration job) · 4 needs 3 (local Supabase, anonymous demo) · 5 needs 4 (the smoke tests guard the move) · 6 needs 5 (tests target the new seams) · 7 needs 3, 5, 6 · 8 needs 7 · 9 needs 7 (object paths per workspace) · 10 and 11 need 5 · 12 needs 5 · 13 needs 8 (account deletion) · 14 needs 5 · 15 needs 2 · 16 needs 10–14 (all visible text exists) · 17 needs 7 and 11 · 18 needs 16 and 17 (selectors and board behaviour settled) · 19 needs all.

## Order principles

1. **Security before polish**: the live app very likely lets anyone with the URL read and write (fake guest without a session, email upsert, `delete-user` without a caller check). Feature 3 closes that right after the tooling that can test it.
2. **A browser test before the big move**: feature 4 guards feature 5, which changes every import.
3. **Unit tests after the move**: they target the new seams (stores with fake repositories), not the code that the move replaces.
4. **Tenancy before what depends on it**: Storage paths (9) and Realtime channels (17) are per workspace.
5. **Text and behaviour before the full E2E suite**: i18n (16) and Realtime (17) change selectors and board behaviour.

## Cross-file decisions (settled before implementation)

1. **Angular version**: v22 (requires TypeScript 6.0 and Node ≥ 22). Angular majors only through `ng update` as their own feature.
2. **State**: NgRx SignalStore (`@ngrx/signals`, `withEntities`) for auth, workspace, contacts and tasks; `resource()` inside the store for loads; toast and modal stay plain services. `@ngrx/signals/resource` stays out while it is experimental. ADR in 5.
3. **Boundaries**: Sheriff (`@softarc/sheriff-core`, `@softarc/eslint-plugin-sheriff`) with a public `index.ts` per feature; verify the rule names and config on the installed version first in 5; fallback `eslint-plugin-boundaries`. Not Nx (one app).
4. **OnPush**: the v22 default. Feature 1 leaves any `Eager` that `ng update` adds; feature 5 removes it component by component behind the smoke tests.
5. **Demo**: Supabase anonymous sign-in with a seeded demo workspace replaces the fake in-memory guest (3, extended in 7).
6. **Tenancy**: workspaces with members and invitations that the invitee accepts; RLS on membership (7).
7. **No `HttpClient`/interceptors, no Angular Material, no NgRx classic Store, no Nx, no Storybook** — each named in the ADR or spec where it was considered.
8. **Supabase projects**: local stack for development and CI, a hosted `dev` project for previews, a hosted `prod` project for `main`.
9. **Required checks** grow with the features: `ci` (2), `integration` (3), `e2e` (4).
