# Test Action

1. Read current-feature.md to understand what was implemented
2. Identify the logic added or changed for this feature: `domain/` functions, stores and repositories in `data-access/`, guards, resolvers, validators, components with real logic (a form, an optimistic update, a drag and drop)
3. Check if tests already exist for them
4. For logic without tests, write tests (see "Testing" in `context/coding-standards.md`):
   - Pure functions: plain Vitest, no TestBed
   - Stores and services: TestBed with a fake repository, never a real Supabase call
   - Components: Angular Testing Library (`render`, `screen`, user events), testing behaviour, not private fields
   - A new or changed table, RPC, RLS policy or Storage policy gets an integration test against the local Supabase (`npm run test:integration`), including a case for a user of another workspace
   - A changed page, route or user journey gets its Playwright test in `e2e/`
   - Do not write tests just to write them. Use your best judgement
5. Run `npm run test`, `npm run test:integration` when the database changed and `npm run test:e2e` when a page, a route or a journey changed; all must be green
6. Report test coverage for the new feature code
