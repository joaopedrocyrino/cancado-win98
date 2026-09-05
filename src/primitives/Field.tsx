import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../utils/cx';
import './primitives.css';

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
  children?: ReactNode;
  className?: string;
}

/** Label + control + hint, stacked. */
export function Field({ label, hint, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cx('w98-field', className)}>
      {label ? (
        <label className="w98-field-label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
      {hint ? <span className="w98-field-hint">{hint}</span> : null}
    </div>
  );
}

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  hint?: ReactNode;
}

/** Sunken single-line text field. */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ label, hint, className, id, ...rest }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const input = (
      <input
        ref={ref}
        id={inputId}
        className={cx('w98-input', 'w98-bevel-in', className)}
        {...rest}
      />
    );
    if (!label && !hint) return input;
    return (
      <Field label={label} hint={hint} htmlFor={inputId}>
        {input}
      </Field>
    );
  },
);

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  hint?: ReactNode;
}

/** Sunken multi-line text field. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ label, hint, className, id, ...rest }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const control = (
      <textarea
        ref={ref}
        id={inputId}
        className={cx('w98-textarea', 'w98-bevel-in', className)}
        {...rest}
      />
    );
    if (!label && !hint) return control;
    return (
      <Field label={label} hint={hint} htmlFor={inputId}>
        {control}
      </Field>
    );
  },
);

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: ReadonlyArray<SelectOption>;
  label?: ReactNode;
  hint?: ReactNode;
}

/** Dropdown list. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ options, label, hint, className, id, ...rest }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const control = (
      <select
        ref={ref}
        id={inputId}
        className={cx('w98-select', 'w98-bevel-in', className)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {typeof option.label === 'string' ? option.label : option.value}
          </option>
        ))}
      </select>
    );
    if (!label && !hint) return control;
    return (
      <Field label={label} hint={hint} htmlFor={inputId}>
        {control}
      </Field>
    );
  },
);

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

/**
 * Checkbox / radio share one implementation: the native input stays in the
 * DOM (keyboard, form submission and a11y all come free) and is visually
 * replaced by a bevelled box next to it. The check mark is drawn in CSS from
 * `:checked`, so uncontrolled inputs work without any React state.
 */
function Toggle({
  label,
  className,
  kind,
  ...rest
}: ToggleProps & { kind: 'checkbox' | 'radio' }) {
  return (
    <label className={cx('w98-check', className)}>
      <input type={kind} className="w98-check-input" {...rest} />
      <span
        aria-hidden="true"
        className={cx(
          'w98-check-box',
          'w98-bevel-in',
          kind === 'radio' && 'w98-check-box--radio',
        )}
      />
      {label ? <span className="w98-check-label">{label}</span> : null}
    </label>
  );
}

export function Checkbox(props: ToggleProps) {
  return <Toggle {...props} kind="checkbox" />;
}

export function Radio(props: ToggleProps) {
  return <Toggle {...props} kind="radio" />;
}

export interface ProgressBarProps {
  /** 0–100. */
  value: number;
  className?: string;
}

/** Segmented progress bar. */
export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx('w98-progress', 'w98-bevel-in', className)}
    >
      <div className="w98-progress-track" style={{ width: `${clamped}%` }} />
    </div>
  );
}
