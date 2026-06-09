// ============================================================
//  ENUMS — single source of truth for statuses/priorities
// ============================================================

export type TaskStatus =
  | 'todo'
  | 'inProgress'
  | 'awaitingFeedback'
  | 'done';

export type TaskPriority = 'urgent' | 'medium' | 'low';

export type TaskCategory =
  | 'Design'
  | 'Sales'
  | 'Backoffice'
  | 'Marketing'
  | 'Media'
  | string; // extensible

// ============================================================
//  SUBTASK
// ============================================================

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

// ============================================================
//  TASK  — main entity
// ============================================================

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignedTo: string[];   // array of contact.id
  subtasks: Subtask[];
  dueDate: string;        // ISO string "dd/mm/yyyy" or Date.toISOString()
  createdAt: string;
}

// ============================================================
//  DTO — what we send to the backend on create/update
// ============================================================

export type CreateTaskDto = Omit<Task, 'id' | 'createdAt'>;

export type UpdateTaskDto = Partial<CreateTaskDto>;

// ============================================================
//  Helper map of statuses → label for UI
// ============================================================

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo:              'To do',
  inProgress:        'In progress',
  awaitingFeedback:  'Awaiting feedback',
  done:              'Done',
};
