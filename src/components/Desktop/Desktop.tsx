import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { desktopShortcuts, findApp, toOpenWindowInput } from '../../core/appRegistry';
import type {
  DesktopApp,
  OpenAppOptions,
  OpenWindowInput,
  WindowId,
  WindowRenderContext,
  WindowState,
} from '../../core/types';
import {
  DesktopContextProvider,
  type DesktopContextValue,
} from '../../context/DesktopContext';
import { resolveLabels, type DesktopLabels } from '../../context/labels';
import { useDesktopIcons } from '../../hooks/useDesktopIcons';
import { useElementSize } from '../../hooks/useElementSize';
import { useWindowManager, type WindowManagerApi } from '../../hooks/useWindowManager';
import { cx } from '../../utils/cx';
import { DesktopIcon } from '../DesktopIcon/DesktopIcon';
import { ShutdownScreen } from '../ShutdownScreen/ShutdownScreen';
import { StartMenu } from '../StartMenu/StartMenu';
import { Taskbar } from '../Taskbar/Taskbar';
import { Window } from '../Window/Window';
import './Desktop.css';

/** Built-in wallpapers, or any CSS `background` shorthand for a custom one. */
export type Wallpaper = 'teal' | 'bliss' | 'dither' | (string & {});

const PRESET_WALLPAPERS = new Set(['teal', 'bliss', 'dither']);

export interface DesktopProps {
  /** The app registry — the single source of truth for icons, menu and windows. */
  apps?: readonly DesktopApp[];
  wallpaper?: Wallpaper;
  /** Branding shown in the Start menu's vertical gutter. */
  brand?: ReactNode;
  /** Override any shell string. */
  labels?: Partial<DesktopLabels>;
  /** Extra system-tray items, rendered left of the clock. */
  tray?: ReactNode;
  showClock?: boolean;
  /** Extra entries appended to the Start menu, above Shut Down. */
  startMenuExtra?: ReactNode;
  /** App ids opened once on mount. */
  initialApps?: readonly string[];
  /**
   * Called when Shut Down is picked. Return `false` to suppress the built-in
   * takeover screen and handle it yourself.
   */
  onShutdown?: () => void | false;
  /** Hide the Shut Down entry entirely. */
  showShutdown?: boolean;
  /**
   * Bring your own window manager (from `useWindowManager`) to drive windows
   * from outside the desktop — a router, a keyboard shortcut, a test.
   */
  windowManager?: WindowManagerApi;
  /** Pin the desktop to the viewport. Off means it fills its parent box. */
  fullscreen?: boolean;
  /** Extra layers rendered above the windows (overlays, CRT effects). */
  children?: ReactNode;
  className?: string;
}

/**
 * The complete Win98 shell: wallpaper, shortcuts, windows, taskbar and Start
 * menu, wired to a window manager.
 *
 * Layering, from the inside out:
 * - `core/`      pure state + geometry, no React
 * - `hooks/`     React bindings around that state
 * - `components/` presentational pieces, each usable on its own
 * - `Desktop`    the only place that composes them
 */
