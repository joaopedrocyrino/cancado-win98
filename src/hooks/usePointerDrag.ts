import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { DRAG_THRESHOLD } from '../core/constants';

export interface DragEventInfo {
  /** Pointer position relative to the drag origin. */
  dx: number;
  dy: number;
  /** Raw viewport pointer position. */
  clientX: number;
  clientY: number;
}

export interface UsePointerDragOptions<T> {
  /** Snapshot taken when the drag starts; handed back on every move. */
  onStart?: (event: ReactPointerEvent<Element>) => T | null | undefined;
  onMove: (info: DragEventInfo, context: T) => void;
  onEnd?: (info: DragEventInfo, context: T, moved: boolean) => void;
  /** Ignore movement below this distance so a click never registers as a drag. */
  threshold?: number;
  disabled?: boolean;
}

interface DragSession<T> {
  pointerId: number;
  startX: number;
  startY: number;
  context: T;
  moved: boolean;
  last: DragEventInfo;
}

/**
 * Pointer-based dragging with the two behaviours every draggable surface here
 * needs: a movement threshold (so a sloppy click still counts as a click) and
 * updates delivered on animation frames rather than on every pointer event.
 *
 * The consumer decides what to do with the delta — this hook owns no geometry.
 */
export function usePointerDrag<T>(options: UsePointerDragOptions<T>) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const sessionRef = useRef<DragSession<T> | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<DragEventInfo | null>(null);
  /** True right after a drag, so the trailing click can be swallowed. */
  const draggedRef = useRef(false);

  const cancelFrame = useCallback(() => {
    if (frameRef.current == null) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const flush = useCallback(() => {
    frameRef.current = null;
    const session = sessionRef.current;
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!session || !pending) return;
    optionsRef.current.onMove(pending, session.context);
  }, []);

  useEffect(() => cancelFrame, [cancelFrame]);

  const onPointerDown = useCallback((event: ReactPointerEvent<Element>) => {
    const opts = optionsRef.current;
    if (opts.disabled || event.button !== 0) return;

    const context = opts.onStart?.(event);
    // `onStart` returning null is how a caller vetoes the drag (e.g. a
    // maximized window, which can't be moved).
    if (context === null || context === undefined) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    draggedRef.current = false;
    sessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      context,
      moved: false,
      last: { dx: 0, dy: 0, clientX: event.clientX, clientY: event.clientY },
    };
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<Element>) => {
      const session = sessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;

      const dx = event.clientX - session.startX;
      const dy = event.clientY - session.startY;
      const threshold = optionsRef.current.threshold ?? DRAG_THRESHOLD;
      if (!session.moved && Math.hypot(dx, dy) < threshold) return;

      session.moved = true;
      draggedRef.current = true;
      const info: DragEventInfo = {
        dx,
        dy,
        clientX: event.clientX,
        clientY: event.clientY,
      };
      session.last = info;
      pendingRef.current = info;
      if (frameRef.current == null) {
        frameRef.current = requestAnimationFrame(flush);
      }
    },
    [flush],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<Element>) => {
      const session = sessionRef.current;
      if (!session || session.pointerId !== event.pointerId) return;
      sessionRef.current = null;

      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      // Deliver the final position synchronously so the committed state always
      // matches the last frame the user saw.
      cancelFrame();
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending) optionsRef.current.onMove(pending, session.context);
      optionsRef.current.onEnd?.(session.last, session.context, session.moved);
    },
    [cancelFrame],
  );

  /** Call from `onClick` to drop the click that ends a drag gesture. */
  const consumeClickAfterDrag = useCallback(() => {
    const dragged = draggedRef.current;
    draggedRef.current = false;
    return dragged;
  }, []);

  return {
    dragging: sessionRef.current !== null,
    consumeClickAfterDrag,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
