import { Component, computed, inject, signal } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { ContactService } from '../../core/services/contact.service';
import { Task, TaskStatus } from '../../core/models/task.model';
import { Button } from '../../components/shared/button/button';
import { SearchInput } from '../../components/shared/search-input/search-input';
import { BoardColumn } from '../../components/task/board-column/board-column';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [Button, SearchInput, BoardColumn],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  private taskService = inject(TaskService);
  private contactService = inject(ContactService);

  contacts = this.contactService.contacts;
  searchQuery = signal('');

  // ─── DUMMY DATA — visual placeholder until the senior wires up the DB ──
  private dummyTasks = computed<Task[]>(() => {
    const ids = this.contacts()
      .slice(0, 3)
      .map((c) => c.id!)
      .filter(Boolean);

    const allIds = this.contacts()
      .map((c) => c.id!)
      .filter(Boolean);

    return [
      {
        id: 'dummy-1',
        title: 'Contact Form & Imprint',
        description:
          'Create a contact form and imprint page for the website, including validation, error states and a confirmation message after successful submission.',
        status: 'todo',
        priority: 'medium',
        category: 'User Story',
        assignedTo: allIds,
        subtasks: [
          { id: 's1', title: 'Form', done: false },
          { id: 's2', title: 'Imprint', done: false },
        ],
        dueDate: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'dummy-2',
        title: 'Kochwelt Page & Recipe Recommender',
        description: 'Build start page with recipe recommendation.',
        status: 'inProgress',
        priority: 'medium',
        category: 'User Story',
        assignedTo: ids,
        subtasks: [{ id: 's3', title: 'Layout', done: true }],
        dueDate: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'dummy-3',
        title: 'HTML Base Template Creation',
        description: 'Create reusable HTML base templates for all pages.',
        status: 'awaitingFeedback',
        priority: 'urgent',
        category: 'Technical Task',
        assignedTo: ids,
        subtasks: [],
        dueDate: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'dummy-4',
        title: 'CSS Architecture Planning',
        description: 'Define CSS naming conventions and structure.',
        status: 'done',
        priority: 'low',
        category: 'Technical Task',
        assignedTo: ids,
        subtasks: [
          { id: 's4', title: 'Naming', done: true },
          { id: 's5', title: 'Structure', done: true },
        ],
        dueDate: '',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  private matchesSearch = (title: string, description: string) => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return true;
    return title.toLowerCase().includes(q) || description.toLowerCase().includes(q);
  };

  private byStatus = (status: TaskStatus) =>
    computed(() =>
      [...this.taskService.tasks(), ...this.dummyTasks()]
        .filter((t) => t.status === status)
        .filter((t) => this.matchesSearch(t.title, t.description)),
    );

  todoTasks = this.byStatus('todo');
  inProgressTasks = this.byStatus('inProgress');
  awaitingFeedbackTasks = this.byStatus('awaitingFeedback');
  doneTasks = this.byStatus('done');

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onAddTask(status: TaskStatus): void {
    // Opens the add-task flow — wired up once the add-task page/modal exists
  }
}
