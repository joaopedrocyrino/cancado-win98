import type { ReactNode } from 'react';
import { cx } from '../utils/cx';
import './primitives.css';

export interface ToolbarProps {
  children?: ReactNode;
  className?: string;
}

/** A strip above flush content — instructions, tool buttons. */
export function Toolbar({ children, className }: ToolbarProps) {
  return <div className={cx('w98-toolbar', className)}>{children}</div>;
}

export interface StatusBarProps {
  children?: ReactNode;
  className?: string;
}

/** A strip below flush content — captions, counts, hints. */
export function StatusBar({ children, className }: StatusBarProps) {
  return <div className={cx('w98-statusbar', className)}>{children}</div>;
}

export interface StatusFieldProps {
  children?: ReactNode;
  /** Absorb the leftover width instead of hugging the content. */
  grow?: boolean;
  className?: string;
}

/** A sunken well inside a StatusBar, as in Explorer's segmented status line. */
export function StatusField({ children, grow, className }: StatusFieldProps) {
  return (
    <div
      className={cx(
        'w98-statusbar-field',
        'w98-bevel-in',
        grow && 'w98-statusbar-field--grow',
        className,
      )}
    >
      {children}
    </div>
  );
}
