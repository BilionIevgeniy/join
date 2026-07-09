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

/**
 * Board — page-level container wiring {@link TaskService} data to the presentational
 * {@link BoardComponent}, and driving the add/edit/open-task modal flows.
 */
@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [Button, SearchInput, BoardComponent],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  // ─── DEPENDENCIES ───────────────────────────────────────────
  private taskService = inject(TaskService);
  private contactService = inject(ContactService);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  // ─── STATE ────────────────────────────────────────────────
  searchQuery = signal('');

  private mobileQuery = window.matchMedia('(width <= 1025px)');
  isMobile = signal(this.mobileQuery.matches);

  constructor() {
    const onChange = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);
    this.mobileQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => this.mobileQuery.removeEventListener('change', onChange));
  }

  // ─── COMPUTED ─────────────────────────────────────────────
  todoTasks = computed(() => this.filterBySearch(this.taskService.todoTasks()));
  inProgressTasks = computed(() => this.filterBySearch(this.taskService.inProgressTasks()));
  awaitingFeedbackTasks = computed(() =>
    this.filterBySearch(this.taskService.awaitingFeedbackTasks()),
  );
  doneTasks = computed(() => this.filterBySearch(this.taskService.doneTasks()));

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

  // ─── PUBLIC API ───────────────────────────────────────────

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  /** Opens the add-task form: a dedicated page on mobile, a modal on desktop. */
  onAddTask(status: TaskStatus): void {
    if (this.isMobile()) {
      this.router.navigate(['/', RoutesEnum.ADD_TASK], { queryParams: { status } });
      return;
    }
    this.openTaskFormModal({ status });
  }

  /** Opens the task-detail modal, keeping it in sync with live updates via a computed signal. */
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

  /** Called by drag-and-drop when a task is dropped into a different column. */
  onTaskMoved(event: { taskId: string; newStatus: TaskStatus }): void {
    this.taskService.moveTask(event.taskId, event.newStatus);
  }

  // ─── PRIVATE ──────────────────────────────────────────────

  private onEditTask(task: Task): void {
    this.openTaskFormModal({ task });
  }

  /**
   * Opens the AddTaskComponent modal in create or edit mode depending on which
   * option is passed, wiring the correct save handler (addTask vs updateTask) for each.
   */
  private openTaskFormModal(options: { status?: TaskStatus; task?: Task }): void {
    const { status, task } = options;
    this.modalService.open(AddTaskComponent, {
      inputs: {
        ...(task ? { task, isEdit: true } : { initialStatus: status }),
        contacts: this.contactService.contacts(),
        isModal: true,
      },
      syncInputs: { isLoading: this.taskService.isLoading },
      actions: {
        save: async (dto: CreateTaskDto) => {
          await (task ? this.taskService.updateTask(task.id, dto) : this.taskService.addTask(dto));
          this.modalService.close();
        },
        cancel: () => this.modalService.close(),
      },
    });
  }

  private matchesSearch(title: string, description: string): boolean {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return true;
    return title.toLowerCase().includes(q) || description.toLowerCase().includes(q);
  }

  /** Applies the current search query to a list of tasks, by title/description. */
  private filterBySearch(tasks: Task[]): Task[] {
    return tasks.filter((t) => this.matchesSearch(t.title, t.description));
  }
}
