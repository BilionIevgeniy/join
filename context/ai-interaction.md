# AI Interaction Guidelines

## Communication

- Be concise and direct
- Explain non-obvious decisions briefly, and say why this option and not the alternative (the project is also the basis of an interview handbook)
- Ask before large refactors or architectural changes
- Don't add features not in the project spec or the feature plan
- Never delete files without clarification

## Workflow

This is the common workflow for every feature and fix. Each step names the skill or agent that runs it; this section is the one place that says so (`.claude/skills/README.md` links here).

1. **Document** (`/feature load`) - Document the feature in @context/current-feature.md, with the model for each phase ("Choosing the model" below)
2. **Branch** (`/feature start`) - Create a new branch for the feature or fix
3. **Review the plan** (`/feature start`, agent `architecture-reviewer`) - Before any code, send the plan to the agent: the whole feature plan at `/feature start`, and again for every later step that changes structure (a new route, store, repository, data flow, migration, RLS or Storage policy). Cosmetic steps (a color, a text, a spacing) skip it. Give the agent the plan and the file paths only, not your reasoning, so its review stays independent. Settle the findings as described in "Working with review agents", then show me the agreed plan and wait for my go
4. **Implement** - Implement the feature/fix from @context/current-feature.md
5. **Test** (`/feature test`) - Add tests for new logic (see "Testing" in @context/coding-standards.md). Run `npm run lint`, `npm run typecheck`, `npm run test` and `npm run build`, `npm run test:integration` when the database changed, `npm run test:e2e` when a page, a route or a journey changed, and fix any errors; every check must be green. I check the feature in the browser myself; the `ui-reviewer` agent runs only when I ask for it
6. **Review the code** (`/feature review`, agents `code-reviewer` and, when `supabase/` or auth code changed, `security-auditor`) - Both get the diff; settle their findings as described in "Working with review agents". The review also reads the IDE diagnostics and the lint ("Warnings at review" below)
7. **Iterate** - Iterate and change things if needed
8. **Commit** (`/feature complete`) - Only after the checks are green and everything works. The reset of @context/current-feature.md and the entry in context/feature-history.md go into the feature's own commit
9. **PR and CI** (`/feature complete`) - Push the branch, open the PR with `gh`, wait for the required checks to be green
10. **Merge** (`/feature complete`) - Once the required checks are green, merge the PR on GitHub (`gh pr merge --merge --delete-branch`) without asking: it is the natural end of the task. Then update the local `main` and delete the local branch. A red or missing check means no merge

Do NOT commit until the checks are green. Run them again right before the commit, not only earlier in the feature. If a test or the build fails, fix the issues first; never skip, disable or delete a test to get a commit through. `main` changes only through a PR merged on GitHub. Until feature 2 creates CI and branch protection, the PR is merged only after I have looked at it.

### Required checks

Until feature 2: none (local checks only). Feature 2 adds `ci` (format, lint, typecheck, unit tests, build). Feature 3 adds `integration` (tests against the local Supabase in CI). Feature 4 adds `e2e` (Playwright against the local Supabase). Each becomes a required check on `main` once it has run green on its PR, and this list changes in the same commit.

### Working with review agents

An agent's findings are not handed to me to decide. For each one, take it, or answer the agent with your reasons and let it reply. At most 2 rounds: what is still open after that, you decide. Then tell me what was concluded, point by point, and why.

### Warnings at review

`/feature review` reads the IDE diagnostics of all files when the IDE tools are available (the review agents have none, so the main session does it) and runs `npm run lint` and `npm run typecheck`:

- A warning in a file the feature changed is fixed in the feature
- A warning in another file is fixed in the feature too, in its own commit, and named in the verdict ("Found work" below)
- A warning that the IDE shows and the lint does not is a gap in the lint: its fix comes with the guard that closes the gap (an ESLint rule in `eslint.config.js` with its line in "What the lint enforces" in `architecture-rules.md`, else a line in `coding-standards.md`). A rule change that is more than a new check gets an ADR in `docs/adr/`

### Choosing the model

`/feature load` rates the spec by what it builds, not by its length, and writes the result under `## Model` in @context/current-feature.md; `/feature start` compares it with the model of the session before it plans. The table is a recommendation: the session model changes with `/model`, and an agent uses the `model:` line of its file, which a call can override.

Only Opus and Sonnet are used, for the session and for every agent. Fable, and any model that costs extra usage or eats the plan's limit faster, is never chosen, recommended or passed as an agent's `model`.

| What the spec builds | Plan (`/feature start`) | Implementation | `architecture-reviewer` |
| --- | --- | --- | --- |
| A new feature folder or store, a migration, an RLS or Storage policy, auth, a different data flow, a change to a lint rule, a framework upgrade | Opus | Opus | Opus |
| A new route, component or repository method inside an existing feature, a new dependency | Opus | Sonnet | Opus |
| Cosmetic work, a text, a color, a known API with no new decision | Sonnet | Sonnet | Opus |

