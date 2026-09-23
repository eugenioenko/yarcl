import { useId, type ComponentProps, type ReactNode } from 'react';
import config from '@yarcl/config';
import { cx, typeClass } from '../classes';
import { FieldContext } from '../field-context';

/** Props for {@link Field}. */
export interface FieldProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Visible label for the control. */
  label: ReactNode;
  /** Helper text shown below the control. */
  description?: ReactNode;
  /** Error message. When set, the control is marked invalid and styled with `defaults.errorColor`. */
  error?: ReactNode;
  /** Marks the control as required and shows an indicator next to the label. */
  required?: boolean;
  /** A single form control: {@link Input}, {@link Textarea}, {@link Checkbox} or {@link Switch}. */
  children: ReactNode;
}

/**
 * Wraps a form control with a label, helper text and an error message.
 * The control receives `id`, `aria-describedby`, `aria-invalid` and `required` automatically;
 * don't set its `id` yourself.
 *
 * @example
 * ```tsx
 * <Field label="Email" description="We never share it." error={errors.email} required>
 *   <Input type="email" />
 * </Field>
 * ```
 */
export function Field({ label, description, error, required, children, className, ...props }: FieldProps) {
  const id = useId();
  const descriptionId = description != null ? `${id}-description` : undefined;
  const errorId = error != null && error !== false ? `${id}-error` : undefined;

  return (
    <FieldContext.Provider
      value={{ id, describedBy: cx(descriptionId, errorId) || undefined, invalid: errorId != null, required }}
    >
      <div className={cx('yarcl-field', className)} {...props}>
        <label className={cx('yarcl-field-label', typeClass(config.defaults.labelStyle))} htmlFor={id}>
          {label}
          {required && (
            <span className="yarcl-field-required" aria-hidden="true">
              {' *'}
            </span>
          )}
        </label>
        {children}
        {descriptionId && (
          <p className={cx('yarcl-field-description', typeClass(config.defaults.helperStyle))} id={descriptionId}>
            {description}
          </p>
        )}
        {errorId && (
          <p className={cx('yarcl-field-error', typeClass(config.defaults.helperStyle))} id={errorId}>
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
