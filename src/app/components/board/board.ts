import { Component, input, output } from '@angular/core';
import { BoardColumnConfig, Task, TaskStatus } from '../../core/models/task.model';
import { BoardColumn } from './board-column/board-column';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [BoardColumn],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  columns = input.required<BoardColumnConfig[]>();
  addTask = output<TaskStatus>();
  taskOpened = output<Task>();
  taskMoved = output<{ taskId: string; newStatus: TaskStatus }>();
}