### Agents

| Agent | Model | When | Input |
| --- | --- | --- | --- |
| `architecture-reviewer` | Opus | Before code: the feature plan, and every later step that changes structure | The plan and the file paths |
| `code-reviewer` | Opus | After code, in `/feature review`; on request over all of `src/` every few features | The diff, or nothing for a full scan |
| `security-auditor` | Opus | In `/feature review` when `supabase/` or auth code changed (report in chat); on request as a full audit (writes `docs/audit-results/SECURITY_REVIEW.md`) | The diff, or "full audit" |
| `ui-reviewer` | Sonnet | Only when I ask, with the dev server and the local Supabase running | The pages or the change |

The built-in `/simplify`, `/code-review` and `/security-review` are quick checks that do not know the project rules; they do not replace the agents.

### Periodic tasks

- `/cleanup` (and `/cleanup run` to apply fixes)
- `code-reviewer` over all of `src/` every few features
- `security-auditor` as a full audit after features 3, 7, 9, 16 and 18
- Every couple of months: check `.claude/` (agents, skills, settings, `.mcp.json`) for paths, tool names and permissions that no longer exist

## Checking APIs

Never write Angular, CDK, NgRx or Supabase code from memory. Check the installed version first, in this order: the Angular CLI MCP server (`.mcp.json`: `get_best_practices`, `search_documentation`, `find_examples`), angular.dev / ngrx.io / supabase.com/docs, the package's `.d.ts` in `node_modules`, Context7. Name in the plan which source settled an API.

## Branching

A new branch for every feature or fix: **feature/[feature]** or **fix/[fix]**, **chore/[chore]**. `/feature complete` deletes it on GitHub and locally once the PR is merged.

## Commits

- Conventional commit messages (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, `ci:`); enforced by commitlint from feature 2
- Keep commits focused (one topic per commit; a feature is one PR with named commits inside)
- Never put "Generated with Claude" in the commit messages

## When Stuck

- If something isn't working after 2-3 attempts, stop and explain the issue
- Don't keep trying random fixes
- Ask for clarification if requirements are unclear

## Code Changes

- Make minimal changes to accomplish the task
- Don't refactor unrelated code unless asked; a defect found on the way is not unrelated ("Found work" below)
- Don't add "nice to have" features
- Preserve existing patterns in the codebase, or change them everywhere with an ADR

## Found work

Nothing new is written down for later. A bug, a warning, a gap in a test or a doc, or a review finding that turns up during a feature is fixed in that feature, in its own commit, and named in the final message. Only two cases leave the feature:

1. **It cannot be built now**: it needs money, a lawyer, or waits for an outside release. It goes to `context/todo-before-live.md`.
2. **It is too large or off-topic**: its own functionality, a migration, or a change that would make the PR hard to review. It goes into the Scope of the matching spec in `context/features/plan/`, with what was found and the fix idea; if no spec fits, a new numbered spec there and a row in its README.

A code comment that points at deferred work names the spec or the before-live file that holds it.

## Dependency updates (Dependabot)

Dependabot (`.github/dependabot.yml`) opens PRs every week. Angular majors are ignored there: they go through `ng update` (which runs the migrations) as a feature of their own, never as a raw version bump.

- **When**: `/feature start` before it creates the branch, and `/feature complete` before it pushes. The list: `gh pr list --author app/dependabot --state open --json number,title,mergeable,statusCheckRollup`
- **A minor/patch group**: merged on GitHub once the required checks are green (`gh pr merge <number> --merge --delete-branch`). A feature branch then takes the new `main` (`git merge main`), and the checks of `/feature complete` run again before the push
- **A major outside a group**: a small task of its own, never merged in passing. Its changelog and peer ranges are read, a needed fix goes on its branch, and it is merged on green checks
- **Out of date or in conflict**: `@dependabot rebase` as a comment on the PR
- **A red check**: no merge. The cause is read in the run and fixed on the bot's branch, or named in the final message

## Production standard

What a production project would not ship without is part of the feature, not a "nice to have". These items go into the plan from the start, as plan items and not as questions: my go on the plan covers them.

- A check a feature adds to CI becomes a required check on `main` once it has run green on the PR, and the docs that list the checks change in the same commit
- The secrets a new CI job or deploy needs come from me (an account, a token). Once they are in a local env file, set them in GitHub with `gh secret set` piped from the file, so the values never enter the conversation
- A new rule or flow comes with its tests; the docs and instructions that name it change in the same commit; a new variable, secret or job is written down where the next person looks (README, `.env.example`)
- Security basics hold without being asked: no secret in code, logs or URLs, least privilege, RLS on every table, migrations that are backward compatible with the deployed app
- Ask only for what only I can give or choose: an account, a token, a payment, a choice between vendors, or a trade-off with no standard answer
