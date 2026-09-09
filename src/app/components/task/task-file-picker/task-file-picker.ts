import { Component, inject, model, signal } from '@angular/core';
import { TaskFile } from '@core/models/task.model';
import { TaskFileList } from '@components/task/task-file-list/task-file-list';
import { validateFile } from '@core/utils/file.utils';
import { buildTaskFile } from '@core/utils/task-file.utils';
import { ToastService } from '@core/services/toast.service';
import { logAndNotify } from '@core/utils/toast.utils';
import { ImageViewerService } from '@core/services/image-viewer.service';

/**
 * TaskFilePicker — the Attachments field for Add/Edit-Task: dropzone +
 * native file input + validation/compression pipeline + preview list
 * (via {@link TaskFileList}) + Image Viewer trigger, all in one place.
 *
 * `files` is a `model()` — a two-way signal — so the parent form just binds
 * `[(files)]="files"` and keeps reading/writing its own signal exactly as
 * before; this component owns everything about *how* that list changes.
 */
@Component({
  selector: 'app-task-file-picker',
  standalone: true,
  imports: [TaskFileList],
  templateUrl: './task-file-picker.html',
  styleUrl: './task-file-picker.scss',
})
export class TaskFilePicker {
  private toast = inject(ToastService);
  private imageViewer = inject(ImageViewerService);

  files = model<TaskFile[]>([]);
  isDragOver = signal(false);

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFiles(input.files);
    input.value = ''; // reset so re-selecting the same file still fires 'change'
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    this.handleFiles(event.dataTransfer?.files ?? null);
  }

  removeFile(id: string): void {
    this.files.update((list) => list.filter((f) => f.id !== id));
  }

  /** Opens the Image Viewer on this file, paging across the rest of {@link files}. */
  onViewFile(file: TaskFile): void {
    const index = this.files().findIndex((f) => f.id === file.id);
    this.imageViewer.open(this.files(), index);
  }

  clearFiles(): void {
    this.files.set([]);
  }

  private handleFiles(fileList: FileList | null): void {
    if (!fileList) return;
    Array.from(fileList).forEach((file) => this.processFile(file));
  }

  /** Validates one file and, if valid, compresses/encodes it and adds it to {@link files}. */
  private async processFile(file: File): Promise<void> {
    const result = validateFile(file);
    if (!result.valid) {
      this.toast.error(result.error!);
      return;
    }
    try {
      const taskFile = await buildTaskFile(file);
      this.files.update((list) => [...list, taskFile]);
    } catch (err) {
      logAndNotify(
        this.toast,
        'buildTaskFile',
        err,
        `${file.name}: could not be processed. Try a different file.`,
      );
    }
  }
}
