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
import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto, Subtask } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private supabase = inject(SupabaseService);
  private toast = inject(ToastService);

  private tasksMap = signal<Record<string, Task>>({});
  isLoading = signal(false);

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

  // Nearest deadline (for Summary page)
  upcomingDeadline = computed(() => {
    const withDates = this.tasks()
      .filter((t) => t.due_date)
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    return withDates[0]?.due_date ?? null;
  });

  // ─── CRUD ──────────────────────────────────────────────────────

  async getAll(): Promise<void> {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.db.from('tasks').select(`
          *,
          assigned_contacts:task_contacts(
            contact:contacts(*)
          )
        `);
      if (error) throw error;
      const map: Record<string, Task> = {};
      data.forEach((t: Task) => {
        if (t.id) map[t.id] = t;
      });
      this.tasksMap.set(map);
    } catch (err) {
      console.error('getAll tasks failed:', err);
      this.toast.error('Failed to load tasks.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Transactional create — inserts task + task_contacts in one transaction
  async addTask(dto: CreateTaskDto): Promise<Task | null> {
    this.isLoading.set(true);
    try {
      const { contact_ids, ...taskData } = dto;
      const { data, error } = await this.supabase.db.rpc('create_task_with_contacts', {
        task_data: taskData,
        contact_ids: contact_ids ?? [],
      });
      if (error) throw error;
      // Reload to get full task with joined contacts
      await this.reloadOne(data.id);
      this.toast.success('Task created successfully.');
      return this.tasksMap()[data.id] ?? null;
    } catch (err) {
      console.error('addTask failed:', err);
      this.toast.error('Failed to create task.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  // Transactional update — updates task + replaces task_contacts in one transaction
  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task | null> {
    const existing = this.tasksMap()[id];
    if (!existing) return null;
    this.isLoading.set(true);
    try {
      const { contact_ids, ...taskData } = dto;
      const { data, error } = await this.supabase.db.rpc('update_task_with_contacts', {
        p_task_id: id,
        task_data: taskData,
        contact_ids: contact_ids ?? [],
      });
      if (error) throw error;
      // Reload to get full task with updated contacts
      await this.reloadOne(data.id);
      this.toast.success('Task updated successfully.');
      return this.tasksMap()[data.id] ?? null;
    } catch (err) {
      console.error('updateTask failed:', err);
      this.toast.error('Failed to update task.');
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  // Move only changes status — no contacts change, simple update
  async moveTask(id: string, newStatus: TaskStatus): Promise<void> {
    const existing = this.tasksMap()[id];
    if (!existing) return;
    // Optimistic update — update UI immediately before server confirms
    this.setOne({ ...existing, status: newStatus });
    try {
      const { error } = await this.supabase.db
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      // Rollback optimistic update on error
      this.setOne(existing);
      console.error('moveTask failed:', err);
      this.toast.error('Failed to move task.');
    }
  }

  // Update subtasks only
  async updateSubtasks(id: string, subtasks: Subtask[]): Promise<void> {
    const existing = this.tasksMap()[id];
    if (!existing) return;
    // Optimistic update — update UI immediately before server confirms
    this.setOne({ ...existing, subtasks });
    try {
      const { error } = await this.supabase.db.from('tasks').update({ subtasks }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      // Rollback optimistic update on error
      this.setOne(existing);
      console.error('updateSubtasks failed:', err);
      this.toast.error('Failed to update subtasks.');
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    this.isLoading.set(true);
    try {
      const { error } = await this.supabase.db.from('tasks').delete().eq('id', id);
      if (error) throw error;
      this.tasksMap.update((map) => {
        const next = { ...map };
        delete next[id];
        return next;
      });
      this.toast.success('Task deleted successfully.');
      return true;
    } catch (err) {
      console.error('deleteTask failed:', err);
      this.toast.error('Failed to delete task.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  // ─── SEARCH ───────────────────────────────────────────────────

  searchTasks(query: string): Task[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.tasks();
    return this.tasks().filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }

  // ─── PRIVATE ──────────────────────────────────────────────────

  private setOne(task: Task): void {
    if (!task.id) return;
    this.tasksMap.update((map) => ({ ...map, [task.id!]: task }));
  }

  private filterByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter((t) => t.status === status);
  }

  // Reload single task with joined contacts after create/update
  private async reloadOne(id: string): Promise<void> {
    const { data, error } = await this.supabase.db
      .from('tasks')
      .select(
        `
        *,
        assigned_contacts:task_contacts(
          contact:contacts(*)
        )
      `,
      )
      .eq('id', id)
      .single();
    if (!error && data) this.setOne(data);
  }
}
