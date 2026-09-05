import {
  BASE_Z,
  DEFAULT_MIN_HEIGHT,
  DEFAULT_MIN_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
} from './constants';
import {
  cascadePosition,
  clampWindowPosition,
  fitWindowSize,
  maximizedRect,
} from './geometry';
import type { Bounds, OpenWindowInput, WindowId, WindowState } from './types';

/**
 * The whole window-manager state. Pure data — no DOM, no React — so the
 * reducer below is directly unit-testable and every transition is explicit.
 */
export interface WindowManagerState {
  windows: WindowState[];
  /** Highest z handed out so far; incremented on every focus/open. */
  z: number;
  /** How many windows have been opened, for cascade placement. */
  cascade: number;
}

export const initialWindowManagerState: WindowManagerState = {
  windows: [],
  z: BASE_Z,
  cascade: 0,
};

/**
 * Every action carries the surface `bounds` it was computed against where
 * placement depends on them. The reducer stays pure: the React layer measures,
 * the reducer decides.
 */
export type WindowManagerAction =
  | { type: 'open'; input: OpenWindowInput; bounds: Bounds }
  | { type: 'close'; id: WindowId }
  | { type: 'closeAll' }
  | { type: 'focus'; id: WindowId }
  | { type: 'move'; id: WindowId; x: number; y: number; bounds: Bounds }
  | { type: 'resize'; id: WindowId; width: number; height: number }
  | { type: 'setTitle'; id: WindowId; title: string }
  | { type: 'minimize'; id: WindowId }
  | { type: 'minimizeAll' }
  | { type: 'restore'; id: WindowId }
  | { type: 'toggleMinimize'; id: WindowId }
  | { type: 'toggleMaximize'; id: WindowId; bounds: Bounds }
  | { type: 'reflow'; bounds: Bounds };

// ---- selectors ---------------------------------------------------------

export function topZ(windows: WindowState[]): number {
  return windows.reduce((max, w) => (w.z > max ? w.z : max), 0);
}

/** The window that currently has focus: top-most among the non-minimized. */
export function focusedWindowId(windows: WindowState[]): WindowId | null {
  let best: WindowState | null = null;
  for (const w of windows) {
    if (w.minimized) continue;
    if (!best || w.z > best.z) best = w;
  }
  return best?.id ?? null;
}

export function findWindow(
  windows: WindowState[],
  id: WindowId,
): WindowState | undefined {
  return windows.find((w) => w.id === id);
}

// ---- helpers -----------------------------------------------------------

/** Map one window by id, returning the original array when nothing changed. */
function patch(
  state: WindowManagerState,
  id: WindowId,
  update: (win: WindowState) => WindowState,
): WindowManagerState {
  let changed = false;
  const windows = state.windows.map((w) => {
    if (w.id !== id) return w;
    const next = update(w);
    if (next !== w) changed = true;
    return next;
  });
  return changed ? { ...state, windows } : state;
}

/** Raise a window to the top of the stack and un-minimize it. */
function raise(state: WindowManagerState, id: WindowId): WindowManagerState {
  const z = state.z + 1;
  return {
    ...state,
    z,
    windows: state.windows.map((w) =>
      w.id === id ? { ...w, z, minimized: false } : w,
    ),
  };
}

function createWindow(
  input: OpenWindowInput,
  bounds: Bounds,
  z: number,
  cascade: number,
): WindowState {
  const size = fitWindowSize(
    {
      width: input.width ?? DEFAULT_WINDOW_WIDTH,
      height: input.height ?? DEFAULT_WINDOW_HEIGHT,
    },
    bounds,
  );
  const position = cascadePosition(size, bounds, cascade);
  const base: WindowState = {
    id: input.id,
    title: input.title,
    icon: input.icon,
    appId: input.appId,
    params: input.params ?? {},
    render: input.render,
    ...position,
    ...size,
    minWidth: input.minWidth ?? DEFAULT_MIN_WIDTH,
    minHeight: input.minHeight ?? DEFAULT_MIN_HEIGHT,
    z,
    minimized: false,
    maximized: false,
    resizable: input.resizable ?? true,
  };

  if (!input.maximized) return base;
  return {
    ...base,
    maximized: true,
    restore: { ...position, ...size },
    ...maximizedRect(bounds),
  };
}

