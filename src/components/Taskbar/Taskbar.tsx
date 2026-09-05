import type { ReactNode } from 'react';
import type { WindowId, WindowState } from '../../core/types';
import { defaultLabels, type DesktopLabels } from '../../context/labels';
import { Separator } from '../../primitives/Layout';
import { SystemTray } from '../SystemTray/SystemTray';
import { cx } from '../../utils/cx';
import './Taskbar.css';

export interface TaskbarProps {
  windows: readonly WindowState[];
  focusedId: WindowId | null;
  startOpen: boolean;
  onStartClick: () => void;
  onTaskClick: (id: WindowId) => void;
  labels?: DesktopLabels;
  /** Extra tray items, rendered left of the clock. */
  tray?: ReactNode;
  showClock?: boolean;
  className?: string;
}

/** Start button, task list, system tray. Fully controlled. */
export function Taskbar({
  windows,
  focusedId,
  startOpen,
  onStartClick,
  onTaskClick,
  labels = defaultLabels,
  tray,
  showClock = true,
  className,
}: TaskbarProps) {
  return (
    <div className={cx('w98-taskbar', 'w98-bevel-out', className)}>
      <button
        type="button"
        className="w98-start-btn w98-bevel-out"
        data-pressed={startOpen || undefined}
        aria-haspopup="menu"
        aria-expanded={startOpen}
        onClick={(event) => {
          // The Start menu dismisses itself on any outside mousedown; without
          // this the same click would immediately reopen it.
          event.stopPropagation();
          onStartClick();
        }}
      >
        <span className="w98-start-flag" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        {labels.start}
      </button>

      <Separator orientation="vertical" />

      <div className="w98-taskbar-tasks">
        {windows.map((win) => (
          <button
            key={win.id}
            type="button"
            className="w98-taskbar-task w98-bevel-out"
            data-active={(!win.minimized && win.id === focusedId) || undefined}
            data-pressed={(!win.minimized && win.id === focusedId) || undefined}
            title={win.title}
            onClick={() => onTaskClick(win.id)}
          >
            {win.icon ? (
              <span className="w98-taskbar-task-icon" aria-hidden="true">
                {win.icon}
              </span>
            ) : null}
            <span className="w98-taskbar-task-label">{win.title}</span>
          </button>
        ))}
      </div>

      <SystemTray showClock={showClock}>{tray}</SystemTray>
    </div>
  );
}
