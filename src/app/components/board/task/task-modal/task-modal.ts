import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import {
  getCategoryModifierClass,
  getPriorityIconUrl,
  getTaskContacts,
  PRIORITY_LABELS,
  Subtask,
  Task,
} from '@core/models/task.model';
import { Avatar } from '@shared/avatar/avatar';
import { Button } from '@shared/button/button';
import { CheckboxButton } from '@shared/checkbox-button/checkbox-button';

/** TaskModal — read-only task detail view opened via the app-wide modal service. */
@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [Avatar, Button, CheckboxButton],
  templateUrl: './task-modal.html',
  styleUrl: './task-modal.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TaskModal {
  task = input.required<Task>();

  subtaskToggled = output<{ taskId: string; subtasks: Subtask[] }>();
  edit = output<Task>();
  delete = output<string>();
  closed = output<void>();

  assignedContacts = computed(() => getTaskContacts(this.task()));

  categoryClass = computed(() => getCategoryModifierClass(this.task().category, 'task-modal'));

  priorityIcon = computed(() => getPriorityIconUrl(this.task().priority));
  priorityLabel = computed(() => PRIORITY_LABELS[this.task().priority]);

  toggleSubtask(subtaskId: string): void {
    const task = this.task();
    const updated = task.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s));
    this.subtaskToggled.emit({ taskId: task.id, subtasks: updated });
  }

  onEdit(): void {
    this.edit.emit(this.task());
  }

  onDelete(): void {
    this.delete.emit(this.task().id);
  }

  close(): void {
    this.closed.emit();
  }
}