export function Desktop({
  apps = [],
  wallpaper = 'teal',
  brand,
  labels: labelOverrides,
  tray,
  showClock = true,
  startMenuExtra,
  initialApps,
  onShutdown,
  showShutdown = true,
  windowManager,
  fullscreen = true,
  children,
  className,
}: DesktopProps) {
  const { ref: surfaceRef, size: bounds, sizeRef } = useElementSize<HTMLDivElement>();
  const getBounds = useCallback(() => sizeRef.current, [sizeRef]);

  // A caller-supplied manager wins; otherwise the desktop owns one. The hook
  // still runs unconditionally so hook order stays stable across renders.
  const ownWindowManager = useWindowManager(getBounds);
  const wm = windowManager ?? ownWindowManager;

  const labels = useMemo(() => resolveLabels(labelOverrides), [labelOverrides]);
  const [startOpen, setStartOpen] = useState(false);
  const [shuttingDown, setShuttingDown] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const shortcuts = useMemo(() => desktopShortcuts(apps), [apps]);
  const shortcutIds = useMemo(() => shortcuts.map((s) => s.appId), [shortcuts]);
  const { positions, moveIcon } = useDesktopIcons(shortcutIds, bounds);

  // ---- actions ---------------------------------------------------------

  const { open, reflow } = wm;

  const openApp = useCallback(
    (appId: string, options?: OpenAppOptions) => {
      const app = findApp(apps, appId);
      if (!app) {
        console.warn(`[cancado-win98] No app registered with id "${appId}".`);
        return;
      }
      open(toOpenWindowInput(app, options));
    },
    [apps, open],
  );

  const openWindow = useCallback(
    (input: OpenWindowInput) => open(input),
    [open],
  );

  const requestShutdown = useCallback(() => {
    if (onShutdown?.() === false) return;
    setShuttingDown(true);
  }, [onShutdown]);

  // Windows are placed and clamped against the surface, so a resized surface
  // has to re-fit them or they end up off-screen and unreachable.
  useEffect(() => {
    reflow();
  }, [bounds.width, bounds.height, reflow]);

  const openedInitialRef = useRef(false);
  useEffect(() => {
    if (openedInitialRef.current || !initialApps?.length) return;
    openedInitialRef.current = true;
    initialApps.forEach((appId) => openApp(appId));
  }, [initialApps, openApp]);

  // ---- context ---------------------------------------------------------

  const contextValue = useMemo<DesktopContextValue>(
    () => ({
      apps,
      labels,
      bounds,
      openApp,
      openWindow,
      closeWindow: wm.close,
      focusWindow: wm.focus,
      minimizeWindow: wm.minimize,
      toggleMaximizeWindow: wm.toggleMaximize,
      setWindowTitle: wm.setTitle,
      shutdown: requestShutdown,
    }),
    [
      apps,
      labels,
      bounds,
      openApp,
      openWindow,
      wm.close,
      wm.focus,
      wm.minimize,
      wm.toggleMaximize,
      wm.setTitle,
      requestShutdown,
    ],
  );

  // ---- rendering -------------------------------------------------------

  const renderWindowBody = (win: WindowState): ReactNode => {
    const render = win.render ?? (win.appId ? findApp(apps, win.appId)?.render : undefined);
    if (!render) return null;
    const ctx: WindowRenderContext = {
      windowId: win.id,
      params: win.params,
      openApp,
      openWindow,
      close: () => wm.close(win.id),
      closeWindow: wm.close,
    };
    return render(ctx);
  };

  const isPreset = PRESET_WALLPAPERS.has(wallpaper);

  return (
    <DesktopContextProvider value={contextValue}>
      <div
        className={cx(
          'w98-root',
          'w98-desktop-host',
          fullscreen && 'w98-root--fullscreen',
          className,
        )}
      >
        <div
          ref={surfaceRef}
          className={cx('w98-desktop', isPreset && `w98-desktop--${wallpaper}`)}
          style={isPreset ? undefined : { background: wallpaper }}
          onPointerDown={() => setSelectedIcon(null)}
        >
          <div className="w98-desktop-icons">
            {shortcuts.map((shortcut) => {
              const position = positions[shortcut.appId];
              return (
                <DesktopIcon
                  key={shortcut.appId}
                  label={shortcut.label}
                  icon={shortcut.icon}
                  x={position?.x ?? 8}
                  y={position?.y ?? 8}
                  bounds={bounds}
                  selected={selectedIcon === shortcut.appId}
                  onSelect={() => setSelectedIcon(shortcut.appId)}
                  onOpen={() => openApp(shortcut.appId)}
                  onMove={(next) => moveIcon(shortcut.appId, next)}
                />
              );
            })}
          </div>

          {wm.windows.map((win) => (
            <Window
              key={win.id}
              win={win}
              focused={win.id === wm.focusedId}
              bounds={bounds}
              labels={labels}
              onFocus={() => wm.focus(win.id)}
              onClose={() => wm.close(win.id)}
              onMinimize={() => wm.minimize(win.id)}
              onToggleMaximize={() => wm.toggleMaximize(win.id)}
              onMove={(x, y) => wm.move(win.id, x, y)}
              onResize={(width, height) => wm.resize(win.id, width, height)}
            >
              {renderWindowBody(win)}
            </Window>
          ))}

          {children}

          {startOpen ? (
            <StartMenu
              apps={apps}
              labels={labels}
              brand={brand}
              onClose={() => setStartOpen(false)}
              onOpenApp={(appId: string) => openApp(appId)}
              onShutdown={showShutdown ? requestShutdown : undefined}
            >
              {startMenuExtra}
            </StartMenu>
          ) : null}

          <Taskbar
            windows={wm.windows}
            focusedId={wm.focusedId}
            startOpen={startOpen}
            labels={labels}
            tray={tray}
            showClock={showClock}
            onStartClick={() => setStartOpen((prev) => !prev)}
            onTaskClick={(id: WindowId) => wm.toggleMinimize(id)}
          />
        </div>

        {shuttingDown ? (
          <ShutdownScreen
            labels={labels}
            onDismiss={() => setShuttingDown(false)}
          />
        ) : null}
      </div>
    </DesktopContextProvider>
  );
}
