# Architecture Rules

The short rulebook: where code goes and which way dependencies point. The newcomer description is `docs/arc42-lite.md`; why the rules are the way they are is in `docs/adr/`. A rule changes only with an ADR.

## Status

Feature 5 of the plan moves the code into the target layout below (feature 6 adds the stores and repositories). Until it is merged, `src/app` still has the course layout (`core/`, `components/`, `pages/`, `layout/`); new code in that period follows the target rules as far as the old layout allows, and feature 5 moves it with the rest. Delete this section when feature 5 is merged.

Why this layout: the Angular style guide asks to organise by feature, not by type (`components/`, `services/`), with one concept per file and tests next to the code; the roles inside a feature (`pages`/`ui`/`data-access`/`domain`) are the feature/ui/data-access/util split common in enterprise Angular codebases, here as folders with lint-enforced boundaries instead of Nx libraries (ADR from feature 5).

## Layout (target)

```text
src/app/
  app.ts, app.config.ts, app.routes.ts   bootstrap, root providers, top-level routes only
  core/                                   app-wide infrastructure, no UI, no feature knowledge
    supabase/                             the Supabase client (InjectionToken), generated database.types.ts
    config/                               APP_CONFIG token, loader and schema of config.json (feature 2)
    error/                                global ErrorHandler, logger
    time/                                 CLOCK token
    i18n/ …                               (later features)
  shell/                                  main layout (signed-in), public layout (login, sign-up, legal, help — no data loads), header, sidebar
  shared/
    ui/                                   the UI kit (feature 11): presentational, CDK/Angular Aria based, each with a harness (button, dialog, confirm, menu, combobox, form field, toast, skeleton, empty/error state…)
    util/                                 pure helpers with no feature knowledge (collection, file, image, date), each with its test
  features/
    auth/        data-access/ (auth.store, auth.repository), guards/, pages/ (login, signup…), index.ts
    workspaces/  data-access/, ui/, pages/, index.ts        (feature 8)
    contacts/    data-access/ (contacts.store, contact.repository, contact.model), ui/, pages/, index.ts
    tasks/       data-access/ (tasks.store, task.repository, task.model, mappers), domain/, ui/ (task-form, task-detail, file-picker, comments, activity…), pages/ (incl. labels), index.ts
    notifications/ data-access/, ui/ (bell, list), index.ts  (feature 21)
    board/       domain/ (filters), ui/ (board-column, task-card), pages/ (board-page), index.ts
    summary/     ui/, pages/
    legal/       pages/ (privacy, legal notice, help, accessibility statement)
supabase/                                 config.toml, migrations/, functions/delete-user/, seed.sql, tests
e2e/                                      Playwright journeys
```

## Roles inside a feature

| Role | What it holds | May use |
| --- | --- | --- |
| `pages/` | Routed container components: read route params, inject the store, pass data to `ui/`, handle outputs | the feature's store, `ui/`, `domain/`, other features' `index.ts`, `shared/`, `core/` |
| `ui/` | Presentational components: `input()`/`output()`/`model()` only, no store, no repository, no router navigation | `domain/`, `shared/` |
| `data-access/` | `*.store.ts` (NgRx SignalStore: state, computed, methods, `resource()` loads, optimistic updates) and `*.repository.ts` (the only code that calls Supabase), models | `domain/`, `core/supabase`, `shared/util` |
| `domain/` | Pure functions and types of the feature's rules (validation, sorting, status rules), each with a test | `shared/util` only |
| `guards/` | Functional route guards and resolvers | the feature's store |
| `index.ts` | The feature's public API: what other features and the routes may import | — |

## Rules

1. Only `*.repository.ts` files and `core/supabase` touch the Supabase client. Stores call repositories; components never do.
2. A feature imports another feature only through its `index.ts`, never a deep path.
3. Dependencies between features point one way: `board → tasks → contacts → workspaces → auth`, `summary → tasks`, `notifications → tasks`, `legal` depends on nothing. No cycles. `shell` may import features' `index.ts`; no feature imports `shell`.
3a. Stores never call each other's reset or load methods: a store's `resource()` is keyed by the context it depends on (`currentUserId()`, `currentWorkspaceId()`), so a sign-out or a workspace switch empties it by itself.
4. `shared/` and `core/` never import from `features/` or `shell/`.
5. Every feature's pages are lazy-loaded (`loadComponent`/`loadChildren`); a store with per-page state is provided at route level, a store with app-wide state (`auth`, the current workspace) in root.
6. Security lives in the database (RLS, Storage policies, Edge Functions). Guards and hidden buttons are UX only.
7. The generated `database.types.ts` is the data contract; the repository maps rows to the feature's camelCase models with pure, tested mappers; components never see row types.
8. A folder past about 12 files is split by topic.

## Where does this go

1. Talks to Supabase → the feature's `*.repository.ts`
2. Holds or changes state, or orchestrates a flow (optimistic update, reload, error) → the feature's `*.store.ts`
3. A pure rule of one feature → its `domain/`, with a test
4. A pure helper with no feature knowledge → `shared/util/`
5. UI used by one feature → its `ui/`; UI with no feature knowledge used by two or more → `shared/ui/`
6. Needed by two features → the lower feature's `index.ts` (rule 3); never copy it
7. App-wide infrastructure (client, error handling, logging, i18n setup) → `core/`
8. A schema change, policy, RPC, trigger → a new file in `supabase/migrations/` (never edit a pushed migration)
9. A new folder in `features/` or a new rule → an ADR in `docs/adr/` in the same PR

## Data and security

- Every table has RLS enabled; policies per command; access is by workspace membership (feature 8); `anon` gets nothing on user data
- Server-side operations: only account deletion needs the service role (Edge Function `delete-user`, called with `supabase.functions.invoke`); everything else, including the data export (`export_my_data()` RPC), runs under RLS
- Writes that must be atomic (a task with its assignees) go through one RPC, `security invoker` unless the ADR says otherwise
- `security definer` functions have `set search_path = ''`, check the caller and are not executable by `anon`
- Concurrent edits: `tasks.version` with `expected_version` in the update RPCs (a mapped `conflict` error); subtasks are rows, not a jsonb array; ordering by fractional `position` keys through `move_task`
- History is written only by `security definer` triggers (`task_activity`); clients have no insert policy on it
- Files live in a private Storage bucket under `<workspace_id>/<task_id>/<file>`; the table keeps metadata only; the app shows them through signed URLs (feature 10)

## What the lint enforces

Filled by feature 2 (angular-eslint, template accessibility, size limits) and feature 5 (module boundaries: rules 1–4). Each rule the lint enforces gets a line here with the rule name.
