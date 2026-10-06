import type { ComponentProps, ReactNode } from 'react';
import { colorClass, cx, radiusClass, sizeClass } from '../classes';
import { useFieldProps } from '../field-context';
import type { TokenProps } from '../types';
import { useDefaults } from '../runtime';

/**
 * Props for {@link Input}. Native form attributes and refs go to the inner input;
 * `className` and `style` go to the outer control.
 */
export interface InputProps extends Omit<ComponentProps<'input'>, 'color' | 'size' | 'children'>, TokenProps<'Input'> {
  /** Content before the input, such as an icon, text or a button. Decorative icons should have `aria-hidden`. */
  startContent?: ReactNode;
  /** Content after the input, such as an icon, text or a button. Actions keep their own accessible names and disabled state. */
  endContent?: ReactNode;
}

/**
 * A text input with optional content on either side, styled from the consumer's design tokens.
 * Shares the base size scale with {@link Button}; component size overrides can adjust either one.
 * `color` sets the focus border. Inside a {@link Field}, it is labelled and described automatically.
 * Slots share the input's border and inherit its typography and icon size. Buttons keep their own props and focus rings.
 *
 * @example
 * ```tsx
 * <Input startContent="$" endContent="USD" aria-label="Amount in US dollars" />
 * ```
 */
export function Input(props: InputProps) {
  const own = useDefaults('Input');
  const { size, radius, color, startContent, endContent, className, style, dir, hidden, ...rest } = useFieldProps(props);
  return (
    <div
      className={cx(
        'yarcl-input yarcl-input-control',
        sizeClass(size ?? own.size, 'Input'),
        radiusClass(radius ?? own.radius, size ?? own.size),
        colorClass(color ?? own.color),
        className,
      )}
      style={style}
      dir={dir}
      hidden={hidden}
    >
      {startContent != null && startContent !== false && <span className="yarcl-input-content">{startContent}</span>}
      <input className="yarcl-input-field" dir={dir} {...rest} />
      {endContent != null && endContent !== false && <span className="yarcl-input-content">{endContent}</span>}
    </div>
  );
}
