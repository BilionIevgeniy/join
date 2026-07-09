import { Injectable, computed, signal } from '@angular/core';
import { Toast, ToastType } from '@core/models/toast.model';

/** ToastService — queues success/error notifications for display by {@link ToastContainer}. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  // Chronological order: oldest first, newest last
  private toasts = signal<Toast[]>([]);

  // For display: newest on top
  toastsForDisplay = computed(() => [...this.toasts()].reverse());

  /** Queues a success toast. */
  success(message: string): void {
    this.show(message, 'success');
  }

  /** Queues an error toast. */
  error(message: string): void {
    this.show(message, 'error');
  }

  /** Called by {@link Toast} when its own timer expires or the close button is clicked. */
  remove(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  // ─── PRIVATE ──────────────────────────────────────────────

  private show(message: string, type: ToastType): void {
    const toast: Toast = { id: this.generateId(), message, type };
    this.toasts.update((list) => [...list, toast]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}
