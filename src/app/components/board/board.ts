import { Component, ElementRef, afterEveryRender, inject, input, output } from '@angular/core';
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
  private el = inject(ElementRef);

  columns = input.required<BoardColumnConfig[]>();
  addTask = output<TaskStatus>();
  taskOpened = output<Task>();
  taskMoved = output<{ taskId: string; newStatus: TaskStatus }>();

  constructor() {
    // afterRender runs after every render cycle — picks up new/removed cards automatically.
    afterEveryRender(() => this.syncCardHeights());
  }

  /**
   * Makes every task card as tall as the tallest card on the board.
   * Reset first so we always measure the card's natural height,
   * not a previously forced value.
   */
  private syncCardHeights(): void {
    const cards = this.el.nativeElement.querySelectorAll('.task-card') as NodeListOf<HTMLElement>;
    cards.forEach((c) => (c.style.minHeight = ''));
    if (!cards.length) return;
    const maxH = Math.max(...Array.from(cards).map((c) => c.offsetHeight));
    cards.forEach((c) => (c.style.minHeight = `${maxH}px`));
  }
}
