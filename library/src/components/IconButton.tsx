import type { ComponentProps } from 'react';
import { colorClass, cx, radiusClass, sizeClass, variantClass } from '../classes';
import type { TokenProps, VariantProps } from '../types';
import { useButtonGroup } from './ButtonGroup';
import { Spinner } from './Spinner';
import { useDefaults } from '../runtime';


/** Props for the action form of {@link IconButton}. `aria-label` is required. */
export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'color'>, TokenProps<'IconButton'>, VariantProps {
  href?: never;
  /** Shows a {@link Spinner}, disables the button and sets `aria-busy`. */
  loading?: boolean;
  /** Accessible name, announced by screen readers in place of visible text. */
  'aria-label': string;
}

/** Props for the link form of {@link IconButton}. `aria-label` is required. */
export interface IconButtonLinkProps extends Omit<ComponentProps<'a'>, 'color' | 'href' | 'type' | 'disabled'>, TokenProps<'IconButton'>, VariantProps {
  /** Destination. Renders a native link with the same visual styles as an icon button. */
  href: string;
  /** Accessible name, announced by screen readers in place of visible text. */
  'aria-label': string;
  type?: never;
  disabled?: never;
  loading?: never;
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
export function IconButton(props: IconButtonProps | IconButtonLinkProps) {
  const own = useDefaults('IconButton');
  const group = useButtonGroup();
  const { size, radius, color, variant, className, children, ...elementProps } = props;
  const classes = cx(
    'yarcl-button yarcl-icon-button',
    sizeClass(size ?? group?.size ?? own.size, 'IconButton'),
    radiusClass(radius ?? group?.radius ?? own.radius, size ?? group?.size ?? own.size),
    colorClass(color ?? group?.color ?? own.color),
    variantClass(variant ?? group?.variant ?? own.variant),
    className,
  );
  if (elementProps.href !== undefined) return <a className={classes} {...elementProps}>{children}</a>;

  const { loading, disabled, type = 'button', ...buttonProps } = elementProps;
  return <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...buttonProps}>
    {loading && <Spinner label="" aria-hidden="true" />}
    {!loading && children}
  </button>;
}
