import { useCallback, useMemo, useReducer, useRef } from 'react';
import { FALLBACK_BOUNDS } from '../core/constants';
import {
  focusedWindowId,
  initialWindowManagerState,
  windowManagerReducer,
} from '../core/windowManager';
import type { Bounds, OpenWindowInput, WindowId, WindowState } from '../core/types';

/**
 * Imperative handle over the window stack. `Desktop` builds one internally, but
 * it can also be created by a consumer and passed in — that's the escape hatch
 * for driving windows from outside the desktop (a router, a global shortcut).
 */
export interface WindowManagerApi {
  windows: WindowState[];
  focusedId: WindowId | null;
  open: (input: OpenWindowInput) => void;
  close: (id: WindowId) => void;
  closeAll: () => void;
  focus: (id: WindowId) => void;
  move: (id: WindowId, x: number, y: number) => void;
  resize: (id: WindowId, width: number, height: number) => void;
  setTitle: (id: WindowId, title: string) => void;
  minimize: (id: WindowId) => void;
  minimizeAll: () => void;
  restore: (id: WindowId) => void;
  toggleMinimize: (id: WindowId) => void;
  toggleMaximize: (id: WindowId) => void;
  /** Re-fit every window after the surface changed size. */
  reflow: () => void;
}

function viewportBounds(): Bounds {
  if (typeof window === 'undefined') return FALLBACK_BOUNDS;
  return { width: window.innerWidth, height: window.innerHeight };
}

/**
 * @param getBounds size of the surface windows live in. `Desktop` passes its
 *   measured element; standalone callers fall back to the viewport.
 */
export function useWindowManager(getBounds?: () => Bounds): WindowManagerApi {
  const [state, dispatch] = useReducer(
    windowManagerReducer,
    initialWindowManagerState,
  );

  // Held in a ref so every callback below stays referentially stable — windows
  // are memoized on identity, and unstable handlers would defeat that.
  const boundsRef = useRef(getBounds);
  boundsRef.current = getBounds;
  const bounds = useCallback(
    () => boundsRef.current?.() ?? viewportBounds(),
    [],
  );

  const open = useCallback(
    (input: OpenWindowInput) =>
      dispatch({ type: 'open', input, bounds: bounds() }),
    [bounds],
  );
  const close = useCallback((id: WindowId) => dispatch({ type: 'close', id }), []);
  const closeAll = useCallback(() => dispatch({ type: 'closeAll' }), []);
  const focus = useCallback((id: WindowId) => dispatch({ type: 'focus', id }), []);
  const move = useCallback(
    (id: WindowId, x: number, y: number) =>
      dispatch({ type: 'move', id, x, y, bounds: bounds() }),
    [bounds],
  );
  const resize = useCallback(
    (id: WindowId, width: number, height: number) =>
      dispatch({ type: 'resize', id, width, height }),
    [],
  );
  const setTitle = useCallback(
    (id: WindowId, title: string) => dispatch({ type: 'setTitle', id, title }),
    [],
  );
  const minimize = useCallback(
    (id: WindowId) => dispatch({ type: 'minimize', id }),
    [],
  );
  const minimizeAll = useCallback(() => dispatch({ type: 'minimizeAll' }), []);
  const restore = useCallback(
    (id: WindowId) => dispatch({ type: 'restore', id }),
    [],
  );
  const toggleMinimize = useCallback(
    (id: WindowId) => dispatch({ type: 'toggleMinimize', id }),
    [],
  );
  const toggleMaximize = useCallback(
    (id: WindowId) =>
      dispatch({ type: 'toggleMaximize', id, bounds: bounds() }),
    [bounds],
  );
  const reflow = useCallback(
    () => dispatch({ type: 'reflow', bounds: bounds() }),
    [bounds],
  );

  const focusedId = useMemo(
    () => focusedWindowId(state.windows),
    [state.windows],
  );

  return {
    windows: state.windows,
    focusedId,
    open,
    close,
    closeAll,
    focus,
    move,
    resize,
    setTitle,
    minimize,
    minimizeAll,
    restore,
    toggleMinimize,
    toggleMaximize,
    reflow,
  };
}
