import type { MouseEvent } from 'react';

/** Lets a tap anywhere in a date field open the native picker, not just its tiny icon. */
export function openDatePicker(e: MouseEvent<HTMLInputElement>) {
  const input = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
  try {
    input.showPicker?.();
  } catch {
    // Unsupported browsers just fall back to the default click behavior.
  }
}
