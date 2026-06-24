import { Component, input, output } from '@angular/core';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskCard } from '../../task/task-card/task-card';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [TaskCard],
  templateUrl: './board-column.html',
  styleUrl: './board-column.scss',
})
export class BoardColumn {
  title = input.required<string>();
  status = input.required<TaskStatus>();
  tasks = input<Task[]>([]);
  showAddIcon = input<boolean>(true);

  addTask = output<TaskStatus>();
  taskOpened = output<Task>();
}
