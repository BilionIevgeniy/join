import { Injectable, signal } from '@angular/core';
import { TaskFile } from '@core/models/task.model';

/**
 * ImageViewerService — app-wide state for the Image Viewer (AT-10).
 *
 * Same pattern as {@link ToastService}: a signal-driven singleton with one
 * renderer ({@link ImageViewer}, mounted once in app.html) watching it —
 * not {@link ModalService}, which hosts arbitrary Angular components.
 * Viewer.js manages its own overlay DOM directly, so it doesn't need that.
 */
@Injectable({ providedIn: 'root' })
export class ImageViewerService {
  /** The full file list to page through — set whenever the viewer opens. */
  files = signal<TaskFile[]>([]);
  /** Index within {@link files} to open on. */
  initialIndex = signal(0);
  /** True while the viewer is visible. */
  isOpen = signal(false);

  /** Opens the viewer on `files`, starting at `index`. */
  open(files: TaskFile[], index: number): void {
    this.files.set(files);
    this.initialIndex.set(index);
    this.isOpen.set(true);
  }

  /** Called by {@link ImageViewer} once Viewer.js reports it has fully closed. */
  close(): void {
    this.isOpen.set(false);
  }
}
