import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { ContactService } from '../../core/services/contact.service';
import { CreateTaskDto } from '../../core/models/task.model';
import { AddTaskComponent } from '../../components/task/add-task/add-task';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [AddTaskComponent],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTaskPage {
  private taskService = inject(TaskService);
  private contactService = inject(ContactService);
  private router = inject(Router);

  // Loading state from service
  isLoading = this.taskService.isLoading;

  // Search query for filtering contacts in dropdown
  searchQuery = signal('');

  // Filtered contacts passed down to AddTask
  filteredContacts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.contactService.contacts();
    return this.contactService
      .contacts()
      .filter(
        (c) =>
          c.first_name.toLowerCase().includes(q) ||
          (c.last_name && c.last_name.toLowerCase().includes(q)),
      );
  });

  // ─── HANDLERS ─────────────────────────────────────────────

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  async onSave(dto: CreateTaskDto): Promise<void> {
    const result = await this.taskService.addTask(dto);
    if (result) this.router.navigate(['/board']);
  }

  onCancel(): void {
    // Reset search query when form is cleared
    this.searchQuery.set('');
  }
}
