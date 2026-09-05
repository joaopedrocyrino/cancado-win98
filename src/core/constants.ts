/**
 * Shared layout constants. They live in the pure `core` layer so the reducer
 * (which never touches the DOM) and the CSS-facing components agree on them.
 */

/** Height of the taskbar strip, in px. Mirrors `--w98-taskbar-height`. */
export const TASKBAR_HEIGHT = 28;

/** Default window size when an app doesn't specify one. */
export const DEFAULT_WINDOW_WIDTH = 480;
export const DEFAULT_WINDOW_HEIGHT = 360;

/** Floor a window can never be resized below. */
export const DEFAULT_MIN_WIDTH = 200;
export const DEFAULT_MIN_HEIGHT = 120;

/** Surface size assumed before the desktop element has been measured. */
export const FALLBACK_BOUNDS = { width: 1024, height: 768 };

/** Desktop icon metrics. Mirror `.w98-icon` in DesktopIcon.css. */
export const ICON_WIDTH = 92;
export const ICON_HEIGHT = 88;
export const ICON_MARGIN = 8;
export const ICON_STEP_Y = 104;
export const ICON_START = { x: 8, y: 8 };

/** Pixels a pointer must travel before an icon press becomes a drag. */
export const DRAG_THRESHOLD = 4;

/** Offset applied to each successive window, and how many before it repeats. */
export const CASCADE_STEP = 24;
export const CASCADE_CYCLE = 6;

/** z-index windows start stacking from. */
export const BASE_Z = 10;
