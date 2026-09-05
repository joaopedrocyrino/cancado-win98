import type { MouseEvent, ReactNode } from 'react';
import { cx } from '../utils/cx';
import './primitives.css';

export interface IconGridProps {
  children?: ReactNode;
  /** Click on empty grid space — typically clears the selection. */
  onBackgroundClick?: () => void;
  className?: string;
}

/** An auto-filling grid of `IconTile`s. */
export function IconGrid({
  children,
  onBackgroundClick,
  className,
}: IconGridProps) {
  return (
    <div className={cx('w98-icon-grid', className)} onClick={onBackgroundClick}>
      {children}
    </div>
  );
}

export interface IconTileProps {
  thumb: ReactNode;
  label: ReactNode;
  selected?: boolean;
  /** Single click — typically selects. */
  onSelect?: () => void;
  /** Double click — typically opens. */
  onOpen?: () => void;
  className?: string;
}

/** A selectable, double-click-to-open tile. */
export function IconTile({
  thumb,
  label,
  selected,
  onSelect,
  onOpen,
  className,
}: IconTileProps) {
  const handleClick = onSelect
    ? (event: MouseEvent) => {
        // Don't let the click reach IconGrid's background handler, which
        // would immediately clear the selection we just made.
        event.stopPropagation();
        onSelect();
      }
    : undefined;

  return (
    <button
      type="button"
      className={cx('w98-tile', className)}
      data-selected={selected || undefined}
      onClick={handleClick}
      onDoubleClick={onOpen}
    >
      <span className="w98-tile-thumb">{thumb}</span>
      <span className="w98-tile-label">{label}</span>
    </button>
  );
}
