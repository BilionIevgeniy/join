import { Component, input, output } from '@angular/core';
import { SummaryTile } from './summary-tile/summary-tile';
import { SummaryDeadlineTile } from './summary-deadline-tile/summary-deadline-tile';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [SummaryTile, SummaryDeadlineTile],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  userName = input<string>('');
  greeting = input<string>('');

  todoCount = input<number>(0);
  doneCount = input<number>(0);
  urgentCount = input<number>(0);
  deadlineLabel = input<string | null>(null);
  boardCount = input<number>(0);
  inProgressCount = input<number>(0);
  awaitingCount = input<number>(0);

  tileClicked = output<void>();
}
