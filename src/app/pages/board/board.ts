import { Component, computed, inject, signal } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { ContactService } from '../../core/services/contact.service';
import { TaskStatus } from '../../core/models/task.model';
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

  private matchesSearch = (title: string, description: string) => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return true;
    return title.toLowerCase().includes(q) || description.toLowerCase().includes(q);
  };

  private byStatus = (status: TaskStatus) =>
    computed(() =>
      this.taskService
        .tasks()
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
