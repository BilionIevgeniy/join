# Before a public launch

JOIN is a portfolio project that does everything a real product does. What only a real launch needs — money, a lawyer, a company — is listed here, not in the feature plan. Nothing else goes here ("Found work" in `context/ai-interaction.md`).

## Needs a decision or money

- Supabase paid plan (daily backups / PITR, no pausing of an inactive free project) and a custom SMTP sender for auth emails (the built-in sender is rate-limited and meant for testing)
- A legal review of Impressum and Datenschutzerklärung (feature 17 writes them for a private portfolio)
- An own domain with a German or EU host for the static app

## Watch

- Angular 23: `ng update` as its own feature when it is released (Angular majors are ignored by Dependabot)
- TypeScript 7 (native compiler): only when Angular and typescript-eslint allow it in their peer ranges
