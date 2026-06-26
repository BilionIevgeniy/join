import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { ContactService } from '../../core/services/contact.service';
import { ModalService } from '../../core/services/modal.service';
import { BoardColumnConfig, CreateTaskDto, STATUS_LABELS, Task, TaskStatus } from '../../core/models/task.model';
import { Button } from '../../components/shared/button/button';
import { SearchInput } from '../../components/shared/search-input/search-input';
import { Board as BoardComponent } from '../../components/board/board';
import { AddTaskComponent } from '../../components/task/add-task/add-task';

@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [Button, SearchInput, BoardComponent],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  private taskService = inject(TaskService);
  private contactService = inject(ContactService);
  private modalService = inject(ModalService);
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
    this.modalService.open(AddTaskComponent, {
      inputs: {
        initialStatus: status,
        contacts: this.contactService.contacts(),
        isModal: true,
      },
      syncInputs: { isLoading: this.taskService.isLoading },
      actions: {
        save: async (dto: CreateTaskDto) => {
          await this.taskService.addTask(dto);
          this.modalService.close();
        },
        cancel: () => this.modalService.close(),
      },
    });
  }

  onTaskOpened(_task: Task): void {
    // Opens the task detail view — wired up once the detail modal exists
  }

  onTaskMoved(event: { taskId: string; newStatus: TaskStatus }): void {
    this.taskService.moveTask(event.taskId, event.newStatus);
  }
}
