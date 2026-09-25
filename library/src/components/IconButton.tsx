import type { ComponentProps } from 'react';
import { colorClass, cx, radiusClass, sizeClass, variantClass } from '../classes.js';
import type { TokenProps, VariantProps } from '../types.js';
import { useButtonGroup } from './ButtonGroup.js';
import { Spinner } from './Spinner.js';
import { useDefaults } from '../runtime.js';


/** Props for {@link IconButton}. `aria-label` is required because the button has no visible text. */
export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'color'>, TokenProps, VariantProps {
  /** Shows a {@link Spinner}, disables the button and sets `aria-busy`. */
  loading?: boolean;
  /** Accessible name, announced by screen readers in place of visible text. */
  'aria-label': string;
}

/**
 * A square button containing only an icon.
 * Width equals the control height, so it lines up with {@link Button} and {@link Input} of the same size.
 *
 * @example
 * ```tsx
 * <IconButton aria-label="Search" variant="ghost"><SearchIcon /></IconButton>
 * ```
 */
export function IconButton({
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
}: IconButtonProps) {
  const own = useDefaults('IconButton');
  const group = useButtonGroup();
  return (
    <button
      type={type}
      className={cx(
        'yarcl-button yarcl-icon-button',
        sizeClass(size ?? group?.size ?? own.size),
        radiusClass(radius ?? group?.radius ?? own.radius, size ?? group?.size ?? own.size),
        colorClass(color ?? group?.color ?? own.color),
        variantClass(variant ?? group?.variant ?? own.variant),
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner label="" aria-hidden="true" />}
      {!loading && children}
    </button>
  );
}
