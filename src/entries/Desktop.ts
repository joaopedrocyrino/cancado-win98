import './tokens';

export { Desktop } from '../components/Desktop';
export type { DesktopProps, Wallpaper } from '../components/Desktop';
export {
  DesktopContextProvider,
  useDesktop,
  useDesktopOptional,
  defaultLabels,
  resolveLabels,
} from '../context';
export type { DesktopContextValue, DesktopLabels } from '../context';
export type {
  DesktopApp,
  OpenAppOptions,
  OpenWindowInput,
  WindowOptions,
  WindowRenderContext,
  WindowRenderer,
  WindowState,
} from '../core/types';
export { useWindowManager } from '../hooks/useWindowManager';
export type { WindowManagerApi } from '../hooks/useWindowManager';
