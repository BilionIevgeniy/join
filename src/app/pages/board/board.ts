import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { BoardColumnConfig, STATUS_LABELS, Task, TaskStatus } from '../../core/models/task.model';
import { Button } from '../../components/shared/button/button';
import { SearchInput } from '../../components/shared/search-input/search-input';
import { Board as BoardComponent } from '../../components/board/board';

@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [Button, SearchInput, BoardComponent],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  private taskService = inject(TaskService);
  private destroyRef = inject(DestroyRef);

  searchQuery = signal('');

  private mobileQuery = window.matchMedia('(width <= 1025px)');
  isMobile = signal(this.mobileQuery.matches);

  constructor() {
    const onChange = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);
    this.mobileQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => this.mobileQuery.removeEventListener('change', onChange));
  }

  private matchesSearch = (title: string, description: string) => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return true;
    return title.toLowerCase().includes(q) || description.toLowerCase().includes(q);
  };

  todoTasks = computed(() =>
    this.taskService.todoTasks().filter((t) => this.matchesSearch(t.title, t.description)),
  );
  inProgressTasks = computed(() =>
    this.taskService.inProgressTasks().filter((t) => this.matchesSearch(t.title, t.description)),
  );
  awaitingFeedbackTasks = computed(() =>
    this.taskService
      .awaitingFeedbackTasks()
      .filter((t) => this.matchesSearch(t.title, t.description)),
  );
  doneTasks = computed(() =>
    this.taskService.doneTasks().filter((t) => this.matchesSearch(t.title, t.description)),
  );

  columns = computed<BoardColumnConfig[]>(() => [
    { title: STATUS_LABELS.todo, status: 'todo', tasks: this.todoTasks(), showAddIcon: true },
    {
      title: STATUS_LABELS.inProgress,
      status: 'inProgress',
      tasks: this.inProgressTasks(),
      showAddIcon: true,
    },
    {
      title: STATUS_LABELS.awaitingFeedback,
      status: 'awaitingFeedback',
      tasks: this.awaitingFeedbackTasks(),
      showAddIcon: true,
    },
    { title: STATUS_LABELS.done, status: 'done', tasks: this.doneTasks(), showAddIcon: false },
  ]);

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onAddTask(status: TaskStatus): void {
    // Opens the add-task flow — wired up once the add-task page/modal exists
  }

  onTaskOpened(task: Task): void {
    // Opens the task detail view — wired up once the detail page/modal exists
  }
}
