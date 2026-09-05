import type { ReactNode } from 'react';

/** Unique id of a live window instance. */
export type WindowId = string;

/** Size of the surface windows live in (the desktop element, not the viewport). */
export interface Bounds {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Rect extends Position, Bounds {}

/**
 * Context handed to a window's `render` function. Lets app content drive the
 * desktop (open a sibling window, close itself) without reaching for globals.
 */
export interface WindowRenderContext {
  /** Id of the window this content is rendered inside. */
  windowId: WindowId;
  /** Parameters the window was opened with. */
  params: Record<string, unknown>;
  /** Open (or focus) an app from the registry. */
  openApp: (appId: string, options?: OpenAppOptions) => void;
  /** Open an arbitrary window, bypassing the registry. */
  openWindow: (input: OpenWindowInput) => void;
  /** Close this window. */
  close: () => void;
  /** Close any window by id. */
  closeWindow: (id: WindowId) => void;
}

export type WindowRenderer = (ctx: WindowRenderContext) => ReactNode;

/** Geometry + behaviour an app wants for its window. */
export interface WindowOptions {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  /** Open maximized. */
  maximized?: boolean;
}

/**
 * A registered application. This is the single source of truth a consumer
 * feeds the desktop: it declares how the app appears on the desktop, in the
 * Start menu, and what its window renders.
 */
export interface DesktopApp {
  id: string;
  /** Window titlebar text. */
  title: string;
  /** Icon shown in the titlebar, taskbar, desktop and Start menu. */
  icon?: ReactNode;
  window?: WindowOptions;
  /**
   * Desktop shortcut. `true` reuses `title` as the label; an object customises
   * it; omitted or `false` keeps the app off the desktop.
   */
  desktop?: boolean | { label?: string };
  /**
   * Start-menu entry. `group` buckets items into separator-delimited sections
   * rendered in the order groups first appear.
   */
  startMenu?: boolean | { label?: string; group?: string };
  /** What the window body renders. */
  render: WindowRenderer;
}

export interface OpenAppOptions {
  /**
   * Instance id. Defaults to the app id, which makes apps single-instance:
   * re-opening focuses the existing window. Pass a distinct id for multi-window
   * apps (e.g. one document per window).
   */
  windowId?: WindowId;
  title?: string;
  icon?: ReactNode;
  params?: Record<string, unknown>;
  window?: WindowOptions;
}

/** Everything needed to materialise a window. */
export interface OpenWindowInput extends WindowOptions {
  id: WindowId;
  title: string;
  icon?: ReactNode;
  /** Registry app this window belongs to, when it came from one. */
  appId?: string;
  params?: Record<string, unknown>;
  /** Inline content, for windows that aren't backed by a registered app. */
  render?: WindowRenderer;
}

/** A live window. Owned exclusively by the window-manager reducer. */
export interface WindowState {
  id: WindowId;
  title: string;
  icon?: ReactNode;
  appId?: string;
  params: Record<string, unknown>;
  render?: WindowRenderer;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  resizable: boolean;
  /** Bounds to return to when un-maximizing. */
  restore?: Rect;
}
