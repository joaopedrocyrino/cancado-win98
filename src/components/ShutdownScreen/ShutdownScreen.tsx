import { useEffect } from 'react';
import { defaultLabels, type DesktopLabels } from '../../context/labels';
import { cx } from '../../utils/cx';
import './ShutdownScreen.css';

export interface ShutdownScreenProps {
  /** Click or key press dismisses; omit to make the screen terminal. */
  onDismiss?: () => void;
  labels?: DesktopLabels;
  className?: string;
}

/** The black "It's now safe to turn off your computer" takeover. */
export function ShutdownScreen({
  onDismiss,
  labels = defaultLabels,
  className,
}: ShutdownScreenProps) {
  useEffect(() => {
    if (!onDismiss) return;
    const onKeyDown = () => onDismiss();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onDismiss]);

  return (
    <div
      className={cx('w98-shutdown', className)}
      role="alertdialog"
      aria-label={labels.shutdownMessage}
      onClick={onDismiss}
    >
      <div className="w98-shutdown-message">{labels.shutdownMessage}</div>
      {onDismiss ? (
        <div className="w98-shutdown-hint">{labels.shutdownHint}</div>
      ) : null}
    </div>
  );
}
