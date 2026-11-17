# Complete Action

The feature reaches `main` through a PR merged on GitHub after green checks, never through a local merge and a push of `main`.

1. Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test` and `npm run build`, `npm run test:integration` when the database changed, and `npm run test:e2e` when a page, a route or a journey changed; stop and fix if anything is not green. (Until feature 2 adds a script, skip it and say so.)
2. Reset current-feature.md:
   - Change H1 back to `# Current Feature`
   - Clear Goals, Notes and Model sections (keep placeholder comments)
   - Add a feature summary to the END of context/feature-history.md (not to current-feature.md)
3. Check `context/todo-before-live.md` and the specs in `context/features/plan/` against what this feature built:
   - Delete each item the feature finished, and each Scope item of a later spec it already did
   - Shorten an item the feature finished in part, so it says only what is left
   - Keep anything not clearly done, and name the deleted items in the final message
   - Work found during the feature was done in it ("Found work" in `context/ai-interaction.md`); only what cannot be built goes to the before-live file, and what is too large goes into the Scope of the matching spec
   - Tick the feature in `context/features/plan/README.md`
4. Commit on the feature branch (check `git branch --show-current` first):
   - Stage the feature's files by name, not `git add -A`
   - Check `git status`: a change that is not part of the feature stays unstaged, and the final message names it
   - Commit with a descriptive conventional message
5. Before the push, handle the open Dependabot PRs ("Dependency updates (Dependabot)" in `context/ai-interaction.md`), then `git fetch` and `git merge origin/main` into the feature branch, and run the checks of step 1 again if anything came in
6. Push the feature branch and open the PR if there is none: `gh pr create --base main` (title = the main commit message)
7. Wait for the required checks: `gh pr checks <number> --watch`. Red: fix, commit, push, wait again
8. Once all required checks are green, merge without asking: `gh pr merge <number> --merge --delete-branch`. A red, pending or missing check means no merge
9. `git switch main`, `git pull --ff-only`; if the feature branch still exists locally, check `git merge-base --is-ancestor <branch> main`, then `git branch -D <branch>`
10. Confirm the deploy of the merge commit (checks and the hosting status) and report it
