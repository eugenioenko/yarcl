import type { ComponentProps, ReactNode } from 'react';
import { colorClass, cx, sizeClass } from '../classes';
import type { Color, Size } from '../types';

/** Props for {@link Radio}. Accepts all native `<input>` attributes except `type`, `color` and `size`. */
export interface RadioProps extends Omit<ComponentProps<'input'>, 'type' | 'color' | 'size' | 'children'> {
  /** Label shown next to the radio. */
  children?: ReactNode;
  /**
   * Radio size, from the `sizes` config (uses the size's `iconSize`).
   * @default config.defaults.size
   */
  size?: Size;
  /**
   * Color of the selected radio, from the `colors` config.
   * @default config.defaults.color
   */
  color?: Color;
}

/**
 * A radio button with an optional label. Group radios with the same `name`.
 *
 * @example
 * ```tsx
 * <Radio name="plan" value="pro" defaultChecked>Pro</Radio>
 * <Radio name="plan" value="team">Team</Radio>
 * ```
 */
export function Radio({ children, size, color, className, style, ...props }: RadioProps) {
  return (
    <label className={cx('yarcl-radio', sizeClass(size), colorClass(color), className)} style={style}>
      <input type="radio" className="yarcl-radio-input" {...props} />
      {children != null && <span className="yarcl-radio-label">{children}</span>}
    </label>
  );
}
