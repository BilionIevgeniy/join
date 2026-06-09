import { Injectable, computed, signal } from '@angular/core';
import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  // Record<id, Task> — instant lookup without array iteration
  private tasksMap = signal<Record<string, Task>>({});

  // Array of all tasks — for search and general operations
  tasks = computed(() => Object.values(this.tasksMap()));

  // Board columns — template just reads these signals
  todoTasks             = computed(() => this.filterByStatus('todo'));
  inProgressTasks       = computed(() => this.filterByStatus('inProgress'));
  awaitingFeedbackTasks = computed(() => this.filterByStatus('awaitingFeedback'));
  doneTasks             = computed(() => this.filterByStatus('done'));

  // Summary statistics
  totalTasks      = computed(() => this.tasks().length);
  urgentCount     = computed(() => this.tasks().filter(t => t.priority === 'urgent').length);
  inProgressCount = computed(() => this.inProgressTasks().length);
  awaitingCount   = computed(() => this.awaitingFeedbackTasks().length);
  todoCount       = computed(() => this.todoTasks().length);
  doneCount       = computed(() => this.doneTasks().length);

  // Nearest deadline (for Summary page)
  upcomingDeadline = computed(() => {
    const withDates = this.tasks()
      .filter(t => t.dueDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return withDates[0]?.dueDate ?? null;
  });

  // ─── CRUD (mock — replace with HTTP calls later) ──────────────

  addTask(dto: CreateTaskDto): void {
    const task: Task = {
      ...dto,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    this.upsert(task);
  }

  updateTask(id: string, dto: UpdateTaskDto): void {
    const existing = this.tasksMap()[id];
    if (!existing) return;
    this.upsert({ ...existing, ...dto });
  }

  // Drag & drop only changes status — separate method for clarity
  moveTask(id: string, newStatus: TaskStatus): void {
    this.updateTask(id, { status: newStatus });
  }

  deleteTask(id: string): void {
    this.tasksMap.update(map => {
      const next = { ...map };
      delete next[id];
      return next;
    });
  }

  // ─── SEARCH ───────────────────────────────────────────────────

  searchTasks(query: string): Task[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.tasks();
    return this.tasks().filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }

  // ─── PRIVATE ──────────────────────────────────────────────────

  private upsert(task: Task): void {
    this.tasksMap.update(map => ({ ...map, [task.id]: task }));
  }

  private filterByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter(t => t.status === status);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}
