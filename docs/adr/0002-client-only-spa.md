# 0002. A client-only SPA, no SSR

- Status: accepted
- Date: 2026-11-17

## Context

Angular supports server-side rendering and prerendering (`@angular/ssr`, hydration). JOIN is a tool behind a sign-in; its only public pages are the login, the legal pages and help.

## Options

1. **Client-only SPA** on static hosting with an SPA fallback.
2. **SSR with hydration** on a Node host.
3. **Prerender** only the public pages, SPA for the rest.

## Decision

Option 1. The content behind the sign-in is private and not indexed, the data comes from Supabase directly in the browser, and static hosting needs no server. The cost is a slower first paint, which `@defer`, lazy routes and budgets keep small (feature 18).

## Consequences

- Hosting is static with an SPA fallback and security headers (features 2, 18)
- The code may use browser APIs (`window`, `sessionStorage`, `matchMedia`) directly; if prerendering of the public pages is ever wanted (option 3), those uses must be guarded first, and that change gets its own record
