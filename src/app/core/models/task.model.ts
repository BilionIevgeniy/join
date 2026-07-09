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

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
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
  due_date: string;
  created_at: string;
  // Joined from task_contacts → contacts
  // Supabase returns: assigned_contacts: [{ contact: Contact }]
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
  due_date: string;
  contact_ids: string[]; // UUID array — handled separately in TaskService
}

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

export interface BoardColumnConfig {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  showAddIcon: boolean;
}

