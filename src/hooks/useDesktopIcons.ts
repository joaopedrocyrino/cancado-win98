import { useCallback, useMemo, useState } from 'react';
import { clampIconPosition, defaultIconPosition } from '../core/geometry';
import type { Bounds, Position } from '../core/types';

export interface DesktopIconLayout {
  /** Resolved position for every shortcut id, auto-laid-out or user-placed. */
  positions: Record<string, Position>;
  moveIcon: (id: string, position: Position) => void;
  /** Drop all user placements and fall back to the auto grid. */
  resetLayout: () => void;
}

/**
 * Owns where desktop shortcuts sit.
 *
 * Only icons the user actually dragged are stored; everything else is derived
 * from its index on each render. That keeps the state minimal and means adding
 * or removing an app re-flows the untouched icons automatically.
 */
export function useDesktopIcons(
  ids: readonly string[],
  bounds: Bounds,
): DesktopIconLayout {
  const [placed, setPlaced] = useState<Record<string, Position>>({});

  const positions = useMemo(() => {
    const result: Record<string, Position> = {};
    ids.forEach((id, index) => {
      const custom = placed[id];
      result[id] = custom
        ? clampIconPosition(custom, bounds)
        : defaultIconPosition(index, bounds);
    });
    return result;
  }, [ids, placed, bounds]);

  const moveIcon = useCallback((id: string, position: Position) => {
    setPlaced((prev) => {
      const current = prev[id];
      if (current && current.x === position.x && current.y === position.y) {
        return prev;
      }
      return { ...prev, [id]: position };
    });
  }, []);

  const resetLayout = useCallback(
    () => setPlaced((prev) => (Object.keys(prev).length ? {} : prev)),
    [],
  );

  return { positions, moveIcon, resetLayout };
}
