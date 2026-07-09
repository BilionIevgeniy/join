import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TaskService } from '@core/services/task.service';
import { RoutesEnum } from '@core/models/routes.model';
import { Summary as SummaryComponent } from '@components/summary/summary';

/** Summary — page-level container wiring auth/task data into the presentational summary view. */
@Component({
  selector: 'app-summary-page',
  standalone: true,
  imports: [SummaryComponent],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private router = inject(Router);

  // Computed once per page load, based on the time the user opened Summary
  greeting = ((hour = new Date().getHours()) => {
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 19) return 'Good afternoon';
    return 'Good night';
  })();

  userName = computed(() => {
    const user = this.authService.currentUser();
    return user ? `${user.first_name} ${user.last_name}`.trim() : '';
  });

  todoCount = this.taskService.todoCount;
  doneCount = this.taskService.doneCount;
  urgentCount = this.taskService.urgentCount;
  boardCount = this.taskService.totalTasks;
  inProgressCount = this.taskService.inProgressCount;
  awaitingCount = this.taskService.awaitingCount;

  deadlineLabel = computed(() => {
    const dueDate = this.taskService.upcomingDeadline();
    if (!dueDate) return null;
    return new Date(dueDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  });

  goToBoard(): void {
    this.router.navigate(['/', RoutesEnum.BOARD]);
  }
}