// ---- reducer -----------------------------------------------------------

export function windowManagerReducer(
  state: WindowManagerState,
  action: WindowManagerAction,
): WindowManagerState {
  switch (action.type) {
    case 'open': {
      const { input, bounds } = action;
      // Same id twice means "focus what's already open" — that's what makes
      // registry apps single-instance by default.
      if (findWindow(state.windows, input.id)) {
        return patch(raise(state, input.id), input.id, (w) => ({
          ...w,
          title: input.title ?? w.title,
          params: input.params ?? w.params,
        }));
      }
      const z = state.z + 1;
      return {
        windows: [...state.windows, createWindow(input, bounds, z, state.cascade)],
        z,
        cascade: state.cascade + 1,
      };
    }

    case 'close': {
      const windows = state.windows.filter((w) => w.id !== action.id);
      return windows.length === state.windows.length ? state : { ...state, windows };
    }

    case 'closeAll':
      return state.windows.length === 0 ? state : { ...state, windows: [] };

    case 'focus': {
      const target = findWindow(state.windows, action.id);
      if (!target) return state;
      if (!target.minimized && target.z === topZ(state.windows)) return state;
      return raise(state, action.id);
    }

    case 'move':
      return patch(state, action.id, (w) => {
        if (w.maximized) return w;
        const next = clampWindowPosition(
          { x: action.x, y: action.y },
          { width: w.width, height: w.height },
          action.bounds,
        );
        if (next.x === w.x && next.y === w.y) return w;
        return { ...w, ...next };
      });

    case 'resize':
      return patch(state, action.id, (w) => {
        if (w.maximized || !w.resizable) return w;
        const width = Math.max(w.minWidth, action.width);
        const height = Math.max(w.minHeight, action.height);
        if (width === w.width && height === w.height) return w;
        return { ...w, width, height };
      });

    case 'setTitle':
      return patch(state, action.id, (w) =>
        w.title === action.title ? w : { ...w, title: action.title },
      );

    case 'minimize':
      return patch(state, action.id, (w) =>
        w.minimized ? w : { ...w, minimized: true },
      );

    case 'minimizeAll': {
      if (state.windows.every((w) => w.minimized)) return state;
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.minimized ? w : { ...w, minimized: true },
        ),
      };
    }

    case 'restore': {
      const target = findWindow(state.windows, action.id);
      if (!target) return state;
      return raise(state, action.id);
    }

    case 'toggleMinimize': {
      const target = findWindow(state.windows, action.id);
      if (!target) return state;
      // Clicking the taskbar button of the focused window minimizes it;
      // clicking any other button brings that window forward.
      const isFocused = !target.minimized && target.z === topZ(state.windows);
      if (isFocused) {
        return patch(state, action.id, (w) => ({ ...w, minimized: true }));
      }
      return raise(state, action.id);
    }

    case 'toggleMaximize':
      return patch(state, action.id, (w) => {
        if (w.maximized) {
          const { restore, ...rest } = w;
          return { ...rest, ...(restore ?? {}), maximized: false };
        }
        return {
          ...w,
          maximized: true,
          restore: { x: w.x, y: w.y, width: w.width, height: w.height },
          ...maximizedRect(action.bounds),
        };
      });

    case 'reflow': {
      // The surface changed size (window resize, rotation): keep maximized
      // windows filling it and drag every other window back into reach.
      const { bounds } = action;
      let changed = false;
      const windows = state.windows.map((w) => {
        if (w.maximized) {
          const rect = maximizedRect(bounds);
          if (rect.width === w.width && rect.height === w.height) return w;
          changed = true;
          return { ...w, ...rect };
        }
        const size = fitWindowSize({ width: w.width, height: w.height }, bounds);
        const position = clampWindowPosition({ x: w.x, y: w.y }, size, bounds);
        if (
          size.width === w.width &&
          size.height === w.height &&
          position.x === w.x &&
          position.y === w.y
        ) {
          return w;
        }
        changed = true;
        return { ...w, ...size, ...position };
      });
      return changed ? { ...state, windows } : state;
    }

    default:
      return state;
  }
}
