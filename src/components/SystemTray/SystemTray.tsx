import {
  useId,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { formatClockTime, useClock } from '../../hooks/useClock';
import { useDismiss } from '../../hooks/useDismiss';
import { Menu, MenuItem } from '../../primitives/Menu';
import { cx } from '../../utils/cx';
import './SystemTray.css';

export interface ClockProps {
  /** Override the default `h:mm AM/PM` rendering. */
  format?: (date: Date) => string;
  /** Tick interval in ms. Defaults to 30s — enough for a minute-resolution clock. */
  intervalMs?: number;
  className?: string;
}

/** The tray clock. */
export function Clock({ format = formatClockTime, intervalMs, className }: ClockProps) {
  const now = useClock(intervalMs);
  return (
    <span
      className={cx('w98-tray-clock', className)}
      title={now.toLocaleString()}
    >
      {format(now)}
    </span>
  );
}

export interface TrayMenuOption {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TrayMenuButtonProps {
  /** Button face — usually a short code or glyph. */
  children: ReactNode;
  options: ReadonlyArray<TrayMenuOption>;
  /** Which option is currently active; gets a bullet. */
  value?: string;
  onSelect: (id: string) => void;
  title?: string;
  className?: string;
}

/**
 * A tray button with a flyout menu above it — the pattern the language
 * indicator, volume and network icons all follow.
 */
export function TrayMenuButton({
  children,
  options,
  value,
  onSelect,
  title,
  className,
}: TrayMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | null>(
    null,
  );
  // Scoped to this button, not every tray button: clicking a *different* tray
  // button must still dismiss this menu.
  const buttonId = useId();
  const popupRef = useDismiss<HTMLDivElement>({
    active: open,
    onDismiss: () => setOpen(false),
    ignoreSelectors: [`[data-tray-button="${CSS.escape(buttonId)}"]`],
  });

  const toggle = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Anchored to the viewport, so it escapes the taskbar's overflow clip.
    setAnchor({
      left: rect.left,
      bottom: window.innerHeight - rect.top + 2,
    });
    setOpen((prev) => !prev);
  };

  return (
    <>
      <button
        type="button"
        title={title}
        data-tray-button={buttonId}
        className={cx('w98-tray-btn', 'w98-bevel-out', className)}
        data-pressed={open || undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        {children}
      </button>
      {open && anchor ? (
        <div
          ref={popupRef}
          className="w98-tray-popup"
          style={{ left: anchor.left, bottom: anchor.bottom }}
        >
          <Menu compact className="w98-bevel-out">
            {options.map((option) => (
              <MenuItem
                key={option.id}
                label={option.label}
                icon={option.icon}
                checked={option.id === value}
                disabled={option.disabled}
                onSelect={() => {
                  setOpen(false);
                  onSelect(option.id);
                }}
              />
            ))}
          </Menu>
        </div>
      ) : null}
    </>
  );
}

export interface SystemTrayProps {
  /** Items rendered before the clock. */
  children?: ReactNode;
  /** Hide the clock when the host wants full control of the tray. */
  showClock?: boolean;
  clockFormat?: ClockProps['format'];
  className?: string;
}

/** The sunken well at the right end of the taskbar. */
export function SystemTray({
  children,
  showClock = true,
  clockFormat,
  className,
}: SystemTrayProps) {
  return (
    <div className={cx('w98-tray', 'w98-bevel-in', className)}>
      {children}
      {showClock ? <Clock format={clockFormat} /> : null}
    </div>
  );
}
