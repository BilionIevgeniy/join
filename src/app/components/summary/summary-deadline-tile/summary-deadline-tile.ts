import { Component, input, output } from '@angular/core';

/** Summary tile showing the urgent-task count and the nearest upcoming deadline. */
@Component({
  selector: 'app-summary-deadline-tile',
  standalone: true,
  imports: [],
  templateUrl: './summary-deadline-tile.html',
  styleUrl: './summary-deadline-tile.scss',
})
export class SummaryDeadlineTile {
  urgentCount = input<number>(0);
  deadlineLabel = input<string | null>(null);

  tileClick = output<void>();
}
