import { Component, OnDestroy, OnInit, input, output } from '@angular/core';
import { Toast as ToastModel } from '@core/models/toast.model';

const AUTO_CLOSE_DELAY = 3000;

/** A single toast notification with a self-managed auto-close timer. */
@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast implements OnInit, OnDestroy {
  toast = input.required<ToastModel>();
  close = output<string>();

  private timerId?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    // Auto-close after delay — each toast manages its own lifetime
    this.timerId = setTimeout(() => this.handleClose(), AUTO_CLOSE_DELAY);
  }

  ngOnDestroy(): void {
    // Prevent the timer from firing after the component is already gone
    clearTimeout(this.timerId);
  }

  handleClose(): void {
    this.close.emit(this.toast().id);
  }
}
