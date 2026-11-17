# 0001. Supabase as the backend, no own server

- Status: accepted
- Date: 2026-11-17 (recording a decision of the course phase)

## Context

JOIN needs authentication, a relational database, file storage and a few privileged operations (deleting an account). The README of the course phase still named a NestJS backend; the code has used Supabase since the start.

## Options

1. **Own backend** (NestJS + Postgres): full control, an API layer to test and secure, a server to host and operate.
2. **Supabase** (Postgres + RLS, Auth, Storage, Edge Functions): the browser talks to the database through PostgREST; security is in RLS policies; privileged operations in Edge Functions.
3. **Firebase**: document store, security rules, no relational joins.

## Decision

Option 2. The data is relational (tasks, assignees, workspaces, members), Postgres RLS expresses "members of a workspace" exactly, and there is no server to run.

## Consequences

- All protection must hold in the database: every table has RLS, `anon` gets nothing on user data, and each policy has an integration test (feature 3, 8)
- The schema is code: migrations in `supabase/migrations/`, a local stack for development and CI (feature 3)
- Atomic writes over several tables are RPCs; privileged operations are Edge Functions that verify the caller
- The Angular app has a thin data layer: repositories wrap `supabase-js`; `HttpClient` and interceptors are not used
- In interviews: be ready to compare with an own backend (API versioning, business logic location, vendor lock-in, testing RLS)
