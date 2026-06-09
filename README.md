# JOIN — Kanban Project Management Tool

Angular 21 + NestJS

A collaborative task management app inspired by Kanban boards. Supports drag-and-drop task movement across columns, contact management, and a summary dashboard.

---

## Quick Start

```bash
npm install
ng serve
```

The NestJS backend must be running at `http://localhost:3000`

To open the app automatically in the browser:

```bash
npm start
```

---

## Tech Stack

| Layer    | Technology                             |
| -------- | -------------------------------------- |
| Frontend | Angular 21, TypeScript 5.9, RxJS 7.8   |
| State    | Angular Signals (`signal`, `computed`) |
| Backend  | NestJS (separate repo)                 |
| Testing  | Vitest                                 |
| Linting  | Prettier 3                             |

---

## Project Structure

```text
src/app/
├── app.ts                          # Root component
├── app.routes.ts                   # Application routing
├── app.config.ts
│
├── core/                           # Singleton services — do not modify without review
│   ├── models/                     # All interfaces and types live here
│   │   ├── task.model.ts           # Task, Subtask, TaskStatus, TaskPriority, DTOs
│   │   ├── contact.model.ts
│   │   └── user.model.ts
│   └── services/
│       ├── task.service.ts         # Task state (Signals)
│       └── contact.service.ts
│
├── components/                     # Reusable feature components
│   ├── shared/
│   │   ├── avatar/                 # Colored circles with initials
│   │   ├── button/
│   │   └── modal/
│   ├── task/
│   │   ├── task-card/
│   │   ├── task-form/              # Used both on the page and inside a modal
│   │   └── task-modal/
│   └── contact/
│       ├── contact-card/
│       ├── contact-form/
│       └── contact-modal/
│
├── pages/                          # Feature pages (lazy-loaded)
│   ├── summary/                    # Dashboard overview  ✓
│   ├── board/                      # Kanban board
│   ├── task/                       # Add / edit task page
│   ├── contacts/                   # Contacts list
│   └── auth/                       # Login / Signup
│
└── layout/
    ├── main-layout/                 # Shell that wraps all protected pages  ✓
    ├── sidebar/
    └── header/
```
