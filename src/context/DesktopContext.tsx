import { createContext, useContext } from 'react';
import type {
  Bounds,
  DesktopApp,
  OpenAppOptions,
  OpenWindowInput,
  WindowId,
} from '../core/types';
import type { DesktopLabels } from './labels';

/**
 * What window content can do to the desktop around it.
 *
 * The shell components (Taskbar, StartMenu, …) deliberately do NOT read this —
 * they take props and stay independently usable. Context exists only so app
 * content nested arbitrarily deep inside a window can command the desktop
 * without prop-drilling through user code.
 */
export interface DesktopContextValue {
  apps: readonly DesktopApp[];
  labels: DesktopLabels;
  /** Live size of the desktop surface. */
  bounds: Bounds;
  openApp: (appId: string, options?: OpenAppOptions) => void;
  openWindow: (input: OpenWindowInput) => void;
  closeWindow: (id: WindowId) => void;
  focusWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  toggleMaximizeWindow: (id: WindowId) => void;
  setWindowTitle: (id: WindowId, title: string) => void;
  /** Show the shutdown takeover. */
  shutdown: () => void;
}

const DesktopContext = createContext<DesktopContextValue | null>(null);

export const DesktopContextProvider = DesktopContext.Provider;

/**
 * Access the desktop from inside a window.
 *
 * @throws when used outside a `<Desktop>`. Use `useDesktopOptional` for
 *   components that must also render standalone (e.g. in Storybook).
 */
export function useDesktop(): DesktopContextValue {
  const value = useContext(DesktopContext);
  if (!value) {
    throw new Error('useDesktop must be used inside a <Desktop>.');
  }
  return value;
}

/** Same as `useDesktop`, but returns `null` outside a desktop. */
export function useDesktopOptional(): DesktopContextValue | null {
  return useContext(DesktopContext);
}
