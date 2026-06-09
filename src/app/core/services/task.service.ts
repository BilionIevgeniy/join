import { Injectable, computed, signal } from '@angular/core';
import { Task, TaskStatus } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  // Record<id, Task> — instant lookup without array iteration
  private tasksMap = signal<Record<string, Task>>({});

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

  // Nearest deadline (for Summary)
  upcomingDeadline = computed(() => {
    const withDates = this.tasks()
      .filter((t) => t.dueDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return withDates[0]?.dueDate ?? null;
  });

  // Search — accepts a string, returns filtered array
  searchTasks(query: string): Task[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.tasks();
    return this.tasks().filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }

  private filterByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter((t) => t.status === status);
  }
}
