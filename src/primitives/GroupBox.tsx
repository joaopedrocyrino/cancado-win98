import type { ReactNode } from 'react';
import { cx } from '../utils/cx';
import './primitives.css';

export interface GroupBoxProps {
  label: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** A `fieldset` + `legend` group box. */
export function GroupBox({ label, children, className }: GroupBoxProps) {
  return (
    <fieldset className={cx('w98-groupbox', className)}>
      <legend className="w98-groupbox-legend">{label}</legend>
      {children}
    </fieldset>
  );
}
