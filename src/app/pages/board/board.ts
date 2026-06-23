import { Component, computed, inject, signal } from '@angular/core';
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

  searchQuery = signal('');

  private matchesSearch = (title: string, description: string) => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return true;
    return title.toLowerCase().includes(q) || description.toLowerCase().includes(q);
  };

  private byStatus = (status: TaskStatus) =>
    computed(() =>
      this.taskService
        .tasks()
        .filter((t) => t.status === status)
        .filter((t) => this.matchesSearch(t.title, t.description)),
    );

  todoTasks = this.byStatus('todo');
  inProgressTasks = this.byStatus('inProgress');
  awaitingFeedbackTasks = this.byStatus('awaitingFeedback');
  doneTasks = this.byStatus('done');

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
