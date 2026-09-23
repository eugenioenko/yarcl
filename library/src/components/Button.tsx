import type { ComponentProps } from 'react';
import { colorClass, cx, radiusClass, sizeClass, variantClass } from '../classes';
import type { TokenProps, VariantProps } from '../types';

/** Props for {@link Button}. Accepts all native `<button>` attributes except `color`. */
export interface ButtonProps extends Omit<ComponentProps<'button'>, 'color'>, TokenProps, VariantProps {}

/**
 * A button styled from the consumer's design tokens.
 * Shares the size scale with {@link Input}, so both have the same height at the same size.
 * Icons (`<svg>`) inside are sized from the size's `iconSize`.
 *
 * @example
 * ```tsx
 * <Button size="lg" color="danger" variant="outline" radius="pill">Delete</Button>
 * ```
 */
export function Button({ size, radius, color, variant, className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'yarcl-button',
        sizeClass(size),
        radiusClass(radius),
        colorClass(color),
        variantClass(variant),
        className,
      )}
      {...props}
    />
  );
}
