import { memo, useCallback, useRef, type ReactNode } from 'react';
import { clampIconPosition } from '../../core/geometry';
import type { Bounds, Position } from '../../core/types';
import { usePointerDrag } from '../../hooks/usePointerDrag';
import { cx } from '../../utils/cx';
import './DesktopIcon.css';

export interface DesktopIconProps {
  label: ReactNode;
  icon?: ReactNode;
  x: number;
  y: number;
  bounds: Bounds;
  selected?: boolean;
  /** Single click. */
  onSelect?: () => void;
  /** Double click, or Enter/Space. */
  onOpen: () => void;
  onMove: (position: Position) => void;
  className?: string;
}

function DesktopIconComponent({
  label,
  icon,
  x,
  y,
  bounds,
  selected,
  onSelect,
  onOpen,
  onMove,
  className,
}: DesktopIconProps) {
  const nodeRef = useRef<HTMLButtonElement>(null);
  const latest = useRef({ x, y, bounds, onMove });
  latest.current = { x, y, bounds, onMove };

  const beginDrag = useCallback(() => ({ ...latest.current }), []);

  const resolve = (dx: number, dy: number) =>
    clampIconPosition(
      { x: latest.current.x + dx, y: latest.current.y + dy },
      latest.current.bounds,
    );

  const drag = usePointerDrag<Position>({
    onStart: beginDrag,
    // Same trick as Window: paint the drag directly, commit once on release.
    onMove: ({ dx, dy }) => {
      const node = nodeRef.current;
      if (!node) return;
      const next = resolve(dx, dy);
      node.style.transform = `translate3d(${next.x}px, ${next.y}px, 0)`;
    },
    onEnd: ({ dx, dy }, _origin, moved) => {
      if (!moved) return;
      latest.current.onMove(resolve(dx, dy));
    },
  });

  return (
    <button
      ref={nodeRef}
      type="button"
      className={cx('w98-icon', className)}
      data-selected={selected || undefined}
      style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
      {...drag.handlers}
      onClick={(event) => {
        event.stopPropagation();
        // The click that terminates a drag isn't a selection.
        if (drag.consumeClickAfterDrag()) return;
        onSelect?.();
      }}
      onDoubleClick={onOpen}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onOpen();
      }}
    >
      <span className="w98-icon-img" aria-hidden="true">
        {icon}
      </span>
      <span className="w98-icon-label">{label}</span>
    </button>
  );
}

export const DesktopIcon = memo(DesktopIconComponent);
