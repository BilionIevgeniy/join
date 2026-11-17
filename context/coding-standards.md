# Coding Standards

Rules for every line of JOIN. Check Angular APIs against the installed version ("Checking APIs" in `context/ai-interaction.md`).

## TypeScript

- `strict` stays on (with `strictTemplates`, `strictInjectionParameters`, `noPropertyAccessFromIndexSignature`)
- No `any`; use `unknown` and narrow. Errors in `catch` are `unknown`
- Types of Supabase tables come from the generated `database.types.ts`; app models are derived from them (`Pick`, `Omit`), not written by hand twice
- Prefer `type` unions and `as const` objects over `enum` for new code
- Path aliases (`@core/*`, `@shared/*`, `@features/*`) instead of long relative paths

## Angular

- Angular 22: standalone by default (never write `standalone: true`), zoneless, OnPush is the default change detection. `ChangeDetectionStrategy.Eager` only with a comment saying why
- File naming of the Angular style guide (v20+): `board-page.ts`, `task.store.ts`, `task.repository.ts`, no `.component` suffix; one component, directive, store or service per file
- `inject()` instead of constructor injection
- `input()`, `input.required()`, `output()`, `model()`; `viewChild()`/`contentChild()`; `host: {}` in the decorator instead of `@HostListener`/`@HostBinding`
- Built-in control flow (`@if`, `@for` with a stable `track`, `@switch`, `@let`), `@defer` for heavy or rare UI
- Class and style bindings (`[class.x]`, `[style.x]`) instead of `ngClass`/`ngStyle`
- No method calls that do work in templates: derive with `computed()`
- `NgOptimizedImage` for images with known size

## Signals and state

- State is signals. Derive with `computed()`; a writable value that resets when its source changes is `linkedSignal()`
- `effect()` only for side effects outside the signal graph (DOM, storage, logging, a third-party widget), never to copy one signal into another
- Feature state lives in an NgRx SignalStore in the feature's `data-access/` (`withState`, `withComputed`, `withMethods`, `withEntities` for lists); loads use `resource()` inside the store (ADR from feature 5)
- RxJS only where it fits better (event streams, debounce of input): bridge with `toSignal`/`toObservable`; every `subscribe` ends with `takeUntilDestroyed()`
- Optimistic updates only where the rollback is cheap and the result is known (moving a task, toggling a subtask); not where the server decides the data (ids, dates)

## Forms

- Signal Forms (`@angular/forms/signals`) from feature 14; until then the existing Reactive Forms stay, and a new form is not started in Reactive Forms
- Validation rules live in a schema next to the form or in `domain/` when shared; messages in plain words next to the field
- A custom input (priority buttons, contact picker, file picker) is a form control, not a component with its own hidden state

## Naming

- Components: PascalCase class without suffix (`BoardPage`, `TaskCard`), selector `app-kebab-case`
- Stores `XStore` (`tasks.store.ts`), repositories `XRepository`, guards `xGuard`, pure functions camelCase verbs
- Booleans start with `is`, `has`, `can`; event outputs are past-tense or verbs (`saved`, `closed`, `taskMoved`)

## Styling

- SCSS with BEM (`block__element--modifier`), one stylesheet per component, design tokens as CSS custom properties in `src/styles/`
- No inline styles; no `::ng-deep`; `ViewEncapsulation.None` only for a shell that renders foreign DOM, with a comment
- Component style budget: 8 kB (angular.json); a bigger stylesheet is split into child components
- Font sizes ≥ 16px for body text, ≥ 14px for small print

## UI/UX

- Feedback at once: a button that starts a request shows its pending state and is disabled until the result, so it cannot be sent twice
- A toast never runs ahead of the screen: "created" shows when the dialog has closed and the item is visible
- Destructive actions ask for confirmation; Undo where it is cheap
- No layout shift: skeletons mirror the size of the content
- Every list has an empty state and an error state with Retry
- Errors in plain words; the form with the user's input stays open so they can retry
- Exit animations finish before the navigation they lead to

## Accessibility

Target WCAG 2.1 AA (BFSG). Checked by the template lint rules (feature 2), axe in tests (feature 12) and the `ui-reviewer` agent.

- Native elements first: a click target is a `<button>` or `<a>`, never a `<div (click)>`
- Every form field has a label; every icon-only button an `aria-label`
- Dialogs: `role="dialog"`, `aria-modal`, a title, focus trapped inside, Esc closes, focus returns to the trigger (CDK a11y)
- Drag and drop always has a keyboard alternative (the "move to" menu)
- Toasts in a live region; color is never the only indicator; visible focus everywhere

## Error handling

- Repositories throw typed errors (`{ code, message }` mapped from Supabase errors); stores catch, roll back, and expose an error state; components show it
- The global `ErrorHandler` (feature 11) logs unexpected errors through the logger (and Sentry); no `console.*` outside the logger
- User-facing messages come from one place (a message map per feature, i18n keys from feature 16), never raw Supabase messages

## Size limits

Enforced by ESLint from feature 2 (`max-lines`, `max-lines-per-function`, `complexity`); tests and generated files are exempt.

| What | Limit |
| --- | --- |
| File (TS) | 250 lines |
| Function / method | 40 lines |
| Cyclomatic complexity | 10 |
| Template | about 150 lines; split into child components above that |

## Testing

- Unit and component tests with Vitest (Angular CLI `ng test`), colocated as `[name].spec.ts`
- Pure functions (`domain/`, `shared/util`): plain tests, no TestBed
- Stores: TestBed with a fake repository; test state transitions, optimistic update and rollback, error state
- Components: Angular Testing Library (`render`, `screen`, `userEvent`), testing what the user sees and does; zoneless: `await fixture.whenStable()`, no `fakeAsync`
- Guards and resolvers: `TestBed.runInInjectionContext`
- Database (`npm run test:integration`): every RLS policy, RPC and Storage policy that guards user data has a test against the local Supabase with a second user/workspace
- End-to-end (`npm run test:e2e`, Playwright): the journeys of every page and route a feature changes, against the local Supabase
- Coverage threshold in CI from feature 6; never delete or skip a test to get green

## Code quality

- No commented-out code, no unused imports or variables, no `console.*` outside the logger
- Every `TODO` names the spec in `context/features/plan/` that holds the work
- Prettier formats everything (`npm run format:check` in CI from feature 2); Stylelint for SCSS
- markdownlint runs only in the IDE; `context/.markdownlint.jsonc` relaxes MD013, MD029 and MD034 for specs
