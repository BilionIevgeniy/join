import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-summary-tile',
  standalone: true,
  imports: [],
  templateUrl: './summary-tile.html',
  styleUrl: './summary-tile.scss',
})
export class SummaryTile {
  icon = input<string>('');
  count = input<number>(0);
  label = input<string>('');
  size = input<'half' | 'third'>('half');

  tileClick = output<void>();
}
