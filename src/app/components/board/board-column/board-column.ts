import { Component, input, output, signal } from '@angular/core';
import { Task, TaskStatus } from '@core/models/task.model';
import { TaskCard } from '@components/board/task/task-card/task-card';

/** BoardColumn — one status column on the board, rendering its tasks and handling drag/drop. */
@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [TaskCard],
  templateUrl: './board-column.html',
  styleUrl: './board-column.scss',
})
export class BoardColumn {
  // ─── INPUTS ───────────────────────────────────────────────
  title = input.required<string>();
  status = input.required<TaskStatus>();
  tasks = input<Task[]>([]);
  showAddIcon = input<boolean>(true);

  // ─── OUTPUTS ──────────────────────────────────────────────
  addTask = output<TaskStatus>();
  taskOpened = output<Task>();
  taskMoved = output<{ taskId: string; newStatus: TaskStatus }>();

  // ─── STATE ────────────────────────────────────────────────
  isDragOver = signal(false);
  private dragCounter = 0;

  // ─── DRAG & DROP ──────────────────────────────────────────

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.dragCounter++;
    this.isDragOver.set(true);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onDragLeave(): void {
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.isDragOver.set(false);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragCounter = 0;
    this.isDragOver.set(false);
    const taskId = event.dataTransfer?.getData('text/plain');
    if (taskId) {
      this.taskMoved.emit({ taskId, newStatus: this.status() });
    }
  }

  // ─── MOVE MENU ────────────────────────────────────────────

  onTaskMoveTo(task: Task, newStatus: TaskStatus): void {
    this.taskMoved.emit({ taskId: task.id, newStatus });
  }
}
