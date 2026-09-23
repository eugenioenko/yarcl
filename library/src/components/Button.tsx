import type { ComponentProps } from 'react';
import { colorClass, cx, radiusClass, sizeClass, variantClass } from '../classes';
import type { TokenProps, VariantProps } from '../types';
import { Spinner } from './Spinner';

/** Props for {@link Button}. Accepts all native `<button>` attributes except `color`. */
export interface ButtonProps extends Omit<ComponentProps<'button'>, 'color'>, TokenProps, VariantProps {
  /** Shows a {@link Spinner}, disables the button and sets `aria-busy`. */
  loading?: boolean;
}

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
export function Button({
  size,
  radius,
  color,
  variant,
  loading,
  disabled,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
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
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner label="" aria-hidden="true" />}
      {children}
    </button>
  );
}
