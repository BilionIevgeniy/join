import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '@core/services/task.service';
import { ContactService } from '@core/services/contact.service';
import { CreateTaskDto } from '@core/models/task.model';
import { AddTaskComponent } from '@components/add-task/add-task';

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

  // Contacts from service
  contacts = this.contactService.contacts;

  // ─── HANDLERS ─────────────────────────────────────────────
  async onSave(dto: CreateTaskDto): Promise<void> {
    const result = await this.taskService.addTask(dto);
    if (result) this.router.navigate(['/board']);
  }
}
