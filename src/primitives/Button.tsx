import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import './primitives.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Drops the 75px minimum width — for toolbar and titlebar-sized buttons. */
  compact?: boolean;
  /** Renders the button held down (toggle buttons, open menus). */
  pressed?: boolean;
}

/** The standard raised Win98 push button. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, compact, pressed, type = 'button', ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        data-pressed={pressed || undefined}
        className={cx(
          'w98-btn',
          'w98-bevel-out',
          compact && 'w98-btn--compact',
          className,
        )}
        {...rest}
      />
    );
  },
);
