---
name: cleanup
description: Clean up project housekeeping tasks and check the architecture rules (add "run" to execute fixes)
argument-hint: run|check
---

Review the codebase for cleanup tasks. Start with `git status` and `npm run lint`: several checks below read the lint output. Name the files with uncommitted changes in the report, since a finding there may be work in progress.

1. **History order:** `context/feature-history.md` goes from oldest to newest; compare with the merge order in `git log main`
2. **Debug logs:** find `console.*` in `src/`. The app logs through the logger service in `core/error` (feature 12); a hit outside it and the tests is a leftover to remove
3. **Unused code:** the unused-import and unused-variable warnings of the lint, unused exports, unused SCSS partials and assets in `public/`
4. **Stale comments:** `TODO`, `FIXME` and `HACK` in `src/` and `supabase/` whose work is done or no longer planned. Such a comment names the spec in `context/features/plan/` or the item in `context/todo-before-live.md` that holds the work ("Found work" in `context/ai-interaction.md`)
5. **Orphaned files:** files in `src/` that nothing imports and no route lazy-loads (skip `main.ts`, `*.spec.ts`, environments)
6. **Context files:** check them against the project:
   - `context/current-feature.md`: its status and goals match the current branch and the code
   - `context/project-overview.md`: the Status section is still true
   - `context/architecture-rules.md`: the layout and the lint section match `src/app` and `eslint.config.js`
   - `docs/architecture.md`: every folder of `src/app/features` has a section
   - Skip the specs in `context/features/`: they keep the paths of their time on purpose
7. **Suppressions:** `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `// stylelint-disable` that are no longer needed
8. **Architecture (what a search can answer; logic is for `code-reviewer`):**
   - `SupabaseClient`/`supabase.` used outside a `data-access/` repository or `core/supabase`
   - A feature importing another feature's internals instead of its public files (the lint should catch it; a hit means a gap in the lint)
   - An `index.ts` barrel in `src/`
   - Decorators the rules replace (`@Input`, `@Output`, `@ViewChild`, `@HostListener`), `standalone: true`, constructor injection, a component without `OnPush` (if the rules require it), `*ngIf`/`*ngFor`
   - A protected route without its guard
9. **Duplication:** run `npm run lint:dup` (jscpd, a report, never a gate) and judge each clone

## Report

One line per check, then the findings numbered across all checks, each with its file and line:

- 🟢 clean
- 🟡 needs a decision (it may be intended)
- 🔴 should be fixed

**Mode: $ARGUMENTS**

If there is no argument, the argument is "check", or it is anything else:

- Only report findings, don't modify anything
- List what WOULD be cleaned up

If the argument is "run" or "fix":

- First, report all findings with numbered items
- Then ask: "Which items would you like me to fix? (enter numbers like 1,3,5 or 'all' or 'none')"
- Wait for user response before making any changes
- Only fix the items the user specifies
- Before fixing, follow the branch rule in `context/ai-interaction.md`: on `main`, create a `fix/` branch; with unrelated uncommitted work, ask first
- An architecture finding that needs more than a local edit gets its own plan; a rule change needs a record in `docs/adr/`
- Confirm each file deletion by name, even with 'all'
- After the fixes, run `npm run lint`, `npm run typecheck`, `npm run test` and `npm run build`, and report the results
- Do not commit: ask first
- Report what you changed
