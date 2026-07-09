// ============================================================
//  TOAST — notification entity
// ============================================================

export type ToastType = 'success' | 'error';

/** A single toast notification queued for display in ToastContainer. */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
