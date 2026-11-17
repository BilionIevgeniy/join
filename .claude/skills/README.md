# Skills and agents

What the project's Claude Code skills and agents do. When each one runs in a feature is in "Workflow" in [context/ai-interaction.md](../../context/ai-interaction.md); this file only lists them.

## Skills (`.claude/skills/<name>/SKILL.md`, run as `/<name>`)

| Skill | What it does |
| ----- | ------------ |
| `/feature load\|start\|test\|review\|explain\|complete` | The feature workflow: write the spec into `context/current-feature.md`, branch and plan, tests, review, explanation, commit and merge. Each action is in `feature/actions/` |
| `/cleanup` (`/cleanup run` to apply) | Housekeeping and the architecture checks a search can answer: debug logs, unused code, stale comments and context files, orphaned files, suppressions |
| `/research <prompt-name>` | Runs the research prompt in `context/research/<prompt-name>.md` and writes the result where the prompt says |

## Agents (`.claude/agents/<name>.md`)

| Agent | What it does | Writes files |
| ----- | ------------ | ------------ |
| `architecture-reviewer` | Independent review of a plan before code: correctness, the architecture rules, Angular best practices, UI/UX, simplicity, tests | No |
| `code-reviewer` | Review of written code: bugs, security, performance, size limits, duplication, Angular best practices | No |
| `security-auditor` | Supabase security: RLS policies, RPCs, Storage policies, Edge Functions, auth flows, secrets | Only a full audit, to `docs/audit-results/SECURITY_REVIEW.md` |
| `ui-reviewer` | Checks pages in a browser (Playwright) against the UI/UX and accessibility rules. Only when asked, with the dev server running | No |

A new agent or skill gets a row here and, if it has a step in the workflow, a line in `context/ai-interaction.md`.
