import { Component, computed, input, output, signal } from '@angular/core';
import {
  ALL_TASK_STATUSES,
  getCategoryModifierClass,
  getPriorityIconUrl,
  getTaskContacts,
  STATUS_LABELS,
  Task,
  TaskStatus,
} from '@core/models/task.model';
import { countRemaining, takeVisible } from '@core/utils/collection.utils';
import { Avatar } from '@shared/avatar/avatar';

/** TaskCard — draggable card rendered inside a board column, summarizing one task. */
@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [Avatar],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  // ─── INPUTS ───────────────────────────────────────────────
  task = input.required<Task>();

  // ─── OUTPUTS ──────────────────────────────────────────────
  opened = output<Task>();
  moveTo = output<TaskStatus>();

  // ─── STATE ────────────────────────────────────────────────
  isDragging = signal(false);
  showMoveMenu = signal(false);

  /** Max number of assigned-contact avatars rendered before collapsing into a "+N" badge. */
  private readonly maxVisibleAvatars = 3;

  // ─── COMPUTED ─────────────────────────────────────────────
  assignedContacts = computed(() => getTaskContacts(this.task()));
  visibleContacts = computed(() => takeVisible(this.assignedContacts(), this.maxVisibleAvatars));
  remainingContactsCount = computed(() =>
    countRemaining(this.assignedContacts(), this.maxVisibleAvatars),
  );

  doneSubtasks = computed(() => this.task().subtasks.filter((s) => s.done).length);
  totalSubtasks = computed(() => this.task().subtasks.length);
  subtaskProgress = computed(() => {
    const total = this.totalSubtasks();
    return total === 0 ? 0 : (this.doneSubtasks() / total) * 100;
  });

  categoryClass = computed(() => getCategoryModifierClass(this.task().category, 'task-card'));

  priorityIcon = computed(() => getPriorityIconUrl(this.task().priority));

  otherStatuses = computed(() => {
    const current = this.task().status;
    return ALL_TASK_STATUSES.filter((s) => s !== current).map((s) => ({
      status: s,
      label: STATUS_LABELS[s],
    }));
  });

  // ─── DRAG & DROP ──────────────────────────────────────────

  onDragStart(event: DragEvent): void {
    this.isDragging.set(true);
    event.dataTransfer?.setData('text/plain', this.task().id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    this.setCustomDragImage(event);
  }

  onDragEnd(): void {
    this.isDragging.set(false);
  }

  // ─── MOVE MENU ────────────────────────────────────────────

  toggleMoveMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showMoveMenu.update((v) => !v);
  }

  selectStatus(status: TaskStatus, event: MouseEvent): void {
    event.stopPropagation();
    this.moveTo.emit(status);
    this.showMoveMenu.set(false);
  }

  closeMoveMenu(): void {
    this.showMoveMenu.set(false);
  }

  onOpen(): void {
    this.opened.emit(this.task());
  }

  // ─── PRIVATE ──────────────────────────────────────────────

  /** Renders an off-screen clone of the card as the native drag ghost image. */
  private setCustomDragImage(event: DragEvent): void {
    const el = event.currentTarget as HTMLElement;
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.cssText = `
      position: fixed; top: -9999px; left: -9999px;
      width: ${el.offsetWidth}px; pointer-events: none;
    `;
    document.body.appendChild(clone);
    event.dataTransfer?.setDragImage(clone, el.offsetWidth / 2, el.offsetHeight / 2);
    setTimeout(() => document.body.removeChild(clone), 0);
  }
}
