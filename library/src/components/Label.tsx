import type { ComponentProps } from 'react';
import { colorClass, cx, typeClass } from '../classes';
import type { Color, TextStyle } from '../types';
import { useConfig, useDefaults } from '../runtime';

/** Props for {@link Label}. */
export interface LabelProps extends Omit<ComponentProps<'label'>, 'color'> {
  /**
   * Text style, from the `typography.styles` config.
   * @default config.defaults.labelStyle
   */
  textStyle?: TextStyle;
  /** Semantic color, from the `colors` config. Uses the default text color when omitted. */
  color?: Color;
  /**
   * Shows a required marker in `defaults.errorColor`. The marker is hidden from screen readers,
   * so also set `required` (or `aria-required`) on the control.
   */
  required?: boolean;
  /** Uses the muted color, to match a disabled control. */
  disabled?: boolean;
}

/**
 * A standalone form label, for layouts {@link Field} doesn't cover: a label beside its control,
 * one label for several controls, or a custom control. Connect it with `htmlFor`, or give it an
 * `id` and point the control's `aria-labelledby` at it.
 *
 * @example
 * ```tsx
 * <Label htmlFor="email" required>Email</Label>
 * <Input id="email" type="email" required />
 * ```
 */
export function Label({ textStyle, color, required, disabled, className, children, ...props }: LabelProps) {
  const config = useConfig();
  const own = useDefaults('Label');
  const resolvedColor = color ?? own.color;
  return (
    <label
      className={cx(
        'yarcl-label',
        typeClass(textStyle ?? own.textStyle ?? config.defaults.labelStyle),
        resolvedColor && cx('yarcl-label-colored', colorClass(resolvedColor)),
        disabled && 'yarcl-label-disabled',
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="yarcl-label-required" aria-hidden="true">
          {' *'}
        </span>
      )}
    </label>
  );
}
