import type { ReactNode } from 'react';
import { cx } from '../utils/cx';
import { Separator } from './Layout';
import './primitives.css';

export interface MenuProps {
  children?: ReactNode;
  /** Tighter rows and smaller glyphs — for tray flyouts. */
  compact?: boolean;
  className?: string;
}

/** A vertical menu surface. Positioning is the caller's job. */
export function Menu({ children, compact, className }: MenuProps) {
  return (
    <div
      role="menu"
      className={cx('w98-menu', compact && 'w98-menu--compact', className)}
    >
      {children}
    </div>
  );
}

export interface MenuItemProps {
  label: ReactNode;
  icon?: ReactNode;
  /** Underlines the first character of a string label, Win98-style. */
  accelerator?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function MenuItem({
  label,
  icon,
  accelerator,
  checked,
  disabled,
  onSelect,
  className,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      aria-checked={checked}
      disabled={disabled}
      data-checked={checked || undefined}
      className={cx('w98-menu-item', className)}
      onClick={onSelect}
    >
      <span className="w98-menu-item-glyph">{checked ? null : icon}</span>
      <span className="w98-menu-item-label">
        {accelerator && typeof label === 'string' ? (
          <>
            <u>{label.charAt(0)}</u>
            {label.slice(1)}
          </>
        ) : (
          label
        )}
      </span>
    </button>
  );
}

/** Divider between menu sections. */
export function MenuSeparator() {
  return <Separator />;
}
