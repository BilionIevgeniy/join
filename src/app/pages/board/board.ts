import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '@core/services/task.service';
import { ContactService } from '@core/services/contact.service';
import { ModalService } from '@core/services/modal.service';
import {
  BoardColumnConfig,
  CreateTaskDto,
  STATUS_LABELS,
  Subtask,
  Task,
  TaskStatus,
} from '@core/models/task.model';
import { RoutesEnum } from '@core/models/routes.model';
import { Button } from '@shared/button/button';
import { SearchInput } from '@shared/search-input/search-input';
import { Board as BoardComponent } from '@components/board/board';
import { AddTaskComponent } from '@components/add-task/add-task';
import { TaskModal } from '@components/board/task/task-modal/task-modal';

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
  private router = inject(Router);

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
    if (this.isMobile()) {
      this.router.navigate(['/', RoutesEnum.ADD_TASK], { queryParams: { status } });
      return;
    }
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

  onTaskOpened(task: Task): void {
    const liveTask = computed(() => this.taskService.tasks().find((t) => t.id === task.id) ?? task);
    this.modalService.open(TaskModal, {
      inputs: { task },
      syncInputs: { task: liveTask },
      actions: {
        subtaskToggled: ({ taskId, subtasks }: { taskId: string; subtasks: Subtask[] }) =>
          this.taskService.updateSubtasks(taskId, subtasks),
        edit: (t: Task) => this.onEditTask(t),
        delete: async (id: string) => {
          await this.taskService.deleteTask(id);
          this.modalService.close();
        },
        closed: () => this.modalService.close(),
      },
    });
  }

  private onEditTask(task: Task): void {
    this.modalService.open(AddTaskComponent, {
      inputs: {
        task,
        contacts: this.contactService.contacts(),
        isModal: true,
        isEdit: true,
      },
      syncInputs: { isLoading: this.taskService.isLoading },
      actions: {
        save: async (dto: CreateTaskDto) => {
          await this.taskService.updateTask(task.id, dto);
          this.modalService.close();
        },
        cancel: () => this.modalService.close(),
      },
    });
  }

  onTaskMoved(event: { taskId: string; newStatus: TaskStatus }): void {
    this.taskService.moveTask(event.taskId, event.newStatus);
  }
}
