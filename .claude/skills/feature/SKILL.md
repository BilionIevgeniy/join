---
name: feature
description: Manage current feature workflow - load, start, test, review, explain or complete
argument-hint: load|start|test|review|explain|complete
---

## Context

Read the current feature from:
@context/current-feature.md

## File Structure

current-feature.md has these sections:

- `# Current Feature` - H1 heading with feature name when active
- `## Status` - Not Started | In Progress | Complete
- `## Goals` - Bullet points of what success looks like
- `## Notes` - Additional context, constraints, or details from spec
- `## Model` - The model for the plan, for the implementation and for `architecture-reviewer`, written by `load` and read by `start` (see "Choosing the model" in context/ai-interaction.md)
- `## History` - Pointer to context/feature-history.md, where completed features are appended (append only)

## Task

Execute the requested action: $ARGUMENTS

| Action     | Description                                     |
| ---------- | ----------------------------------------------- |
| `load`     | Load a feature spec or inline description       |
| `start`    | Create branch, plan, plan review, then implement |
| `test`     | Write and run tests for the feature             |
| `review`   | Check goals met, code quality (review agents)   |
| `explain`  | Document what changed and why                   |
| `complete` | Checks, commit, PR, green CI, merge, reset      |

See [actions/](actions/) for detailed instructions.

If no action provided, explain the available options.
