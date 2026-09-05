import { useEffect, useRef } from 'react';

export interface UseDismissOptions {
  /** Only listens while true. */
  active: boolean;
  onDismiss: () => void;
  /**
   * Selectors that must NOT dismiss when clicked — typically the trigger that
   * opened the surface, whose own click would otherwise reopen it immediately.
   */
  ignoreSelectors?: readonly string[];
  /** Dismiss on Escape. Defaults to true. */
  closeOnEscape?: boolean;
}

/**
 * Closes a popup on outside click or Escape. Used by the Start menu and every
 * tray flyout, so dismissal behaves identically across the shell.
 */
export function useDismiss<T extends HTMLElement>({
  active,
  onDismiss,
  ignoreSelectors,
  closeOnEscape = true,
}: UseDismissOptions) {
  const ref = useRef<T | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const ignoreRef = useRef(ignoreSelectors);
  ignoreRef.current = ignoreSelectors;

  useEffect(() => {
    if (!active) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (ref.current?.contains(target)) return;
      for (const selector of ignoreRef.current ?? []) {
        if (target.closest(selector)) return;
      }
      onDismissRef.current();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') onDismissRef.current();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active, closeOnEscape]);

  return ref;
}
