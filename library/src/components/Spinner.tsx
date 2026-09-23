import type { ComponentProps } from 'react';
import { colorClass, cx, defaultsFor, sizeClass } from '../classes';
import type { Color, Size } from '../types';

const own = defaultsFor('Spinner');

/** Props for {@link Spinner}. */
export interface SpinnerProps extends Omit<ComponentProps<'span'>, 'color'> {
  /** Diameter from the size's `iconSize`, from the `sizes` config. Inherits the surrounding control's size when omitted. */
  size?: Size;
  /** Semantic color, from the `colors` config. Uses the current text color when omitted. */
  color?: Color;
  /**
   * Accessible label announced to screen readers.
   * @default 'Loading'
   */
  label?: string;
}

/**
 * An indeterminate loading indicator. Sized like an icon, so it fits inside controls of the same size.
 *
 * @example
 * ```tsx
 * <Spinner size="lg" color="brand" />
 * ```
 */
export function Spinner({ size, color, label = 'Loading', className, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cx('yarcl-spinner', (size ?? own.size) && sizeClass(size ?? own.size), (color ?? own.color) && cx('yarcl-spinner-colored', colorClass(color ?? own.color)), className)}
      {...props}
    />
  );
}
