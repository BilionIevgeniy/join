# JOIN

A collaborative Kanban board (Angular 22 + Supabase), brought to production standard as a portfolio project and the basis of an Angular interview handbook.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/architecture-rules.md
- @context/ai-interaction.md
- @context/current-feature.md

The newcomer description of the architecture is `docs/arc42-lite.md`, the decisions are in `docs/adr/` (not auto-loaded: read them when a plan touches structure, data or security).

Planned work is in `context/features/plan/` (its README gives the order and the dependencies). What only a real launch needs is in `context/todo-before-live.md`. Nothing new is deferred: "Found work" in `context/ai-interaction.md`.

## Angular and library APIs

Angular, NgRx and Supabase change fast and your training data may be older than the installed versions. Before writing code that uses an API, check it ("Checking APIs" in `context/ai-interaction.md`): the Angular CLI MCP server from `.mcp.json` (`get_best_practices`, `search_documentation`, `find_examples`), the official docs, the installed `.d.ts`, Context7.

## Commands

- `npm start` — dev server on http://localhost:4200
- `npm run build` — production build (budgets must not warn)
- `npm run test` — Vitest unit and component tests (`ng test`), must be green before every commit
- `npm run lint:styles` — Stylelint for SCSS

Added by the feature plan and listed here in the commit that adds them: `lint`, `format`, `format:check`, `typecheck`, `lint:dup` (feature 2), `db:start`, `db:reset`, `db:types`, `test:integration` (feature 3), `test:e2e` (feature 4).

## Supabase

- Schema changes only as migrations in `supabase/migrations/` via the Supabase CLI, never in the dashboard (from feature 3)
- Work against the local stack (`supabase start`) or the development project; never read from, write to or change the production project unless I explicitly ask for it
- The publishable key in `src/environments/` is public by design; the service-role key never appears in `src/`
