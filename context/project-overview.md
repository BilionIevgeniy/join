# Overview

## JOIN — Kanban task management

JOIN is a collaborative Kanban board for small teams: tasks move through To do → In progress → Awaiting feedback → Done, are assigned to contacts, carry subtasks, a priority, a category, a due date and image attachments, and a summary dashboard shows what needs attention. It started as a Developer Akademie course project (2025–2026) and is now being brought to production standard as a portfolio project and the basis of an English Angular interview handbook (`BilionIevgeniy/join-handbook`).

**Goal:** a codebase that looks and works like what a German company runs in production with Angular — security in the database, tests on every level, CI/CD, accessibility (BFSG), GDPR-aware — and that its author can explain line by line in an interview.

## Users

- **Team member** (signed up with email and password): works in their own workspace and in workspaces they were invited to
- **Demo visitor** ("Try the demo"): an anonymous Supabase session with a seeded demo workspace; can try everything, data is cleaned up later; can convert to a real account
- **Workspace owner**: invites members by email (accept/decline), removes members

## Features (today)

- Sign up, sign in, guest mode (today a fake in-memory user — replaced in feature 3), sign out
- Summary: counts per status, urgent tasks, next deadline, greeting
- Board: four columns, search, drag and drop (native HTML5 today, CDK in feature 13), "move to" menu on mobile, task detail modal with subtask toggles, edit, delete
- Add / edit task: page on mobile, modal on desktop; title, description, due date, priority, category, assignees, subtasks, image attachments (compressed client-side, today Base64 in a jsonb column — Storage in feature 9)
- Contacts: A–Z list, add, edit, delete (also deletes the linked auth user via an Edge Function — locked down in feature 3)
- Legal notice, privacy policy, help

Avatar `color` and `initials` of a contact are generated once at registration and stored.

## Data model

Today (Supabase project, schema not yet in the repo — feature 3 pulls it): `contacts` (one row per person, `auth_user_id` links a registered user), `tasks` (with `subtasks` and `files` as jsonb), `task_contacts` (assignees, cascade delete), RPCs `create_task_with_contacts` and `update_task_with_contacts`, Edge Function `delete-user`. Every signed-in user sees all rows.

Target (features 3, 7, 9, 13, 15, 16, 20): `profiles` (created by a trigger on `auth.users`), `workspaces`, `workspace_members` (owner | member), `workspace_invitations`, `contacts`, `tasks` (with `version` and `position`), `subtasks`, `task_contacts`, `labels`, `task_labels`, `task_files` (metadata; bytes in the private Storage bucket `task-files`), `task_comments`, `task_activity` (written only by triggers), `notifications`; all scoped by `workspace_id` and protected by RLS on membership.

## Features (target, from the plan)

On top of today's features: workspaces with invitations and an owner/member permission matrix (7); email confirmation, password reset, account settings, MFA, account deletion (8); filters in the URL and routed task dialogs (11); ordering inside columns and accessible drag and drop (13); labels (15); comments and an activity log (16); data export (17); realtime board (19); in-app notifications (20); English and German (21).

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Angular 21.2 → 22 (feature 1), TypeScript 5.9 → 6, standalone, zoneless, signals |
| State | Signal-based services → NgRx SignalStore with `resource()` (feature 5) |
| Forms | Reactive Forms → Signal Forms (feature 14) |
| UI | SCSS + BEM, design tokens, own UI kit on Angular CDK + Angular Aria with harnesses (feature 10) |
| Backend | Supabase: Postgres + RLS, Auth (email/password, anonymous), Storage, Edge Functions (Deno), Realtime (feature 19) |
| Tests | Vitest + Angular Testing Library, integration tests against local Supabase, Playwright |
| Tooling | angular-eslint, Sheriff, Prettier, Stylelint, commitlint + husky, GitHub Actions, Dependabot, SonarQube Cloud, release-please |
| Hosting | Static hosting with PR previews, one build for every environment with a runtime `config.json` (feature 2), Supabase cloud (dev and prod projects) |
| Monitoring | Sentry, EU region (feature 12) |

## Status

Course phase finished (PR #68). The production plan is in `context/features/plan/` (23 features, in order); nothing of it is implemented yet.
