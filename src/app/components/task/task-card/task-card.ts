import { Component, computed, input, output } from '@angular/core';
import { Task } from '../../../core/models/task.model';
import { Contact } from '../../../core/models/contact.model';
import { Avatar } from '../../shared/avatar/avatar';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [Avatar],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  task = input.required<Task>();
  contacts = input<Contact[]>([]);
  opened = output<Task>();

  private readonly maxVisibleAvatars = 4;

  assignedContacts = computed(() => {
    const ids = this.task().assignedTo;
    return this.contacts().filter((c) => c.id && ids.includes(c.id));
  });

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
    this.task().category === 'User Story' ? 'task-card__category--user-story' : 'task-card__category--technical-task',
  );

  priorityIcon = computed(() => `${this.task().priority}-prio-icon.svg`);

  onOpen(): void {
    this.opened.emit(this.task());
  }
}
