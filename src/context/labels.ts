/**
 * Every user-visible string in the shell. Consumers pass a partial override,
 * which is how the kit stays i18n-library-agnostic — plug in whatever
 * translation layer you already have and hand the result to `<Desktop labels>`.
 */
export interface DesktopLabels {
  start: string;
  shutDown: string;
  shutdownMessage: string;
  shutdownHint: string;
  minimize: string;
  maximize: string;
  restore: string;
  close: string;
}

export const defaultLabels: DesktopLabels = {
  start: 'Start',
  shutDown: 'Shut Down...',
  shutdownMessage: "It's now safe to turn off your computer.",
  shutdownHint: 'Click anywhere to restart.',
  minimize: 'Minimize',
  maximize: 'Maximize',
  restore: 'Restore',
  close: 'Close',
};

export function resolveLabels(overrides?: Partial<DesktopLabels>): DesktopLabels {
  return overrides ? { ...defaultLabels, ...overrides } : defaultLabels;
}
