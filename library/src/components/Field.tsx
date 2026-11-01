import { useId, type ComponentProps, type ReactNode } from 'react';
import { cx, typeClass } from '../classes';
import { FieldContext } from '../field-context';
import { useConfig } from '../runtime';
import { Label } from './Label';

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
  /**
   * Content shown after the label but outside it, such as an info tooltip or a "Forgot password?" link.
   * It doesn't become part of the control's accessible name.
   */
  labelEnd?: ReactNode;
  /** A single form control, such as {@link Input}, {@link ColorPicker}, {@link Textarea}, {@link Checkbox}, {@link Switch} or {@link Slider}. */
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
export function Field({ label, description, error, required, labelEnd, children, className, ...props }: FieldProps) {
  const config = useConfig();
  const id = useId();
  const descriptionId = description != null ? `${id}-description` : undefined;
  const errorId = error != null && error !== false ? `${id}-error` : undefined;

  const labelElement = (
    <Label id={`${id}-label`} htmlFor={id} required={required}>
      {label}
    </Label>
  );

  return (
    <FieldContext.Provider
      value={{ id, labelId: `${id}-label`, describedBy: cx(descriptionId, errorId) || undefined, invalid: errorId != null, required }}
    >
      <div className={cx('yarcl-field', className)} {...props}>
        {labelEnd != null ? (
          <div className="yarcl-field-label-row">
            {labelElement}
            {labelEnd}
          </div>
        ) : (
          labelElement
        )}
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
