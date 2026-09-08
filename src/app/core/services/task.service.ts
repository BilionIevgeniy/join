/**
 * TaskService — CRUD over Supabase `tasks` table.
 *
 * Read:   .select() with nested join through task_contacts
 * Create: .rpc('create_task_with_contacts') — transactional
 * Update: .rpc('update_task_with_contacts') — transactional
 * Delete: .delete() — only tasks row, task_contacts cascade deletes automatically
 * Move:   .update() — only status field, no contacts change needed
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ToastService } from './toast.service';
import {
  Task,
  TaskStatus,
  CreateTaskDto,
  UpdateTaskDto,
  Subtask,
  normalizeTask,
} from '@core/models/task.model';
import { logAndNotify, withLoading } from '../utils/async.utils';
import { toMapById } from '../utils/collection.utils';

// Selects a task row together with its assigned contacts via the task_contacts join table.
const TASK_WITH_CONTACTS_SELECT = `
  *,
  assigned_contacts:task_contacts(
    contact:contacts(*)
  )
`;

@Injectable({ providedIn: 'root' })
export class TaskService {
  // ─── DEPENDENCIES ───────────────────────────────────────────
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);

  // ─── STATE ────────────────────────────────────────────────
  private tasksMap = signal<Record<string, Task>>({});
  isLoading = signal(false);

  // ─── COMPUTED ─────────────────────────────────────────────
  // Array of all tasks — for search and general operations
  tasks = computed(() => Object.values(this.tasksMap()));

  // Board columns — template just reads these signals
  todoTasks = computed(() => this.filterByStatus('todo'));
  inProgressTasks = computed(() => this.filterByStatus('inProgress'));
  awaitingFeedbackTasks = computed(() => this.filterByStatus('awaitingFeedback'));
  doneTasks = computed(() => this.filterByStatus('done'));

  // Summary statistics
  totalTasks = computed(() => this.tasks().length);
  urgentCount = computed(() => this.tasks().filter((t) => t.priority === 'urgent').length);
  inProgressCount = computed(() => this.inProgressTasks().length);
  awaitingCount = computed(() => this.awaitingFeedbackTasks().length);
  todoCount = computed(() => this.todoTasks().length);
  doneCount = computed(() => this.doneTasks().length);

  // Nearest deadline (for Summary page) — excludes dates before today
  upcomingDeadline = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const withDates = this.tasks()
      .filter((t) => t.due_date && new Date(t.due_date).getTime() >= today.getTime())
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    return withDates[0]?.due_date ?? null;
  });

  // ─── CRUD ──────────────────────────────────────────────────────

  /** Loads all tasks (with joined assigned contacts) from Supabase into local state. */
  async getAll(): Promise<void> {
    await withLoading(this.isLoading, async () => {
      try {
        const { data, error } = await this.supabase.db
          .from('tasks')
          .select(TASK_WITH_CONTACTS_SELECT);
        if (error) throw error;
        this.tasksMap.set(toMapById(data.map(normalizeTask)));
      } catch (err) {
        logAndNotify(this.toast, 'getAll tasks', err, 'Failed to load tasks.');
      }
    });
  }

  /** Transactional create — inserts the task and its task_contacts rows in one RPC call. */
  async addTask(dto: CreateTaskDto): Promise<Task | null> {
    return withLoading(this.isLoading, async () => {
      try {
        const { contact_ids, ...taskData } = dto;
        return await this.saveTaskViaRpc(
          'create_task_with_contacts',
          { task_data: taskData, contact_ids: contact_ids ?? [] },
          'Task created successfully.',
        );
      } catch (err) {
        logAndNotify(this.toast, 'addTask', err, 'Failed to create task.');
        return null;
      }
    });
  }

  /** Transactional update — updates the task and replaces its task_contacts rows in one RPC call. */
  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task | null> {
    const existing = this.tasksMap()[id];
    if (!existing) return null;
    return withLoading(this.isLoading, async () => {
      try {
        const { contact_ids, ...taskData } = dto;
        return await this.saveTaskViaRpc(
          'update_task_with_contacts',
          { p_task_id: id, task_data: taskData, contact_ids: contact_ids ?? [] },
          'Task updated successfully.',
        );
      } catch (err) {
        logAndNotify(this.toast, 'updateTask', err, 'Failed to update task.');
        return null;
      }
    });
  }

  /** Moves a task to a new status, updating the UI optimistically before the server confirms. */
  async moveTask(id: string, newStatus: TaskStatus): Promise<void> {
    await this.applyOptimisticUpdate(
      id,
      (task) => ({ ...task, status: newStatus }),
      () => this.supabase.db.from('tasks').update({ status: newStatus }).eq('id', id),
      'moveTask',
      'Failed to move task.',
    );
  }

  /** Replaces a task's subtasks, updating the UI optimistically before the server confirms. */
  async updateSubtasks(id: string, subtasks: Subtask[]): Promise<void> {
    await this.applyOptimisticUpdate(
      id,
      (task) => ({ ...task, subtasks }),
      () => this.supabase.db.from('tasks').update({ subtasks }).eq('id', id),
      'updateSubtasks',
      'Failed to update subtasks.',
    );
  }

  /** Deletes a task; `task_contacts` rows cascade-delete automatically. */
  async deleteTask(id: string): Promise<boolean> {
    return withLoading(this.isLoading, async () => {
      try {
        const { error } = await this.supabase.db.from('tasks').delete().eq('id', id);
        if (error) throw error;
        this.removeOne(id);
        this.toast.success('Task deleted successfully.');
        return true;
      } catch (err) {
        logAndNotify(this.toast, 'deleteTask', err, 'Failed to delete task.');
        return false;
      }
    });
  }

  // ─── SEARCH ───────────────────────────────────────────────────

  /** Filters loaded tasks by title/description. Returns all tasks when `query` is blank. */
  searchTasks(query: string): Task[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.tasks();
    return this.tasks().filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }

  // ─── PRIVATE ──────────────────────────────────────────────────

  /**
   * Applies a local update immediately (optimistic), persists it, and rolls back
   * to the previous value if the request fails. Used by field-only updates
   * (status, subtasks) that don't need the full create/update RPC round-trip.
   * @param updater - derives the new local task from the existing one
   * @param persist - performs the actual write; only its `error` is checked
   * @param operation - short label used in the console error log
   * @param userMessage - shown via a toast if `persist` fails
   */
  private async applyOptimisticUpdate(
    id: string,
    updater: (task: Task) => Task,
    persist: () => PromiseLike<{ error: unknown }>,
    operation: string,
    userMessage: string,
  ): Promise<void> {
    const existing = this.tasksMap()[id];
    if (!existing) return;
    this.setOne(updater(existing));
    try {
      const { error } = await persist();
      if (error) throw error;
    } catch (err) {
      this.setOne(existing);
      logAndNotify(this.toast, operation, err, userMessage);
    }
  }

  private setOne(task: Task): void {
    if (!task.id) return;
    this.tasksMap.update((map) => ({ ...map, [task.id!]: task }));
  }

  private removeOne(id: string): void {
    this.tasksMap.update((map) => {
      const next = { ...map };
      delete next[id];
      return next;
    });
  }

  private filterByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter((t) => t.status === status);
  }

  /**
   * Calls a create/update RPC, then reloads the affected task with joined contacts.
   * Shared by {@link addTask} and {@link updateTask}, which only differ in the RPC
   * name and its parameters.
   */
  private async saveTaskViaRpc(
    rpcName: 'create_task_with_contacts' | 'update_task_with_contacts',
    rpcParams: Record<string, unknown>,
    successMessage: string,
  ): Promise<Task | null> {
    const { data, error } = await this.supabase.db.rpc(rpcName, rpcParams);
    if (error) throw error;
    await this.reloadOne(data.id);
    this.toast.success(successMessage);
    return this.tasksMap()[data.id] ?? null;
  }

  /** Reloads a single task with joined contacts after create/update. */
  private async reloadOne(id: string): Promise<void> {
    const { data, error } = await this.supabase.db
      .from('tasks')
      .select(TASK_WITH_CONTACTS_SELECT)
      .eq('id', id)
      .single();
    if (!error && data) this.setOne(normalizeTask(data));
  }
}
