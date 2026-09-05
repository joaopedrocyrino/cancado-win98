import { memo, useCallback, useRef, type ReactNode } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { clampWindowPosition } from '../../core/geometry';
import type { Bounds, WindowState } from '../../core/types';
import { defaultLabels, type DesktopLabels } from '../../context/labels';
import { usePointerDrag } from '../../hooks/usePointerDrag';
import { cx } from '../../utils/cx';
import './Window.css';

export interface WindowProps {
  win: WindowState;
  focused: boolean;
  /** Size of the surface, for clamping while dragging. */
  bounds: Bounds;
  children?: ReactNode;
  labels?: DesktopLabels;
  /** Give the body the white "document well" background. */
  inset?: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  className?: string;
}

/** Snapshot of the window's geometry when a drag begins. */
interface DragOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
}

function WindowComponent({
  win,
  focused,
  bounds,
  children,
  labels = defaultLabels,
  inset,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
  onResize,
  className,
}: WindowProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  // Live values for the drag callbacks, which are created once and would
  // otherwise capture the geometry from the render the drag started in.
  const latest = useRef({ win, bounds, onMove, onResize, onFocus });
  latest.current = { win, bounds, onMove, onResize, onFocus };

  const beginDrag = useCallback((): DragOrigin | null => {
    const { win: current, onFocus: focus } = latest.current;
    focus();
    // A maximized window is pinned to the surface — nothing to drag.
    if (current.maximized) return null;
    return {
      x: current.x,
      y: current.y,
      width: current.width,
      height: current.height,
    };
  }, []);

  const moveDrag = usePointerDrag<DragOrigin>({
    onStart: beginDrag,
    // Painted straight to the DOM instead of through state: a drag can fire
    // dozens of times a second and re-rendering the tree each time is what
    // makes naive window managers feel sticky. State is committed on release.
    onMove: ({ dx, dy }, origin) => {
      const node = nodeRef.current;
      if (!node) return;
      const next = clampWindowPosition(
        { x: origin.x + dx, y: origin.y + dy },
        { width: origin.width, height: origin.height },
        latest.current.bounds,
      );
      node.style.transform = `translate3d(${next.x}px, ${next.y}px, 0)`;
    },
    onEnd: ({ dx, dy }, origin, moved) => {
      if (!moved) return;
      const next = clampWindowPosition(
        { x: origin.x + dx, y: origin.y + dy },
        { width: origin.width, height: origin.height },
        latest.current.bounds,
      );
      latest.current.onMove(next.x, next.y);
    },
  });

  const resizeDrag = usePointerDrag<DragOrigin>({
    onStart: beginDrag,
    onMove: ({ dx, dy }, origin) => {
      const node = nodeRef.current;
      if (!node) return;
      const { win: current } = latest.current;
      node.style.width = `${Math.max(current.minWidth, origin.width + dx)}px`;
      node.style.height = `${Math.max(current.minHeight, origin.height + dy)}px`;
    },
    onEnd: ({ dx, dy }, origin, moved) => {
      if (!moved) return;
      latest.current.onResize(origin.width + dx, origin.height + dy);
    },
  });

  if (win.minimized) return null;

  /** Titlebar buttons must not start a window drag. */
  const stopDrag = (event: ReactPointerEvent) => {
    event.stopPropagation();
    onFocus();
  };

  return (
    <div
      ref={nodeRef}
      className={cx('w98-window', 'w98-bevel-out', className)}
      data-focused={focused}
      data-window-id={win.id}
      role="dialog"
      aria-label={win.title}
      style={{
        transform: `translate3d(${win.x}px, ${win.y}px, 0)`,
        width: win.width,
        height: win.height,
        zIndex: win.z,
      }}
      onPointerDown={onFocus}
    >
      <div
        className="w98-window-titlebar"
        onDoubleClick={onToggleMaximize}
        {...moveDrag.handlers}
      >
        {win.icon ? (
          <span className="w98-window-icon" aria-hidden="true">
            {win.icon}
          </span>
        ) : null}
        <div className="w98-window-title">{win.title}</div>
        <div className="w98-window-controls">
          <button
            type="button"
            className="w98-titlebar-btn w98-bevel-out"
            aria-label={labels.minimize}
            onPointerDown={stopDrag}
            onClick={onMinimize}
          >
            <span aria-hidden="true">–</span>
          </button>
          <button
            type="button"
            className="w98-titlebar-btn w98-bevel-out"
            aria-label={win.maximized ? labels.restore : labels.maximize}
            onPointerDown={stopDrag}
            onClick={onToggleMaximize}
          >
            <span aria-hidden="true">{win.maximized ? '❐' : '☐'}</span>
          </button>
          <button
            type="button"
            className="w98-titlebar-btn w98-titlebar-btn--close w98-bevel-out"
            aria-label={labels.close}
            onPointerDown={stopDrag}
            onClick={onClose}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>

      <div className={cx('w98-window-body', inset && 'w98-window-body--inset')}>
        {children}
      </div>

      {win.resizable && !win.maximized ? (
        <div
          className="w98-resize-handle"
          aria-hidden="true"
          {...resizeDrag.handlers}
        />
      ) : null}
    </div>
  );
}

/**
 * Memoized: a drag commits state only on release, so the desktop doesn't
 * re-render mid-gesture and sibling windows stay untouched.
 */
export const Window = memo(WindowComponent);
