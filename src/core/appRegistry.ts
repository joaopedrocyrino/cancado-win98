import type { DesktopApp, OpenAppOptions, OpenWindowInput } from './types';

/** A desktop shortcut derived from an app's `desktop` declaration. */
export interface DesktopShortcut {
  appId: string;
  label: string;
  icon: DesktopApp['icon'];
}

/** One separator-delimited section of the Start menu. */
export interface StartMenuGroup {
  id: string;
  items: Array<{ appId: string; label: string; icon: DesktopApp['icon'] }>;
}

const DEFAULT_START_GROUP = 'main';

export function findApp(
  apps: readonly DesktopApp[],
  appId: string,
): DesktopApp | undefined {
  return apps.find((app) => app.id === appId);
}

/** Apps that asked for a desktop shortcut, in registry order. */
export function desktopShortcuts(apps: readonly DesktopApp[]): DesktopShortcut[] {
  const shortcuts: DesktopShortcut[] = [];
  for (const app of apps) {
    if (!app.desktop) continue;
    const config = app.desktop === true ? {} : app.desktop;
    shortcuts.push({
      appId: app.id,
      label: config.label ?? app.title,
      icon: app.icon,
    });
  }
  return shortcuts;
}

/**
 * Start-menu entries bucketed by group. Groups are emitted in the order they
 * first appear in the registry, so consumers control the layout by ordering
 * their app list rather than by configuring the menu separately.
 */
export function startMenuGroups(apps: readonly DesktopApp[]): StartMenuGroup[] {
  const groups: StartMenuGroup[] = [];
  const byId = new Map<string, StartMenuGroup>();

  for (const app of apps) {
    if (!app.startMenu) continue;
    const config = app.startMenu === true ? {} : app.startMenu;
    const id = config.group ?? DEFAULT_START_GROUP;
    let group = byId.get(id);
    if (!group) {
      group = { id, items: [] };
      byId.set(id, group);
      groups.push(group);
    }
    group.items.push({
      appId: app.id,
      label: config.label ?? app.title,
      icon: app.icon,
    });
  }

  return groups;
}

/**
 * Translate a registry app (plus per-launch overrides) into the input the
 * window manager consumes. This is the only place the two models meet.
 */
export function toOpenWindowInput(
  app: DesktopApp,
  options: OpenAppOptions = {},
): OpenWindowInput {
  const window = { ...app.window, ...options.window };
  return {
    id: options.windowId ?? app.id,
    appId: app.id,
    title: options.title ?? app.title,
    icon: options.icon ?? app.icon,
    params: options.params,
    width: window.width,
    height: window.height,
    minWidth: window.minWidth,
    minHeight: window.minHeight,
    resizable: window.resizable,
    maximized: window.maximized,
  };
}
