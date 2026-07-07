import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TaskService } from '@core/services/task.service';
import { ContactService } from '@core/services/contact.service';
import { CreateTaskDto, TaskStatus } from '@core/models/task.model';
import { AddTaskComponent } from '@components/add-task/add-task';

const VALID_STATUSES: TaskStatus[] = ['todo', 'inProgress', 'awaitingFeedback', 'done'];

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
  private route = inject(ActivatedRoute);

  isLoading = this.taskService.isLoading;
  contacts = this.contactService.contacts;

  initialStatus = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => {
        const s = params.get('status') as TaskStatus | null;
        return s && VALID_STATUSES.includes(s) ? s : 'todo';
      }),
    ),
    { initialValue: 'todo' as TaskStatus },
  );

  async onSave(dto: CreateTaskDto): Promise<void> {
    const result = await this.taskService.addTask(dto);
    if (result) this.router.navigate(['/board']);
  }
}
