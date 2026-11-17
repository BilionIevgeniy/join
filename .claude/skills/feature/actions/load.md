# Load Action

1. Check $ARGUMENTS (after "load"):
   - If it looks like a filename or a number (single word, no spaces): look for `context/features/plan/{name}.md`, or the file in that folder whose name starts with `{number}.`
   - If it's multiple words: use it as an inline feature description and generate goals
   - If empty: error - "load" requires a spec filename, a number or a feature description

2. Update current-feature.md:
   - Update H1 heading to include feature name (e.g., `# Current Feature: Angular 22 upgrade`)
   - Write goals as bullet points under ## Goals (from the spec's Scope and Acceptance criteria)
   - Write any additional notes/context under ## Notes (Non-goals, Read first, dependencies)
   - Rate the spec with "Choosing the model" in `context/ai-interaction.md`, by what it builds and not by its length, and write three lines under ## Model: `Plan:`, `Implementation:` and `architecture-reviewer:`, each with the model alias and the row of the table that decided it
   - Set Status to "Not Started"

3. Check the spec's dependencies in `context/features/plan/README.md`: if a feature it needs is not ticked, say so and stop

4. Confirm spec loaded and show the feature summary, then the model: `for /feature start I recommend /model <alias>`

5. Move the file from `context/features/plan/` to `context/features/` (`git mv`)
