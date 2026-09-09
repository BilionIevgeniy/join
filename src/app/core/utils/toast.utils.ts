import { WritableSignal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

/**
 * Runs an async operation while toggling a loading signal on and off around it.
 * Guarantees the signal is reset to `false` even if the operation throws.
 *
 * @param loading - Signal flipped to `true` before the operation and back to `false` after.
 * @param operation - The async work to run while `loading` is `true`.
 */
export async function withLoading<T>(
  loading: WritableSignal<boolean>,
  operation: () => Promise<T>,
): Promise<T> {
  loading.set(true);
  try {
    return await operation();
  } finally {
    loading.set(false);
  }
}

/**
 * Logs an error to the console and surfaces a user-facing message via the toast service.
 * Centralizes the "console.error + toast.error" pair repeated across service catch blocks.
 *
 * @param toast - Toast service used to display the message.
 * @param operation - Short label identifying the failed operation, used in the console log.
 * @param err - The caught error.
 * @param userMessage - Human-readable message shown to the user.
 */
export function logAndNotify(
  toast: ToastService,
  operation: string,
  err: unknown,
  userMessage: string,
): void {
  console.error(`${operation} failed:`, err);
  toast.error(userMessage);
}
