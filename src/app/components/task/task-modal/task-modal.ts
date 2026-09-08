import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import {
  getCategoryModifierClass,
  getPriorityIconUrl,
  getTaskContacts,
  PRIORITY_LABELS,
  Subtask,
  Task,
  TaskFile,
} from '@core/models/task.model';
import { Avatar } from '@shared/avatar/avatar';
import { Button } from '@shared/button/button';
import { CheckboxButton } from '@shared/checkbox-button/checkbox-button';
import { TaskFileList } from '@components/task/task-file-list/task-file-list';

/** TaskModal — read-only task detail view opened via the app-wide modal service. */
@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [Avatar, Button, CheckboxButton, TaskFileList],
  templateUrl: './task-modal.html',
  styleUrl: './task-modal.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TaskModal {
  // ─── INPUTS ───────────────────────────────────────────────
  task = input.required<Task>();

  // ─── OUTPUTS ──────────────────────────────────────────────
  subtaskToggled = output<{ taskId: string; subtasks: Subtask[] }>();
  edit = output<Task>();
  delete = output<string>();
  closed = output<void>();

  // ─── COMPUTED ─────────────────────────────────────────────
  assignedContacts = computed(() => getTaskContacts(this.task()));
  categoryClass = computed(() => getCategoryModifierClass(this.task().category, 'task-modal'));
  priorityIcon = computed(() => getPriorityIconUrl(this.task().priority));
  priorityLabel = computed(() => PRIORITY_LABELS[this.task().priority]);

  // ─── PUBLIC API ───────────────────────────────────────────

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

  /** TODO(AT-10): open the shared Image Viewer on this file, paging across `task().files`. */
  onViewFile(file: TaskFile): void {
    console.warn('Image viewer not implemented yet (AT-10):', file.name);
  }

  close(): void {
    this.closed.emit();
  }
}
