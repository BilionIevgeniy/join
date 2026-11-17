# Review Action

1. Read current-feature.md to understand the goals
2. Review all code changes made for this feature (`git diff main...HEAD` plus uncommitted changes)
3. Send the diff and the list of changed files to the `code-reviewer` agent. If the feature changed `supabase/` (migrations, policies, RPCs, Edge Functions, Storage) or auth code (`features/auth`, guards), also send them to the `security-auditor` agent as a feature review: its report comes back in chat and it writes no file
4. Go through each agent finding the way "Working with review agents" in `context/ai-interaction.md` describes: take it, or answer the agent with your reasons, at most 2 rounds, then decide
5. Read the IDE diagnostics with `getDiagnostics` when available (the agents have no IDE tools) and run `npm run lint` and `npm run typecheck`, then work through them as "Warnings at review" in `context/ai-interaction.md` says
6. Check list for:
   - ✅ Goals met
   - ❌ Goals missing or incomplete
   - ⚠️ Code quality issues or bugs (yours and the agents' findings that were taken, and the warnings of step 5)
   - 🚫 Scope creep (code beyond goals)
7. Final verdict: Ready to complete or needs changes, shown as a table with the signs of the check list, followed by what was decided on the agents' findings and why, and each warning of step 5 with what fixed it
