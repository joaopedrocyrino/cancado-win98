import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../utils/cx';
import './primitives.css';

export interface StackProps {
  children?: ReactNode;
  /** Flex gap in px. */
  gap?: number;
  direction?: 'column' | 'row';
  wrap?: boolean;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  className?: string;
  style?: CSSProperties;
}

/** A flex stack — replaces the ad-hoc inline `display:flex` divs. */
export function Stack({
  children,
  gap = 0,
  direction = 'column',
  wrap = false,
  align,
  justify,
  className,
  style,
}: StackProps) {
  return (
    <div
      className={cx(
        'w98-stack',
        direction === 'row' && 'w98-stack--row',
        wrap && 'w98-stack--wrap',
        className,
      )}
      style={{ gap, alignItems: align, justifyContent: justify, ...style }}
    >
      {children}
    </div>
  );
}

export interface FlushBodyProps {
  children?: ReactNode;
  /** Lay children out as a flex column (content + status strip). */
  column?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Cancels the window body padding so content sits flush against the frame.
 * Use for iframes, canvases and full-bleed grids.
 */
export function FlushBody({ children, column, className, style }: FlushBodyProps) {
  return (
    <div
      className={cx('w98-flush', column && 'w98-flush--column', className)}
      style={style}
    >
      {children}
    </div>
  );
}

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/** The etched 2px divider used in menus and the taskbar. */
export function Separator({
  orientation = 'horizontal',
  className,
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cx(
        'w98-separator',
        orientation === 'vertical' && 'w98-separator--vertical',
        className,
      )}
    />
  );
}
