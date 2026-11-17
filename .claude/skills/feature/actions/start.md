# Start Action

1. Read current-feature.md - verify Goals are populated, and read `## Model`
2. If empty, error: "Run /feature load first"
3. Compare the model of this session with `Plan:` under `## Model`. If they differ, say so in one line and wait: the user switches with `/model` or says to go on
4. Set Status to "In Progress"
5. Handle the open Dependabot PRs first, as "Dependency updates (Dependabot)" in `context/ai-interaction.md` says. Then `git switch main`, `git pull --ff-only`, and create and checkout the feature branch (derive name from H1 heading: `feature/<kebab-name>`)
6. Check every Angular, CDK and Supabase API the plan will use against the installed version, never memory: the Angular CLI MCP server (`get_best_practices`, `search_documentation`), angular.dev, the package's `.d.ts` in `node_modules`, or Context7
7. Decide where the code goes, before planning any file:
   - Read `context/architecture-rules.md` ("Layout", "Where does this go") and `docs/architecture.md`
   - Say in the plan which feature folder and which role (`data-access`, `ui`, `pages`, `domain`) each new file goes in and which rule decides it
   - A new feature folder or a new rule in the lint is a structural change: it gets an ADR in `docs/adr/` in the same PR
   - If what you found moves the spec to another row of "Choosing the model" in `context/ai-interaction.md`, update `## Model` and say so
8. Write the plan, then send it to the `architecture-reviewer` agent before any code (see "Review the plan" in `context/ai-interaction.md`): the plan and the file paths only, not your reasoning. Pass the model of `architecture-reviewer:` under `## Model` as the `model` of that call. Settle its findings with the agent (at most 2 rounds, then you decide), then show the user the agreed plan with what was decided on each finding and why, and wait for their go before any code
9. List the goals, then implement them one by one. Before the first edit, say so if `Implementation:` under `## Model` names another model than this session's. A later step that changes structure (a new route, a new service or store, a different data flow, a new migration or RLS policy) goes through the reviewer again; cosmetic steps do not
