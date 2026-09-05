// The headless window manager: state, actions and the React binding, without
// any of the shell chrome. Build your own desktop on top of it.
export { useWindowManager } from '../hooks/useWindowManager';
export type { WindowManagerApi } from '../hooks/useWindowManager';
export {
  windowManagerReducer,
  initialWindowManagerState,
  focusedWindowId,
  findWindow,
  topZ,
} from '../core/windowManager';
export type {
  WindowManagerState,
  WindowManagerAction,
} from '../core/windowManager';
export type {
  Bounds,
  OpenWindowInput,
  Position,
  Rect,
  WindowId,
  WindowState,
} from '../core/types';
