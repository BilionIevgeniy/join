import { Component, input, output } from '@angular/core';
import { TaskFile } from '@core/models/task.model';

/**
 * TaskFileList — horizontally scrolling row of task attachment thumbnails,
 * each with a small "view" action plus either "delete" (`variant="editable"`,
 * used in Add/Edit-Task) or "download" (`variant="readonly"`, used in the
 * task detail modal). Download is handled locally (`file.data` is already a
 * full data URL); `view` bubbles up since opening the Image Viewer needs the
 * whole {@link files} list to page through, not just the clicked file.
 */
@Component({
  selector: 'app-task-file-list',
  standalone: true,
  templateUrl: './task-file-list.html',
  styleUrl: './task-file-list.scss',
})
export class TaskFileList {
  files = input.required<TaskFile[]>();
  variant = input<'editable' | 'readonly'>('readonly');

  /** Emitted when a file's "view" action is clicked — opens the Image Viewer (AT-10). */
  view = output<TaskFile>();
  /** Emitted when a file's "delete" action is clicked (`variant="editable"` only). */
  remove = output<string>();

  onView(file: TaskFile): void {
    this.view.emit(file);
  }

  onRemove(id: string): void {
    this.remove.emit(id);
  }
}
