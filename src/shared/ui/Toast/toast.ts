type Listener = (message: string | null) => void;

const DURATION_MS = 2500;

let currentMessage: string | null = null;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(currentMessage));
}

/**
 * Shows a lightweight, auto-dismissing toast — for generic/unmapped/network
 * errors that aren't tied to one specific field. A new call replaces whatever
 * is currently showing (no stacking/queue).
 */
export function showToast(message: string) {
  clearTimeout(hideTimer);
  currentMessage = message;
  emit();
  hideTimer = setTimeout(() => {
    currentMessage = null;
    emit();
  }, DURATION_MS);
}

/** Dismisses the current toast immediately (e.g. tap-to-dismiss). */
export function dismissToast() {
  clearTimeout(hideTimer);
  currentMessage = null;
  emit();
}

/** Subscribes to toast state changes; returns the unsubscribe function. */
export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentMessage);
  return () => listeners.delete(listener);
}
