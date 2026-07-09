import { Component, input, output } from '@angular/core';

/** Generic stat tile on the Summary page — icon, count and label, sized as `half` or `third` of the row. */
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
