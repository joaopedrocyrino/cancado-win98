import { useId, type ReactNode } from 'react';
import { cx } from '../utils/cx';
import './primitives.css';

export interface TabItem<T extends string> {
  id: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<T extends string> {
  items: ReadonlyArray<TabItem<T>>;
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

/**
 * A Win98 tab strip. Controlled — the active tab and its panel content stay
 * with the caller, so tabs can drive anything (a window body, a sub-view).
 */
export function Tabs<T extends string>({
  items,
  active,
  onChange,
  className,
}: TabsProps<T>) {
  const baseId = useId();
  return (
    <div className={cx('w98-tabs', className)} role="tablist">
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${baseId}-${item.id}`}
            aria-selected={selected}
            aria-controls={`${baseId}-${item.id}-panel`}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            data-active={selected || undefined}
            className="w98-tab"
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps {
  children?: ReactNode;
  className?: string;
}

/** Body area below a tab strip. */
export function TabPanel({ children, className }: TabPanelProps) {
  return (
    <div role="tabpanel" className={cx('w98-tabpanel', 'w98-bevel-out', className)}>
      {children}
    </div>
  );
}
