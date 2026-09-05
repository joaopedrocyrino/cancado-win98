import { Fragment, type ReactNode } from 'react';
import { startMenuGroups } from '../../core/appRegistry';
import type { DesktopApp } from '../../core/types';
import { defaultLabels, type DesktopLabels } from '../../context/labels';
import { useDismiss } from '../../hooks/useDismiss';
import { MenuItem, MenuSeparator } from '../../primitives/Menu';
import { cx } from '../../utils/cx';
import './StartMenu.css';

export interface StartMenuProps {
  apps: readonly DesktopApp[];
  onClose: () => void;
  onOpenApp: (appId: string) => void;
  /** Omit to hide the Shut Down entry. */
  onShutdown?: () => void;
  /** Branding in the vertical gutter. */
  brand?: ReactNode;
  /** Extra entries appended below the app groups, above Shut Down. */
  children?: ReactNode;
  labels?: DesktopLabels;
  className?: string;
}

/**
 * The Start menu. Entries are derived from the app registry — an app declares
 * `startMenu: { group }` and lands in the right section automatically, so
 * there's no second list to keep in sync.
 */
export function StartMenu({
  apps,
  onClose,
  onOpenApp,
  onShutdown,
  brand,
  children,
  labels = defaultLabels,
  className,
}: StartMenuProps) {
  const ref = useDismiss<HTMLDivElement>({
    active: true,
    onDismiss: onClose,
    // The Start button toggles the menu itself; letting its mousedown also
    // dismiss would make the menu close and reopen on every click.
    ignoreSelectors: ['.w98-start-btn'],
  });

  const groups = startMenuGroups(apps);

  /** Every entry closes the menu before running its action. */
  const select = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={labels.start}
      className={cx('w98-startmenu', 'w98-bevel-out', className)}
    >
      <div className="w98-startmenu-side" aria-hidden="true">
        {brand ? <div className="w98-startmenu-side-text">{brand}</div> : null}
      </div>

      <div className="w98-startmenu-items">
        {groups.map((group, index) => (
          <Fragment key={group.id}>
            {index > 0 ? <MenuSeparator /> : null}
            {group.items.map((item) => (
              <MenuItem
                key={item.appId}
                label={item.label}
                icon={item.icon}
                accelerator
                onSelect={select(() => onOpenApp(item.appId))}
              />
            ))}
          </Fragment>
        ))}

        {children ? (
          <>
            {groups.length > 0 ? <MenuSeparator /> : null}
            {children}
          </>
        ) : null}

        {onShutdown ? (
          <>
            <MenuSeparator />
            <MenuItem
              label={labels.shutDown}
              icon="⏻"
              onSelect={select(onShutdown)}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
