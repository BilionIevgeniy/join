import { Component, computed, input, output, signal } from '@angular/core';
import {
  getTaskContacts,
  STATUS_LABELS,
  Task,
  TaskStatus,
} from '../../../../core/models/task.model';
import { Avatar } from '../../../shared/avatar/avatar';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [Avatar],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  task = input.required<Task>();
  opened = output<Task>();
  moveTo = output<TaskStatus>();

  private readonly maxVisibleAvatars = 4;

  isDragging = signal(false);
  showMoveMenu = signal(false);

  assignedContacts = computed(() => getTaskContacts(this.task()));
  visibleContacts = computed(() => this.assignedContacts().slice(0, this.maxVisibleAvatars));
  remainingContactsCount = computed(() =>
    Math.max(0, this.assignedContacts().length - this.maxVisibleAvatars),
  );

  doneSubtasks = computed(() => this.task().subtasks.filter((s) => s.done).length);
  totalSubtasks = computed(() => this.task().subtasks.length);
  subtaskProgress = computed(() => {
    const total = this.totalSubtasks();
    return total === 0 ? 0 : (this.doneSubtasks() / total) * 100;
  });

  categoryClass = computed(() =>
    this.task().category === 'User Story'
      ? 'task-card__category--user-story'
      : 'task-card__category--technical-task',
  );

  priorityIcon = computed(() => `${this.task().priority}-prio-icon.svg`);

  otherStatuses = computed(() => {
    const current = this.task().status;
    const all: TaskStatus[] = ['todo', 'inProgress', 'awaitingFeedback', 'done'];
    return all.filter((s) => s !== current).map((s) => ({ status: s, label: STATUS_LABELS[s] }));
  });

  onDragStart(event: DragEvent): void {
    this.isDragging.set(true);
    event.dataTransfer?.setData('text/plain', this.task().id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';

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

  onDragEnd(): void {
    this.isDragging.set(false);
  }

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
}
