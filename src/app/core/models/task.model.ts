import { Contact } from './contact.model';

// ============================================================
//  ENUMS
// ============================================================

export type TaskStatus = 'todo' | 'inProgress' | 'awaitingFeedback' | 'done';

/** All task statuses, in board column order. */
export const ALL_TASK_STATUSES: TaskStatus[] = ['todo', 'inProgress', 'awaitingFeedback', 'done'];

export type TaskPriority = 'urgent' | 'medium' | 'low';

export type TaskCategory = 'User Story' | 'Technical Task';

// ============================================================
//  SUBTASK — stored as jsonb array inside tasks table
// ============================================================

/** A single checklist item within a {@link Task}, stored inline as part of the task's jsonb column. */
export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

// ============================================================
//  TASK FILE — stored as jsonb array inside tasks table
// ============================================================

/**
 * A single file attached to a {@link Task}, stored inline as part of the
 * task's jsonb `files` column. `size` is the original file size in bytes
 * (not the larger size of the Base64-encoded `data` string). `data` holds
 * the file content Base64-encoded — see the (upcoming) base64 utils.
 */
export interface TaskFile {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  data: string;
}

// ============================================================
//  TASK — matches Supabase response with joined contacts
// ============================================================

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  subtasks: Subtask[];
  files: TaskFile[];
  due_date: string;
  created_at: string;
  /**
   * Joined from `task_contacts` → `contacts` via the Supabase query.
   * Use {@link getTaskContacts} to get a flat `Contact[]` instead of unwrapping this manually.
   */
  assigned_contacts?: { contact: Contact }[];
}

// ============================================================
//  DTO — what we send to Supabase on create
// ============================================================

export interface CreateTaskDto {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  subtasks: Subtask[];
  files: TaskFile[];
  due_date: string;
  /** Contact UUIDs to assign — persisted via a separate join table by {@link TaskService}. */
  contact_ids: string[];
}

/** Partial update — only the fields that changed are sent to the update RPC. */
export type UpdateTaskDto = Partial<CreateTaskDto>;

// ============================================================
//  Helper — extract flat Contact[] from task
// ============================================================

export function getTaskContacts(task: Task): Contact[] {
  return (task.assigned_contacts ?? []).map((ac) => ac.contact).filter((c): c is Contact => !!c);
}

// ============================================================
//  Helper map of statuses → label for UI
// ============================================================

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  inProgress: 'In progress',
  awaitingFeedback: 'Awaiting feedback',
  done: 'Done',
};

// ============================================================
//  Helper map of priorities → label for UI
// ============================================================

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  medium: 'Medium',
  low: 'Low',
};

/** Filename of the priority icon asset for a given priority (e.g. `urgent-prio-icon.svg`). */
export function getPriorityIconUrl(priority: TaskPriority): string {
  return `${priority}-prio-icon.svg`;
}

/**
 * BEM modifier class for a task's category, scoped to the given block name.
 * Used by task-card and task-modal, which render the same category pill under
 * different block names (`task-card__category--...` vs `task-modal__category--...`).
 */
export function getCategoryModifierClass(category: TaskCategory, block: string): string {
  const modifier = category === 'User Story' ? 'user-story' : 'technical-task';
  return `${block}__category--${modifier}`;
}

// ============================================================
//  BOARD COLUMN CONFIG — one column's data, built by the Board page
// ============================================================

/** One board column's rendering data, assembled by the Board page and passed to {@link BoardColumn}. */
export interface BoardColumnConfig {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  showAddIcon: boolean;
}

