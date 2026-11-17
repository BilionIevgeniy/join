# Feature plan

The work that brings JOIN from course project to production standard, in implementation order. Each file is self-contained: load one with `/feature load <number>`, then follow the workflow in `context/ai-interaction.md` (plan review by `architecture-reviewer`, tests, `code-reviewer`/`security-auditor`, PR with green checks). A feature is one PR with named commits inside; `/feature load` moves its spec from this folder to `context/features/`.

The plan was reviewed by independent senior-architect agents on 2026-11-17, each review two rounds and each ending OK with changes, all taken: (1) order and security; (2) enterprise realism and product completeness (runtime config, data contract, lost-update protection, subtasks as rows, UI kit, filters, ordering, labels, comments and activity, data export, notifications); (3) the owner's final criterion — **only what solves a real JOIN problem goes into JOIN; everything else is a handbook topic with external examples**. Review 3 removed Nx, the REST/OpenAPI layer, Keycloak, Storybook, feature flags, release automation, SonarQube, DevTools and the events plugin from the plan (they are in `BilionIevgeniy/join-handbook`, `topics-outside-join.md`), kept SSR out (ADR 0002 stands) and added the `PublicLayout` fix. The handbook (`BilionIevgeniy/join-handbook`) is written after the features, from the real code.

Rules for every spec:

- `context/architecture-rules.md` and `context/coding-standards.md` win over anything written here. If a step conflicts with them, the plan review decides, and a changed rule gets an ADR
- Check every API against the installed version first ("Checking APIs" in `context/ai-interaction.md`); the links under "Read first" are starting points, not a replacement
- Every feature updates the E2E journeys of the pages and routes it changes (from feature 4 on)
- Work found during a feature is done in that feature; what is too large goes into the Scope of the matching spec below
- When a feature is merged, tick it here and add it to `context/feature-history.md`

| # | Feature | Priority | Status |
| --- | --- | --- | --- |
| 1 | [Angular 22 and TypeScript 6](1.angular-22-upgrade.md) | MUST | [ ] |
| 2 | [Tooling, CI, deploy and runtime config](2.tooling-ci-deploy.md) | MUST | [ ] |
| 3 | [Supabase as code and security lockdown](3.supabase-as-code-and-lockdown.md) | MUST | [ ] |
| 4 | [E2E smoke tests](4.e2e-smoke.md) | MUST | [ ] |
| 5 | [Feature folders and boundary lint](5.feature-folders-and-boundaries.md) | MUST | [ ] |
| 6 | [SignalStores, repositories and data contract](6.stores-repositories-data-contract.md) | MUST | [ ] |
| 7 | [Unit and component tests](7.unit-and-component-tests.md) | MUST | [ ] |
| 8 | [Workspaces, invitations, permissions and RLS](8.workspaces-and-rls.md) | MUST | [ ] |
| 9 | [Auth completeness and account settings](9.auth-and-account-settings.md) | MUST | [ ] |
| 10 | [Files in Storage and subtasks as rows](10.files-and-subtasks.md) | MUST | [ ] |
| 11 | [Design tokens and shared UI kit](11.design-tokens-and-ui-kit.md) | MUST | [ ] |
| 12 | [Routing, filters and UX](12.routing-and-ux.md) | MUST | [ ] |
| 13 | [Data states, errors and monitoring](13.data-states-errors-monitoring.md) | MUST | [ ] |
| 14 | [CDK drag and drop, ordering and accessibility](14.drag-drop-ordering-and-a11y.md) | MUST | [ ] |
| 15 | [Signal Forms](15.signal-forms.md) | MUST | [ ] |
| 16 | [Workspace labels](16.workspace-labels.md) | SHOULD | [ ] |
| 17 | [Comments and activity log](17.comments-and-activity-log.md) | MUST | [ ] |
| 18 | [Legal pages, privacy and data export](18.legal-and-privacy.md) | MUST | [ ] |
| 19 | [Hardening: performance, CSP and headers](19.hardening.md) | MUST | [ ] |
| 20 | [Realtime board](20.realtime-board.md) | MUST | [ ] |
| 21 | [In-app notifications](21.in-app-notifications.md) | SHOULD | [ ] |
| 22 | [English and German (i18n)](22.i18n-en-de.md) | MUST | [ ] |
| 23 | [Full E2E suite](23.e2e-full.md) | MUST | [ ] |
| 24 | [Final review and v1.0.0](24.final-review.md) | MUST, last | [ ] |

MUST/SHOULD is a priority, not a cut: every feature is built.

