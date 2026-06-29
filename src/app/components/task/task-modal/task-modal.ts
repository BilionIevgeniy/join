import { Component, computed, inject, input, output } from '@angular/core';
import { getTaskContacts, Task, TaskPriority } from '../../../core/models/task.model';
import { ModalService } from '../../../core/services/modal.service';
import { TaskService } from '../../../core/services/task.service';
import { Avatar } from '../../shared/avatar/avatar';
import { Button } from '../../shared/button/button';
import { CheckboxButton } from '../../shared/checkbox-button/checkbox-button';

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  medium: 'Medium',
  low: 'Low',
};

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [Avatar, Button, CheckboxButton],
  templateUrl: './task-modal.html',
  styleUrl: './task-modal.scss',
})
export class TaskModal {
  private taskService = inject(TaskService);
  private modalService = inject(ModalService);

  task = input.required<Task>();

  edit = output<Task>();
  delete = output<string>();

  assignedContacts = computed(() => getTaskContacts(this.task()));

  categoryClass = computed(() =>
    this.task().category === 'User Story'
      ? 'task-modal__category--user-story'
      : 'task-modal__category--technical-task',
  );

  priorityIcon = computed(() => `${this.task().priority}-prio-icon.svg`);
  priorityLabel = computed(() => PRIORITY_LABELS[this.task().priority]);

  toggleSubtask(subtaskId: string): void {
    const task = this.task();
    const updated = task.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s));
    this.taskService.updateSubtasks(task.id, updated);
  }

  onEdit(): void {
    this.edit.emit(this.task());
  }

  onDelete(): void {
    this.delete.emit(this.task().id);
  }

  close(): void {
    this.modalService.close();
  }
}
