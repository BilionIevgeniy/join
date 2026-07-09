import { Component, ViewEncapsulation, input, output } from '@angular/core';
import { TaskPriority } from '@core/models/task.model';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: '#FF3D00' },
  medium: { label: 'Medium', color: '#FFA800' },
  low: { label: 'Low', color: '#7AE229' },
};

/** One priority option (urgent/medium/low) in the priority picker; label and color come from `PRIORITY_CONFIG`. */
@Component({
  selector: 'app-priority-button',
  standalone: true,
  imports: [],
  templateUrl: './priority-button.html',
  styleUrl: './priority-button.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PriorityButton {
  priority = input.required<TaskPriority>();
  selected = input<boolean>(false);
  priorityChange = output<TaskPriority>();

  get config() {
    return PRIORITY_CONFIG[this.priority()];
  }

  onClick() {
    this.priorityChange.emit(this.priority());
  }
}