**Dependencies:** 2 needs 1 · 3 needs 2 (CI, runtime config) · 4 needs 3 (local Supabase, anonymous demo) · 5 needs 4 (the smoke tests guard the move) · 6 needs 5 · 7 needs 6 (tests target the new seams) · 8 needs 3, 6, 7 · 9 needs 3 and 8 · 10 needs 8 (object paths per workspace) · 11 needs 6 and 7 · 12 and 13 need 11 · 14 needs 8 (`version`) and 11 · 15 needs 11 · 16 needs 8 and 15 · 17 needs 10 and 15 · 18 needs 9 and 17 · 19 needs 2 · 20 needs 8, 13 and 17 · 21 needs 8 and 20 · 22 needs every feature that adds visible text (11–21) · 23 needs 20 and 22 · 24 needs all.

## Order principles

1. **Security before polish**: the live app very likely lets anyone with the URL read and write (fake guest without a session, email upsert, `delete-user` without a caller check). Feature 3 closes that right after the tooling that can test it.
2. **A browser test before the big move**: feature 4 guards feature 5 (the move to feature folders), which changes every import.
3. **Unit tests after the stores**: they target the new seams (stores with fake repositories, 6), not the code that 5 and 6 replace.
4. **Tenancy before what depends on it**: Storage paths (10), labels (16), comments (17), export (18) and Realtime channels (20) are per workspace.
5. **The kit before the screens that need it**: routed dialogs (12), error and empty states (13), menus for drag and drop (14) and form controls (15) use the kit (11).
6. **Text and behaviour before the full E2E suite**: i18n (22) and Realtime (20) change selectors and board behaviour.
7. **Only what JOIN needs**: every technology in a spec names the JOIN problem it solves; what has no such problem is a handbook topic, not code.

## Cross-file decisions (settled before implementation)

1. **Angular version**: v22 (requires TypeScript 6.0 and Node ≥ 22). Angular majors only through `ng update` as their own feature.
2. **State**: NgRx SignalStore (`@ngrx/signals`, `withEntities`) for auth, workspace, contacts and tasks; `resource()` inside the store for loads, keyed by `currentUserId()`/`currentWorkspaceId()` (no reset methods); toast and modal stay plain services. ADR in 6.
3. **Structure and boundaries**: Angular CLI workspace with feature folders and a public `index.ts` per feature; Sheriff enforces the boundaries (verify the flat-config package and rule names first in 5; fallback `eslint-plugin-boundaries`). Not Nx: one app, one team, one deployable. ADR in 5.
4. **OnPush**: the v22 default. Feature 1 leaves any `Eager` that `ng update` adds; feature 6 removes it component by component behind the smoke tests.
5. **Demo**: Supabase anonymous sign-in with a seeded demo workspace replaces the fake in-memory guest (3, extended in 8).
6. **Tenancy**: workspaces with members and invitations that the invitee accepts; RLS on membership; a permission matrix exposed as `canX` signals used with `@if` (8).
7. **Not in JOIN, explained in the handbook with external examples** (`join-handbook/topics-outside-join.md`): Nx monorepo, micro frontends, REST/OpenAPI codegen with `HttpClient` interceptors, OIDC/Keycloak, Storybook, feature flags, SSR/prerender/hydration (ADR 0002), classic NgRx Store/Effects and the events plugin, facades, NgModules and their migration, Angular Material theming, build-time i18n, Angular Elements, Web Workers, virtual scrolling, PWA, structural directives for roles, release automation, SonarQube, NgRx DevTools, Renovate. Product items left out: multiple boards per workspace, bulk actions, keyboard shortcuts (WCAG 2.1.4 risk), product tours, avatar upload, realtime presence, per-kind notification settings.
8. **Supabase projects**: local stack for development and CI, a hosted `dev` project for previews, a hosted `prod` project for `main`.
9. **Required checks** grow with the features: `ci` (2, with the coverage threshold from 7), `integration` (3), `e2e` (4).
10. **Data contract**: generated DB types are the contract; camelCase domain models with tested mappers in the repository (ADR in 6). Dates as `date` columns, a `CLOCK` token for "now".
11. **Build once, deploy many**: one artifact; `config.json` per deploy context (Supabase project, Sentry DSN, version) loaded with `HttpClient` by `provideAppInitializer` into `APP_CONFIG` (2).
12. **Concurrency**: `version` column with `expected_version` in the update RPCs (8); subtasks as rows (10); ordering with fractional `position` keys and a `move_task` RPC (14); activity only from triggers (17).
13. **Server-side operations**: only account deletion needs the service role → one Edge Function (`delete-user`, called with `supabase.functions.invoke`); data export is an RPC scoped by `auth.uid()`. Everything else is RLS-scoped PostgREST through `supabase-js`.
14. **SSR**: no; JOIN is client-only (ADR 0002). Revisit only if a public, indexable landing page becomes a product decision (then `outputMode: 'static'` prerender of the public routes).
