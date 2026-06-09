# JOIN — Kanban Project Management Tool
### Angular + NestJS

---

## 🚀 Быстрый старт

```bash
npm install
ng serve
```

Бекенд (NestJS) должен быть запущен на `http://localhost:3000`

---

## 📁 Структура проекта

```
src/app/
├── core/                     # Синглтон-сервисы (не трогать без согласования!)
│   ├── models/               # ← ВСЕ интерфейсы/типы здесь
│   │   ├── task.model.ts
│   │   ├── contact.model.ts
│   │   └── user.model.ts
│   ├── services/
│   │   ├── task.service.ts   # стейт тасок (Signals)
│   │   ├── contact.service.ts
│   │   └── auth.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── interceptors/
│       └── auth.interceptor.ts
│
├── shared/                   # Переиспользуемые компоненты
│   └── components/
│       ├── button/
│       ├── modal/
│       ├── avatar/           # Цветные кружки с инициалами
│       ├── badge/            # Design / Sales теги
│       └── priority-icon/   # Urgent / Medium / Low иконки
│
├── features/                 # Страницы
│   ├── auth/login/ signup/
│   ├── summary/
│   ├── board/
│   │   ├── board.component
│   │   ├── kanban-column/
│   │   └── task-card/
│   ├── task/
│   │   ├── task-form/        # ← ИСПОЛЬЗУЕТСЯ и на странице и в попапе!
│   │   └── add-task-page/    # просто враппер для task-form
│   └── contacts/
│       ├── contacts.component
│       ├── contact-card/
│       └── contact-form/
│
└── layout/
    ├── main-layout/          # Обёртка с sidebar
    ├── sidebar/
    └── header/
```

---

## 👥 Кто что делает

| Разработчик | Зона |
|-------------|------|
| **Мидл (ты)** | core/ сервисы, NestJS интеграция, роутинг, code review |
| **Преджун 1** | features/board, drag&drop, task-card, task-form |
| **Преджун 2** | features/contacts, features/summary, shared/ компоненты |

---

## ⚠️ ПРАВИЛА (обязательно прочитать!)

### 1. Данные — только из сервисов
```typescript
// ✅ ПРАВИЛЬНО
export class BoardComponent {
  private taskService = inject(TaskService);
  tasks = this.taskService.todoTasks; // это сигнал!
}

// ❌ НЕПРАВИЛЬНО — никаких моков в компонентах
tasks = [{ id: '1', title: 'Fake task' }];
```

### 2. HTTP — только в сервисах
Компоненты НИКОГДА не делают HTTP запросы напрямую.

### 3. Имена из моделей
Все поля берём из `core/models/*.ts`. Не придумываем свои.

### 4. Ветки
```
main → dev → feature/board (Преджун 1)
           → feature/contacts (Преджун 2)
```
Merge только через Pull Request. Мидл ревьюит.

### 5. Попап vs Страница
`task-form` — один компонент, используется в двух местах:
- `/add-task` страница — просто рендерит `<app-task-form>`
- Board → кнопка "Add task" — открывает модал с `<app-task-form>`

---

## 🔌 API endpoints (NestJS)

```
GET    /tasks          → загрузить все таски
POST   /tasks          → создать таску
PATCH  /tasks/:id      → обновить таску (статус, поля)
DELETE /tasks/:id      → удалить таску

GET    /contacts       → загрузить контакты
POST   /contacts       → создать контакт
PATCH  /contacts/:id   → обновить контакт
DELETE /contacts/:id   → удалить контакт

POST   /auth/login     → логин
POST   /auth/signup    → регистрация
```

---

## 💡 Как работает стейт (для преджунов)

```
TaskService
  tasksMap (signal) ← источник правды
       ↓
  tasks (computed)  ← массив всех тасок
       ↓
  todoTasks         ← computed, только todo
  inProgressTasks   ← computed, только inProgress
  ...

// В компоненте — просто читаешь:
todo = inject(TaskService).todoTasks;

// В шаблоне:
@for (task of todo(); track task.id) { ... }
```

При drag&drop вызываем `taskService.moveTask(id, newStatus)` — 
и ВСЕ колонки обновятся автоматически ✨
