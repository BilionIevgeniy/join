# Feature plan

The work that brings JOIN from course project to production standard, in implementation order. Each file is self-contained: load one with `/feature load <number>`, then follow the workflow in `context/ai-interaction.md` (plan review by `architecture-reviewer`, tests, `code-reviewer`/`security-auditor`, PR with green checks). A feature is one PR with named commits inside; `/feature load` moves its spec from this folder to `context/features/`.

The plan was reviewed twice by independent senior-architect agents on 2026-11-17: first for order and security (two rounds, OK with changes, all taken), then for enterprise realism and product completeness (two rounds, OK with changes, all taken; it added the runtime config, the data contract, lost-update protection, subtasks as rows, the UI kit, filters, ordering, labels, comments and activity, data export, notifications and release-please). The handbook (`BilionIevgeniy/join-handbook`) is written after the features, from the real code.

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
| 5 | [Feature structure, SignalStores and data contract](5.feature-structure-and-stores.md) | MUST | [ ] |
| 6 | [Unit and component tests](6.unit-and-component-tests.md) | MUST | [ ] |
| 7 | [Workspaces, invitations, permissions and RLS](7.workspaces-and-rls.md) | MUST | [ ] |
| 8 | [Auth completeness and account settings](8.auth-and-account-settings.md) | MUST | [ ] |
| 9 | [Files in Storage and subtasks as rows](9.files-and-subtasks.md) | MUST | [ ] |
| 10 | [Design tokens and shared UI kit](10.design-tokens-and-ui-kit.md) | MUST | [ ] |
| 11 | [Routing, filters and UX](11.routing-and-ux.md) | MUST | [ ] |
| 12 | [Data states, errors and monitoring](12.data-states-errors-monitoring.md) | MUST | [ ] |
| 13 | [CDK drag and drop, ordering and accessibility](13.drag-drop-ordering-and-a11y.md) | MUST | [ ] |
| 14 | [Signal Forms](14.signal-forms.md) | MUST | [ ] |
| 15 | [Workspace labels](15.workspace-labels.md) | SHOULD | [ ] |
| 16 | [Comments and activity log](16.comments-and-activity-log.md) | MUST | [ ] |
| 17 | [Legal pages, privacy and data export](17.legal-and-privacy.md) | MUST | [ ] |
| 18 | [Hardening: performance, CSP and headers](18.hardening.md) | MUST | [ ] |
| 19 | [Realtime board](19.realtime-board.md) | MUST | [ ] |
| 20 | [In-app notifications](20.in-app-notifications.md) | SHOULD | [ ] |
| 21 | [English and German (i18n)](21.i18n-en-de.md) | MUST | [ ] |
| 22 | [Full E2E suite](22.e2e-full.md) | MUST | [ ] |
| 23 | [Final review and v1.0.0](23.final-review.md) | MUST, last | [ ] |

MUST/SHOULD is a priority, not a cut: every feature is built.

**Dependencies:** 2 needs 1 · 3 needs 2 (CI, runtime config) · 4 needs 3 (local Supabase, anonymous demo) · 5 needs 4 (the smoke tests guard the move) · 6 needs 5 (tests target the new seams) · 7 needs 3, 5, 6 · 8 needs 7 · 9 needs 7 (object paths per workspace) · 10 needs 5 and 6 · 11 and 12 need 10 · 13 needs 7 (`version`) and 10 · 14 needs 10 · 15 needs 7 and 14 · 16 needs 9 and 14 · 17 needs 8 and 16 · 18 needs 2 · 19 needs 7, 12 and 16 · 20 needs 8 and 19 · 21 needs every feature that adds visible text (10–20) · 22 needs 19 and 21 · 23 needs all.

## Order principles

1. **Security before polish**: the live app very likely lets anyone with the URL read and write (fake guest without a session, email upsert, `delete-user` without a caller check). Feature 3 closes that right after the tooling that can test it.
2. **A browser test before the big move**: feature 4 guards feature 5, which changes every import.
3. **Unit tests after the move**: they target the new seams (stores with fake repositories), not the code that the move replaces.
4. **Tenancy before what depends on it**: Storage paths (9), labels (15), comments (16) and Realtime channels (19) are per workspace.
5. **The kit before the screens that need it**: routed dialogs (11), error and empty states (12), menus for drag and drop (13) and form controls (14) use the kit (10).
6. **Text and behaviour before the full E2E suite**: i18n (21) and Realtime (19) change selectors and board behaviour.

## Cross-file decisions (settled before implementation)

1. **Angular version**: v22 (requires TypeScript 6.0 and Node ≥ 22). Angular majors only through `ng update` as their own feature.
2. **State**: NgRx SignalStore (`@ngrx/signals`, `withEntities`) for auth, workspace, contacts and tasks; `resource()` inside the store for loads, keyed by `currentUserId()`/`currentWorkspaceId()` (no reset methods); toast and modal stay plain services. `@ngrx/signals/resource` stays out while it is experimental. ADR in 5.
3. **Boundaries**: Sheriff (`@softarc/sheriff-core`, `@softarc/eslint-plugin-sheriff`) with a public `index.ts` per feature; verify the rule names and config on the installed version first in 5; fallback `eslint-plugin-boundaries`. Not Nx (one app).
4. **OnPush**: the v22 default. Feature 1 leaves any `Eager` that `ng update` adds; feature 5 removes it component by component behind the smoke tests.
5. **Demo**: Supabase anonymous sign-in with a seeded demo workspace replaces the fake in-memory guest (3, extended in 7).
6. **Tenancy**: workspaces with members and invitations that the invitee accepts; RLS on membership (7).
7. **Rejected, each named in the ADR or spec where it was considered**: `HttpClient`/interceptors and MSW (no HTTP layer; fakes at the repository seam), Angular Material (own kit on CDK + Aria, 10), classic NgRx Store and the SignalStore events plugin, facades on top of stores, Nx and domain-slice renaming (one app), Storybook, feature flags (`APP_CONFIG.environment` is enough), Renovate (Dependabot fits GitHub), virtual scrolling, multiple boards per workspace, bulk actions, keyboard shortcuts (WCAG 2.1.4 risk), product tours, avatar upload.
8. **Supabase projects**: local stack for development and CI, a hosted `dev` project for previews, a hosted `prod` project for `main`.
9. **Required checks** grow with the features: `ci` (2), `integration` (3), `e2e` (4), the SonarQube Cloud gate (6).
10. **Data contract**: generated DB types are the contract; camelCase domain models with tested mappers in the repository (ADR in 5). Dates as `date` columns, a `CLOCK` token for "now".
11. **Build once, deploy many**: one artifact; `config.json` per deploy context loaded by `provideAppInitializer` into `APP_CONFIG` (2).
12. **Concurrency**: `version` column with `expected_version` in the update RPCs (7); subtasks as rows (9); ordering with fractional `position` keys and a `move_task` RPC (13); activity only from triggers (16).
