import { Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { Toast } from './toast/toast';

/** Renders the queued {@link ToastService} notifications as a stack of {@link Toast} components. */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [Toast],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  private toastService = inject(ToastService);

  // Read-only signal from the service — newest on top
  toasts = this.toastService.toastsForDisplay;

  onClose(id: string): void {
    this.toastService.remove(id);
  }
}
