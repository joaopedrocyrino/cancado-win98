import {
  CASCADE_CYCLE,
  CASCADE_STEP,
  ICON_HEIGHT,
  ICON_MARGIN,
  ICON_START,
  ICON_STEP_Y,
  ICON_WIDTH,
  TASKBAR_HEIGHT,
} from './constants';
import type { Bounds, Position, Rect } from './types';

/** Clamp `value` into `[min, max]`, tolerating an inverted range. */
export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

/** Usable desktop area — the surface minus the taskbar strip. */
export function workArea(bounds: Bounds): Bounds {
  return {
    width: bounds.width,
    height: Math.max(0, bounds.height - TASKBAR_HEIGHT),
  };
}

/**
 * Where a freshly opened window lands: centred-ish, then nudged down-right by
 * the cascade counter so a burst of windows fans out instead of stacking.
 */
export function cascadePosition(
  size: Bounds,
  bounds: Bounds,
  cascadeIndex: number,
): Position {
  const area = workArea(bounds);
  const offset = (cascadeIndex % CASCADE_CYCLE) * CASCADE_STEP;
  return {
    x: Math.max(8, Math.round((area.width - size.width) / 2 - 80) + offset),
    y: Math.max(8, Math.round((area.height - size.height) / 2 - 60) + offset),
  };
}

/** Shrink a requested window size so it always fits the surface. */
export function fitWindowSize(size: Bounds, bounds: Bounds): Bounds {
  const area = workArea(bounds);
  return {
    width: Math.max(1, Math.min(size.width, area.width - 40)),
    height: Math.max(1, Math.min(size.height, area.height - 40)),
  };
}

/**
 * Keep a dragged window reachable: its titlebar may hang off the left/right
 * edges, but never above the top or below the taskbar, so it can always be
 * grabbed again.
 */
export function clampWindowPosition(
  position: Position,
  size: Bounds,
  bounds: Bounds,
): Position {
  return {
    x: clamp(position.x, -(size.width - 40), bounds.width - 40),
    y: clamp(position.y, 0, bounds.height - TASKBAR_HEIGHT - 18),
  };
}

/** Bounds a maximized window occupies. */
export function maximizedRect(bounds: Bounds): Rect {
  const area = workArea(bounds);
  return { x: 0, y: 0, width: area.width, height: area.height };
}

/**
 * Auto-layout for desktop shortcuts: a left-hand column that wraps into a new
 * column once it runs past the bottom of the work area — same as Windows.
 */
export function defaultIconPosition(index: number, bounds: Bounds): Position {
  const area = workArea(bounds);
  const usableHeight = Math.max(ICON_STEP_Y, area.height - ICON_START.y);
  const perColumn = Math.max(1, Math.floor(usableHeight / ICON_STEP_Y));
  const column = Math.floor(index / perColumn);
  const row = index % perColumn;
  return {
    x: ICON_START.x + column * (ICON_WIDTH + ICON_MARGIN),
    y: ICON_START.y + row * ICON_STEP_Y,
  };
}

/** Keep a dragged icon fully inside the work area. */
export function clampIconPosition(position: Position, bounds: Bounds): Position {
  const area = workArea(bounds);
  return {
    x: clamp(position.x, ICON_MARGIN, area.width - ICON_WIDTH - ICON_MARGIN),
    y: clamp(position.y, ICON_MARGIN, area.height - ICON_HEIGHT - ICON_MARGIN),
  };
}
